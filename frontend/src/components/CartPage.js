import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart = [], snacks = [], userPoints = 0 } = location.state || {};
  
  const [cartItems, setCartItems] = useState(cart);
  const [error, setError] = useState(null);

  // Calculate total function
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity * (snacks.find(s => s.id === item.snackId)?.price || 0), 0);
  };

  const total = calculateTotal();
  const maxPoints = Math.min(userPoints, total);
  const [pointsToUse, setPointsToUse] = useState(Math.min(userPoints, total));
  const remainingToPay = total - pointsToUse;

  const handleQuantityChange = (snackId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(snackId);
    } else {
      setCartItems(prev => prev.map(item => item.snackId === snackId ? { ...item, quantity: newQuantity } : item));
    }
  };

  const handleRemoveItem = (snackId) => {
    setCartItems(prev => prev.filter(item => item.snackId !== snackId));
  };

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty!');
      return;
    }
    
    navigate('/payment-checkout', {
      state: {
        cart: cartItems,
        snacks,
        userPoints,
        pointsToUse,
        total,
        remainingToPay,
        bookingId: location.state?.bookingId
      }
    });
  };

  const handleContinueShopping = () => {
    navigate(-1);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mt-5 mb-5">
        <div className="text-center">
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>🛒</div>
          <h2>Your Cart is Empty</h2>
          <p className="text-muted mb-4">Add some delicious snacks to get started!</p>
          <button className="btn btn-primary btn-lg" onClick={handleContinueShopping}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      {/* Header */}
      <div className="mb-4">
        <h2>🛒 Your Cart</h2>
        <p className="text-muted">Review your items and proceed to checkout</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      <div className="row">
        {/* Cart Items - Left Side */}
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">📦 Items ({cartItems.length})</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {cartItems.map(item => {
                  const snack = snacks.find(s => s.id === item.snackId);
                  const itemTotal = snack ? snack.price * item.quantity : 0;
                  return (
                    <div className="list-group-item p-4 border-bottom" key={item.snackId}>
                      <div className="row align-items-center">
                        {/* Snack Image */}
                        <div className="col-md-2 mb-3 mb-md-0">
                          <img
                            src={snack?.imageUrl.startsWith('http') ? snack.imageUrl : (snack?.imageUrl.startsWith('images/') ? `/${snack.imageUrl}` : `/images/${snack?.imageUrl}`)}
                            alt={snack?.name}
                            className="img-fluid rounded"
                            style={{ maxHeight: '80px', objectFit: 'cover' }}
                          />
                        </div>

                        {/* Snack Details */}
                        <div className="col-md-4">
                          <h6 className="mb-1">{snack?.name}</h6>
                          <p className="text-muted mb-0 small">₹{snack?.price} per item</p>
                        </div>

                        {/* Quantity Control */}
                        <div className="col-md-3">
                          <div className="input-group input-group-sm">
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => handleQuantityChange(item.snackId, item.quantity - 1)}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={e => handleQuantityChange(item.snackId, parseInt(e.target.value) || 1)}
                              className="form-control text-center"
                              style={{ maxWidth: '50px' }}
                            />
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => handleQuantityChange(item.snackId, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Price & Remove */}
                        <div className="col-md-3 text-end">
                          <h6 className="mb-2 text-success">₹{itemTotal}</h6>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveItem(item.snackId)}
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Continue Shopping Button */}
          <button className="btn btn-secondary btn-lg w-100" onClick={handleContinueShopping}>
            ← Continue Shopping
          </button>
        </div>

        {/* Order Summary - Right Side */}
        <div className="col-lg-4">
          {/* Order Summary Card */}
          <div className="card shadow-sm mb-4 position-sticky" style={{ top: '20px' }}>
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">💰 Order Summary</h5>
            </div>
            <div className="card-body">
              {/* Price Breakdown */}
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <strong>₹{total}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Taxes & Charges:</span>
                  <strong>₹0</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <h6>Grand Total:</h6>
                  <h6 className="text-success">₹{total}</h6>
                </div>
              </div>

              {/* Divider */}
              <hr className="my-4" />

              {/* Points Section */}
              <div className="mb-4 p-3 border rounded bg-light">
                <h6 className="text-muted mb-3">🪙 Cine-Milestone Points</h6>
                <div className="d-flex justify-content-between mb-3">
                  <span>Available:</span>
                  <strong className="text-success">{userPoints}</strong>
                </div>

                {userPoints > 0 ? (
                  <>
                    <label className="form-label">Use Points (max: {maxPoints})</label>
                    <div className="input-group mb-2">
                      <input
                        type="number"
                        min="0"
                        max={maxPoints}
                        value={pointsToUse}
                        onChange={e => setPointsToUse(Math.max(0, Math.min(maxPoints, Number(e.target.value))))}
                        className="form-control"
                      />
                      <span className="input-group-text">/ {maxPoints}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={maxPoints}
                      value={pointsToUse}
                      onChange={e => setPointsToUse(Number(e.target.value))}
                      className="form-range"
                    />
                    <small className="text-muted d-block mt-2">Drag to adjust points usage</small>
                  </>
                ) : (
                  <div className="alert alert-warning mb-0">
                    No points available. Pay full amount.
                  </div>
                )}
              </div>

              {/* Payment Breakdown */}
              <div className="p-3 border rounded mb-4">
                <h6 className="text-muted mb-3">📊 Payment Breakdown</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span>Snack Price:</span>
                  <strong>₹{total}</strong>
                </div>
                {pointsToUse > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Points Used:</span>
                    <strong>- ₹{pointsToUse}</strong>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <h6>Amount to Pay:</h6>
                  <h5 className="text-danger">₹{remainingToPay}</h5>
                </div>

                {/* Status Message */}
                <div className={`alert mb-0 ${pointsToUse >= total ? 'alert-success' : pointsToUse > 0 ? 'alert-info' : 'alert-warning'}`}>
                  {pointsToUse >= total ? (
                    <small>✅ Order will use points entirely. No payment required!</small>
                  ) : pointsToUse > 0 ? (
                    <small>ℹ️ Payment of ₹{remainingToPay} required. Points used partially.</small>
                  ) : (
                    <small>⚠️ No points used. Full payment required.</small>
                  )}
                </div>
              </div>

              {/* Checkout Button */}
              <button
                className="btn btn-success btn-lg w-100 mb-2"
                onClick={handleProceedToPayment}
              >
                💳 Proceed to Checkout
              </button>

              {/* Secure Badge */}
              <small className="text-muted d-block text-center">
                🔒 Secure Checkout. Your data is protected.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
