package com.bookmyshow.repository;

import com.bookmyshow.entity.SnackOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SnackOrderRepository extends JpaRepository<SnackOrder, Long> {
}
