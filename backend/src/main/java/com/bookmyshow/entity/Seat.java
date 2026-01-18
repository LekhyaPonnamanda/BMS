package com.bookmyshow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(
    name = "seats",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_seat_theatre_row_number",
            columnNames = {"theatre_id", "row_label", "seat_number"}
        )
    }
)
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many seats belong to one theatre
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theatre_id", nullable = false)
    @NotNull(message = "Theatre is required")
    private Theatre theatre;

    @NotBlank(message = "Row label is required")
    @Column(name = "row_label", nullable = false, length = 5)
    private String rowLabel;

    @NotNull(message = "Seat number is required")
    @Positive(message = "Seat number must be positive")
    @Column(name = "seat_number", nullable = false)
    private Integer seatNumber;

    @NotNull(message = "Seat type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", nullable = false, length = 20)
    private SeatType seatType;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Constructors
    public Seat() {
    }

    public Seat(Theatre theatre, String rowLabel, Integer seatNumber, SeatType seatType) {
        this.theatre = theatre;
        this.rowLabel = rowLabel;
        this.seatNumber = seatNumber;
        this.seatType = seatType;
        this.isActive = true;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public Theatre getTheatre() {
        return theatre;
    }

    public void setTheatre(Theatre theatre) {
        this.theatre = theatre;
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

    public SeatType getSeatType() {
        return seatType;
    }

    public void setSeatType(SeatType seatType) {
        this.seatType = seatType;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }
}
