package com.bookmyshow.dto;

import java.time.LocalDateTime;

public class SeatStatusResponse {

    private Long seatId;
    private String rowLabel;
    private Integer seatNumber;
    private String seatType;
    private String status;
    private boolean heldByCurrentUser;
    private LocalDateTime holdExpiresAt;
    private Long remainingSeconds;

    // No-args constructor
    public SeatStatusResponse() {
    }

    // All-args constructor
    public SeatStatusResponse(
            Long seatId,
            String rowLabel,
            Integer seatNumber,
            String seatType,
            String status,
            boolean heldByCurrentUser,
            LocalDateTime holdExpiresAt,
            Long remainingSeconds
    ) {
        this.seatId = seatId;
        this.rowLabel = rowLabel;
        this.seatNumber = seatNumber;
        this.seatType = seatType;
        this.status = status;
        this.heldByCurrentUser = heldByCurrentUser;
        this.holdExpiresAt = holdExpiresAt;
        this.remainingSeconds = remainingSeconds;
    }

    // Getters and Setters
    public Long getSeatId() {
        return seatId;
    }

    public void setSeatId(Long seatId) {
        this.seatId = seatId;
    }

    public String getRowLabel() {
        return rowLabel;
    }

    public void setRowLabel(String rowLabel) {
        this.rowLabel = rowLabel;
    }

    public Integer getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(Integer seatNumber) {
        this.seatNumber = seatNumber;
    }

    public String getSeatType() {
        return seatType;
    }

    public void setSeatType(String seatType) {
        this.seatType = seatType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isHeldByCurrentUser() {
        return heldByCurrentUser;
    }

    public void setHeldByCurrentUser(boolean heldByCurrentUser) {
        this.heldByCurrentUser = heldByCurrentUser;
    }

    public LocalDateTime getHoldExpiresAt() {
        return holdExpiresAt;
    }

    public void setHoldExpiresAt(LocalDateTime holdExpiresAt) {
        this.holdExpiresAt = holdExpiresAt;
    }

    public Long getRemainingSeconds() {
        return remainingSeconds;
    }

    public void setRemainingSeconds(Long remainingSeconds) {
        this.remainingSeconds = remainingSeconds;
    }
}
