package com.bookmyshow.controller;

import com.bookmyshow.dto.ConfirmBookingRequest;
import com.bookmyshow.dto.ConfirmBookingResponse;
import com.bookmyshow.entity.Booking;
import com.bookmyshow.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @GetMapping
    public ResponseEntity<java.util.List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> bookingRequest) {
        try {
            Long showId = Long.valueOf(bookingRequest.get("showId").toString());
            Integer seatsBooked = Integer.valueOf(bookingRequest.get("seatsBooked").toString());
            String userName = bookingRequest.get("userName").toString();

            Booking booking = bookingService.createBooking(showId, seatsBooked, userName);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // Confirm a booking
    @PostMapping("/confirm")
    public ResponseEntity<ConfirmBookingResponse> confirmBooking(
            @RequestBody ConfirmBookingRequest request) {
        ConfirmBookingResponse response = bookingService.confirmBooking(request);
        return ResponseEntity.ok(response);
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        return bookingService.getBookingById(id)
                .map(booking -> {
                    // Create a response object that includes booking and its seats
                    java.util.Map<String, Object> response = new java.util.HashMap<>();
                    response.put("booking", booking);
                    response.put("seats", bookingService.getBookingSeatsByBookingId(id).stream()
                            .map(bs -> {
                                java.util.Map<String, Object> seatInfo = new java.util.HashMap<>();
                                seatInfo.put("seatId", bs.getSeat().getId());
                                seatInfo.put("rowLabel", bs.getSeat().getRowLabel());
                                seatInfo.put("seatNumber", bs.getSeat().getSeatNumber());
                                seatInfo.put("seatType", bs.getSeat().getSeatType().name());
                                return seatInfo;
                            })
                            .collect(java.util.stream.Collectors.toList()));
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
