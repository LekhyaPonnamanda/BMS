package com.bookmyshow.service;

import com.bookmyshow.dto.ConfirmBookingRequest;
import com.bookmyshow.dto.ConfirmBookingResponse;
import com.bookmyshow.entity.*;
import com.bookmyshow.exception.BookingException;
import com.bookmyshow.notification.NotificationDispatcher;
import com.bookmyshow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private BookingSeatRepository bookingSeatRepository;

    @Autowired
    private NotificationDispatcher notificationDispatcher;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    public List<com.bookmyshow.entity.BookingSeat> getBookingSeatsByBookingId(Long bookingId) {
        return bookingSeatRepository.findByBookingId(bookingId);
    }

    @Transactional
    public Booking createBooking(Long showId, Integer seatsBooked, String userName) {
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new BookingException("Show not found with id: " + showId));

        if (show.getAvailableSeats() < seatsBooked) {
            throw new BookingException("Not enough seats available");
        }

        show.setAvailableSeats(show.getAvailableSeats() - seatsBooked);
        showRepository.save(show);

        Booking booking = new Booking(show, seatsBooked, userName);
        booking.setStatus(BookingStatus.PENDING);
        booking.setBookingTime(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    @Transactional
    public ConfirmBookingResponse confirmBooking(ConfirmBookingRequest request) {

        if (request == null || request.getShowId() == null) {
            throw new BookingException("Show ID is required");
        }
        if (request.getSeatIds() == null || request.getSeatIds().isEmpty()) {
            throw new BookingException("Seat IDs are required");
        }
        if (request.getUserId() == null || request.getUserId().isBlank()) {
            throw new BookingException("User ID is required");
        }

        Show show = showRepository.findById(request.getShowId())
                .orElseThrow(() -> new BookingException("Show not found with id: " + request.getShowId()));

        ensureShowSeats(show);

        List<ShowSeat> showSeats =
                showSeatRepository.findByShowIdAndSeatIdInForUpdate(
                        request.getShowId(), request.getSeatIds());

        if (showSeats.size() != request.getSeatIds().size()) {
            throw new BookingException("Invalid seat ids for this show");
        }

        // CRITICAL: Validate that all seats belong to the correct show
        for (ShowSeat ss : showSeats) {
            if (!ss.getShow().getId().equals(request.getShowId())) {
                throw new BookingException("Seat does not belong to the specified show");
            }
        }

        LocalDateTime now = LocalDateTime.now();
        for (ShowSeat ss : showSeats) {
            boolean expired = ss.getHoldExpiresAt() == null || ss.getHoldExpiresAt().isBefore(now);
            boolean notHeldByUser =
                    ss.getHeldByUserId() == null ||
                            !ss.getHeldByUserId().equals(request.getUserId());

            if (ss.getStatus() != ShowSeatStatus.HELD || expired || notHeldByUser) {
                throw new BookingException("Seats must be held by current user before confirmation");
            }
        }

        Booking booking = new Booking(show, request.getSeatIds().size(), request.getUserId());
        booking.setUserId(request.getUserId());
        booking.setPhoneNumber(request.getPhoneNumber()); // Store phone number for reminder calls
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setBookingTime(LocalDateTime.now());
        Booking savedBooking = bookingRepository.save(booking);

        List<BookingSeat> bookingSeats = new ArrayList<>();
        for (ShowSeat ss : showSeats) {
            bookingSeats.add(new BookingSeat(savedBooking, show, ss.getSeat()));
        }

        try {
            bookingSeatRepository.saveAll(bookingSeats);
        } catch (DataIntegrityViolationException ex) {
            throw new BookingException("One or more seats already booked");
        }

        for (ShowSeat ss : showSeats) {
            ss.setStatus(ShowSeatStatus.BOOKED);
            ss.setHeldByUserId(null);
            ss.setHoldExpiresAt(null);
        }
        showSeatRepository.saveAll(showSeats);

        int remaining =
                Math.max(show.getAvailableSeats() - request.getSeatIds().size(), 0);
        show.setAvailableSeats(remaining);
        showRepository.save(show);

        notificationDispatcher.sendBookingConfirmation(
                savedBooking,
                showSeats,
                request.getEmail(),
                request.getPhoneNumber()
        );

        return new ConfirmBookingResponse(
                savedBooking.getId(),
                show.getId(),
                request.getSeatIds(),
                savedBooking.getStatus().name()
        );
    }

    private void ensureShowSeats(Show show) {
        List<ShowSeat> existing = showSeatRepository.findByShowId(show.getId());
        if (!existing.isEmpty()) return;

        List<Seat> seats =
                seatRepository.findByTheatreIdAndIsActiveTrueOrderByRowLabelAscSeatNumberAsc(
                        show.getTheatre().getId());

        if (seats.isEmpty()) return;

        List<ShowSeat> toCreate = new ArrayList<>();
        for (Seat seat : seats) {
            toCreate.add(new ShowSeat(show, seat, ShowSeatStatus.AVAILABLE));
        }
        showSeatRepository.saveAll(toCreate);
    }
}