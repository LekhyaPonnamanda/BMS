package com.bookmyshow.exception;

import java.util.List;

public class SeatHoldConflictException extends RuntimeException {

    private final List<Long> failedSeatIds;

    public SeatHoldConflictException(String message, List<Long> failedSeatIds) {
        super(message);
        this.failedSeatIds = failedSeatIds;
    }

    public List<Long> getFailedSeatIds() {
        return failedSeatIds;
    }
}
