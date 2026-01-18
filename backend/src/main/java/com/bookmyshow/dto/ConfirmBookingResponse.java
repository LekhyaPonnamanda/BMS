package com.bookmyshow.dto;

import java.util.List;

public class ConfirmBookingResponse {

    private Long bookingId;
    private Long showId;
    private List<Long> seatIds;
    private String status;

    // No-args constructor
    public ConfirmBookingResponse() {
    }

    // All-args constructor
    public ConfirmBookingResponse(Long bookingId, Long showId, List<Long> seatIds, String status) {
        this.bookingId = bookingId;
        this.showId = showId;
        this.seatIds = seatIds;
        this.status = status;
    }

    // Getters and Setters
    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getShowId() {
        return showId;
    }

    public void setShowId(Long showId) {
        this.showId = showId;
    }

    public List<Long> getSeatIds() {
        return seatIds;
    }

    public void setSeatIds(List<Long> seatIds) {
        this.seatIds = seatIds;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
