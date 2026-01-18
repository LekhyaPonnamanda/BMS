package com.bookmyshow.notification;

import com.bookmyshow.entity.Booking;
import com.bookmyshow.entity.ShowSeat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationDispatcher {

    private static final Logger logger = LoggerFactory.getLogger(NotificationDispatcher.class);
    
    private final List<Notifier> notifiers;

    public NotificationDispatcher(List<Notifier> notifiers) {
        this.notifiers = notifiers;
    }

    @Async
    public void sendBookingConfirmation(Booking booking, List<ShowSeat> seats, String email, String phoneNumber) {
        logger.info("🚀 Starting notification dispatch for booking {}", booking.getId());
        logger.info("Email: {}, Phone: {}", email != null ? email : "not provided", phoneNumber != null ? phoneNumber : "not provided");
        
        int successCount = 0;
        int failCount = 0;
        
        for (Notifier notifier : notifiers) {
            try {
                String notifierName = notifier.getClass().getSimpleName();
                logger.info("Processing notification via: {}", notifierName);
                
                if (notifier instanceof EmailNotifier) {
                    if (email != null && !email.isEmpty()) {
                        ((EmailNotifier) notifier).sendBookingConfirmation(booking, seats, email);
                        successCount++;
                        logger.info("✅ Email notification processed via {}", notifierName);
                    } else {
                        logger.warn("⚠️ Email not provided, skipping email notification");
                    }
                } else if (notifier instanceof SmsNotifier) {
                    if (phoneNumber != null && !phoneNumber.isEmpty()) {
                        ((SmsNotifier) notifier).sendBookingConfirmation(booking, seats, phoneNumber);
                        successCount++;
                        logger.info("✅ SMS notification processed via {}", notifierName);
                    } else {
                        logger.warn("⚠️ Phone number not provided, skipping SMS notification");
                    }
                } else if (notifier instanceof PhoneCallNotifier) {
                    if (phoneNumber != null && !phoneNumber.isEmpty()) {
                        ((PhoneCallNotifier) notifier).sendBookingConfirmation(booking, seats, phoneNumber);
                        successCount++;
                        logger.info("✅ Phone call notification processed via {}", notifierName);
                    } else {
                        logger.warn("⚠️ Phone number not provided, skipping phone call notification");
                    }
                } else {
                    // Console notifier and others
                    notifier.sendBookingConfirmation(booking, seats);
                    successCount++;
                    logger.info("✅ {} notification processed", notifierName);
                }
            } catch (Exception e) {
                failCount++;
                logger.error("❌ Error sending notification via {}: {}", 
                    notifier.getClass().getSimpleName(), e.getMessage(), e);
            }
        }
        
        logger.info("📊 Notification summary: {} succeeded, {} failed", successCount, failCount);
    }
}
