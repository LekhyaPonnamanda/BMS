package com.bookmyshow.notification;

import com.bookmyshow.entity.Booking;
import com.bookmyshow.entity.ShowSeat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ConsoleNotifier implements Notifier {

    private static final Logger logger = LoggerFactory.getLogger(ConsoleNotifier.class);

    @Override
    public void sendBookingConfirmation(Booking booking, List<ShowSeat> seats) {
        String seatLabels = seats.stream()
                .map(seat -> seat.getSeat().getRowLabel() + seat.getSeat().getSeatNumber())
                .sorted()
                .collect(Collectors.joining(", "));

        System.out.println("\n" + "=".repeat(70));
        System.out.println("🎬 BOOKING CONFIRMATION NOTIFICATION");
        System.out.println("=".repeat(70));
        System.out.println("Booking ID: #" + booking.getId());
        System.out.println("Movie: " + booking.getShow().getMovie().getName());
        System.out.println("Theatre: " + booking.getShow().getTheatre().getName() + ", " + booking.getShow().getTheatre().getCity());
        System.out.println("Show Time: " + booking.getShow().getShowTime());
        System.out.println("Seats: " + seatLabels);
        System.out.println("Booked By: " + booking.getUserName());
        System.out.println("Status: " + booking.getStatus());
        System.out.println("=".repeat(70) + "\n");

        logger.info("Console notification sent for booking {}", booking.getId());
    }
}
