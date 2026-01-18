package com.bookmyshow.repository;

import com.bookmyshow.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    // Get all active seats for a theatre, ordered by row label and seat number
    List<Seat> findByTheatreIdAndIsActiveTrueOrderByRowLabelAscSeatNumberAsc(Long theatreId);
}
