import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function BookingConfirmation() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [show, setShow] = useState(null);
    const [seatMap, setSeatMap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    const [bookedSeatDetails, setBookedSeatDetails] = useState([]);

    const fetchBookingDetails = async () => {
        try {
            setLoading(true);
            const bookingResponse = await axios.get(`http://localhost:8090/api/bookings/${bookingId}`);
            const responseData = bookingResponse.data;

            // Extract booking and seats from response
            const bookingData = responseData.booking || responseData;
            const seatsData = responseData.seats || [];

            setBooking(bookingData);
            setBookedSeatDetails(seatsData);

            // Fetch show details (booking.show should have the show object with movie and theatre)
            const showId = bookingData.show?.id;
            if (showId) {
                const showResponse = await axios.get(`http://localhost:8090/api/shows/${showId}`);
                const showData = showResponse.data;
                setShow(showData);
            } else {
                setError('Show information not found in booking.');
            }
        } catch (err) {
            setError('Failed to load booking details. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getBookedSeats = () => {
        // CRITICAL FIX: Only show seats from THIS specific booking, not all booked seats
        if (!bookedSeatDetails || bookedSeatDetails.length === 0) {
            // Fallback to seatsBooked count if seat details not available
            return booking?.seatsBooked ? [`${booking.seatsBooked} seat(s)`] : [];
        }

        // Get seats ONLY from this booking and sort them
        const bookedSeats = bookedSeatDetails
            .map(seat => `${seat.rowLabel}${seat.seatNumber}`)
            .sort((a, b) => {
                // Sort by row first, then by seat number
                const rowA = a.match(/^([A-Z]+)/)[1];
                const rowB = b.match(/^([A-Z]+)/)[1];
                if (rowA !== rowB) return rowA.localeCompare(rowB);
                const numA = parseInt(a.match(/(\d+)$/)[1]);
                const numB = parseInt(b.match(/(\d+)$/)[1]);
                return numA - numB;
            });
        return bookedSeats;
    };

    if (loading) {
        return (
            <div className="main-content">
                <div className="container text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !booking || !show) {
        return (
            <div className="main-content">
                <div className="container">
                    <div className="alert alert-danger" role="alert">
                        {error || 'Booking not found.'}
                    </div>
                </div>
            </div>
        );
    }

    const bookedSeats = getBookedSeats();

    return (
        <div className="main-content" style={{ paddingTop: '40px', paddingBottom: '60px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-10 col-xl-8">
                        {/* Success Header */}
                        <div className="text-center mb-4">
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px',
                                boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                            }}>
                                <i className="bi bi-check-circle-fill" style={{ fontSize: '48px', color: 'white' }}></i>
                            </div>
                            <h1 style={{
                                color: '#1A1A1A',
                                fontWeight: '700',
                                marginBottom: '10px',
                                fontSize: '32px'
                            }}>
                                Booking Confirmed! 🎉
                            </h1>
                            <p style={{ color: '#6c757d', fontSize: '18px' }}>
                                Your tickets have been booked successfully
                            </p>
                        </div>

                        {/* Ticket Card */}
                        <div className="card shadow-lg border-0 mb-4" style={{
                            borderRadius: '20px',
                            overflow: 'hidden',
                            background: 'white',
                            border: '2px solid #e9ecef'
                        }}>
                            {/* Ticket Header */}
                            <div style={{
                                background: 'linear-gradient(135deg, var(--bms-red) 0%, var(--bms-red-dark) 100%)',
                                padding: '30px',
                                color: 'white',
                                position: 'relative'
                            }}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h2 style={{ fontWeight: '700', marginBottom: '10px', fontSize: '28px' }}>
                                            {show.movie?.name || 'Movie'}
                                        </h2>
                                        <div style={{ fontSize: '16px', opacity: 0.9 }}>
                                            <i className="bi bi-film me-2"></i>
                                            {show.movie?.language || ''} • {show.movie?.genre || ''} • {show.movie?.duration || 0} min
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        borderRadius: '12px',
                                        padding: '12px 20px',
                                        textAlign: 'center',
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>Booking ID</div>
                                        <div style={{ fontSize: '20px', fontWeight: '700' }}>#{booking.id}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Body */}
                            <div className="card-body p-4">
                                <div className="row g-4">
                                    {/* Show Details */}
                                    <div className="col-md-6">
                                        <div style={{
                                            background: '#f8f9fa',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            height: '100%',
                                            border: '1px solid #e9ecef'
                                        }}>
                                            <h5 style={{
                                                color: '#6c757d',
                                                fontSize: '12px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                marginBottom: '12px',
                                                fontWeight: '600'
                                            }}>
                                                Show Details
                                            </h5>
                                            <div className="mb-3">
                                                <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>
                                                    <i className="bi bi-calendar3 me-2"></i>Date & Time
                                                </div>
                                                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1A1A1A' }}>
                                                    {formatDateTime(show.showTime)}
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>
                                                    <i className="bi bi-building me-2"></i>Theatre
                                                </div>
                                                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1A1A1A' }}>
                                                    {show.theatre?.name || 'Theatre'}
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
                                                    {show.theatre?.city || ''}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Booking Details */}
                                    <div className="col-md-6">
                                        <div style={{
                                            background: '#f8f9fa',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            height: '100%',
                                            border: '1px solid #e9ecef'
                                        }}>
                                            <h5 style={{
                                                color: '#6c757d',
                                                fontSize: '12px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '1px',
                                                marginBottom: '12px',
                                                fontWeight: '600'
                                            }}>
                                                Booking Details
                                            </h5>
                                            <div className="mb-3">
                                                <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>
                                                    <i className="bi bi-person me-2"></i>Booked By
                                                </div>
                                                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1A1A1A' }}>
                                                    {booking.userName}
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>
                                                    <i className="bi bi-ticket-perforated me-2"></i>Seats
                                                </div>
                                                <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--bms-red)' }}>
                                                    {bookedSeats.length > 0 ? bookedSeats.join(', ') : `${booking.seatsBooked} seat(s)`}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>
                                                    <i className="bi bi-check-circle me-2"></i>Status
                                                </div>
                                                <div>
                                                    <span className="badge" style={{
                                                        background: '#28a745',
                                                        fontSize: '14px',
                                                        padding: '6px 12px',
                                                        borderRadius: '6px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Important Information */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    marginTop: '24px',
                                    border: '1px solid #ffc107'
                                }}>
                                    <div className="d-flex align-items-start">
                                        <i className="bi bi-info-circle-fill me-3" style={{ fontSize: '24px', color: '#856404' }}></i>
                                        <div>
                                            <h6 style={{ fontWeight: '700', color: '#856404', marginBottom: '8px' }}>
                                                Important Information
                                            </h6>
                                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#856404', fontSize: '14px' }}>
                                                <li>Please arrive at the theatre 15 minutes before the show time</li>
                                                <li>Carry a valid ID proof for verification</li>
                                                <li>Booking ID: <strong>#{booking.id}</strong> - Keep this for reference</li>
                                                <li>Seats are non-refundable and non-transferable</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="text-center">
                            <button
                                className="btn btn-lg me-3"
                                onClick={() => navigate('/')}
                                style={{
                                    background: 'linear-gradient(135deg, var(--bms-red) 0%, var(--bms-red-dark) 100%)',
                                    border: 'none',
                                    color: 'white',
                                    padding: '14px 40px',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    fontSize: '16px',
                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                                }}
                            >
                                <i className="bi bi-house me-2"></i>Go to Home
                            </button>
                            <button
                                className="btn btn-outline-secondary btn-lg"
                                onClick={() => window.print()}
                                style={{
                                    padding: '14px 40px',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    fontSize: '16px',
                                    borderWidth: '2px'
                                }}
                            >
                                <i className="bi bi-printer me-2"></i>Print Ticket
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookingConfirmation;