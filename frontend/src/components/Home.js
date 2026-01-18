import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const navigate = useNavigate();

  const cities = ['Hyderabad', 'Bangalore', 'Chennai'];
  const languages = ['TELUGU', 'HINDI'];

  const handleSearch = () => {
    if (selectedCity) {
      const params = new URLSearchParams();
      params.append('city', selectedCity);
      if (selectedLanguage) {
        params.append('language', selectedLanguage);
      }
      navigate(`/movies?${params.toString()}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <div className="hero-content text-center">
            <h1 className="hero-title">Book Your Movie Tickets</h1>
            <p className="hero-subtitle">
              Experience the magic of cinema. Choose your city and discover amazing movies!
            </p>
          </div>
        </div>
      </div>

      {/* City Selector Card */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <div className="city-selector-card">
              <div className="text-center mb-4">
                <h2 className="mb-2" style={{ color: '#1A1A1A', fontWeight: '600' }}>
                  Where are you watching?
                </h2>
                <p className="text-muted">Select your city to explore movies</p>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="city" className="form-label fw-bold">
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    Select City
                  </label>
                  <select
                    id="city"
                    className="form-select form-select-lg"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    <option value="">Choose a city...</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label htmlFor="language" className="form-label fw-bold">
                    <i className="bi bi-translate me-2"></i>
                    Filter by Language (Optional)
                  </label>
                  <select
                    id="language"
                    className="form-select form-select-lg"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    <option value="">All Languages</option>
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="d-grid mt-4">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleSearch}
                  disabled={!selectedCity}
                  style={{ padding: '14px', fontSize: '18px' }}
                >
                  <i className="bi bi-search me-2"></i>
                  Search Movies
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

