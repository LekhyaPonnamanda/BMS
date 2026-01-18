package com.bookmyshow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(
        name = "booking_seats",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_booking_seat_show_seat",
                        columnNames = {"show_id", "seat_id"}
                )
        }
)
public class BookingSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many seats belong to one booking
    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    @NotNull(message = "Booking is required")
    private Booking booking;

    // Many booking seats belong to one show
    @ManyToOne
    @JoinColumn(name = "show_id", nullable = false)
    @NotNull(message = "Show is required")
    private Show show;

    // Each booking seat maps to one seat
    @ManyToOne
    @JoinColumn(name = "seat_id", nullable = false)
    @NotNull(message = "Seat is required")
    private Seat seat;

    // Constructors
    public BookingSeat() {
    }

    public BookingSeat(Booking booking, Show show, Seat seat) {
        this.booking = booking;
        this.show = show;
        this.seat = seat;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public Show getShow() {
        return show;
    }

    public void setShow(Show show) {
        this.show = show;
    }

    public Seat getSeat() {
        return seat;
    }

    public void setSeat(Seat seat) {
        this.seat = seat;
    }
}
