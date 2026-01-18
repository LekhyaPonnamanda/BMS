import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    const { showId, seatIds, userName, userId, showDetails } = location.state || {};

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [upiId, setUpiId] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    // Calculate total amount (assuming ₹200 per seat)
    const seatPrice = 200;
    const totalAmount = (seatIds?.length || 0) * seatPrice;
    const gst = Math.round(totalAmount * 0.18);
    const finalAmount = totalAmount + gst;

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const formatExpiry = (value) => {
        const v = value.replace(/\D/g, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const handleCardNumberChange = (e) => {
        setCardNumber(formatCardNumber(e.target.value));
    };

    const handleExpiryChange = (e) => {
        setExpiryDate(formatExpiry(e.target.value));
    };

    const handleCvvChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').substring(0, 3);
        setCvv(value);
    };

    const validatePayment = () => {
        if (!email.trim()) {
            setError('Please enter your email address');
            return false;
        }
        if (!phoneNumber.trim() || phoneNumber.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return false;
        }
        if (paymentMethod === 'card') {
            if (cardNumber.replace(/\s/g, '').length !== 16) {
                setError('Please enter a valid 16-digit card number');
                return false;
            }
            if (!cardName.trim()) {
                setError('Please enter cardholder name');
                return false;
            }
            if (expiryDate.length !== 5) {
                setError('Please enter a valid expiry date (MM/YY)');
                return false;
            }
            if (cvv.length !== 3) {
                setError('Please enter a valid CVV');
                return false;
            }
        } else if (paymentMethod === 'upi') {
            if (!upiId.trim() || !upiId.includes('@')) {
                setError('Please enter a valid UPI ID (e.g., name@paytm)');
                return false;
            }
        }
        return true;
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validatePayment()) {
            return;
        }

        try {
            setProcessing(true);
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Confirm booking with payment details
            const response = await axios.post(`http://localhost:8090/api/bookings/confirm`, {
                showId: parseInt(showId),
                seatIds: seatIds,
                userId: userId || userName,
                paymentRef: `PAY-${Date.now()}`,
                paymentMethod: paymentMethod,
                email: email,
                phoneNumber: phoneNumber,
            });

            navigate(`/booking-confirmation/${response.data.bookingId}`, {
                state: { email, phoneNumber }
            });
        } catch (err) {
            setError(err.response?.data || 'Payment failed. Please try again.');
            setProcessing(false);
        }
    };

    if (!showId || !seatIds || seatIds.length === 0) {
        return (
            <div className="main-content">
                <div className="container">
                    <div className="alert alert-danger" role="alert">
                        Invalid booking session. Please start over.
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/')}>
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-10 col-xl-9">
                        <div className="card shadow-lg border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                            {/* Header */}
                            <div className="card-header text-white" style={{
                                background: 'linear-gradient(135deg, var(--bms-red) 0%, var(--bms-red-dark) 100%)',
                                padding: '24px',
                                border: 'none'
                            }}>
                                <h3 className="mb-0" style={{ fontWeight: '700' }}>
                                    <i className="bi bi-credit-card me-2"></i>
                                    Payment
                                </h3>
                            </div>

                            <div className="card-body p-4">
                                {error && (
                                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        <div>{error}</div>
                                    </div>
                                )}

                                <div className="row">
                                    {/* Payment Form */}
                                    <div className="col-lg-7">
                                        <form onSubmit={handlePayment}>
                                            {/* Contact Information */}
                                            <div className="mb-4">
                                                <h5 style={{ fontWeight: '600', marginBottom: '20px', color: '#1A1A1A' }}>
                                                    <i className="bi bi-person me-2"></i>Contact Information
                                                </h5>
                                                <div className="mb-3">
                                                    <label className="form-label">Email Address <span className="text-danger">*</span></label>
                                                    <input
                                                        type="email"
                                                        className="form-control form-control-lg"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="your.email@example.com"
                                                        required
                                                    />
                                                    <small className="text-muted">Ticket details will be sent to this email</small>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Phone Number <span className="text-danger">*</span></label>
                                                    <input
                                                        type="tel"
                                                        className="form-control form-control-lg"
                                                        value={phoneNumber}
                                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').substring(0, 10))}
                                                        placeholder="9876543210"
                                                        maxLength="10"
                                                        required
                                                    />
                                                    <small className="text-muted">SMS confirmation will be sent to this number</small>
                                                </div>
                                            </div>

                                            {/* Payment Method Selection */}
                                            <div className="mb-4">
                                                <h5 style={{ fontWeight: '600', marginBottom: '20px', color: '#1A1A1A' }}>
                                                    <i className="bi bi-wallet2 me-2"></i>Select Payment Method
                                                </h5>
                                                <div className="btn-group w-100 mb-3" role="group">
                                                    <input
                                                        type="radio"
                                                        className="btn-check"
                                                        name="paymentMethod"
                                                        id="card"
                                                        checked={paymentMethod === 'card'}
                                                        onChange={() => setPaymentMethod('card')}
                                                    />
                                                    <label className="btn btn-outline-primary" htmlFor="card">
                                                        <i className="bi bi-credit-card me-2"></i>Card
                                                    </label>

                                                    <input
                                                        type="radio"
                                                        className="btn-check"
                                                        name="paymentMethod"
                                                        id="upi"
                                                        checked={paymentMethod === 'upi'}
                                                        onChange={() => setPaymentMethod('upi')}
                                                    />
                                                    <label className="btn btn-outline-primary" htmlFor="upi">
                                                        <i className="bi bi-phone me-2"></i>UPI
                                                    </label>
                                                </div>

                                                {/* Card Payment Form */}
                                                {paymentMethod === 'card' && (
                                                    <div style={{
                                                        background: '#f8f9fa',
                                                        borderRadius: '12px',
                                                        padding: '20px',
                                                        border: '1px solid #e9ecef'
                                                    }}>
                                                        <div className="mb-3">
                                                            <label className="form-label">Card Number <span className="text-danger">*</span></label>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-lg"
                                                                value={cardNumber}
                                                                onChange={handleCardNumberChange}
                                                                placeholder="1234 5678 9012 3456"
                                                                maxLength="19"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="form-label">Cardholder Name <span className="text-danger">*</span></label>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-lg"
                                                                value={cardName}
                                                                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                                                placeholder="JOHN DOE"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-6 mb-3">
                                                                <label className="form-label">Expiry Date <span className="text-danger">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-lg"
                                                                    value={expiryDate}
                                                                    onChange={handleExpiryChange}
                                                                    placeholder="MM/YY"
                                                                    maxLength="5"
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="col-md-6 mb-3">
                                                                <label className="form-label">CVV <span className="text-danger">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-lg"
                                                                    value={cvv}
                                                                    onChange={handleCvvChange}
                                                                    placeholder="123"
                                                                    maxLength="3"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* UPI Payment Form */}
                                                {paymentMethod === 'upi' && (
                                                    <div style={{
                                                        background: '#f8f9fa',
                                                        borderRadius: '12px',
                                                        padding: '20px',
                                                        border: '1px solid #e9ecef'
                                                    }}>
                                                        <div className="mb-3">
                                                            <label className="form-label">UPI ID <span className="text-danger">*</span></label>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-lg"
                                                                value={upiId}
                                                                onChange={(e) => setUpiId(e.target.value)}
                                                                placeholder="yourname@paytm"
                                                                required
                                                            />
                                                            <small className="text-muted">Enter your UPI ID (e.g., name@paytm, name@phonepe)</small>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Security Notice */}
                                            <div className="alert alert-info d-flex align-items-start mb-4">
                                                <i className="bi bi-shield-check me-2" style={{ fontSize: '20px' }}></i>
                                                <div>
                                                    <strong>Secure Payment</strong>
                                                    <p className="mb-0" style={{ fontSize: '14px' }}>
                                                        Your payment information is encrypted and secure. We use industry-standard security measures.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            <button
                                                type="submit"
                                                className="btn btn-success btn-lg w-100"
                                                disabled={processing}
                                                style={{
                                                    background: 'linear-gradient(135deg, var(--bms-red) 0%, var(--bms-red-dark) 100%)',
                                                    border: 'none',
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    fontWeight: '600',
                                                    fontSize: '18px'
                                                }}
                                            >
                                                {processing ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Processing Payment...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-lock-fill me-2"></i>
                                                        Pay ₹{finalAmount.toLocaleString('en-IN')}
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="col-lg-5">
                                        <div style={{
                                            background: '#f8f9fa',
                                            borderRadius: '12px',
                                            padding: '24px',
                                            border: '1px solid #e9ecef',
                                            position: 'sticky',
                                            top: '20px'
                                        }}>
                                            <h5 style={{ fontWeight: '700', marginBottom: '20px', color: '#1A1A1A' }}>
                                                <i className="bi bi-receipt me-2"></i>Order Summary
                                            </h5>

                                            {showDetails && (
                                                <div className="mb-3 pb-3 border-bottom">
                                                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#1A1A1A', marginBottom: '8px' }}>
                                                        {showDetails.movie?.name}
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                                        <i className="bi bi-building me-1"></i>
                                                        {showDetails.theatre?.name}, {showDetails.theatre?.city}
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
                                                        <i className="bi bi-calendar3 me-1"></i>
                                                        {new Date(showDetails.showTime).toLocaleString('en-IN')}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span style={{ color: '#6c757d' }}>Seats ({seatIds.length})</span>
                                                    <span style={{ fontWeight: '600' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span style={{ color: '#6c757d' }}>GST (18%)</span>
                                                    <span style={{ fontWeight: '600' }}>₹{gst.toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>

                                            <div className="border-top pt-3 mt-3">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A1A' }}>Total</span>
                                                    <span style={{ fontSize: '24px', fontWeight: '700', color: 'var(--bms-red)' }}>
                                                        ₹{finalAmount.toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-top">
                                                <div style={{ fontSize: '12px', color: '#6c757d', textAlign: 'center' }}>
                                                    <i className="bi bi-info-circle me-1"></i>
                                                    Tickets are non-refundable
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Payment;
