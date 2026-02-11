import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function ShowTimings() {
  const { movieId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [shows, setShows] = useState([]);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const city = searchParams.get('city');

  useEffect(() => {
    fetchMovie();
    fetchShows();
  }, [movieId, city]);

  const fetchMovie = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8090/api/movies/${movieId}`
      );
      setMovie(response.data);
    } catch (err) {
      console.error('Failed to fetch movie:', err);
    }
  };

  const fetchShows = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8090/api/shows?movieId=${movieId}&city=${city}`
      );
      setShows(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load show timings. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBookNow = (showId) => {
    if (!isAuthenticated) {
      // Redirect to login with return path
      navigate('/login', { state: { from: { pathname: `/booking/${showId}` } } });
      return;
    }
    navigate(`/booking/${showId}`);
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

  if (error) {
    return (
      <div className="main-content">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="container">
        {movie && (
          <div className="card mb-5 shadow-lg border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="row g-0">
              <div className="col-md-3" style={{
                background: `linear-gradient(135deg, var(--bms-red) 0%, var(--bms-red-dark) 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '64px'
              }}>
                🎬
              </div>
              <div className="col-md-9">
                <div className="card-body p-4">
                  <h2 className="card-title mb-3" style={{ color: '#1A1A1A', fontWeight: '700' }}>
                    {movie.name}
                  </h2>
                  <div className="mb-3">
                    <span className="badge bg-secondary me-2" style={{ fontSize: '13px', padding: '8px 14px' }}>
                      {movie.language}
                    </span>
                    <span className="badge bg-info me-2" style={{ fontSize: '13px', padding: '8px 14px' }}>
                      {movie.genre}
                    </span>
                    <span className="text-muted ms-2">
                      <i className="bi bi-clock me-1"></i>
                      {movie.duration} min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 style={{ color: '#1A1A1A', fontWeight: '700', marginBottom: '4px' }}>
              Show Timings in {city}
            </h3>
            <p className="text-muted">Select a show time to book your tickets</p>
          </div>
        </div>

        {shows.length === 0 ? (
          <div className="alert alert-info d-flex align-items-center" role="alert" style={{
            borderRadius: '12px',
            padding: '30px',
            background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
            border: 'none'
          }}>
            <i className="bi bi-calendar-x me-3" style={{ fontSize: '24px' }}></i>
            <div>
              <strong>No shows available</strong>
              <p className="mb-0 mt-1">No shows available for this movie in {city}.</p>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {shows.map((show) => (
              <div key={show.id} className="col-lg-4 col-md-6">
                <div className="show-time-card">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 style={{ color: '#1A1A1A', fontWeight: '600', marginBottom: '8px' }}>
                        {show.theatre.name}
                      </h5>
                      <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                        <i className="bi bi-geo-alt me-1"></i>
                        {city}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3" style={{
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                      <i className="bi bi-calendar3 me-1"></i>
                      Show Time
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A' }}>
                      {formatDateTime(show.showTime)}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>
                        Available Seats
                      </div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: show.availableSeats > 0 ? 'var(--seat-available)' : '#dc3545' }}>
                        {show.availableSeats}
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-success w-100"
                    onClick={() => handleBookNow(show.id)}
                    disabled={show.availableSeats === 0}
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      padding: '12px',
                      background: 'linear-gradient(135deg, var(--bms-red) 0%, var(--bms-red-dark) 100%)',
                      border: 'none'
                    }}
                  >
                    {show.availableSeats > 0 ? (
                      <>
                        <i className="bi bi-ticket-perforated me-2"></i>
                        Book Now
                      </>
                    ) : (
                      <>
                        <i className="bi bi-x-circle me-2"></i>
                        Sold Out
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ShowTimings;