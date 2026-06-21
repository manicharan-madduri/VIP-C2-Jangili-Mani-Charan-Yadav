import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const PatientProfile = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const updateData = { name, email, phone };
      if (password) {
        updateData.password = password;
      }
      
      await updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 mt-5 page-fade-in d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="glass-card p-5 w-100" style={{ maxWidth: '600px' }}>
        <h3 className="fw-bold text-main mb-2"><i className="bi bi-person-fill-gear text-primary me-2"></i>Account Profile</h3>
        <p className="text-muted small mb-4">Keep your contact details up to date.</p>

        {success && (
          <div className="alert alert-success border-0 small py-2 mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill"></i>
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger border-0 rounded-3 small py-2 mb-4 d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6 col-12">
              <label htmlFor="profName" className="form-label text-muted small">Full Name</label>
              <input
                type="text"
                className="form-control form-glass text-main py-2"
                id="profName"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="col-md-6 col-12">
              <label htmlFor="profEmail" className="form-label text-muted small">Email Address</label>
              <input
                type="email"
                className="form-control form-glass text-main py-2"
                id="profEmail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="col-12">
              <label htmlFor="profPhone" className="form-label text-muted small">Phone Number</label>
              <input
                type="tel"
                className="form-control form-glass text-main py-2"
                id="profPhone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <hr className="border-secondary opacity-25 my-4" />
            <h6 className="fw-semibold text-main mb-1">Change Password (Leave blank to keep current)</h6>

            <div className="col-md-6 col-12">
              <label htmlFor="profPass" className="form-label text-muted small">New Password</label>
              <input
                type="password"
                className="form-control form-glass text-main py-2"
                id="profPass"
                value={password}
                placeholder="••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="col-md-6 col-12">
              <label htmlFor="profConfirm" className="form-label text-muted small">Confirm Password</label>
              <input
                type="password"
                className="form-control form-glass text-main py-2"
                id="profConfirm"
                value={confirmPassword}
                placeholder="••••••"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="col-12 mt-4">
              <button
                type="submit"
                className="btn btn-primary-glow w-100 py-3 fw-medium d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Profile Changes</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;
