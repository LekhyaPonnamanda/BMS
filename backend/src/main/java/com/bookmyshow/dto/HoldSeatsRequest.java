package com.bookmyshow.dto;

import java.util.List;

public class HoldSeatsRequest {

    private List<Long> seatIds;
    private Integer holdMinutes;
    private String userId;

    // No-args constructor
    public HoldSeatsRequest() {
    }

    // Getters and Setters
    public List<Long> getSeatIds() {
        return seatIds;
    }

    public void setSeatIds(List<Long> seatIds) {
        this.seatIds = seatIds;
    }

    public Integer getHoldMinutes() {
        return holdMinutes;
    }

    public void setHoldMinutes(Integer holdMinutes) {
        this.holdMinutes = holdMinutes;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
