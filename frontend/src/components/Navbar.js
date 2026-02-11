import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Small delay to ensure state is cleared before navigation
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 100);
  };

  return (
    <nav className="navbar navbar-expand-lg bms-navbar">
      <div className="container">
        <Link className="navbar-brand bms-brand" to="/" style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px' }}>
          BookMyShow
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
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
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <span className="nav-link bms-nav-link" style={{ cursor: 'default' }}>
                    <i className="bi bi-person-circle me-1"></i>
                    {user?.name || user?.email}
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
                      textDecoration: 'none'
                    }}
                    title="Logout"
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
                      marginLeft: '8px'
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