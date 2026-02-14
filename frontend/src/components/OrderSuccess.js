import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OrderTracking from './OrderTracking';

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderData = {}, orderDetails = {} } = location.state || {};
  const [pointsNotification, setPointsNotification] = useState(null);

  // Refresh snack points immediately when order is confirmed
  useEffect(() => {
    console.log('📦 Order success page loaded. Fetching updated points...');
    
    // Set up global notification handler
    window.showPointsNotification = (oldPoints, newPoints, reduced) => {
      console.log('📊 Points changed:', oldPoints, '→', newPoints, '(reduced by', reduced, ')');
      setPointsNotification({
        oldPoints,
        newPoints,
        reduced
      });
      // Auto-hide after 5 seconds
      setTimeout(() => setPointsNotification(null), 5000);
    };
    
    if (window.refreshSnackPoints) {
      window.refreshSnackPoints();
      console.log('✅ Points refresh called');
      
      // Call again after 1 second for extra guarantee
      setTimeout(() => {
        if (window.refreshSnackPoints) {
          window.refreshSnackPoints();
          console.log('✅ Second points refresh called');
        }
      }, 1000);
    }
  }, []);

  const { items = [], snacks = [], total = 0, pointsUsed = 0, moneyPaid = 0 } = orderDetails;

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Success Header */}
          <div className="card shadow-sm mb-4 border-success">
            <div className="card-body text-center p-5">
              <div style={{ fontSize: '100px', marginBottom: '20px' }}>✅</div>
              <h2 className="text-success mb-2">Order Confirmed!</h2>
              <p className="text-muted mb-0">Your snack order has been successfully placed.</p>
            </div>
          </div>

          {/* Points Reduction Notification */}
          {pointsNotification && (
            <div className="card shadow-lg mb-4 border border-warning" style={{ animation: 'slideInRight 0.3s ease' }}>
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-auto">
                    <span style={{ fontSize: '3rem' }}>🪙</span>
                  </div>
                  <div className="col">
                    <h5 className="mb-1">Cine-Milestone Points Updated!</h5>
                    <p className="mb-0 text-muted">
                      <strong>{pointsNotification.oldPoints}</strong>
                      <span style={{ margin: '0 10px', fontSize: '1.5rem' }}>→</span>
                      <strong className="text-success">{pointsNotification.newPoints}</strong>
                    </p>
                    <small className="text-danger fw-bold mt-2 d-block">
                      ✓ {pointsNotification.reduced} points used for this order
                    </small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">📦 Order Summary</h5>
            </div>
            <div className="card-body">
              {/* Order Items */}
              <h6 className="text-muted mb-3">Items Ordered:</h6>
              <div className="list-group mb-3">
                {items && items.length > 0 ? (
                  items.map((item, idx) => {
                    const snack = snacks.find(s => s.id === item.snackId);
                    const itemTotal = snack ? snack.price * item.quantity : 0;
                    return (
                      <div className="list-group-item d-flex justify-content-between align-items-center" key={idx}>
                        <div>
                          <strong>{snack?.name || 'Unknown Item'}</strong>
                          <br />
                          <small className="text-muted">Qty: {item.quantity} × ₹{snack?.price || 0}</small>
                        </div>
                        <span className="badge bg-info">₹{itemTotal}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted">No items found</p>
                )}
              </div>

              {/* Price Breakdown */}
              <hr />
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <strong>₹{total}</strong>
                </div>
                {pointsUsed > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Points Used:</span>
                    <strong>- ₹{pointsUsed}</strong>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span>Amount Paid:</span>
                  <strong className={moneyPaid > 0 ? 'text-danger' : 'text-success'}>
                    ₹{moneyPaid}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {(pointsUsed > 0 || moneyPaid > 0) && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">💳 Payment Info</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <div className="text-center p-3 border rounded bg-light">
                      <h6 className="text-muted mb-2">🪙 Points Used</h6>
                      <h3 className="text-success mb-0">₹{pointsUsed}</h3>
                      <small className="text-muted">From Cine-Milestone</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-center p-3 border rounded bg-light">
                      <h6 className="text-muted mb-2">💰 Cash Paid</h6>
                      <h3 className={moneyPaid > 0 ? 'text-danger' : 'text-success'} style={{ marginBottom: 0 }}>
                        ₹{moneyPaid}
                      </h3>
                      <small className="text-muted">
                        {moneyPaid > 0 ? 'Via Payment Gateway' : 'No cash payment required'}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Tracking */}
          <OrderTracking orderId={orderData?.id} orderData={orderData} />

          {/* Pickup Instructions */}
          <div className="alert alert-info mb-4">
            <strong>🎬 Next Steps:</strong>
            <ol className="mb-0 mt-2 small">
              <li>Proceed to the theatre snack counter</li>
              <li>Show your booking ID or order confirmation</li>
              <li>Collect your ordered items</li>
              <li>Enjoy your movie! 🍿</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-lg flex-grow-1" onClick={() => navigate('/')}>
              🏠 Go to Home
            </button>
            <button className="btn btn-outline-primary btn-lg flex-grow-1" onClick={() => navigate('/movies')}>
              🎬 Browse Movies
            </button>
          </div>

          {/* Order Details Footer */}
          <div className="card mt-4">
            <div className="card-body text-center">
              <small className="text-muted">
                Thank you for ordering from BookMyShow!<br />
                Your order has been confirmed and points have been deducted from your account.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
