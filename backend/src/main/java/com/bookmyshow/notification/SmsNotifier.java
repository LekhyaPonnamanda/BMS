package com.bookmyshow.notification;

import com.bookmyshow.entity.Booking;
import com.bookmyshow.entity.ShowSeat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SmsNotifier implements Notifier {

    private static final Logger logger = LoggerFactory.getLogger(SmsNotifier.class);

    @Override
    public void sendBookingConfirmation(Booking booking, List<ShowSeat> seats) {
        // Default implementation - phone will be passed via overloaded method
        logger.info("SMS: Booking confirmed. bookingId={}", booking.getId());
    }

    public void sendBookingConfirmation(Booking booking, List<ShowSeat> seats, String phoneNumber) {
        try {
            if (phoneNumber == null || phoneNumber.isEmpty()) {
                logger.warn("No phone number found for booking {}", booking.getId());
                return;
            }

            String seatLabels = seats.stream()
                    .map(seat -> seat.getSeat().getRowLabel() + seat.getSeat().getSeatNumber())
                    .sorted()
                    .collect(java.util.stream.Collectors.joining(", "));

            String message = String.format(
                "Booking Confirmed! Booking ID: #%d\n" +
                "Movie: %s\n" +
                "Theatre: %s, %s\n" +
                "Show: %s\n" +
                "Seats: %s\n" +
                "Thank you for booking with BookMyShow!",
                booking.getId(),
                booking.getShow().getMovie().getName(),
                booking.getShow().getTheatre().getName(),
                booking.getShow().getTheatre().getCity(),
                booking.getShow().getShowTime().toString(),
                seatLabels
            );

            // In production, integrate with SMS service like Twilio, AWS SNS, etc.
            // For now, log the SMS details
            logger.info("═══════════════════════════════════════════════════════════");
            logger.info("SMS NOTIFICATION DETAILS (Not sent - SMS service not configured)");
            logger.info("═══════════════════════════════════════════════════════════");
            logger.info("To: {}", phoneNumber);
            logger.info("Message: {}", message);
            logger.info("═══════════════════════════════════════════════════════════");
            logger.info("To enable SMS sending, configure SMS API in application.properties");
            logger.info("═══════════════════════════════════════════════════════════");

            // Example: Uncomment and configure for actual SMS sending
            // smsService.sendSms(phoneNumber, message);

        } catch (Exception e) {
            logger.error("Failed to send SMS for booking {}", booking.getId(), e);
        }
    }
}
