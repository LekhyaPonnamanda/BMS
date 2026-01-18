package com.bookmyshow.notification;

import com.bookmyshow.entity.Booking;
import com.bookmyshow.entity.ShowSeat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PhoneCallNotifier implements Notifier {

    private static final Logger logger = LoggerFactory.getLogger(PhoneCallNotifier.class);

    @Value("${phone.call.enabled:true}")
    private boolean phoneCallEnabled;

    @Value("${phone.call.api.key:}")
    private String apiKey;

    @Value("${phone.call.api.url:}")
    private String apiUrl;

    @Override
    public void sendBookingConfirmation(Booking booking, List<ShowSeat> seats) {
        // Default implementation
        logger.info("PHONE CALL: Booking confirmed. bookingId={}", booking.getId());
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
                    .collect(Collectors.joining(", "));

            String message = String.format(
                "Hello %s, your booking has been confirmed! " +
                "Booking ID: %d. " +
                "Movie: %s at %s, %s. " +
                "Show time: %s. " +
                "Seats: %s. " +
                "Thank you for booking with BookMyShow!",
                booking.getUserName(),
                booking.getId(),
                booking.getShow().getMovie().getName(),
                booking.getShow().getTheatre().getName(),
                booking.getShow().getTheatre().getCity(),
                booking.getShow().getShowTime().toString(),
                seatLabels
            );

            if (phoneCallEnabled && apiKey != null && !apiKey.isEmpty() && apiUrl != null && !apiUrl.isEmpty()) {
                // Make actual phone call using API (e.g., Twilio, AWS Connect, etc.)
                makePhoneCall(phoneNumber, message);
                logger.info("Phone call initiated to {} for booking {}", phoneNumber, booking.getId());
            } else {
                // Simulate phone call for development/testing
                logger.info("═══════════════════════════════════════════════════════════");
                logger.info("PHONE CALL NOTIFICATION DETAILS (Not made - Service not configured)");
                logger.info("═══════════════════════════════════════════════════════════");
                logger.info("To: {}", phoneNumber);
                logger.info("Message: {}", message);
                logger.info("Booking ID: {}", booking.getId());
                logger.info("═══════════════════════════════════════════════════════════");
                logger.info("To enable phone calls, configure phone call API in application.properties");
                logger.info("═══════════════════════════════════════════════════════════");
                // In a real scenario, you would integrate with a service like:
                // - Twilio Voice API
                // - AWS Amazon Connect
                // - Google Cloud Speech-to-Text API
                // Example: twilioService.makeCall(phoneNumber, message);
            }
        } catch (Exception e) {
            logger.error("Failed to make phone call for booking {}", booking.getId(), e);
        }
    }

    private void makePhoneCall(String phoneNumber, String message) {
        // Implement actual phone call logic here
        // Example with Twilio:
        /*
        Twilio.init(apiKey, apiSecret);
        Call call = Call.creator(
            new PhoneNumber(phoneNumber),
            new PhoneNumber("+1234567890"), // Your Twilio number
            new URI(apiUrl + "/voice?message=" + URLEncoder.encode(message, "UTF-8"))
        ).create();
        */
        
        // For now, just log
        logger.info("Making phone call to {} with message: {}", phoneNumber, message);
    }
}
