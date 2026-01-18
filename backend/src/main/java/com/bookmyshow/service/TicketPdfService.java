package com.bookmyshow.service;

import com.bookmyshow.entity.Booking;
import com.bookmyshow.entity.ShowSeat;
import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.HtmlConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketPdfService {

    private static final Logger logger = LoggerFactory.getLogger(TicketPdfService.class);

    public byte[] generateTicketPdf(Booking booking, List<ShowSeat> seats) {
        try {
            String html = generateTicketHtml(booking, seats);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            // Configure converter properties with better error handling
            ConverterProperties properties = new ConverterProperties();
            // Add font provider if needed
            // properties.setFontProvider(new DefaultFontProvider(true, true, true));

            HtmlConverter.convertToPdf(html, outputStream, properties);

            byte[] pdfBytes = outputStream.toByteArray();
            if (pdfBytes == null || pdfBytes.length == 0) {
                logger.error("PDF generation produced empty output for booking {}", booking.getId());
                throw new RuntimeException("PDF generation produced empty output");
            }

            logger.info("PDF generated successfully for booking {}, size: {} bytes", booking.getId(), pdfBytes.length);
            return pdfBytes;
        } catch (Exception e) {
            logger.error("Failed to generate PDF ticket for booking {}: {}", booking.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to generate PDF ticket: " + e.getMessage(), e);
        }
    }

    private String generateTicketHtml(Booking booking, List<ShowSeat> seats) {

        String seatLabels = seats.stream()
                .map(seat -> seat.getSeat().getRowLabel() + seat.getSeat().getSeatNumber())
                .sorted()
                .collect(Collectors.joining(", "));

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("EEEE, MMMM dd, yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                            background: #f5f5f5;
                        }
                        .ticket {
                            max-width: 600px;
                            margin: 0 auto;
                            background: white;
                            border-radius: 12px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                            overflow: hidden;
                        }
                        .header {
                            background: linear-gradient(135deg, #DF1827 0%%, #BE1C68 100%%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 32px;
                            font-weight: bold;
                        }
                        .header p {
                            margin: 10px 0 0 0;
                            font-size: 16px;
                            opacity: 0.9;
                        }
                        .content {
                            padding: 30px;
                        }
                        .section {
                            margin-bottom: 25px;
                            padding-bottom: 25px;
                            border-bottom: 1px solid #e9ecef;
                        }
                        .section:last-child {
                            border-bottom: none;
                        }
                        .section-title {
                            font-size: 12px;
                            color: #6c757d;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            margin-bottom: 10px;
                            font-weight: 600;
                        }
                        .section-content {
                            font-size: 18px;
                            color: #1A1A1A;
                            font-weight: 600;
                        }
                        .section-subtitle {
                            font-size: 14px;
                            color: #6c757d;
                            margin-top: 5px;
                        }
                        .info-grid {
                            display: table;
                            width: 100%%;
                        }
                        .info-grid > div {
                            display: table-cell;
                            width: 50%%;
                            padding-right: 20px;
                            vertical-align: top;
                        }
                        .booking-id {
                            background: #f8f9fa;
                            padding: 15px;
                            border-radius: 8px;
                            text-align: center;
                            margin-top: 20px;
                        }
                        .booking-id-label {
                            font-size: 12px;
                            color: #6c757d;
                            margin-bottom: 5px;
                        }
                        .booking-id-value {
                            font-size: 24px;
                            font-weight: bold;
                            color: #DF1827;
                        }
                        .footer {
                            background: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            font-size: 12px;
                            color: #6c757d;
                        }
                        .qr-placeholder {
                            width: 120px;
                            height: 120px;
                            background: #e9ecef;
                            border: 2px dashed #6c757d;
                            display: table-cell;
                            text-align: center;
                            vertical-align: middle;
                            margin: 20px auto;
                            border-radius: 8px;
                            color: #6c757d;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="ticket">
                        <div class="header">
                            <h1>BOOKMYSHOW</h1>
                            <p>Your Ticket</p>
                        </div>
                        <div class="content">
                            <div class="section">
                                <div class="section-title">Movie</div>
                                <div class="section-content">%s</div>
                                <div class="section-subtitle">%s • %s • %d min</div>
                            </div>
                            <div class="section">
                                <div class="info-grid">
                                    <div>
                                        <div class="section-title">Theatre</div>
                                        <div class="section-content">%s</div>
                                        <div class="section-subtitle">%s</div>
                                    </div>
                                    <div>
                                        <div class="section-title">Show Time</div>
                                        <div class="section-content">%s</div>
                                        <div class="section-subtitle">%s</div>
                                    </div>
                                </div>
                            </div>
                            <div class="section">
                                <div class="section-title">Seats</div>
                                <div class="section-content">%s</div>
                            </div>
                            <div class="section">
                                <div class="section-title">Booked By</div>
                                <div class="section-content">%s</div>
                            </div>
                            <div class="booking-id">
                                <div class="booking-id-label">Booking ID</div>
                                <div class="booking-id-value">#%d</div>
                            </div>
                            <div class="qr-placeholder">
                                QR Code<br/>Booking ID: %d
                            </div>
                        </div>
                        <div class="footer">
                            <p><strong>Important:</strong> Please arrive 15 minutes before show time. Carry a valid ID proof.</p>
                            <p>Tickets are non-refundable and non-transferable.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                booking.getShow().getMovie().getName(),
                booking.getShow().getMovie().getLanguage(),
                booking.getShow().getMovie().getGenre(),
                booking.getShow().getMovie().getDuration(),
                booking.getShow().getTheatre().getName(),
                booking.getShow().getTheatre().getCity(),
                booking.getShow().getShowTime().format(timeFormatter),
                booking.getShow().getShowTime().format(dateFormatter),
                seatLabels,
                booking.getUserName(),
                booking.getId(),
                booking.getId()
        );
    }
}
