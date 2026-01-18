package com.bookmyshow.dto;

import java.time.LocalDateTime;
import java.util.List;

public class HoldSeatsResponse {

    private Long showId;
    private LocalDateTime holdExpiresAt;
    private List<SeatStatusResponse> seats;

    // No-args constructor
    public HoldSeatsResponse() {
    }

    // All-args constructor
    public HoldSeatsResponse(Long showId, LocalDateTime holdExpiresAt, List<SeatStatusResponse> seats) {
        this.showId = showId;
        this.holdExpiresAt = holdExpiresAt;
        this.seats = seats;
    }

    // Getters and Setters
    public Long getShowId() {
        return showId;
    }

    public void setShowId(Long showId) {
        this.showId = showId;
    }

    public LocalDateTime getHoldExpiresAt() {
        return holdExpiresAt;
    }

    public void setHoldExpiresAt(LocalDateTime holdExpiresAt) {
        this.holdExpiresAt = holdExpiresAt;
    }

    public List<SeatStatusResponse> getSeats() {
        return seats;
    }

    public void setSeats(List<SeatStatusResponse> seats) {
        this.seats = seats;
    }
}
