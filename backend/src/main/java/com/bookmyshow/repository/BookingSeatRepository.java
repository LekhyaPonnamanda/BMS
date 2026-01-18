package com.bookmyshow.repository;

import com.bookmyshow.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {
    // You can add custom queries here if needed
}
