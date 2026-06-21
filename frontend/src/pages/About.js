import React from 'react';

const About = () => {
  return (
    <div className="container py-5 mt-5 page-fade-in">
      <div className="text-center mb-5">
        <h1 className="fw-bold text-main">About <span className="text-gradient">Book a Doctor</span></h1>
        <p className="text-muted">Bridging the gap between patients and quality medical consultations.</p>
      </div>

      <div className="row g-5 align-items-center mb-5">
        <div className="col-lg-6">
          <img
            src="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop"
            alt="Medical Research"
            className="img-fluid rounded-4 shadow-sm border border-secondary"
          />
        </div>
        <div className="col-lg-6">
          <h3 className="fw-bold text-main mb-3">Our Mission</h3>
          <p className="text-muted mb-4">
            We believe that healthcare should be accessible, transparent, and seamless for everyone. "Book a Doctor" was established to remove the traditional barriers of long queues, phone call wait times, and scattered paper medical records.
          </p>
          <p className="text-muted mb-4">
            By providing a secure, digital portal that connects patients directly with approved medical specialists, we empower individuals to take control of their clinical schedule and medical history securely.
          </p>
          
          <div className="row g-3">
            <div className="col-sm-6">
              <div className="glass-card p-3 border-0 bg-light bg-opacity-10">
                <h6 className="fw-bold text-main mb-1"><i className="bi bi-patch-check text-primary me-2"></i>100% Verified</h6>
                <span className="text-muted small">Every practitioner is vetted by system administrators.</span>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="glass-card p-3 border-0 bg-light bg-opacity-10">
                <h6 className="fw-bold text-main mb-1"><i className="bi bi-lock text-primary me-2"></i>Secure Vault</h6>
                <span className="text-muted small">Your medical uploads are fully encrypted and private.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-5 border-top border-secondary border-opacity-10 text-center">
        <h3 className="fw-bold text-main mb-5">Meet Our Leadership Team</h3>
        <div className="row g-4 justify-content-center">
          {[
            { name: 'Dr. Elizabeth Blackwell', role: 'Chief Medical Officer', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop' },
            { name: 'Marcus Sterling', role: 'Head of Technology', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop' },
            { name: 'Sophia Patel', role: 'VP of Patient Relations', img: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=200&auto=format&fit=crop' }
          ].map((member, i) => (
            <div key={i} className="col-lg-3 col-md-6 col-sm-10">
              <div className="glass-card p-4">
                <img
                  src={member.img}
                  alt={member.name}
                  className="rounded-circle mb-3 border border-secondary"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
                <h5 className="fw-semibold text-main mb-1">{member.name}</h5>
                <span className="text-primary small fw-medium">{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
