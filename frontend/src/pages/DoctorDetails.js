import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

const DoctorDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await apiClient.get(`/doctors/${id}`);
        if (res.data.success) {
          setDoctor(res.data.doctor);
        }
      } catch (err) {
        console.error('Failed to load doctor profile:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');

    if (!bookingDate || !bookingTime || !bookingReason) {
      setBookingError('Please fill out all fields');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await apiClient.post('/appointments', {
        doctorId: doctor._id,
        date: bookingDate,
        time: bookingTime,
        reason: bookingReason
      });

      if (res.data.success) {
        setBookingSuccess('Appointment booked successfully! Status: Pending approval.');
        setBookingDate('');
        setBookingTime('');
        setBookingReason('');
        // Close modal after delay
        setTimeout(() => {
          setShowModal(false);
          setBookingSuccess('');
          navigate('/patient/dashboard');
        }, 2000);
      }
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Booking failed. Try a different time slot.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-pulse"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container py-5 mt-5 text-center">
        <h3 className="text-danger">Doctor Profile Not Found</h3>
        <Link to="/doctors" className="btn btn-primary mt-3">Back to listings</Link>
      </div>
    );
  }

  return (
    <div className="container py-5 mt-5 page-fade-in">
      <div className="row g-4">
        {/* Doctor Core Profile Info Card */}
        <div className="col-lg-8">
          <div className="glass-card p-5 mb-4">
            <div className="d-flex flex-column flex-sm-row gap-4 mb-4">
              <img
                src={doctor.profileImage}
                alt={doctor.userId?.name}
                className="rounded-4 border border-secondary align-self-start"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
              <div>
                <span className="badge bg-primary bg-opacity-10 text-primary mb-2">{doctor.specialization}</span>
                <h2 className="fw-bold text-main mb-2">{doctor.userId?.name}</h2>
                <p className="text-muted mb-3"><i className="bi bi-building me-1"></i>{doctor.hospital}</p>
                <div className="d-flex flex-wrap gap-3 text-muted small">
                  <span><i className="bi bi-award me-1"></i>{doctor.qualification}</span>
                  <span><i className="bi bi-briefcase me-1"></i>{doctor.experience} Years Experience</span>
                  <span><i className="bi bi-telephone me-1"></i>{doctor.userId?.phone}</span>
                </div>
              </div>
            </div>

            <h5 className="fw-semibold text-main mb-3">About Doctor</h5>
            <p className="text-muted mb-4 small">
              Dr. {doctor.userId?.name.split(' ').slice(1).join(' ')} is a highly accomplished specialist in the department of {doctor.specialization} at {doctor.hospital}. With {doctor.experience} years of clinical experience, they have been providing cutting-edge diagnosis and treatments for various clinical conditions.
            </p>

            <h5 className="fw-semibold text-main mb-3">Qualification Details</h5>
            <table className="table table-borderless table-sm small text-muted mb-0">
              <tbody>
                <tr>
                  <td className="ps-0" style={{ width: '120px' }}>Degree</td>
                  <td className="text-main fw-medium">{doctor.qualification}</td>
                </tr>
                <tr>
                  <td className="ps-0">Specialty</td>
                  <td className="text-main fw-medium">{doctor.specialization}</td>
                </tr>
                <tr>
                  <td className="ps-0">Hospital</td>
                  <td className="text-main fw-medium">{doctor.hospital}</td>
                </tr>
                <tr>
                  <td className="ps-0">consultationFee</td>
                  <td className="text-success fw-bold">${doctor.consultationFee} (Per Visit)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Availability & Booking trigger */}
        <div className="col-lg-4">
          <div className="glass-card p-4 sticky-top" style={{ top: '100px', zIndex: 10 }}>
            <h5 className="fw-bold text-main mb-3"><i className="bi bi-calendar3 me-2 text-primary"></i>Availability</h5>
            
            <div className="mb-4">
              <span className="text-muted small d-block mb-2">Available Days</span>
              <div className="d-flex flex-wrap gap-1.5">
                {doctor.availableDays.map((day, i) => (
                  <span key={i} className="badge bg-light bg-opacity-10 text-main border border-secondary px-2.5 py-1.5 small">
                    {day}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <span className="text-muted small d-block mb-2">Consultation Slots</span>
              <div className="d-flex flex-column gap-1.5">
                {doctor.availableTimeSlots.map((slot, i) => (
                  <div key={i} className="p-2 border border-secondary rounded-3 small text-muted">
                    <i className="bi bi-clock me-2 text-primary"></i>{slot}
                  </div>
                ))}
              </div>
            </div>

            {user ? (
              user.role === 'patient' ? (
                <button onClick={() => setShowModal(true)} className="btn btn-primary-glow w-100 py-3 fw-bold">
                  Book Appointment
                </button>
              ) : (
                <button disabled className="btn btn-outline-secondary w-100 py-3 text-main border border-secondary" style={{ cursor: 'not-allowed' }}>
                  Logged in as {user.role}
                </button>
              )
            ) : (
              <Link to="/login" className="btn btn-primary-glow w-100 py-3 fw-bold">
                Login to Book
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Booking Modal (Bootstrap styled inline glass modal) */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card p-4 border border-secondary shadow-lg">
              <div className="modal-header border-0 pb-0 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold text-main">Schedule Appointment</h5>
                <button type="button" className="btn-close shadow-none" onClick={() => { setShowModal(false); setBookingError(''); }} aria-label="Close"></button>
              </div>
              
              <div className="modal-body pt-3">
                {bookingSuccess && (
                  <div className="alert alert-success border-0 small py-2 mb-3">
                    <i className="bi bi-check-circle-fill me-2"></i>{bookingSuccess}
                  </div>
                )}
                {bookingError && (
                  <div className="alert alert-danger border-0 small py-2 mb-3">
                    <i className="bi bi-exclamation-triangle-fill"></i>{bookingError}
                  </div>
                )}

                <form onSubmit={handleBookSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Select Date</label>
                    <input
                      type="date"
                      className="form-control form-glass text-main py-2"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small">Select Time Slot</label>
                    <select
                      className="form-select form-glass text-main py-2"
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                    >
                      <option value="">-- Choose Slot --</option>
                      {doctor.availableTimeSlots.map((slot, i) => (
                        <option key={i} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small">Reason for Visit</label>
                    <textarea
                      className="form-control form-glass text-main py-2"
                      rows="3"
                      placeholder="Symptoms, checkup details..."
                      required
                      value={bookingReason}
                      onChange={(e) => setBookingReason(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="d-flex justify-content-between align-items-center border-top border-secondary border-opacity-10 pt-3 mt-4">
                    <span className="text-muted small">Consultation: <b className="text-success">${doctor.consultationFee}</b></span>
                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-outline-secondary text-main border-secondary" onClick={() => { setShowModal(false); setBookingError(''); }}>Cancel</button>
                      <button type="submit" className="btn btn-primary-glow px-4" disabled={bookingLoading}>
                        {bookingLoading ? 'Booking...' : 'Confirm Book'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetails;
