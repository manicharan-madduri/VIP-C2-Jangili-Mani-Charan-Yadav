import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container py-5 mt-5 page-fade-in hero-container">
      {/* Decorative blurred background orb */}
      <div className="hero-bg-blur"></div>

      {/* Hero Section */}
      <div className="row align-items-center g-5 min-vh-75 py-4">
        <div className="col-lg-6">
          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill fw-semibold mb-3">
            <i className="bi bi-shield-check me-2"></i>Verified Professionals Only
          </span>
          <h1 className="display-4 fw-extrabold text-main mb-4 lh-sm">
            Find and Book Your <br />
            <span className="text-gradient fw-black">Perfect Specialist</span> Instantly
          </h1>
          <p className="lead text-muted mb-5" style={{ fontSize: '1.1rem' }}>
            Connect with verified healthcare practitioners, secure instant appointments, store digital medical records, and consult on your own schedule. All in one unified platform.
          </p>
          <div className="d-flex flex-wrap gap-3">
            <Link to="/doctors" className="btn btn-primary-glow btn-lg px-4 py-3">
              <i className="bi bi-search me-2"></i>Find a Doctor
            </Link>
            <Link to="/register?role=doctor" className="btn btn-outline-secondary btn-lg px-4 py-3 text-main" style={{ borderColor: 'var(--border-color)' }}>
              Join as Doctor
            </Link>
          </div>
        </div>

        <div className="col-lg-6 text-center position-relative">
          <div className="position-relative d-inline-block">
            {/* Elegant Healthcare Backdrop Mockup Image */}
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop"
              alt="Healthcare professionals"
              className="img-fluid rounded-4 shadow-lg border border-secondary"
              style={{ maxHeight: '450px', objectFit: 'cover', width: '100%' }}
            />
            {/* Overlay Glass Widget */}
            <div className="glass-card p-3 position-absolute bottom-0 start-0 m-4 text-start border-primary" style={{ maxWidth: '220px' }}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-star-fill text-warning"></i>
                <span className="fw-bold text-main">4.9 / 5.0 Rating</span>
              </div>
              <span className="text-muted small">Based on 10,000+ patient reviews across the platform.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specialty Quick Grid */}
      <div className="my-5 py-5 text-center">
        <h2 className="fw-bold text-main mb-2">Search by Specialties</h2>
        <p className="text-muted mb-5">Access high-quality care across various clinical fields.</p>

        <div className="row g-4 justify-content-center">
          {[
            { name: 'Cardiology', icon: 'bi-heart-pulse text-danger', desc: 'Heart diagnostics' },
            { name: 'Pediatrics', icon: 'bi-balloon text-info', desc: 'Child health care' },
            { name: 'Dermatology', icon: 'bi-droplet text-warning', desc: 'Skin & laser treatment' },
            { name: 'Neurology', icon: 'bi-activity text-primary', desc: 'Brain & nerve health' },
            { name: 'Orthopedics', icon: 'bi-body-text text-success', desc: 'Bones & joints treatment' },
            { name: 'General', icon: 'bi-hospital text-secondary', desc: 'General medicine checkups' }
          ].map((spec, i) => (
            <div key={i} className="col-lg-2 col-md-4 col-6">
              <Link to={`/doctors?specialization=${spec.name}`} className="text-decoration-none">
                <div className="glass-card p-4 h-100 d-flex flex-column align-items-center justify-content-center">
                  <div className="rounded-circle bg-light bg-opacity-10 p-3 mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <i className={`bi ${spec.icon} fs-3`}></i>
                  </div>
                  <h6 className="fw-semibold text-main mb-1">{spec.name}</h6>
                  <span className="text-muted small" style={{ fontSize: '0.75rem' }}>{spec.desc}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Features Section */}
      <div className="row align-items-center g-5 my-5 py-4 border-top border-secondary border-opacity-10">
        <div className="col-lg-6 order-lg-2">
          <h2 className="fw-bold text-main mb-4">Why Book with Us?</h2>
          <div className="d-flex gap-3 mb-4">
            <div className="bg-primary bg-opacity-10 rounded p-3 text-primary align-self-start">
              <i className="bi bi-clock-history fs-4"></i>
            </div>
            <div>
              <h5 className="fw-semibold text-main">Real-time Booking Availability</h5>
              <p className="text-muted small">Select your doctor, pick an open slot, and get instant booking request logs with notifications.</p>
            </div>
          </div>
          <div className="d-flex gap-3 mb-4">
            <div className="bg-primary bg-opacity-10 rounded p-3 text-primary align-self-start">
              <i className="bi bi-file-earmark-medical fs-4"></i>
            </div>
            <div>
              <h5 className="fw-semibold text-main">Medical Report Locker</h5>
              <p className="text-muted small">Patients can upload PDF records, X-Rays, and prescriptions, sharing them securely with their consulting doctor.</p>
            </div>
          </div>
          <div className="d-flex gap-3">
            <div className="bg-primary bg-opacity-10 rounded p-3 text-primary align-self-start">
              <i className="bi bi-prescription fs-4"></i>
            </div>
            <div>
              <h5 className="fw-semibold text-main">Digital Prescription Records</h5>
              <p className="text-muted small">Doctors write clinical prescriptions directly, which are saved in the patient's dashboard history.</p>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="glass-card p-5 border-primary">
            <div className="row g-4 text-center">
              <div className="col-6">
                <h2 className="fw-extrabold text-gradient">20+</h2>
                <span className="text-muted small">Verified Specialties</span>
              </div>
              <div className="col-6">
                <h2 className="fw-extrabold text-gradient">500+</h2>
                <span className="text-muted small">Expert Doctors</span>
              </div>
              <div className="col-6">
                <h2 className="fw-extrabold text-gradient">15K+</h2>
                <span className="text-muted small">Happy Patients</span>
              </div>
              <div className="col-6">
                <h2 className="fw-extrabold text-gradient">50K+</h2>
                <span className="text-muted small">Appointments Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
