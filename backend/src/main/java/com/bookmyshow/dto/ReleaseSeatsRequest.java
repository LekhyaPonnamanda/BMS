package com.bookmyshow.dto;

import java.util.List;

public class ReleaseSeatsRequest {

    private List<Long> seatIds;
    private String userId;

    // No-args constructor
    public ReleaseSeatsRequest() {
    }

    // Getters and Setters
    public List<Long> getSeatIds() {
        return seatIds;
    }

    public void setSeatIds(List<Long> seatIds) {
        this.seatIds = seatIds;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
