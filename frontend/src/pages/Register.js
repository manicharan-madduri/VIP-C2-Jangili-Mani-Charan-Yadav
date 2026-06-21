import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('patient');
  const [registerError, setRegisterError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pick role from query param if available (e.g. /register?role=doctor)
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'doctor' || roleParam === 'patient') {
      setRole(roleParam);
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');

    // Client-side validations
    if (password.length < 6) {
      setRegisterError('Password must be at least 6 characters');
      return;
    }

    try {
      const loggedUser = await register(name, email, password, role, phone);
      if (loggedUser.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/patient/dashboard');
    } catch (err) {
      setRegisterError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="container py-5 mt-5 page-fade-in d-flex justify-content-center align-items-center" style={{ minHeight: '90vh' }}>
      <div className="glass-card p-5 w-100" style={{ maxWidth: '500px' }}>
        <div className="text-center mb-4">
          <i className="bi bi-person-plus-fill text-primary fs-1"></i>
          <h2 className="fw-bold text-main mt-2">Create Account</h2>
          <p className="text-muted small">Register to get started on Book a Doctor</p>
        </div>

        {registerError && (
          <div className="alert alert-danger border-0 rounded-3 small py-2 mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{registerError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role selector tab style */}
          <div className="d-flex p-1 bg-light bg-opacity-10 rounded-3 mb-4">
            <button
              type="button"
              className={`btn w-50 py-2 rounded-3 border-0 shadow-none ${role === 'patient' ? 'btn-primary-glow' : 'text-main'}`}
              onClick={() => setRole('patient')}
            >
              <i className="bi bi-person me-2"></i>Patient
            </button>
            <button
              type="button"
              className={`btn w-50 py-2 rounded-3 border-0 shadow-none ${role === 'doctor' ? 'btn-primary-glow' : 'text-main'}`}
              onClick={() => setRole('doctor')}
            >
              <i className="bi bi-heart-pulse me-2"></i>Doctor
            </button>
          </div>

          <div className="mb-3">
            <label htmlFor="regName" className="form-label text-muted small">Full Name</label>
            <div className="input-group">
              <span className="input-group-text form-glass border-end-0 text-muted"><i className="bi bi-person-vcard"></i></span>
              <input
                type="text"
                className="form-control form-glass text-main py-2 border-start-0"
                id="regName"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="regEmail" className="form-label text-muted small">Email Address</label>
            <div className="input-group">
              <span className="input-group-text form-glass border-end-0 text-muted"><i className="bi bi-envelope"></i></span>
              <input
                type="email"
                className="form-control form-glass text-main py-2 border-start-0"
                id="regEmail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="regPhone" className="form-label text-muted small">Phone Number</label>
            <div className="input-group">
              <span className="input-group-text form-glass border-end-0 text-muted"><i className="bi bi-telephone"></i></span>
              <input
                type="tel"
                className="form-control form-glass text-main py-2 border-start-0"
                id="regPhone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="regPassword" className="form-label text-muted small">Password</label>
            <div className="input-group">
              <span className="input-group-text form-glass border-end-0 text-muted"><i className="bi bi-key"></i></span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control form-glass text-main py-2 border-start-0 border-end-0"
                id="regPassword"
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
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Register</span>
            )}
          </button>
        </form>

        <div className="text-center mt-4" style={{ fontSize: '0.9rem' }}>
          <span className="text-muted">Already registered? </span>
          <Link to="/login" className="text-primary text-decoration-none fw-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
