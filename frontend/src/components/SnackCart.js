import React, { useState } from 'react';

function SnackCart({ cart, snacks, points, pointsToUse, setPointsToUse, onPlaceOrder, placingOrder }) {
  const total = cart.reduce((sum, item) => sum + item.quantity * (snacks.find(s => s.id === item.snackId)?.price || 0), 0);
  const maxPoints = Math.min(points, total);
  const money = total - pointsToUse;
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');

  if (cart.length === 0) {
    return null;
  }

  const handlePlaceOrder = async () => {
    setOrderMessage('');
    await onPlaceOrder();
    setOrderPlaced(true);
    setTimeout(() => setOrderPlaced(false), 5000);
  };

  return (
    <div className="row mt-5">
      <div className="col-md-8">
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">🛒 Order Summary</h5>
          </div>
          <div className="card-body">
            {/* Cart Items */}
            <div className="mb-4">
              <h6 className="text-muted mb-3">Items in Cart:</h6>
              <ul className="list-group">
                {cart.map(item => {
                  const snack = snacks.find(s => s.id === item.snackId);
                  return (
                    <li className="list-group-item d-flex justify-content-between align-items-center" key={item.snackId}>
                      <div>
                        <strong>{snack?.name}</strong>
                        <br />
                        <small className="text-muted">Qty: {item.quantity} × ₹{snack?.price || 0}</small>
                      </div>
                      <span className="badge bg-info">₹{snack ? snack.price * item.quantity : 0}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Price Breakdown */}
            <div className="card bg-light p-3 mb-4">
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
                <h6>Total:</h6>
                <h6>₹{total}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Sidebar */}
      <div className="col-md-4">
        <div className="card shadow-sm">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">💳 Payment Details</h5>
          </div>
          <div className="card-body">
            {/* Points Section */}
            <div className="mb-4 p-3 border rounded bg-light">
              <h6 className="text-muted mb-2">🪙 Cine-Milestone Points</h6>
              <div className="d-flex justify-content-between mb-3">
                <span>Available Points:</span>
                <strong className="text-success">{points}</strong>
              </div>

              {points > 0 ? (
                <div>
                  <label className="form-label">Use Points (up to {maxPoints}):</label>
                  <div className="input-group mb-3">
                    <input
                      type="number"
                      min="0"
                      max={maxPoints}
                      value={pointsToUse}
                      onChange={e => setPointsToUse(Math.max(0, Math.min(maxPoints, Number(e.target.value))))}
                      className="form-control"
                      disabled={placingOrder}
                    />
                    <span className="input-group-text">/ {maxPoints}</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar bg-success" style={{ width: `${(pointsToUse / maxPoints) * 100}%` }}></div>
                  </div>
                  <small className="text-muted">Slide to adjust points usage</small>
                </div>
              ) : (
                <div className="alert alert-warning mb-0">
                  ⚠️ No points available. Full payment required.
                </div>
              )}
            </div>

            {/* Payment Breakdown */}
            <div className="mb-4 p-3 border rounded">
              <h6 className="text-muted mb-3">Breakdown:</h6>
              <div className="d-flex justify-content-between mb-2">
                <span>Snack Price:</span>
                <strong>₹{total}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2 text-success">
                <span>Points Used:</span>
                <strong>- ₹{pointsToUse}</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <h6>Amount to Pay:</h6>
                <h5 className="text-danger">₹{money}</h5>
              </div>

              {/* Payment Message */}
              {total > 0 && (
                <div className="alert alert-info mb-3">
                  {pointsToUse >= total ? (
                    <small>✅ Order will be placed using points. No payment required.</small>
                  ) : pointsToUse > 0 ? (
                    <small>ℹ️ You need to pay <strong>₹{money}</strong>. Points used partially.</small>
                  ) : (
                    <small>⚠️ You don't have enough points. Please pay full amount (₹{total}).</small>
                  )}
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              className="btn btn-success w-100 btn-lg mb-3"
              disabled={placingOrder || total === 0}
              onClick={handlePlaceOrder}
            >
              {placingOrder ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                `Place Order (₹${money})`
              )}
            </button>

            {/* Order Status */}
            {orderPlaced && (
              <div className="alert alert-success">
                ✅ Order placed successfully!
              </div>
            )}

            {/* Terms */}
            <small className="text-muted d-block text-center mt-3">
              By placing order, you agree to our Terms & Conditions
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SnackCart;
