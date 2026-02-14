package com.bookmyshow.service;

import com.bookmyshow.entity.*;
import com.bookmyshow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SnackOrderService {
    @Autowired
    private SnackOrderRepository snackOrderRepository;
    @Autowired
    private SnackOrderItemRepository snackOrderItemRepository;
    @Autowired
    private SnackRepository snackRepository;
    @Autowired
    private SnackRewardRepository snackRewardRepository;

    /**
     * Place a snack order with points and payment logic.
     * Returns a result map with order, message, and payment info.
     */
    @Transactional
    public Map<String, Object> placeOrderWithPoints(String userId, Long bookingId, List<Map<String, Object>> items, int userPoints) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Cart cannot be empty");
        }

        System.out.println("🔍 Processing order for userId: " + userId + ", pointsAvailable: " + userPoints + ", numItems: " + items.size());

        int totalAmount = 0;
        List<SnackOrderItem> orderItems = new ArrayList<>();
        
        for (Map<String, Object> item : items) {
            Long snackId = Long.valueOf(item.get("snackId").toString());
            int quantity = Integer.parseInt(item.get("quantity").toString());
            
            Snack snack = snackRepository.findById(snackId).orElseThrow(() -> 
                new IllegalArgumentException("Snack not found: " + snackId));
            
            totalAmount += snack.getPrice() * quantity;
            
            SnackOrderItem orderItem = new SnackOrderItem();
            orderItem.setSnack(snack);
            orderItem.setQuantity(quantity);
            orderItems.add(orderItem);
        }

        int pointsUsed = Math.min(userPoints, totalAmount);
        int moneyPaid = totalAmount - pointsUsed;
        
        String message;
        if (userPoints >= totalAmount && totalAmount > 0) {
            message = "Order placed using points. No payment required.";
        } else if (userPoints > 0 && userPoints < totalAmount) {
            message = "You need to pay Rs. " + moneyPaid + "; points used partially.";
        } else {
            message = "You don't have enough points; please pay full amount.";
        }

        // Deduct points from oldest NON-EXPIRED rewards first (FIFO by earned date)
        // Only deduct from rewards that haven't expired, ordered by when they were earned
        List<SnackReward> rewards = snackRewardRepository.findByUserIdAndExpiresAtAfterOrderByEarnedAtAsc(userId, LocalDateTime.now());
        System.out.println("📊 Found " + rewards.size() + " active (non-expired) reward records for userId: " + userId + " ordered by earned date");
        for (SnackReward r : rewards) {
            System.out.println("   - Reward ID: " + r.getId() + ", Points: " + r.getPoints() + ", EarnedAt: " + r.getEarnedAt() + ", ExpiresAt: " + r.getExpiresAt());
        }
        
        int toDeduct = pointsUsed;
        List<SnackReward> rewardsToUpdate = new ArrayList<>();
        
        for (SnackReward reward : rewards) {
            if (toDeduct <= 0) break;
            if (reward.getPoints() > 0) {
                int deduct = Math.min(reward.getPoints(), toDeduct);
                System.out.println("💰 Deducting " + deduct + " points from reward ID: " + reward.getId() + " (had " + reward.getPoints() + ")");
                reward.setPoints(reward.getPoints() - deduct);
                toDeduct -= deduct;
                rewardsToUpdate.add(reward);
            }
        }
        
        // Batch save all updated rewards
        if (!rewardsToUpdate.isEmpty()) {
            snackRewardRepository.saveAll(rewardsToUpdate);
            System.out.println("✅ Successfully saved " + rewardsToUpdate.size() + " updated rewards. Remaining to deduct: " + toDeduct);
        } else {
            System.out.println("⚠️ No active rewards to update!");
        }

        // Create and save snack order
        SnackOrder order = new SnackOrder();
        order.setUserId(userId);
        order.setBookingId(bookingId);
        order.setTotalAmount(totalAmount);
        order.setPointsUsed(pointsUsed);
        order.setMoneyPaid(moneyPaid);
        order.setOrderTime(LocalDateTime.now());
        order.setItems(orderItems);
        snackOrderRepository.save(order);

        // Save order items
        for (SnackOrderItem item : orderItems) {
            item.setSnackOrder(order);
            snackOrderItemRepository.save(item);
        }

        // Get remaining points after deduction
        int remainingPoints = snackRewardRepository
                .sumActivePointsByUserId(userId, LocalDateTime.now());
        remainingPoints = remainingPoints >= 0 ? remainingPoints : 0;
        
        // Return result
        Map<String, Object> result = new HashMap<>();
        result.put("id", order.getId());
        result.put("userId", order.getUserId());
        result.put("bookingId", order.getBookingId());
        result.put("totalAmount", order.getTotalAmount());
        result.put("pointsUsed", order.getPointsUsed());
        result.put("moneyPaid", order.getMoneyPaid());
        result.put("orderTime", order.getOrderTime().toString());
        result.put("message", message);
        result.put("status", "SUCCESS");
        result.put("remainingPoints", remainingPoints);
        System.out.println("📊 Order completed. Points used: " + pointsUsed + ", Remaining points: " + remainingPoints);
        return result;
    }
}
