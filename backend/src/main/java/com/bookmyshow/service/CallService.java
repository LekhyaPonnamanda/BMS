package com.bookmyshow.service;

import com.bookmyshow.entity.Booking;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Call;
import com.twilio.type.PhoneNumber;
import com.twilio.type.Twiml;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class CallService {

    private static final Logger logger = LoggerFactory.getLogger(CallService.class);

    @Value("${twilio.fromNumber:}")
    private String fromNumber;

    @Value("${twilio.accountSid:}")
    private String accountSid;

    @Value("${twilio.authToken:}")
    private String authToken;

    @PostConstruct
    public void init() {
        try {
            if (accountSid != null && authToken != null && !accountSid.isEmpty() && !authToken.isEmpty()) {
                Twilio.init(accountSid, authToken);
                logger.info("✅ Twilio initialized successfully");
            } else {
                logger.warn("⚠️ Twilio credentials not configured - calls will fail");
            }
        } catch (Exception e) {
            logger.error("❌ Failed to initialize Twilio: {}", e.getMessage());
        }
    }

    /**
     * Make a simple phone call (existing method)
     */
    public String makeCall(String toNumber) {
        if (fromNumber == null || fromNumber.isEmpty() || accountSid == null || accountSid.isEmpty()) {
            logger.warn("⚠️ Twilio not configured - cannot make call");
            throw new RuntimeException("Twilio is not configured. Please set twilio.fromNumber, twilio.accountSid, and twilio.authToken in application.properties");
        }

        Call call = Call.creator(
                new PhoneNumber(toNumber),
                new PhoneNumber(fromNumber),
                new Twiml(
                        "<Response>" +
                                "<Say voice='alice'>Hello Lekhya Ponnamanda! This call is made using Spring Boot.</Say>" +
                                "</Response>"
                )
        ).create();

        return call.getSid();
    }

    /**
     * Make a reminder call for a booking
     * @param booking The booking to send reminder for
     * @param phoneNumber Phone number to call
     * @return Call SID if successful
     */
    public String makeReminderCall(Booking booking, String phoneNumber) {
        if (fromNumber == null || fromNumber.isEmpty() || accountSid == null || accountSid.isEmpty()) {
            logger.warn("⚠️ Twilio not configured - cannot make reminder call for booking {}", booking.getId());
            throw new RuntimeException("Twilio is not configured. Please set twilio.fromNumber, twilio.accountSid, and twilio.authToken in application.properties");
        }

        try {
            String movieName = booking.getShow().getMovie().getName();
            String theatreName = booking.getShow().getTheatre().getName();
            String city = booking.getShow().getTheatre().getCity();
            LocalDateTime showTime = booking.getShow().getShowTime();

            // Format show time for speech
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("h:mm a");
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("EEEE, MMMM d");
            String showTimeFormatted = showTime.format(timeFormatter);
            String showDateFormatted = showTime.format(dateFormatter);

            // Build TwiML message for reminder call
            String twimlMessage = String.format(
                    "<Response>" +
                            "<Say voice='alice'>Hello %s! This is a reminder from BookMyShow.</Say>" +
                            "<Pause length='1'/>" +
                            "<Say voice='alice'>Your booking for %s is confirmed.</Say>" +
                            "<Pause length='1'/>" +
                            "<Say voice='alice'>Show details: Movie %s at %s in %s.</Say>" +
                            "<Pause length='1'/>" +
                            "<Say voice='alice'>Show time: %s on %s.</Say>" +
                            "<Pause length='1'/>" +
                            "<Say voice='alice'>Booking ID: %d.</Say>" +
                            "<Pause length='1'/>" +
                            "<Say voice='alice'>Please arrive 15 minutes before show time. Thank you for choosing BookMyShow!</Say>" +
                            "</Response>",
                    booking.getUserName(),
                    movieName,
                    movieName,
                    theatreName,
                    city,
                    showTimeFormatted,
                    showDateFormatted,
                    booking.getId()
            );

            logger.info("📞 Initiating reminder call to {} for booking {} (Movie: {}, Show: {})",
                    phoneNumber, booking.getId(), movieName, showTimeFormatted);

            Call call = Call.creator(
                    new PhoneNumber(phoneNumber),
                    new PhoneNumber(fromNumber),
                    new Twiml(twimlMessage)
            ).create();

            logger.info("✅ Reminder call initiated successfully. Call SID: {} for booking {}",
                    call.getSid(), booking.getId());

            return call.getSid();
        } catch (Exception e) {
            logger.error("❌ Failed to make reminder call for booking {}: {}",
                    booking.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to make reminder call", e);
        }
    }
}