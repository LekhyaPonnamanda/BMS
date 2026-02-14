package com.bookmyshow.repository;

import com.bookmyshow.entity.SnackOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SnackOrderItemRepository extends JpaRepository<SnackOrderItem, Long> {
}
