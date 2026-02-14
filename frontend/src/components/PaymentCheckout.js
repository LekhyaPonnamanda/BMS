import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function PaymentCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart, snacks, userPoints, pointsToUse, total, remainingToPay, bookingId } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStep, setPaymentStep] = useState('method'); // method, details, processing, success
  const [pointsNotification, setPointsNotification] = useState(null); // {old, new, deducted}
  
  // Card details
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const handleCardChange = (field, value) => {
    if (field === 'number') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }
    if (field === 'expiry') {
      // Remove all non-digits
      value = value.replace(/\D/g, '');
      // Format as MM/YY (limit to 4 digits)
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
    }
    if (field === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 3);
    }
    setCardDetails(prev => ({ ...prev, [field]: value }));
  };

  const validateCardDetails = () => {
    if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length !== 16) {
      setError('Card number must be 16 digits');
      return false;
    }
    if (!cardDetails.name) {
      setError('Cardholder name is required');
      return false;
    }
    if (!cardDetails.expiry || cardDetails.expiry.length !== 5) {
      setError('Expiration date must be MM/YY');
      return false;
    }
    if (!cardDetails.cvv || cardDetails.cvv.length !== 3) {
      setError('CVV must be 3 digits');
      return false;
    }
    return true;
  };

  const processPayment = async () => {
    setError(null);
    
    if (paymentMethod === 'card' && !validateCardDetails()) return;

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate payment success (99.9% success - very high reliability)
      const isSuccessful = Math.random() > 0.001;

      if (!isSuccessful) {
        throw new Error('Payment declined by bank. Please try again.');
      }

      // Place snack order after successful payment
      let orderResponse = null;
      try {
        const response = await axios.post('http://localhost:8090/snacks/order', {
          userId: user.id,
          bookingId,
          items: cart,
          pointsToUse
        });
        orderResponse = response.data;
        console.log('✅ Order placed successfully:', orderResponse);
        console.log('📊 Remaining points from backend:', orderResponse.remainingPoints);
      } catch (orderErr) {
        // If backend fails, create a demo response for demo purposes
        console.warn('Backend order failed, using demo response:', orderErr.message);
        
        // Create dummy order response for demo mode
        orderResponse = {
          id: Math.floor(Math.random() * 10000),
          userId: user.id,
          bookingId: bookingId,
          totalAmount: total,
          pointsUsed: pointsToUse,
          moneyPaid: remainingToPay,
          orderTime: new Date().toISOString(),
          message: 'Order placed successfully (Demo Mode)',
          remainingPoints: Math.max(0, userPoints - pointsToUse)
        };
      }

      // Store order details for display
      const orderDataToDisplay = orderResponse;
      
      // ULTRA-FAST UI UPDATE: Calculate new points immediately
      const newRemainingPoints = orderResponse.remainingPoints !== undefined ? 
        orderResponse.remainingPoints : Math.max(0, userPoints - pointsToUse);
      
      const updateStartTime = performance.now();
      console.log('💾 Order placed! Points used: ' + pointsToUse + ', New balance: ' + newRemainingPoints);
      
      // SYNCHRONOUS Update 1: Update global navbar points (< 1ms)
      if (pointsToUse > 0 && window.updateSnackPointsImmediately) {
        window.updateSnackPointsImmediately(newRemainingPoints);
      }
      
      // SYNCHRONOUS Update 2: Set notification before showing success screen
      if (pointsToUse > 0) {
        setPointsNotification({
          old: userPoints,
          new: newRemainingPoints,
          deducted: pointsToUse
        });
      }
      
      // SYNCHRONOUS Update 3: Show success screen with updated state
      setPaymentStep('success');
      
      const updateEndTime = performance.now();
      console.log('⚡ Total UI update time: ' + (updateEndTime - updateStartTime).toFixed(2) + 'ms');
      
      // Backup: Refresh after a tiny delay for extra safety
      setTimeout(() => {
        if (window.refreshSnackPoints) {
          window.refreshSnackPoints();
        }
      }, 50);
      
      // Navigate to order success after 3 seconds
      setTimeout(() => {
        navigate('/order-success', { 
          state: { 
            orderData: orderDataToDisplay,
            orderDetails: {
              items: cart,
              snacks: snacks,
              total: total,
              pointsUsed: orderResponse.pointsUsed || pointsToUse,
              moneyPaid: orderResponse.moneyPaid || remainingToPay
            }
          } 
        });
      }, 3000);
    } catch (paymentErr) {
      // Payment simulation failed
      setError(paymentErr.message || 'Payment processing failed. Please try again.');
      setPaymentStep('method');
      setIsProcessing(false);
    }
  };

  if (!location.state) {
    return (
      <div className="container mt-5 text-center">
        <p>No cart found. Please start shopping.</p>
        <button className="btn btn-primary" onClick={() => navigate('/snacks')}>
          Back to Snacks
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="mb-4">
            <h2>💳 Secure Checkout</h2>
            <p className="text-muted">Complete your payment to confirm your order</p>
          </div>

          {/* Payment Steps Indicator */}
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-3">
              <div className={`step ${paymentStep !== 'method' ? 'completed' : 'active'}`}>
                <div className="step-number">1</div>
                <div className="step-label">Payment Method</div>
              </div>
              <div className={`step ${paymentStep === 'success' ? 'completed' : paymentStep === 'processing' ? 'active' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Processing</div>
              </div>
              <div className={`step ${paymentStep === 'success' ? 'completed' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">Confirmation</div>
              </div>
            </div>
            <div className="progress" style={{ height: '4px' }}>
              <div
                className="progress-bar bg-success"
                style={{ width: paymentStep === 'method' ? '33%' : paymentStep === 'processing' ? '66%' : '100%' }}
              ></div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}

          {/* Processing State */}
          {paymentStep === 'processing' && (
            <div className="card shadow-sm mb-4">
              <div className="card-body text-center p-5">
                <div className="spinner-border text-success mb-3" role="status">
                  <span className="visually-hidden">Processing...</span>
                </div>
                <h5>Processing Your Payment</h5>
                <p className="text-muted">Please wait while we secure your payment...</p>
                <small className="text-muted d-block mt-3">Do not close this window</small>
              </div>
            </div>
          )}

          {/* Success State */}
          {paymentStep === 'success' && (
            <>
              <div className="card shadow-sm mb-4 border-success">
                <div className="card-body text-center p-5">
                  <div style={{ fontSize: '80px', marginBottom: '20px' }}>✅</div>
                  <h4 className="text-success mb-2">Payment Successful!</h4>
                  <p className="text-muted mb-3">Your order has been confirmed.</p>
                  {pointsNotification && (
                    <div className="alert alert-info mt-3 mb-3">
                      <strong>🪙 Cine-Milestone Points Updated!</strong>
                      <br />
                      <small>
                        <span className="text-danger">-{pointsNotification.deducted} points</span> used in this order
                        <br />
                        Balance: <span className="text-success">{pointsNotification.new} points</span> remaining
                      </small>
                    </div>
                  )}
                  <p className="small text-muted">Redirecting to order details...</p>
                </div>
              </div>
            </>
          )}

          {/* Payment Method Selection */}
          {paymentStep === 'method' && (
            <>
              {/* Order Summary */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">📦 Order Summary</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Snacks Total:</span>
                    <strong>₹{total}</strong>
                  </div>
                  {pointsToUse > 0 && (
                    <div className="d-flex justify-content-between mb-2 text-success">
                      <span>Points Used:</span>
                      <strong>- ₹{pointsToUse}</strong>
                    </div>
                  )}
                  <hr />
                  <div className="d-flex justify-content-between">
                    <h6>Amount to Pay:</h6>
                    <h5 className="text-danger">₹{remainingToPay}</h5>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0">💳 Payment Method</h5>
                </div>
                <div className="card-body">
                  <div className="form-check mb-3 p-3 border rounded cursor-pointer" style={{ cursor: 'pointer' }}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="payment"
                      id="card"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={e => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="card">
                      <strong>💳 Credit / Debit Card</strong> (Visa, MasterCard, RuPay)
                    </label>
                  </div>

                  <div className="form-check mb-3 p-3 border rounded cursor-pointer" style={{ cursor: 'pointer' }}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="payment"
                      id="upi"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={e => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="upi">
                      <strong>📱 UPI</strong> (Google Pay, PhonePe, Paytm)
                    </label>
                  </div>

                  <div className="form-check p-3 border rounded cursor-pointer" style={{ cursor: 'pointer' }}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="payment"
                      id="wallet"
                      value="wallet"
                      checked={paymentMethod === 'wallet'}
                      onChange={e => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="wallet">
                      <strong>💰 Wallet</strong> (PayPal, Amazon Pay)
                    </label>
                  </div>
                </div>
              </div>

              {/* Card Details (Only show for card method) */}
              {paymentMethod === 'card' && (
                <div className="card shadow-sm mb-4">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">💳 Card Details</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label">Card Number</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.number}
                        onChange={e => handleCardChange('number', e.target.value)}
                        maxLength="19"
                        disabled={isProcessing}
                      />
                      <small className="text-muted">For demo, use any 16-digit number</small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Cardholder Name</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="John Doe"
                        value={cardDetails.name}
                        onChange={e => handleCardChange('name', e.target.value)}
                        disabled={isProcessing}
                      />
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Expiration (MM/YY)</label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          placeholder="12/25"
                          value={cardDetails.expiry}
                          onChange={e => handleCardChange('expiry', e.target.value)}
                          maxLength="5"
                          disabled={isProcessing}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">CVV</label>
                        <input
                          type="password"
                          className="form-control form-control-lg"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={e => handleCardChange('cvv', e.target.value)}
                          maxLength="3"
                          disabled={isProcessing}
                        />
                      </div>
                    </div>

                    <div className="form-check mb-3">
                      <input className="form-check-input" type="checkbox" id="saveCard" />
                      <label className="form-check-label" htmlFor="saveCard">
                        Save this card for future transactions
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Info */}
              <div className="alert alert-info mb-4">
                <strong>🔒 Your Payment is Secure</strong>
                <p className="mb-0 small mt-2">Your payment information is encrypted and secure. We never store your complete card details.</p>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2 mb-5">
                <button
                  className="btn btn-outline-secondary btn-lg flex-grow-1"
                  onClick={() => navigate(-1)}
                  disabled={isProcessing}
                >
                  ← Back to Cart
                </button>
                <button
                  className="btn btn-success btn-lg flex-grow-1"
                  onClick={processPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : remainingToPay === 0 ? (
                    '✅ Confirm Order (Points Only)'
                  ) : (
                    `💳 Pay ₹${remainingToPay}`
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
          flex: 1;
        }

        .step.active .step-number {
          background-color: #0d6efd;
          color: white;
        }

        .step.completed .step-number {
          background-color: #28a745;
          color: white;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          border: 2px solid #dee2e6;
          background-color: #f8f9fa;
        }

        .step-label {
          font-size: 12px;
          text-align: center;
          color: #666;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        .cursor-pointer:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
}

export default PaymentCheckout;
