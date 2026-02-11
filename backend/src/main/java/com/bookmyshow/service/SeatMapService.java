package com.bookmyshow.service;

import com.bookmyshow.dto.SeatMapResponse;
import com.bookmyshow.dto.SeatStatusResponse;
import com.bookmyshow.entity.*;
import com.bookmyshow.repository.SeatRepository;
import com.bookmyshow.repository.ShowRepository;
import com.bookmyshow.repository.ShowSeatRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SeatMapService {

    @Autowired
    private ShowRepository showRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private ShowSeatRepository showSeatRepository;

    @Transactional
    public Optional<SeatMapResponse> getSeatMap(Long showId, String userId) {
        Optional<Show> showOpt = showRepository.findById(showId);
        if (showOpt.isEmpty()) {
            return Optional.empty();
        }

        Show show = showOpt.get();

        // Clear expired holds for this specific show before fetching seat map
        clearExpiredHoldsForShow(show.getId());

        // Fetch all seats in the theatre
        List<Seat> seats = seatRepository
                .findByTheatreIdAndIsActiveTrueOrderByRowLabelAscSeatNumberAsc(show.getTheatre().getId());

        if (seats.isEmpty()) {
            SeatMapResponse empty = new SeatMapResponse(
                    show.getId(),
                    new SeatMapResponse.TheatreInfo(
                            show.getTheatre().getId(),
                            show.getTheatre().getName(),
                            show.getTheatre().getCity()
                    ),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    LocalDateTime.now()
            );
            return Optional.of(empty);
        }

        // CRITICAL: Fetch existing ShowSeat records - EXPLICITLY filter by showId only
        // This ensures we ONLY get seats for THIS specific show (showId + showTime + date combination)
        List<ShowSeat> showSeats = showSeatRepository.findByShowId(show.getId());

        // Additional validation: ensure all showSeats belong to this EXACT show
        // This prevents any cross-show contamination
        showSeats = showSeats.stream()
                .filter(ss -> {
                    boolean matches = ss.getShow().getId().equals(show.getId());
                    if (!matches) {
                        // Log warning if we find a ShowSeat that doesn't belong to this show
                        System.err.println("WARNING: Found ShowSeat " + ss.getId() +
                                " belonging to show " + ss.getShow().getId() +
                                " when querying for show " + show.getId());
                    }
                    return matches;
                })
                .collect(Collectors.toList());

        // Map for quick lookup
        Map<Long, ShowSeat> seatMap = showSeats.stream()
                .collect(Collectors.toMap(ss -> ss.getSeat().getId(), ss -> ss));

        // Create missing ShowSeats if any
        List<ShowSeat> missing = new ArrayList<>();
        for (Seat seat : seats) {
            if (!seatMap.containsKey(seat.getId())) {
                ShowSeat newShowSeat = new ShowSeat(show, seat, ShowSeatStatus.AVAILABLE);
                missing.add(newShowSeat);
                seatMap.put(seat.getId(), newShowSeat);
            }
        }
        if (!missing.isEmpty()) {
            showSeatRepository.saveAll(missing);
        }

        // Prepare response
        LinkedHashSet<String> rows = new LinkedHashSet<>();
        LinkedHashSet<String> seatTypes = new LinkedHashSet<>();
        LocalDateTime now = LocalDateTime.now();
        List<SeatStatusResponse> seatStatuses = new ArrayList<>();

        for (Seat seat : seats) {
            ShowSeat showSeat = seatMap.get(seat.getId());

            // CRITICAL: Validate that this ShowSeat belongs to the correct show
            if (showSeat == null || !showSeat.getShow().getId().equals(show.getId())) {
                // Create a new ShowSeat if it doesn't exist or belongs to wrong show
                showSeat = new ShowSeat(show, seat, ShowSeatStatus.AVAILABLE);
                showSeatRepository.save(showSeat);
                seatMap.put(seat.getId(), showSeat);
            }

            // Only show as HELD if it's not expired
            boolean isHeld = showSeat.getStatus() == ShowSeatStatus.HELD;
            LocalDateTime holdExpiresAt = showSeat.getHoldExpiresAt();
            if (isHeld && holdExpiresAt != null && holdExpiresAt.isBefore(now)) {
                // Expired hold - treat as available
                showSeat.setStatus(ShowSeatStatus.AVAILABLE);
                showSeat.setHeldByUserId(null);
                showSeat.setHoldExpiresAt(null);
                showSeatRepository.save(showSeat);
                isHeld = false;
            }

            boolean heldByCurrentUser = isHeld && userId != null && userId.equals(showSeat.getHeldByUserId());
            Long remainingSeconds = holdExpiresAt != null && isHeld ? Duration.between(now, holdExpiresAt).getSeconds() : null;

            // Determine final status
            String finalStatus = isHeld ? ShowSeatStatus.HELD.name() : showSeat.getStatus().name();

            seatStatuses.add(new SeatStatusResponse(
                    seat.getId(),
                    seat.getRowLabel(),
                    seat.getSeatNumber(),
                    seat.getSeatType().name(),
                    finalStatus,
                    heldByCurrentUser,
                    holdExpiresAt,
                    remainingSeconds
            ));

            rows.add(seat.getRowLabel());
            seatTypes.add(seat.getSeatType().name());
        }

        SeatMapResponse response = new SeatMapResponse(
                show.getId(),
                new SeatMapResponse.TheatreInfo(
                        show.getTheatre().getId(),
                        show.getTheatre().getName(),
                        show.getTheatre().getCity()
                ),
                new ArrayList<>(rows),
                new ArrayList<>(seatTypes),
                seatStatuses,
                now
        );

        return Optional.of(response);
    }

    /**
     * Clear expired holds for a specific show
     */
    private void clearExpiredHoldsForShow(Long showId) {
        LocalDateTime now = LocalDateTime.now();
        List<ShowSeat> showSeats = showSeatRepository.findByShowId(showId);
        List<ShowSeat> toUpdate = new ArrayList<>();

        for (ShowSeat showSeat : showSeats) {
            if (showSeat.getStatus() == ShowSeatStatus.HELD
                    && showSeat.getHoldExpiresAt() != null
                    && showSeat.getHoldExpiresAt().isBefore(now)) {
                showSeat.setStatus(ShowSeatStatus.AVAILABLE);
                showSeat.setHeldByUserId(null);
                showSeat.setHoldExpiresAt(null);
                toUpdate.add(showSeat);
            }
        }

        if (!toUpdate.isEmpty()) {
            showSeatRepository.saveAll(toUpdate);
        }
    }
}
