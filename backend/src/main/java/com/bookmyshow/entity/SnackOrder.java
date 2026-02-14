package com.bookmyshow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
public class SnackOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private Long bookingId;

    @Column(nullable = false)
    private int totalAmount;

    @Column(nullable = false)
    private int pointsUsed;

    @Column(nullable = false)
    private int moneyPaid;

    @Column(nullable = false)
    private LocalDateTime orderTime;

    @OneToMany(mappedBy = "snackOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SnackOrderItem> items;

    public SnackOrder() {}

    // ✅ GETTERS & SETTERS

    public Long getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public int getTotalAmount() {
        return totalAmount;
    }

    public int getPointsUsed() {
        return pointsUsed;
    }

    public int getMoneyPaid() {
        return moneyPaid;
    }

    public LocalDateTime getOrderTime() {
        return orderTime;
    }

    public List<SnackOrderItem> getItems() {
        return items;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public void setTotalAmount(int totalAmount) {
        this.totalAmount = totalAmount;
    }

    public void setPointsUsed(int pointsUsed) {
        this.pointsUsed = pointsUsed;
    }

    public void setMoneyPaid(int moneyPaid) {
        this.moneyPaid = moneyPaid;
    }

    public void setOrderTime(LocalDateTime orderTime) {
        this.orderTime = orderTime;
    }

    public void setItems(List<SnackOrderItem> items) {
        this.items = items;
    }
}
