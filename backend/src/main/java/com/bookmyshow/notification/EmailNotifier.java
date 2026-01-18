package com.bookmyshow.notification;

import com.bookmyshow.entity.Booking;
import com.bookmyshow.entity.ShowSeat;
import com.bookmyshow.service.TicketPdfService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmailNotifier implements Notifier {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotifier.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private TicketPdfService ticketPdfService;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Override
    public void sendBookingConfirmation(Booking booking, List<ShowSeat> seats) {
        // Default implementation - email will be passed via overloaded method
        logger.info("EMAIL: Booking confirmed. bookingId={}", booking.getId());
    }

    public void sendBookingConfirmation(Booking booking, List<ShowSeat> seats, String email) {
        try {
            if (email == null || email.isEmpty()) {
                logger.warn("No email found for booking {}", booking.getId());
                return;
            }

            String seatLabels = seats.stream()
                    .map(seat ->
                            seat.getSeat().getRowLabel() +
                            seat.getSeat().getSeatNumber()
                    )
                    .collect(Collectors.joining(", "));

            // Always try to send email - will log if not configured
            if (mailSender != null && fromEmail != null && !fromEmail.isEmpty()) {
                try {
                    sendEmailWithPdf(booking, seats, email, seatLabels);
                    logger.info("✅ EMAIL SENT successfully to {} for booking {}", email, booking.getId());
                } catch (Exception e) {
                    logger.error("❌ Failed to send email to {} for booking {}: {}", email, booking.getId(), e.getMessage());
                    // Fallback: log email details
                    logEmailDetails(booking, seats, email, seatLabels);
                }
            } else {
                // Log email content if mail is not configured
                logger.warn("⚠️ EMAIL NOT CONFIGURED - Email details logged below:");
                logEmailDetails(booking, seats, email, seatLabels);
            }
        } catch (Exception e) {
            logger.error("Failed to send email for booking {}", booking.getId(), e);
        }
    }

    private void sendEmailWithPdf(Booking booking, List<ShowSeat> seats, String toEmail, String seatLabels) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Booking Confirmed - BookMyShow Ticket #" + booking.getId());

            String emailBody = generateEmailBody(booking, seatLabels);
            helper.setText(emailBody, true);

            // Try to attach PDF ticket, but send email even if PDF generation fails
            try {
                byte[] pdfBytes = ticketPdfService.generateTicketPdf(booking, seats);
                if (pdfBytes != null && pdfBytes.length > 0) {
                    try {
                        jakarta.mail.util.ByteArrayDataSource pdfDataSource = 
                            new jakarta.mail.util.ByteArrayDataSource(pdfBytes, "application/pdf");
                        pdfDataSource.setName("Ticket_" + booking.getId() + ".pdf");
                        helper.addAttachment("Ticket_" + booking.getId() + ".pdf", pdfDataSource);
                        logger.info("PDF ticket attached successfully for booking {} ({} bytes)", booking.getId(), pdfBytes.length);
                    } catch (Exception attachException) {
                        logger.warn("Failed to attach PDF for booking {}: {}. Sending email without PDF.", 
                                booking.getId(), attachException.getMessage());
                    }
                } else {
                    logger.warn("PDF generation returned empty bytes for booking {}", booking.getId());
                }
            } catch (Exception pdfException) {
                logger.warn("Failed to generate PDF for booking {}: {}. Sending email without PDF attachment.", 
                        booking.getId(), pdfException.getMessage());
                logger.debug("PDF generation error details:", pdfException);
                // Continue to send email without PDF
            }

            mailSender.send(message);
            logger.info("✅ Email sent successfully to {} for booking {}", toEmail, booking.getId());
        } catch (MessagingException e) {
            logger.error("❌ Failed to send email to {} for booking {}: {}", toEmail, booking.getId(), e.getMessage());
            throw new RuntimeException("Email sending failed", e);
        } catch (Exception e) {
            logger.error("❌ Unexpected error sending email to {} for booking {}: {}", toEmail, booking.getId(), e.getMessage());
            throw new RuntimeException("Email sending failed", e);
        }
    }

    private String generateEmailBody(Booking booking, String seatLabels) {
        return """
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #DF1827 0%%, #BE1C68 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0;">Booking Confirmed! 🎉</h1>
                    </div>
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #1A1A1A;">%s</h2>
                        <p><strong>Theatre:</strong> %s, %s</p>
                        <p><strong>Show Time:</strong> %s</p>
                        <p><strong>Seats:</strong> %s</p>
                        <p><strong>Booking ID:</strong> #%d</p>
                        <p><strong>Booked By:</strong> %s</p>
                        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">
                        <p style="color: #6c757d; font-size: 14px;">
                            <strong>Important:</strong> Please find your ticket attached as PDF. 
                            Please arrive 15 minutes before show time. Carry a valid ID proof.
                        </p>
                        <p style="color: #6c757d; font-size: 14px;">
                            Tickets are non-refundable and non-transferable.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                booking.getShow().getMovie().getName(),
                booking.getShow().getTheatre().getName(),
                booking.getShow().getTheatre().getCity(),
                booking.getShow().getShowTime().toString(),
                seatLabels,
                booking.getId(),
                booking.getUserName()
            );
    }

    private void logEmailDetails(Booking booking, List<ShowSeat> seats, String email, String seatLabels) {
        logger.info("═══════════════════════════════════════════════════════════");
        logger.info("EMAIL NOTIFICATION DETAILS (Not sent - SMTP not configured)");
        logger.info("═══════════════════════════════════════════════════════════");
        logger.info("To: {}", email);
        logger.info("Subject: Booking Confirmed - BookMyShow Ticket #{}", booking.getId());
        logger.info("Booking ID: {}", booking.getId());
        logger.info("Movie: {}", booking.getShow().getMovie().getName());
        logger.info("Theatre: {}, {}", booking.getShow().getTheatre().getName(), booking.getShow().getTheatre().getCity());
        logger.info("Show Time: {}", booking.getShow().getShowTime());
        logger.info("Seats: {}", seatLabels);
        logger.info("Booked By: {}", booking.getUserName());
        logger.info("PDF Ticket: Would be attached (Ticket_{}.pdf)", booking.getId());
        logger.info("═══════════════════════════════════════════════════════════");
        logger.info("To enable email sending, configure SMTP in application.properties");
        logger.info("═══════════════════════════════════════════════════════════");
    }

}