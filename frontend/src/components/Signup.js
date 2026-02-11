import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signup, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobileNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (formData.mobileNumber.length !== 10) {
            setError('Mobile number must be 10 digits');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const result = await signup(
            formData.name,
            formData.email,
            formData.mobileNumber,
            formData.password,
            formData.confirmPassword
        );
        setLoading(false);

        if (result.success) {
            // Redirect to previous page or home
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="main-content" style={{ paddingTop: '60px', paddingBottom: '60px', minHeight: '80vh' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-7 col-lg-6">
                        <div className="card shadow-lg border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                            <div className="card-header text-white" style={{
                                background: 'linear-gradient(135deg, var(--bms-red) 0%, var(--bms-red-dark) 100%)',
                                padding: '24px',
                                border: 'none'
                            }}>
                                <h3 className="mb-0 text-center" style={{ fontWeight: '700' }}>
                                    <i className="bi bi-person-plus me-2"></i>
                                    Create Account
                                </h3>
                            </div>

                            <div className="card-body p-4">
                                {error && (
                                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        <div>{error}</div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">
                                            <i className="bi bi-person me-2"></i>Full Name
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">
                                            <i className="bi bi-envelope me-2"></i>Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control form-control-lg"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your.email@example.com"
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="mobileNumber" className="form-label">
                                            <i className="bi bi-phone me-2"></i>Mobile Number
                                        </label>
                                        <input
                                            type="tel"
                                            className="form-control form-control-lg"
                                            id="mobileNumber"
                                            name="mobileNumber"
                                            value={formData.mobileNumber}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '').substring(0, 10);
                                                setFormData({ ...formData, mobileNumber: value });
                                            }}
                                            placeholder="9876543210"
                                            maxLength="10"
                                            required
                                        />
                                        <small className="text-muted">10-digit mobile number</small>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">
                                            <i className="bi bi-lock me-2"></i>Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control form-control-lg"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter password (min 6 characters)"
                                            required
                                            minLength="6"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="confirmPassword" className="form-label">
                                            <i className="bi bi-lock-fill me-2"></i>Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control form-control-lg"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm your password"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-success btn-lg w-100"
                                        disabled={loading}
                                        style={{
                                            background: 'linear-gradient(135deg, var(--bms-red) 0%, var(--bms-red-dark) 100%)',
                                            border: 'none',
                                            padding: '14px',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            fontSize: '16px'
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-person-plus me-2"></i>
                                                Sign Up
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center mt-4">
                                    <p className="mb-0">
                                        Already have an account?{' '}
                                        <Link
                                            to="/login"
                                            state={location.state}
                                            style={{ color: 'var(--bms-red)', fontWeight: '600', textDecoration: 'none' }}
                                        >
                                            Login
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signup;