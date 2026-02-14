import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function SnackOrder() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get bookingId from location state OR localStorage (fallback)
  const locationState = location.state || {};
  const bookingId = locationState.bookingId || localStorage.getItem('lastBookingId');
  const theatreId = locationState.theatreId || localStorage.getItem('lastTheatreId') || 1;
  const showId = locationState.showId;
  
  const [snacks, setSnacks] = useState([]);
  const [cart, setCart] = useState([]); // [{snackId, quantity}]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [toast, setToast] = useState(null); // {message, type}
  const [eligible, setEligible] = useState(null);
  const [eligibilityMessage, setEligibilityMessage] = useState('');

  useEffect(() => {
    console.log('🍿 SnackOrder loaded. bookingId:', bookingId, 'theatreId:', theatreId, 'userId:', user?.id);
    
    if (!bookingId || !user?.id) {
      console.error('❌ Missing bookingId or userId. bookingId:', bookingId, 'userId:', user?.id);
      navigate('/movies');
      return;
    }

    // Check snack eligibility first
    fetch(`http://localhost:8090/snacks/eligible/${user.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to check eligibility');
        return res.json();
      })
      .then(data => {
        setEligible(data.eligible === true);
        setEligibilityMessage(data.message || '');
        console.log('🍿 Eligibility Check:', data);
        
        if (!data.eligible) {
          setError('❌ ' + data.message);
        }
      })
      .catch(err => {
        console.error('Error checking eligibility:', err);
        setEligible(false);
        setError('Unable to verify snack access. Please try again.');
      });

    // Fetch snacks for theatre
    axios.get(`http://localhost:8090/snacks/menu/${theatreId || 1}`)
      .then(res => setSnacks(res.data))
      .catch(() => setError('Failed to load snacks'))
      .finally(() => setLoading(false));
    
    // Fetch user points
    axios.get(`http://localhost:8090/api/rewards/points/${user.id}`)
      .then(res => setUserPoints(res.data))
      .catch(() => setUserPoints(0));
  }, [bookingId, user, navigate, theatreId]);

  const handleAddToCart = (snackId, quantity) => {
    setCart(prev => {
      const exists = prev.find(item => item.snackId === snackId);
      if (exists) {
        return prev.map(item => item.snackId === snackId ? { ...item, quantity } : item);
      } else {
        return [...prev, { snackId, quantity }];
      }
    });
  };

  const handleQuantityChange = (snackId, value) => {
    setSnacks(snacks => snacks.map(s => s.id === snackId ? { ...s, tempQty: Math.max(1, value) } : s));
  };

  const handleCartAdd = (snackId, tempQty) => {
    const snack = snacks.find(s => s.id === snackId);
    handleAddToCart(snackId, tempQty || 1);
    
    // Show toast notification
    setToast({
      message: `✅ ${snack?.name} added to cart!`,
      type: 'success'
    });
    
    // Play sound effect
    playCartSound();
    
    // Auto-hide toast after 2 seconds
    setTimeout(() => setToast(null), 2000);
  };

  // Play a simple beep sound
  const playCartSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Browser doesn't support audio context, silently fail
    }
  };

  const handleViewCart = () => {
    if (cart.length === 0) {
      setError('Your cart is empty!');
      return;
    }
    navigate('/cart', {
      state: {
        cart,
        snacks,
        userPoints,
        bookingId,
        theatreId
      }
    });
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>;

  // Check eligibility - show access denied if not eligible
  if (eligible === false) {
    return (
      <div className="container mt-5 mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow-lg">
              <div className="card-body text-center p-5">
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>🚫</div>
                <h2 className="text-danger mb-3">Access Denied</h2>
                <p className="text-muted mb-4">{eligibilityMessage}</p>
                <div className="alert alert-info mb-4">
                  <strong>📋 Requirement:</strong>
                  <p className="mb-0 mt-2">You need to book <strong>minimum 2 movie tickets within 15 minutes</strong> to unlock snack ordering!</p>
                </div>
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate('/movies')}
                >
                  🎬 Go Book Tickets
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Professional Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, #f5b700 0%, #ff8c00 100%)',
        color: 'white',
        padding: '40px 20px',
        marginBottom: '30px',
        boxShadow: '0 4px 20px rgba(255, 140, 0, 0.3)'
      }}>
        <div className="container">
          <h1 style={{ margin: 0, marginBottom: '10px', fontSize: '2.5rem', fontWeight: '700' }}>
            🍿 Order Snacks & Drinks
          </h1>
          <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.95 }}>
            Enjoy delicious snacks while watching your favorite movies!
          </p>
        </div>
      </div>

      <div className="container mb-5">
        {/* Cart Badge */}
        {cart.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <span className="badge bg-danger fs-5">
              🛒 {cart.reduce((sum, item) => sum + item.quantity, 0)} items in cart
            </span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="position-fixed" style={{ top: '80px', right: '20px', zIndex: 9999 }}>
            <div className={`alert alert-${toast.type} alert-dismissible fade show mb-0 shadow-lg`} role="alert" style={{ minWidth: '300px', animation: 'slideInRight 0.3s ease' }}>
              {toast.message}
              <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
            </div>
          </div>
        )}

        {/* Snacks Grid */}
        <div className="row">
        {snacks.map(snack => (
          <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={snack.id}>
            <div className="card h-100 shadow-sm hover-shadow transition">
              <div className="position-relative">
                <img
                  src={snack.imageUrl.startsWith('http') ? snack.imageUrl : (snack.imageUrl.startsWith('images/') ? `/${snack.imageUrl}` : `/images/${snack.imageUrl}`)}
                  alt={snack.name}
                  className="card-img-top"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              </div>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{snack.name}</h5>
                <p className="card-text text-muted flex-grow-1">Fast & Refreshing</p>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="h5 text-success mb-0">₹{snack.price}</span>
                  <small className="text-muted">per unit</small>
                </div>
                
                {/* Quantity Control */}
                <div className="d-flex align-items-center mb-3 border rounded p-2 bg-light">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleQuantityChange(snack.id, Math.max(1, (snack.tempQty || 1) - 1))}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={snack.tempQty || 1}
                    onChange={e => handleQuantityChange(snack.id, Math.max(1, parseInt(e.target.value) || 1))}
                    className="form-control mx-2 text-center"
                    style={{ width: '50px' }}
                  />
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleQuantityChange(snack.id, (snack.tempQty || 1) + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  className="btn btn-warning w-100 fw-bold"
                  onClick={() => handleCartAdd(snack.id, snack.tempQty || 1)}
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>

        {/* Cart Sidebar */}
        {cart.length > 0 && (
          <div className="row mt-5 mb-5">
            <div className="col-lg-8 offset-lg-2">
              <div className="card shadow-sm">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">🛒 Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</h5>
                </div>
                <div className="card-body">
                  <p className="mb-3">Total: <strong className="text-success">₹{cart.reduce((sum, item) => sum + item.quantity * (snacks.find(s => s.id === item.snackId)?.price || 0), 0)}</strong></p>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-secondary flex-grow-1"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      ← Continue Shopping
                    </button>
                    <button
                      className="btn btn-success flex-grow-1"
                      onClick={handleViewCart}
                    >
                      View Cart 🛒
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SnackOrder;
