package com.bookmyshow.notification;

import com.bookmyshow.entity.Booking;
import com.bookmyshow.entity.ShowSeat;

import java.util.List;

public interface Notifier {

    void sendBookingConfirmation(Booking booking, List<ShowSeat> seats);
}
