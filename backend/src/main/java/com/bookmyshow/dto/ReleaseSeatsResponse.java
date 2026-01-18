package com.bookmyshow.dto;

import java.util.List;

public class ReleaseSeatsResponse {

    private Long showId;
    private List<SeatStatusResponse> seats;

    // No-args constructor
    public ReleaseSeatsResponse() {
    }

    // All-args constructor
    public ReleaseSeatsResponse(Long showId, List<SeatStatusResponse> seats) {
        this.showId = showId;
        this.seats = seats;
    }

    // Getters and Setters
    public Long getShowId() {
        return showId;
    }

    public void setShowId(Long showId) {
        this.showId = showId;
    }

    public List<SeatStatusResponse> getSeats() {
        return seats;
    }

    public void setSeats(List<SeatStatusResponse> seats) {
        this.seats = seats;
    }
}
