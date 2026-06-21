import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    }
  }, [user, navigate]);

  // Display expiration warning if redirected from expired token
  useEffect(() => {
    if (location.search.includes('expired=true')) {
      setLoginError('Your session has expired. Please login again.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'admin') navigate('/admin/dashboard');
      else if (loggedUser.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      setLoginError(err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="container py-5 mt-5 page-fade-in d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card p-5 w-100" style={{ maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <i className="bi bi-lock-fill text-primary fs-1"></i>
          <h2 className="fw-bold text-main mt-2">Welcome Back</h2>
          <p className="text-muted small">Access your healthcare booking dashboard</p>
        </div>

        {loginError && (
          <div className="alert alert-danger border-0 rounded-3 small py-2 mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="loginEmail" className="form-label text-muted small">Email Address</label>
            <div className="input-group">
              <span className="input-group-text form-glass border-end-0 text-muted"><i className="bi bi-envelope"></i></span>
              <input
                type="email"
                className="form-control form-glass text-main py-2 border-start-0"
                id="loginEmail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label htmlFor="loginPassword" className="form-label text-muted small mb-0">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem' }} className="text-primary text-decoration-none">
                Forgot password?
              </Link>
            </div>
            <div className="input-group">
              <span className="input-group-text form-glass border-end-0 text-muted"><i className="bi bi-key"></i></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control form-glass text-main py-2 border-start-0 border-end-0"
                id="loginPassword"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="input-group-text form-glass border-start-0 text-muted"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary-glow w-100 py-2.5 mb-3 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center mt-4" style={{ fontSize: '0.9rem' }}>
          <span className="text-muted">New to the platform? </span>
          <Link to="/register" className="text-primary text-decoration-none fw-semibold">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
