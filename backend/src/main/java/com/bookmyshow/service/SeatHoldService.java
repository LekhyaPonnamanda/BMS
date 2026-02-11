package com.bookmyshow.service;

import com.bookmyshow.dto.HoldSeatsRequest;
import com.bookmyshow.dto.HoldSeatsResponse;
import com.bookmyshow.dto.ReleaseSeatsRequest;
import com.bookmyshow.dto.ReleaseSeatsResponse;
import com.bookmyshow.dto.SeatStatusResponse;
import com.bookmyshow.entity.Seat;
import com.bookmyshow.entity.Show;
import com.bookmyshow.entity.ShowSeat;
import com.bookmyshow.entity.ShowSeatStatus;
import com.bookmyshow.exception.BookingException;
import com.bookmyshow.exception.SeatHoldConflictException;
import com.bookmyshow.repository.SeatRepository;
import com.bookmyshow.repository.ShowRepository;
import com.bookmyshow.repository.ShowSeatRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class SeatHoldService {

    private static final int DEFAULT_HOLD_MINUTES = 10;
    private static final int MIN_HOLD_MINUTES = 5;
    private static final int MAX_HOLD_MINUTES = 10;

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Transactional
    public HoldSeatsResponse holdSeats(Long showId, HoldSeatsRequest request) {
        if (request == null || request.getSeatIds() == null || request.getSeatIds().isEmpty()) {
            throw new BookingException("Seat IDs are required");
        }
        if (request.getUserId() == null || request.getUserId().isBlank()) {
            throw new BookingException("User ID is required to hold seats");
        }

        int holdMinutes = request.getHoldMinutes() != null ? request.getHoldMinutes() : DEFAULT_HOLD_MINUTES;
        if (holdMinutes < MIN_HOLD_MINUTES || holdMinutes > MAX_HOLD_MINUTES) {
            throw new BookingException("Hold minutes must be between " + MIN_HOLD_MINUTES + " and " + MAX_HOLD_MINUTES);
        }

        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new BookingException("Show not found with id: " + showId));

        ensureShowSeats(show);

        List<ShowSeat> showSeats = showSeatRepository.findByShowIdAndSeatIdInForUpdate(showId, request.getSeatIds());
        if (showSeats.size() != request.getSeatIds().size()) {
            throw new BookingException("One or more seat IDs are invalid for this show");
        }

        // CRITICAL: Validate that all seats belong to the correct show
        for (ShowSeat ss : showSeats) {
            if (!ss.getShow().getId().equals(showId)) {
                throw new BookingException("Seat does not belong to the specified show");
            }
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime holdExpiresAt = now.plusMinutes(holdMinutes);

        List<Long> failedSeatIds = new ArrayList<>();
        for (ShowSeat showSeat : showSeats) {
            if (showSeat.getStatus() == ShowSeatStatus.BOOKED ||
                    (showSeat.getStatus() == ShowSeatStatus.HELD && showSeat.getHoldExpiresAt().isAfter(now))) {
                failedSeatIds.add(showSeat.getSeat().getId());
            }
        }

        if (!failedSeatIds.isEmpty()) {
            throw new SeatHoldConflictException("Some seats are no longer available", failedSeatIds);
        }

        // Hold seats
        for (ShowSeat showSeat : showSeats) {
            showSeat.setStatus(ShowSeatStatus.HELD);
            showSeat.setHeldByUserId(request.getUserId());
            showSeat.setHoldExpiresAt(holdExpiresAt);
        }
        showSeatRepository.saveAll(showSeats);

        // Build response
        List<SeatStatusResponse> seatStatuses = new ArrayList<>();
        for (ShowSeat showSeat : showSeats) {
            Long remainingSeconds = Duration.between(now, holdExpiresAt).getSeconds();
            seatStatuses.add(new SeatStatusResponse(
                    showSeat.getSeat().getId(),
                    showSeat.getSeat().getRowLabel(),
                    showSeat.getSeat().getSeatNumber(),
                    showSeat.getSeat().getSeatType().name(),
                    showSeat.getStatus().name(),
                    true,
                    holdExpiresAt,
                    remainingSeconds
            ));
        }

        return new HoldSeatsResponse(showId, holdExpiresAt, seatStatuses);
    }

    @Transactional
    public ReleaseSeatsResponse releaseSeats(Long showId, ReleaseSeatsRequest request) {
        if (request == null || request.getSeatIds() == null || request.getSeatIds().isEmpty()) {
            throw new BookingException("Seat IDs are required");
        }
        if (request.getUserId() == null || request.getUserId().isBlank()) {
            throw new BookingException("User ID is required to release seats");
        }

        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new BookingException("Show not found with id: " + showId));

        ensureShowSeats(show);

        List<ShowSeat> showSeats = showSeatRepository.findByShowIdAndSeatIdInForUpdate(showId, request.getSeatIds());
        if (showSeats.size() != request.getSeatIds().size()) {
            throw new BookingException("One or more seat IDs are invalid for this show");
        }

        // CRITICAL: Validate that all seats belong to the correct show
        for (ShowSeat ss : showSeats) {
            if (!ss.getShow().getId().equals(showId)) {
                throw new BookingException("Seat does not belong to the specified show");
            }
        }

        LocalDateTime now = LocalDateTime.now();
        List<Long> invalidSeatIds = new ArrayList<>();

        for (ShowSeat showSeat : showSeats) {
            boolean expired = showSeat.getHoldExpiresAt() != null && showSeat.getHoldExpiresAt().isBefore(now);
            boolean notHeldByUser = !request.getUserId().equals(showSeat.getHeldByUserId());
            if (showSeat.getStatus() != ShowSeatStatus.HELD || expired || notHeldByUser) {
                invalidSeatIds.add(showSeat.getSeat().getId());
            }
        }

        if (!invalidSeatIds.isEmpty()) {
            throw new BookingException("Cannot release seats not held by the current user: " + invalidSeatIds);
        }

        for (ShowSeat showSeat : showSeats) {
            showSeat.setStatus(ShowSeatStatus.AVAILABLE);
            showSeat.setHeldByUserId(null);
            showSeat.setHoldExpiresAt(null);
        }
        showSeatRepository.saveAll(showSeats);

        List<SeatStatusResponse> seatStatuses = new ArrayList<>();
        for (ShowSeat showSeat : showSeats) {
            seatStatuses.add(new SeatStatusResponse(
                    showSeat.getSeat().getId(),
                    showSeat.getSeat().getRowLabel(),
                    showSeat.getSeat().getSeatNumber(),
                    showSeat.getSeat().getSeatType().name(),
                    showSeat.getStatus().name(),
                    false,
                    null,
                    null
            ));
        }

        return new ReleaseSeatsResponse(showId, seatStatuses);
    }

    // Scheduled task to clear expired holds every minute
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void clearExpiredHolds() {
        showSeatRepository.clearExpiredHolds(LocalDateTime.now());
    }

    // Ensure all seats exist as ShowSeats for the show
    private void ensureShowSeats(Show show) {
        List<ShowSeat> existing = showSeatRepository.findByShowId(show.getId());
        if (!existing.isEmpty()) return;

        List<Seat> seats = seatRepository.findByTheatreIdAndIsActiveTrueOrderByRowLabelAscSeatNumberAsc(show.getTheatre().getId());
        if (seats.isEmpty()) return;

        List<ShowSeat> toCreate = new ArrayList<>();
        for (Seat seat : seats) {
            toCreate.add(new ShowSeat(show, seat, ShowSeatStatus.AVAILABLE));
        }
        showSeatRepository.saveAll(toCreate);
    }
}
