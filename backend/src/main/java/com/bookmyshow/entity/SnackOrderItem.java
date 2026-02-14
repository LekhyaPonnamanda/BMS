package com.bookmyshow.entity;

import jakarta.persistence.*;

@Entity
public class SnackOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "snack_order_id")
    private SnackOrder snackOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "snack_id")
    private Snack snack;

    @Column(nullable = false)
    private int quantity;

    public SnackOrderItem() {}

    // ✅ GETTERS & SETTERS

    public Long getId() {
        return id;
    }

    public SnackOrder getSnackOrder() {
        return snackOrder;
    }

    public Snack getSnack() {
        return snack;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setSnackOrder(SnackOrder snackOrder) {
        this.snackOrder = snackOrder;
    }

    public void setSnack(Snack snack) {
        this.snack = snack;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
