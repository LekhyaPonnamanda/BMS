package com.bookmyshow.repository;

import com.bookmyshow.entity.SnackReward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SnackRewardRepository extends JpaRepository<SnackReward, Long> {

    List<SnackReward> findByUserId(String userId);

    List<SnackReward> findByUserIdAndExpiresAtAfter(String userId, LocalDateTime now);

    // ⭐ NON-EXPIRED rewards ordered by earned date (FIFO for deduction)
    List<SnackReward> findByUserIdAndExpiresAtAfterOrderByEarnedAtAsc(
            String userId, LocalDateTime now);

    // ⭐ ordered by expiry (useful when spending oldest first, only non-expired)
    List<SnackReward> findByUserIdAndExpiresAtAfterOrderByExpiresAtAsc(
            String userId, LocalDateTime now);

    // ⭐ ALL rewards ordered by earned date (FIFO for deduction - regardless of expiry)
    List<SnackReward> findByUserIdOrderByEarnedAtAsc(String userId);

    // ⭐ total active points (only non-expired)
    @Query("SELECT COALESCE(SUM(s.points), 0) FROM SnackReward s WHERE s.userId = :userId AND s.expiresAt > :now")
    int sumActivePointsByUserId(@Param("userId") String userId,
                                @Param("now") LocalDateTime now);
}
