package com.bookmyshow.repository;

import com.bookmyshow.entity.ShowSeat;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ShowSeatRepository extends JpaRepository<ShowSeat, Long> {

    List<ShowSeat> findByShowId(Long showId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT ss 
        FROM ShowSeat ss 
        WHERE ss.show.id = :showId 
        AND ss.seat.id IN :seatIds
    """)
    List<ShowSeat> findByShowIdAndSeatIdInForUpdate(
            @Param("showId") Long showId,
            @Param("seatIds") List<Long> seatIds
    );

    @Modifying
    @Query("""
        UPDATE ShowSeat ss 
        SET ss.status = com.bookmyshow.entity.ShowSeatStatus.AVAILABLE,
            ss.heldByUserId = NULL,
            ss.holdExpiresAt = NULL
        WHERE ss.status = com.bookmyshow.entity.ShowSeatStatus.HELD
        AND ss.holdExpiresAt < :now
    """)
    int clearExpiredHolds(@Param("now") LocalDateTime now);
}
