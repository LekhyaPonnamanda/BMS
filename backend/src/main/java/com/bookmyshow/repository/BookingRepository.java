package com.bookmyshow.repository;

import com.bookmyshow.entity.Booking;
import com.bookmyshow.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    /**
     * Find confirmed bookings with show times in the future
     * Eagerly fetch show, movie, and theatre relationships
     */
    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.show s " +
           "JOIN FETCH s.movie m " +
           "JOIN FETCH s.theatre t " +
           "WHERE b.status = :status AND s.showTime > :now " +
           "ORDER BY s.showTime ASC")
    List<Booking> findConfirmedUpcomingBookings(@Param("status") BookingStatus status, 
                                                 @Param("now") LocalDateTime now);
    
    List<Booking> findByUserIdAndBookingTimeBetween(String userId, LocalDateTime start, LocalDateTime end);
}

