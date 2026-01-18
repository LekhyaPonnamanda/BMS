package com.bookmyshow.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Show is required")
    @ManyToOne
    @JoinColumn(name = "show_id", nullable = false)
    private Show show;

    @NotNull(message = "Seats booked is required")
    @Positive(message = "Seats booked must be positive")
    @Column(nullable = false)
    private Integer seatsBooked;

    @NotBlank(message = "User name is required")
    @Column(nullable = false)
    private String userName;


    @Column(name="user_id",length=255)
    private String userId;

    @Column(name="phone_number", length=20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false,length=20)
    private BookingStatus status=BookingStatus.PENDING;

    @Column(name="total_amount",precision=10,scale=2)
    private BigDecimal totalAmount;



    @Column(name="booking_time", nullable = false)
    private LocalDateTime bookingTime;

    @PrePersist
    protected void onCreate() {
        if (bookingTime == null) {
            bookingTime = LocalDateTime.now();
        }
    }

    public Booking() {
    }

    public Booking(Show show, Integer seatsBooked, String userName) {
        this.show = show;
        this.seatsBooked = seatsBooked;
        this.userName = userName;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Show getShow() {
        return show;
    }

    public void setShow(Show show) {
        this.show = show;
    }

    public Integer getSeatsBooked() {
        return seatsBooked;
    }

    public void setSeatsBooked(Integer seatsBooked) {
        this.seatsBooked = seatsBooked;
    }

    public String getUserName() {
        return userName;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public LocalDateTime getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(LocalDateTime bookingTime) {
        this.bookingTime = bookingTime;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}

