import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Home from './components/Home';
import MovieList from './components/MovieList';
import ShowTimings from './components/ShowTimings';
import Booking from './components/Booking';
import Payment from './components/Payment';
import BookingConfirmation from './components/BookingConfirmation';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<MovieList />} />
          <Route path="/shows/:movieId" element={<ShowTimings />} />
          <Route path="/booking/:showId" element={<Booking />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

