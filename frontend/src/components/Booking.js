import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Booking() {
    const { showId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [show, setShow] = useState(null);
    const [seatMap, setSeatMap] = useState(null);
    const [selectedSeatIds, setSelectedSeatIds] = useState([]);
    const [holdExpiresAt, setHoldExpiresAt] = useState(null);
    const [holdRemainingSeconds, setHoldRemainingSeconds] = useState(null);
    const userName = user?.name || user?.email || "";
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [holding, setHolding] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchShow();
    }, [showId]);

    useEffect(() => {
        // Reset state when showId changes
        setSeatMap(null);
        setSelectedSeatIds([]);
        setHoldExpiresAt(null);
        setError(null);
        fetchSeatMap();
    }, [showId, user?.id]);

    useEffect(() => {
        // Only set up polling if we have a valid showId
        if (!showId) return;

        const interval = setInterval(() => {
            fetchSeatMap();
        }, 5000);
        return () => clearInterval(interval);
    }, [showId, user?.id]);

    useEffect(() => {
        if (!holdExpiresAt) {
            setHoldRemainingSeconds(null);
            return;
        }

        const timer = setInterval(() => {
            const diffMs = new Date(holdExpiresAt).getTime() - Date.now();
            const seconds = Math.max(Math.floor(diffMs / 1000), 0);
            setHoldRemainingSeconds(seconds);

            if (seconds <= 0) {
                setHoldExpiresAt(null);
                setSelectedSeatIds([]);
                fetchSeatMap();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [holdExpiresAt]);

    const fetchShow = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8090/api/shows/${showId}`);
            setShow(response.data);
        } catch (err) {
            setError('Failed to load show details. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSeatMap = async () => {
        try {
            // CRITICAL: Always use the current showId from URL params to ensure correct show
            const currentShowId = showId;
            if (!currentShowId) {
                console.error('ShowId is missing');
                return;
            }

            const query = user?.id ? `?userId=${encodeURIComponent(user.id.toString())}` : "";
            const response = await axios.get(`http://localhost:8090/api/shows/${currentShowId}/seats${query}`);

            // Validate that the response is for the correct show
            if (response.data.showId && response.data.showId.toString() !== currentShowId.toString()) {
                console.error('Seat map response is for wrong show:', response.data.showId, 'expected:', currentShowId);
                return;
            }

            setSeatMap(response.data);

            const heldSeats = response.data.seats.filter(seat => seat.status === 'HELD' && seat.heldByCurrentUser);
            if (heldSeats.length > 0) {
                const expiresAt = heldSeats[0].holdExpiresAt;
                setHoldExpiresAt(expiresAt);
                setSelectedSeatIds(heldSeats.map(seat => seat.seatId));
            } else {
                // Clear hold state if no held seats found
                setHoldExpiresAt(null);
                setSelectedSeatIds([]);
            }
        } catch (err) {
            console.error('Failed to load seat map:', err);
            setError('Failed to load seat map. Please refresh the page.');
        }
    };

    const groupedSeats = useMemo(() => {
        if (!seatMap?.seats) return [];
        const byRow = {};
        seatMap.seats.forEach(seat => {
            if (!byRow[seat.rowLabel]) {
                byRow[seat.rowLabel] = [];
            }
            byRow[seat.rowLabel].push(seat);
        });

        const rows = seatMap.rows || Object.keys(byRow).sort();
        return rows.map(row => ({
            row,
            seats: (byRow[row] || []).sort((a, b) => a.seatNumber - b.seatNumber),
        }));
    }, [seatMap]);

    const handleSeatClick = (seat) => {
        if (holdExpiresAt) {
            setError('Release your hold to change selection.');
            return;
        }
        if (seat.status === 'BOOKED' || (seat.status === 'HELD' && !seat.heldByCurrentUser)) return;

        if (selectedSeatIds.includes(seat.seatId)) {
            setSelectedSeatIds(selectedSeatIds.filter(id => id !== seat.seatId));
        } else {
            setSelectedSeatIds([...selectedSeatIds, seat.seatId]);
        }
    };

    const getSeatClass = (seat) => {
        if (seat.status === 'BOOKED') return 'taken';
        if (seat.status === 'HELD' && !seat.heldByCurrentUser) return 'held';
        if (selectedSeatIds.includes(seat.seatId)) return 'selected';
        if (seat.status === 'HELD' && seat.heldByCurrentUser) return 'selected';
        return 'available';
    };

    const handleHoldSeats = async () => {
        if (!user || !userName.trim()) {
            setError('Please login to hold seats.');
            return;
        }
        if (selectedSeatIds.length === 0) {
            setError('Please select seats first.');
            return;
        }
        try {
            setHolding(true);
            setError(null);
            const response = await axios.post(`http://localhost:8090/api/shows/${showId}/seats/hold`, {
                seatIds: selectedSeatIds,
                holdMinutes: 10,
                userId: user.id.toString(),
            });
            setHoldExpiresAt(response.data.holdExpiresAt);
            setSelectedSeatIds(response.data.seats.map(seat => seat.seatId));
            fetchSeatMap();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to hold seats. Please try again.');
        } finally {
            setHolding(false);
        }
    };

    const handleReleaseSeats = async () => {
        try {
            setHolding(true);
            await axios.post(`http://localhost:8090/api/shows/${showId}/seats/release`, {
                seatIds: selectedSeatIds,
                userId: user?.id.toString(),
            });
            setHoldExpiresAt(null);
            setSelectedSeatIds([]);
            fetchSeatMap();
        } catch (err) {
            setError(err.response?.data || 'Failed to release seats. Please try again.');
        } finally {
            setHolding(false);
        }
    };

    const handleConfirmBooking = async (e) => {
        e.preventDefault();
        if (!user || !userName.trim()) {
            setError('Please login to proceed with booking.');
            return;
        }
        if (!holdExpiresAt || !selectedSeatIds.length) {
            setError('Please hold seats before confirming booking.');
            return;
        }

        // Navigate to payment page instead of directly confirming
        navigate('/payment', {
            state: {
                showId: parseInt(showId),
                seatIds: selectedSeatIds,
                userName: userName,
                userId: user.id.toString(),
                showDetails: show
            }
        });
    };

    const formatCountdown = (seconds) => {
        if (seconds === null) return "";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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

    if (!show) {
        return (
            <div className="main-content">
                <div className="container">
                    <div className="alert alert-danger" role="alert">
                        Show not found.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-8 col-md-11">
                        <div className="card shadow-lg border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                            <div className="card-header text-white" style={{
                                background: 'linear-gradient(135deg, var(--bms-red) 0%, var(--bms-red-dark) 100%)',
                                padding: '24px', border: 'none'
                            }}>
                                <h3 className="mb-0" style={{ fontWeight: '700' }}>
                                    <i className="bi bi-ticket-perforated me-2"></i>
                                    Book Your Tickets
                                </h3>
                            </div>

                            <div className="card-body p-4">
                                {error && (
                                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        <div>{error}</div>
                                    </div>
                                )}

                                <div className="mb-4" style={{ background: '#f8f9fa', borderRadius: '12px', padding: '24px', border: '2px solid #e9ecef' }}>
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <h4 style={{ color: '#1A1A1A', fontWeight: '700', marginBottom: '16px' }}>{show.movie.name}</h4>
                                        </div>
                                        <div className="col-md-6">
                                            <div style={{ fontSize: '13px', color: '#6c757d' }}><i className="bi bi-building me-1"/> Venue</div>
                                            <div style={{ fontSize: '16px', fontWeight: '600' }}>{show.theatre.name}, {show.theatre.city}</div>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleConfirmBooking} className="booking-form">
                                    {user && (
                                        <div className="mb-4" style={{ background: '#e7f3ff', borderRadius: '12px', padding: '16px', border: '1px solid #b3d9ff' }}>
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-person-circle me-2" style={{ fontSize: '24px', color: 'var(--bms-red)' }}></i>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#1A1A1A' }}>{user.name}</div>
                                                    <small className="text-muted">{user.email}</small>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="seat-map-container mb-4">
                                        <h5 className="mb-3 text-center" style={{ fontWeight: '700' }}>Select Your Seats</h5>
                                        <div className="seat-map">
                                            {groupedSeats.map((row) => (
                                                <div key={row.row} className="seat-row">
                                                    <div className="seat-row-label">{row.row}</div>
                                                    {row.seats.map((seat) => (
                                                        <div
                                                            key={seat.seatId}
                                                            className={`seat-item seat-${getSeatClass(seat)}`}
                                                            onClick={() => handleSeatClick(seat)}
                                                            title={seat.status === 'BOOKED' ? 'Booked' : 'Available'}
                                                        >
                                                            {seat.seatNumber}
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="text-center mb-4">
                                        <div className="screen-label">SCREEN</div>
                                        <div className="seat-legend">
                                            <div className="legend-item"><div className="legend-box legend-available"></div><span>Available</span></div>
                                            <div className="legend-item"><div className="legend-box legend-selected"></div><span>Selected</span></div>
                                            <div className="legend-item"><div className="legend-box legend-held"></div><span>Held</span></div>
                                            <div className="legend-item"><div className="legend-box legend-taken"></div><span>Booked</span></div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <p>Seats Selected: <strong style={{ color: 'var(--bms-red)' }}>{selectedSeatIds.length}</strong></p>
                                        {holdExpiresAt && (
                                            <div className="alert alert-warning d-flex align-items-center">
                                                <i className="bi bi-hourglass-split me-2"></i>
                                                <div>Hold expires in {formatCountdown(holdRemainingSeconds)}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-grid gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-lg"
                                            disabled={holding || !selectedSeatIds.length || holdExpiresAt}
                                            onClick={handleHoldSeats}
                                        >
                                            {holding ? 'Holding...' : 'Hold Seats'}
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            disabled={holding || !holdExpiresAt}
                                            onClick={handleReleaseSeats}
                                        >
                                            Release Hold
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn btn-success btn-lg"
                                            disabled={booking || !holdExpiresAt}
                                            style={{ background: 'linear-gradient(135deg, var(--bms-red) 0%, var(--bms-red-dark) 100%)', border: 'none' }}
                                        >
                                            {booking ? 'Confirming...' : 'Confirm Booking'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Booking;