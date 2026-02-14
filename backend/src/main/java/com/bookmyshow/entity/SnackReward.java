package com.bookmyshow.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class SnackReward {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private int points;

    @Column(nullable = false)
    private LocalDateTime earnedAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    public SnackReward() {}

    public SnackReward(String userId, int points, LocalDateTime earnedAt, LocalDateTime expiresAt) {
        this.userId = userId;
        this.points = points;
        this.earnedAt = earnedAt;
        this.expiresAt = expiresAt;
    }

    public Long getId() { return id; }
    public String getUserId() { return userId; }
    public int getPoints() { return points; }
    public LocalDateTime getEarnedAt() { return earnedAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }

    public void setId(Long id) { this.id = id; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setPoints(int points) { this.points = points; }
    public void setEarnedAt(LocalDateTime earnedAt) { this.earnedAt = earnedAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
