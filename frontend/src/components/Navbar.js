import React, { useRef, useState, useEffect } from 'react';
import SnackPoints from './SnackPoints';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const snackPointsRef = useRef();
  const [snackEligible, setSnackEligible] = useState(false);

  // Check snack eligibility
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetch(`http://localhost:8090/snacks/eligible/${user.id}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to check eligibility');
          return res.json();
        })
        .then(data => {
          setSnackEligible(data.eligible === true);
          console.log('🍿 Snack Eligibility:', data);
        })
        .catch(err => {
          console.error('Error checking snack eligibility:', err);
          setSnackEligible(false);
        });
    } else {
      setSnackEligible(false);
    }
  }, [isAuthenticated, user?.id]);

  // Expose a global refresh function for snack eligibility (called after booking)
  window.refreshSnackEligibility = () => {
    if (isAuthenticated && user?.id) {
      fetch(`http://localhost:8090/snacks/eligible/${user.id}`)
        .then(res => res.json())
        .then(data => setSnackEligible(data.eligible === true))
        .catch(() => setSnackEligible(false));
    }
  };

  // Expose a global refresh function for points (for BookingConfirmation to call)
  window.refreshSnackPoints = () => {
    if (snackPointsRef.current && snackPointsRef.current.refresh) {
      snackPointsRef.current.refresh();
    }
  };

  // Expose a global function to update points immediately (for snack orders) - ULTRA FAST
  window.updateSnackPointsImmediately = (newPoints) => {
    if (snackPointsRef.current && snackPointsRef.current.updatePoints) {
      const t0 = performance.now();
      snackPointsRef.current.updatePoints(newPoints);
      const t1 = performance.now();
      if (t1 - t0 > 100) {
        console.warn('⚠️ Slow update detected:', (t1 - t0).toFixed(2) + 'ms');
      }
    }
  };

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 100);
  };

  return (
    <nav className="navbar navbar-expand-lg bms-navbar">
      <div className="container">
        <Link
          className="navbar-brand bms-brand"
          to="/"
          style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px' }}
        >
          BookMyShow
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link bms-nav-link" to="/">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link bms-nav-link" to="/movies">
                Movies
              </Link>
            </li>

    {snackEligible && isAuthenticated && (
              <li className="nav-item">
                <button 
                  className="nav-link nav-snack-btn" 
                  onClick={() => {
                    const bookingId = localStorage.getItem('lastBookingId');
                    const theatreId = localStorage.getItem('lastTheatreId') || 1;
                    console.log('🍿 Navigating to snacks with:', { bookingId, theatreId });
                    navigate('/snacks', {
                      state: {
                        bookingId,
                        theatreId
                      }
                    });
                  }}
                  style={{ 
                    border: 'none',
                    background: 'transparent',
                    padding: '0.5rem 0',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  🍿 Order Snacks
                </button>
              </li>
            )}

            {isAuthenticated ? (
              <>
                <li className="nav-item d-flex align-items-center">
                  <span
                    className="nav-link bms-nav-link"
                    style={{
                      cursor: 'default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {user?.name || user?.email}
                    <span style={{ marginLeft: '8px', fontWeight: 600, color: '#f5b700' }}>
                      <SnackPoints ref={snackPointsRef} />
                    </span>
                  </span>
                </li>

                <li className="nav-item">
                  <button
                    className="nav-link bms-nav-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                    }}
                    style={{
                      cursor: 'pointer',
                      border: 'none',
                      background: 'transparent',
                      padding: '8px 16px',
                      color: 'inherit',
                      textDecoration: 'none',
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-1"></i>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link bms-nav-link" to="/login">
                    Login
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className="nav-link bms-nav-link"
                    to="/signup"
                    style={{
                      background: 'var(--bms-red)',
                      color: 'white',
                      borderRadius: '6px',
                      padding: '6px 16px',
                      marginLeft: '8px',
                    }}
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
