package com.bookmyshow.service;

import com.bookmyshow.entity.SnackReward;
import com.bookmyshow.repository.SnackRewardRepository;
import com.bookmyshow.repository.BookingRepository;
import com.bookmyshow.entity.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SnackRewardService {

    @Autowired
    private SnackRewardRepository snackRewardRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private static final int REWARD_POINTS = 100;  // First milestone: 100 coins = ₹100
    private static final int REWARD_POINTS_SUBSEQUENT = 50;  // Subsequent earnings: 50 coins = ₹50

    // 15-minute window: check for bookings within last 15 minutes
    private static final int BOOKING_WINDOW_MINUTES = 15;
    
    // 15-minute expiry: coins expire 15 minutes after earned
    private static final int REWARD_VALIDITY_MINUTES = 15;

    // ✅ TOTAL ACTIVE POINTS
    public int getActivePoints(String userId) {
        Integer points = snackRewardRepository
                .sumActivePointsByUserId(userId, LocalDateTime.now());
        int activePoints = points != null ? points : 0;
        System.out.println("🪙 getActivePoints for userId: " + userId + " = " + activePoints);
        return activePoints;
    }

    // ✅ called whenever booking completed
    @Transactional
    public void processBookingForRewards(String userId) {

        LocalDateTime now = LocalDateTime.now();
        // Check bookings within last 15 minutes only
        LocalDateTime windowStart = now.minusMinutes(BOOKING_WINDOW_MINUTES);

        List<Booking> bookings =
                bookingRepository.findByUserIdAndBookingTimeBetween(
                        userId, windowStart, now);

        int bookingCount = bookings.size();
        
        System.out.println("📅 Booking count for userId " + userId + " in last " + BOOKING_WINDOW_MINUTES + " minutes: " + bookingCount);

        // Only award coins if minimum 2 bookings within 15 minutes
        // First time earning (bookingCount == 2): award 100 coins, expires in 15 min
        // Subsequent earnings (bookingCount > 2): award 50 coins, expires in 15 min
        if (bookingCount >= 2) {
            int pointsToAward = (bookingCount == 2) ? REWARD_POINTS : REWARD_POINTS_SUBSEQUENT;
            System.out.println("🎉 Minimum 2 bookings reached in 15 minutes! Awarding " + pointsToAward + " coins to " + userId);
            addReward(userId, pointsToAward);
        } else {
            System.out.println("⏳ Only " + bookingCount + " booking(s). Need minimum 2 within 15 minutes to earn coins.");
        }
    }

    // ✅ create reward
    private void addReward(String userId, int points) {

        LocalDateTime now = LocalDateTime.now();
        
        System.out.println("💾 Saving " + points + " coins reward for userId " + userId);

        SnackReward reward = new SnackReward(
                userId,
                points,
                now,
                now.plusMinutes(REWARD_VALIDITY_MINUTES)   // change to days later
        );

        snackRewardRepository.save(reward);
        System.out.println("✅ Reward saved successfully. Expires at: " + reward.getExpiresAt());
    }

    // ✅ list active rewards
    public List<SnackReward> getActiveRewards(String userId) {
        return snackRewardRepository
                .findByUserIdAndExpiresAtAfter(userId, LocalDateTime.now());
    }
}
