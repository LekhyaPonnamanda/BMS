import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function MovieList() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const city = searchParams.get('city');
  const language = searchParams.get('language');

  useEffect(() => {
    fetchMovies();
  }, [language]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const url = language
        ? `http://localhost:8090/api/movies?language=${language}`
        : 'http://localhost:8090/api/movies';
      const response = await axios.get(url);
      setMovies(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load movies. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/shows/${movieId}?city=${city}`);
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
        <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap">
          <div>
            <h2 style={{ color: '#1A1A1A', fontWeight: '700', marginBottom: '8px' }}>
              Movies in {city}
            </h2>
            <p className="text-muted">Discover and book your favorite movies</p>
          </div>
          {language && (
            <span className="badge bg-primary fs-6" style={{ padding: '10px 20px' }}>
              <i className="bi bi-funnel-fill me-2"></i>
              Filter: {language}
            </span>
          )}
        </div>

        {movies.length === 0 ? (
          <div className="alert alert-info d-flex align-items-center" role="alert" style={{ 
            borderRadius: '12px', 
            padding: '30px',
            background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
            border: 'none'
          }}>
            <i className="bi bi-info-circle me-3" style={{ fontSize: '24px' }}></i>
            <div>
              <strong>No movies found</strong>
              <p className="mb-0 mt-1">Please try a different filter or city.</p>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {movies.map((movie) => (
              <div key={movie.id} className="col-lg-3 col-md-4 col-sm-6">
                <div
                  className="card movie-card h-100"
                  onClick={() => handleMovieClick(movie.id)}
                >
                  {/* Movie Poster Placeholder */}
                  <div style={{
                    height: '280px',
                    background: `linear-gradient(135deg, var(--bms-red) 0%, var(--bms-red-dark) 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '48px',
                    fontWeight: 'bold',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '72px',
                      opacity: 0.3
                    }}>🎬</div>
                    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>NOW SHOWING</div>
                      <div style={{ fontSize: '20px', fontWeight: '700' }}>{movie.name.charAt(0)}</div>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <h5 className="card-title" style={{ 
                      fontSize: '18px', 
                      fontWeight: '600',
                      marginBottom: '12px',
                      minHeight: '54px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {movie.name}
                    </h5>
                    <div className="mb-3">
                      <span className="badge bg-secondary me-2 mb-2" style={{ fontSize: '11px', padding: '6px 10px' }}>
                        {movie.language}
                      </span>
                      <span className="badge bg-info mb-2" style={{ fontSize: '11px', padding: '6px 10px' }}>
                        {movie.genre}
                      </span>
                    </div>
                    <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                      <i className="bi bi-clock me-1"></i>
                      {movie.duration} min
                    </p>
                  </div>
                  <div className="card-footer">
                    <button className="btn btn-primary w-100">
                      <i className="bi bi-calendar-event me-2"></i>
                      View Show Timings
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieList;

