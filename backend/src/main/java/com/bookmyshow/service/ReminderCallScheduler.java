package com.bookmyshow.service;

import com.bookmyshow.entity.Booking;
import com.bookmyshow.entity.BookingStatus;
import com.bookmyshow.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Scheduled service to send reminder calls before show time
 * 
 * Configuration:
 * - REMINDER_OFFSET_MINUTES: Time before show to send reminder (default: 30 minutes)
 * - CHECK_INTERVAL: How often to check for upcoming reminders (default: every 1 minute)
 * - REMINDER_WINDOW_MINUTES: Time window to trigger reminder (default: 1 minute tolerance)
 */
@Service
public class ReminderCallScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ReminderCallScheduler.class);

    // CONFIGURABLE OFFSET: Change this value to adjust reminder time
    // Options: 30 minutes, 60 minutes (1 hour), etc.
    private static final int REMINDER_OFFSET_MINUTES = 30; // Change to 60 for 1 hour reminders
    
    // Time window to trigger reminder (in minutes) - allows for slight timing differences
    private static final int REMINDER_WINDOW_MINUTES = 1;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CallService callService;

    // Track bookings that have already received reminder calls to avoid duplicates
    private final Set<Long> remindedBookings = ConcurrentHashMap.newKeySet();

    /**
     * Scheduled task that runs every minute to check for bookings needing reminder calls
     * Fixed delay of 60 seconds = 1 minute
     */
    @Scheduled(fixedDelay = 60000, initialDelay = 30000) // Start after 30 seconds, then every 1 minute
    @Transactional
    public void checkAndSendReminderCalls() {
        try {
            LocalDateTime now = LocalDateTime.now();
            
            logger.debug("🔍 Checking for reminder calls... (Current time: {}, Reminder offset: {} minutes)", 
                    now, REMINDER_OFFSET_MINUTES);

            // Find all confirmed upcoming bookings
            List<Booking> upcomingBookings = bookingRepository.findConfirmedUpcomingBookings(
                    BookingStatus.CONFIRMED, now);

            if (upcomingBookings.isEmpty()) {
                logger.debug("No upcoming bookings found for reminder calls");
                return;
            }

            logger.info("📋 Found {} upcoming confirmed booking(s) to check for reminders", 
                    upcomingBookings.size());

            int remindersSent = 0;
            int remindersSkipped = 0;

            for (Booking booking : upcomingBookings) {
                try {
                    LocalDateTime showTime = booking.getShow().getShowTime();
                    
                    // Calculate when reminder should be sent
                    LocalDateTime reminderTime = showTime.minus(REMINDER_OFFSET_MINUTES, ChronoUnit.MINUTES);
                    
                    // Check if we're within the reminder window
                    long minutesUntilReminder = ChronoUnit.MINUTES.between(now, reminderTime);
                    
                    // Check if reminder has already been sent for this booking
                    if (remindedBookings.contains(booking.getId())) {
                        logger.debug("⏭️ Skipping booking {} - reminder already sent", booking.getId());
                        remindersSkipped++;
                        continue;
                    }

                    // Trigger reminder if we're within the window (0 to REMINDER_WINDOW_MINUTES before reminder time)
                    if (minutesUntilReminder >= 0 && minutesUntilReminder <= REMINDER_WINDOW_MINUTES) {
                        
                        // Validate booking has required data
                        if (!isValidBookingForReminder(booking)) {
                            logger.warn("⚠️ Skipping booking {} - missing required data for reminder", booking.getId());
                            remindersSkipped++;
                            continue;
                        }

                        // Get phone number from booking
                        // Note: You may need to add phoneNumber field to Booking entity
                        // For now, we'll use userId or extract from some other field
                        String phoneNumber = extractPhoneNumber(booking);
                        
                        if (phoneNumber == null || phoneNumber.isEmpty()) {
                            logger.warn("⚠️ Skipping booking {} - no phone number available", booking.getId());
                            remindersSkipped++;
                            continue;
                        }

                        // Make the reminder call
                        logger.info("📞 Sending reminder call for booking #{} - Show: {} at {}", 
                                booking.getId(), 
                                booking.getShow().getMovie().getName(),
                                showTime);
                        
                        logger.info("⏰ Reminder timing - Show time: {}, Reminder time: {}, Current time: {}, Minutes until reminder: {}", 
                                showTime, reminderTime, now, minutesUntilReminder);

                        String callSid = callService.makeReminderCall(booking, phoneNumber);
                        
                        // Mark as reminded
                        remindedBookings.add(booking.getId());
                        remindersSent++;
                        
                        logger.info("✅ Reminder call sent successfully for booking #{} - Call SID: {}", 
                                booking.getId(), callSid);

                    } else if (minutesUntilReminder < 0) {
                        // Reminder time has passed but call wasn't made - mark as processed to avoid retries
                        if (!remindedBookings.contains(booking.getId())) {
                            logger.debug("⏰ Reminder time passed for booking {} ({} minutes ago), marking as processed", 
                                    booking.getId(), Math.abs(minutesUntilReminder));
                            remindedBookings.add(booking.getId());
                        }
                    } else {
                        logger.debug("⏳ Booking {} - reminder scheduled in {} minutes (Show: {})", 
                                booking.getId(), minutesUntilReminder, showTime);
                    }

                } catch (Exception e) {
                    logger.error("❌ Error processing reminder for booking {}: {}", 
                            booking.getId(), e.getMessage(), e);
                }
            }

            logger.info("📊 Reminder check complete - Sent: {}, Skipped: {}, Total checked: {}", 
                    remindersSent, remindersSkipped, upcomingBookings.size());

        } catch (Exception e) {
            logger.error("❌ Error in reminder call scheduler: {}", e.getMessage(), e);
        }
    }

    /**
     * Validate that booking has all required data for reminder call
     */
    private boolean isValidBookingForReminder(Booking booking) {
        if (booking == null) return false;
        if (booking.getShow() == null) return false;
        if (booking.getShow().getMovie() == null) return false;
        if (booking.getShow().getTheatre() == null) return false;
        if (booking.getShow().getShowTime() == null) return false;
        if (booking.getUserName() == null || booking.getUserName().isEmpty()) return false;
        
        return true;
    }

    /**
     * Extract phone number from booking
     * 
     * Priority:
     * 1. Use phoneNumber field (if available)
     * 2. Fall back to userId (if it looks like a phone number)
     * 
     * Phone number format expected: 10 digits (e.g., "6304871659") or with country code (e.g., "+916304871659")
     */
    private String extractPhoneNumber(Booking booking) {
        if (booking == null) {
            return null;
        }
        
        // First, try to use phoneNumber field
        if (booking.getPhoneNumber() != null && !booking.getPhoneNumber().isEmpty()) {
            String phone = booking.getPhoneNumber().trim();
            
            // Format: add country code if it's a 10-digit number
            if (phone.matches("\\d{10}")) {
                return "+91" + phone; // Add country code for India
            }
            
            // If it already has country code or is formatted, return as is
            if (phone.startsWith("+") || phone.matches("^\\+?\\d{10,15}$")) {
                return phone.startsWith("+") ? phone : "+" + phone;
            }
        }
        
        // Fallback: try to extract from userId field
        if (booking.getUserId() != null && !booking.getUserId().isEmpty()) {
            String userId = booking.getUserId().trim();
            
            // Check if userId is a 10-digit phone number
            if (userId.matches("\\d{10}")) {
                return "+91" + userId; // Add country code for India
            }
            
            // Check if userId is already a phone number with country code
            if (userId.matches("^\\+\\d{10,15}$")) {
                return userId;
            }
        }
        
        logger.warn("No valid phone number found for booking {} - phoneNumber: '{}', userId: '{}'", 
                booking.getId(), 
                booking.getPhoneNumber(), 
                booking.getUserId());
        
        return null;
    }

    /**
     * Clean up old reminders from memory (optional - prevents memory growth)
     * This can be called periodically to remove old booking IDs
     */
    @Scheduled(cron = "0 0 2 * * ?") // Run daily at 2 AM
    public void cleanupOldReminders() {
        int sizeBefore = remindedBookings.size();
        
        // Remove bookings older than 24 hours (this is a simple cleanup)
        // In production, you might want more sophisticated cleanup
        
        logger.info("🧹 Cleaning up reminder tracking cache - Size before: {}", sizeBefore);
        // For now, we keep all reminders to avoid duplicates
        // You can implement more sophisticated cleanup if needed
    }

    /**
     * Get current reminder offset configuration (for logging/debugging)
     */
    public int getReminderOffsetMinutes() {
        return REMINDER_OFFSET_MINUTES;
    }
}
