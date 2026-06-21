import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DoctorProfile = () => {
  const { user, updateProfile } = useAuth();
  const docProfile = user?.doctorProfile || {};

  // Form States (User Account)
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form States (Doctor Practice Details)
  const [specialization, setSpecialization] = useState(docProfile.specialization || '');
  const [qualification, setQualification] = useState(docProfile.qualification || '');
  const [experience, setExperience] = useState(docProfile.experience || 0);
  const [hospital, setHospital] = useState(docProfile.hospital || '');
  const [consultationFee, setConsultationFee] = useState(docProfile.consultationFee || 500);
  const [profileImage, setProfileImage] = useState(docProfile.profileImage || '');

  // Availability Days check boxes
  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [availableDays, setAvailableDays] = useState(docProfile.availableDays || []);

  // Time Slots
  const slotsList = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM'
  ];
  const [availableTimeSlots, setAvailableTimeSlots] = useState(docProfile.availableTimeSlots || []);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDayCheck = (day) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter(d => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleSlotCheck = (slot) => {
    if (availableTimeSlots.includes(slot)) {
      setAvailableTimeSlots(availableTimeSlots.filter(s => s !== slot));
    } else {
      setAvailableTimeSlots([...availableTimeSlots, slot]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (availableDays.length === 0) {
      setError('Please select at least one available day');
      return;
    }

    if (availableTimeSlots.length === 0) {
      setError('Please select at least one consulting slot');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        name,
        email,
        phone,
        specialization,
        qualification,
        experience: Number(experience),
        hospital,
        consultationFee: Number(consultationFee),
        profileImage,
        availableDays,
        availableTimeSlots
      };

      if (password) {
        updateData.password = password;
      }

      await updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 mt-5 page-fade-in d-flex justify-content-center">
      <div className="glass-card p-5 w-100" style={{ maxWidth: '850px' }}>
        <h3 className="fw-bold text-main mb-2"><i className="bi bi-heart-pulse-fill text-primary me-2"></i>Doctor Practice Profile</h3>
        <p className="text-muted small mb-4">Configure account configurations and consulting hours.</p>

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
          <div className="row g-4">
            
            {/* Left Column: Account Details */}
            <div className="col-lg-6 col-12">
              <h6 className="fw-bold text-gradient mb-3">1. Credentials Details</h6>
              
              <div className="mb-3">
                <label className="form-label text-muted small">Full Name</label>
                <input
                  type="text"
                  className="form-control form-glass text-main py-2"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small">Email Address</label>
                <input
                  type="email"
                  className="form-control form-glass text-main py-2"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small">Phone Number</label>
                <input
                  type="tel"
                  className="form-control form-glass text-main py-2"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small">Change Password</label>
                <input
                  type="password"
                  className="form-control form-glass text-main py-2"
                  placeholder="Leave blank to keep current"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small">Confirm Password</label>
                <input
                  type="password"
                  className="form-control form-glass text-main py-2"
                  placeholder="Leave blank to keep current"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Right Column: Practice Details */}
            <div className="col-lg-6 col-12">
              <h6 className="fw-bold text-gradient mb-3">2. Clinical Specializations</h6>

              <div className="mb-3">
                <label className="form-label text-muted small">Specialization Specialty</label>
                <select
                  className="form-select form-glass text-main py-2"
                  required
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small">Medical Degree / Qualification</label>
                <input
                  type="text"
                  className="form-control form-glass text-main py-2"
                  placeholder="e.g. MBBS, MD, FACC"
                  required
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label text-muted small">Experience (Years)</label>
                  <input
                    type="number"
                    className="form-control form-glass text-main py-2"
                    required
                    min="0"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-muted small">Fee Per Visit ($)</label>
                  <input
                    type="number"
                    className="form-control form-glass text-main py-2"
                    required
                    min="0"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small">Assigned Clinic / Hospital</label>
                <input
                  type="text"
                  className="form-control form-glass text-main py-2"
                  required
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small">Avatar Image URL</label>
                <input
                  type="text"
                  className="form-control form-glass text-main py-2"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                />
              </div>
            </div>

            {/* Row for schedule settings */}
            <div className="col-12 border-top border-secondary border-opacity-10 pt-4">
              <h6 className="fw-bold text-gradient mb-3">3. Consultation Schedules</h6>
              
              <div className="row g-3">
                <div className="col-md-6 col-12">
                  <label className="form-label text-muted small d-block mb-2">Practice Days</label>
                  <div className="d-flex flex-wrap gap-3">
                    {daysList.map((day) => (
                      <div key={day} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`dayCheck-${day}`}
                          checked={availableDays.includes(day)}
                          onChange={() => handleDayCheck(day)}
                        />
                        <label className="form-check-label small text-main" htmlFor={`dayCheck-${day}`}>{day}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-md-6 col-12">
                  <label className="form-label text-muted small d-block mb-2">Consultation Slots</label>
                  <div className="d-flex flex-column gap-2">
                    {slotsList.map((slot) => (
                      <div key={slot} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`slotCheck-${slot}`}
                          checked={availableTimeSlots.includes(slot)}
                          onChange={() => handleSlotCheck(slot)}
                        />
                        <label className="form-check-label small text-main" htmlFor={`slotCheck-${slot}`}>{slot}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submission */}
            <div className="col-12 mt-4 pt-3 border-top border-secondary border-opacity-10">
              <button
                type="submit"
                className="btn btn-primary-glow w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Updating Profile...</span>
                  </>
                ) : (
                  <span>Update Doctor Profile settings</span>
                )}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfile;
