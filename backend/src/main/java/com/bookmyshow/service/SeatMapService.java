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

        // Fetch existing ShowSeat records
        List<ShowSeat> showSeats = showSeatRepository.findByShowId(show.getId());

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

            boolean heldByCurrentUser = userId != null && userId.equals(showSeat.getHeldByUserId());
            LocalDateTime holdExpiresAt = showSeat.getHoldExpiresAt();
            Long remainingSeconds = holdExpiresAt != null ? Duration.between(now, holdExpiresAt).getSeconds() : null;

            seatStatuses.add(new SeatStatusResponse(
                    seat.getId(),
                    seat.getRowLabel(),
                    seat.getSeatNumber(),
                    seat.getSeatType().name(),
                    showSeat.getStatus().name(),
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
}
