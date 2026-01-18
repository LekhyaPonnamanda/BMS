package com.bookmyshow.repository;

import com.bookmyshow.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {
    @Query("SELECT s FROM Show s JOIN FETCH s.movie JOIN FETCH s.theatre WHERE s.movie.id = :movieId AND s.theatre.city = :city")
    List<Show> findByMovieIdAndCity(@Param("movieId") Long movieId, @Param("city") String city);
    
    @Query("SELECT s FROM Show s JOIN FETCH s.movie JOIN FETCH s.theatre WHERE s.theatre.city = :city")
    List<Show> findByTheatreCity(@Param("city") String city);
}

