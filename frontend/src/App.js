import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import Home from './components/Home';
import MovieList from './components/MovieList';
import ShowTimings from './components/ShowTimings';
import Booking from './components/Booking';
import Payment from './components/Payment';
import BookingConfirmation from './components/BookingConfirmation';
import SnackOrder from './components/SnackOrder';
import CartPage from './components/CartPage';
import PaymentCheckout from './components/PaymentCheckout';
import Login from './components/Login';
import Signup from './components/Signup';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import OrderSuccess from './components/OrderSuccess';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<MovieList />} />
            <Route path="/shows/:movieId" element={<ShowTimings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/booking/:showId"
              element={
                <ProtectedRoute>
                  <Booking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking-confirmation/:bookingId"
              element={
                <ProtectedRoute>
                  <BookingConfirmation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/snacks"
              element={
                <ProtectedRoute>
                  <SnackOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment-checkout"
              element={
                <ProtectedRoute>
                  <PaymentCheckout />
                </ProtectedRoute>
              }
            />
            <Route path="/order-success" element={<OrderSuccess />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;