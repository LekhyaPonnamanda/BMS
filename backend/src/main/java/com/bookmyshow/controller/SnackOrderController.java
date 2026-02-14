package com.bookmyshow.controller;

import com.bookmyshow.service.SnackOrderService;
import com.bookmyshow.repository.BookingRepository;
import com.bookmyshow.entity.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/snacks")
@CrossOrigin(origins = "http://localhost:3000")
public class SnackOrderController {
    @Autowired
    private SnackOrderService snackOrderService;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    private static final int BOOKING_WINDOW_MINUTES = 15;

    @GetMapping("/eligible/{userId}")
    public ResponseEntity<Map<String, Object>> checkSnackEligibility(@PathVariable String userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime windowStart = now.minusMinutes(BOOKING_WINDOW_MINUTES);
            
            List<Booking> bookings = bookingRepository.findByUserIdAndBookingTimeBetween(userId, windowStart, now);
            int bookingCount = bookings.size();
            
            boolean isEligible = bookingCount >= 2;
            
            response.put("eligible", isEligible);
            response.put("bookingCount", bookingCount);
            response.put("requiredBookings", 2);
            response.put("timeWindowMinutes", BOOKING_WINDOW_MINUTES);
            
            if (isEligible) {
                response.put("message", "✅ You qualify for snacks! You have " + bookingCount + " bookings in last 15 minutes.");
            } else {
                response.put("message", "⏳ You need minimum 2 bookings within 15 minutes. Currently: " + bookingCount + "/2");
            }
            
            System.out.println("🍿 Snack eligibility check for userId " + userId + ": " + (isEligible ? "ELIGIBLE" : "NOT ELIGIBLE") + " (" + bookingCount + " bookings)");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("eligible", false);
            response.put("error", "Error checking eligibility: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/order")
    public ResponseEntity<Map<String, Object>> placeSnackOrder(
            @RequestBody Map<String, Object> orderRequest) {
        try {
            String userId = (String) orderRequest.get("userId");
            if (userId == null || userId.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "User ID is required");
                error.put("status", "FAILED");
                return ResponseEntity.badRequest().body(error);
            }

            Long bookingId = Long.parseLong(orderRequest.get("bookingId").toString());
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) orderRequest.get("items");
            
            if (items == null || items.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Cart is empty");
                error.put("status", "FAILED");
                return ResponseEntity.badRequest().body(error);
            }

            int pointsToUse = Integer.parseInt(orderRequest.get("pointsToUse").toString());

            Map<String, Object> result = snackOrderService.placeOrderWithPoints(userId, bookingId, items, pointsToUse);
            return ResponseEntity.ok(result);
            
        } catch (NumberFormatException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Invalid booking ID or points format");
            error.put("status", "FAILED");
            error.put("details", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("status", "FAILED");
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Order placement failed: " + e.getMessage());
            error.put("status", "FAILED");
            error.put("details", e.toString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
