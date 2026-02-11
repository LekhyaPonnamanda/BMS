import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated } = useAuth();
    const [emailOrMobile, setEmailOrMobile] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(emailOrMobile, password);
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
                    <div className="col-md-6 col-lg-5">
                        <div className="card shadow-lg border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                            <div className="card-header text-white" style={{
                                background: 'linear-gradient(135deg, var(--bms-red) 0%, var(--bms-red-dark) 100%)',
                                padding: '24px',
                                border: 'none'
                            }}>
                                <h3 className="mb-0 text-center" style={{ fontWeight: '700' }}>
                                    <i className="bi bi-box-arrow-in-right me-2"></i>
                                    Login
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
                                        <label htmlFor="emailOrMobile" className="form-label">
                                            <i className="bi bi-envelope me-2"></i>Email or Mobile Number
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            id="emailOrMobile"
                                            value={emailOrMobile}
                                            onChange={(e) => setEmailOrMobile(e.target.value)}
                                            placeholder="Enter email or mobile number"
                                            required
                                            autoFocus
                                        />
                                        <small className="text-muted">You can login with your registered email or mobile number</small>
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="password" className="form-label">
                                            <i className="bi bi-lock me-2"></i>Password
                                        </label>
                                        <input
                                            type="password"
                                            className="form-control form-control-lg"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
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
                                                Logging in...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                                Login
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center mt-4">
                                    <p className="mb-0">
                                        Don't have an account?{' '}
                                        <Link
                                            to="/signup"
                                            state={location.state}
                                            style={{ color: 'var(--bms-red)', fontWeight: '600', textDecoration: 'none' }}
                                        >
                                            Sign Up
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

export default Login;
