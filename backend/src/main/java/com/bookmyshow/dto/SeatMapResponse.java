package com.bookmyshow.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SeatMapResponse {

    private Long showId;
    private TheatreInfo theatre;
    private List<String> rows;
    private List<String> seatTypes;
    private List<SeatStatusResponse> seats;
    private LocalDateTime serverTime;

    // No-args constructor
    public SeatMapResponse() {
    }

    // All-args constructor
    public SeatMapResponse(
            Long showId,
            TheatreInfo theatre,
            List<String> rows,
            List<String> seatTypes,
            List<SeatStatusResponse> seats,
            LocalDateTime serverTime
    ) {
        this.showId = showId;
        this.theatre = theatre;
        this.rows = rows;
        this.seatTypes = seatTypes;
        this.seats = seats;
        this.serverTime = serverTime;
    }

    // Getters and Setters
    public Long getShowId() {
        return showId;
    }

    public void setShowId(Long showId) {
        this.showId = showId;
    }

    public TheatreInfo getTheatre() {
        return theatre;
    }

    public void setTheatre(TheatreInfo theatre) {
        this.theatre = theatre;
    }

    public List<String> getRows() {
        return rows;
    }

    public void setRows(List<String> rows) {
        this.rows = rows;
    }

    public List<String> getSeatTypes() {
        return seatTypes;
    }

    public void setSeatTypes(List<String> seatTypes) {
        this.seatTypes = seatTypes;
    }

    public List<SeatStatusResponse> getSeats() {
        return seats;
    }

    public void setSeats(List<SeatStatusResponse> seats) {
        this.seats = seats;
    }

    public LocalDateTime getServerTime() {
        return serverTime;
    }

    public void setServerTime(LocalDateTime serverTime) {
        this.serverTime = serverTime;
    }

    public static class TheatreInfo {
        private Long id;
        private String name;
        private String city;

        // Default constructor (required for JSON deserialization)
        public TheatreInfo() {
        }

        // Constructor with all fields
        public TheatreInfo(Long id, String name, String city) {
            this.id = id;
            this.name = name;
            this.city = city;
        }

        // Getters and Setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }
    }
}
