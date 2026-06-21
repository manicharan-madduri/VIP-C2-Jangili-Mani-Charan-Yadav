import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 500);
  };

  return (
    <div className="container py-5 mt-5 page-fade-in">
      <div className="text-center mb-5">
        <h1 className="fw-bold text-main">Contact <span className="text-gradient">Our Support</span></h1>
        <p className="text-muted">Have any questions or need technical support? Drop us a message.</p>
      </div>

      <div className="row g-5">
        <div className="col-lg-5">
          <div className="glass-card p-4 h-100">
            <h4 className="fw-bold text-main mb-4">Get In Touch</h4>
            
            <div className="d-flex gap-3 mb-4">
              <div className="bg-primary bg-opacity-10 text-primary rounded p-3 align-self-start">
                <i className="bi bi-geo-alt-fill fs-4"></i>
              </div>
              <div>
                <h6 className="fw-semibold text-main mb-1">Corporate HQ</h6>
                <p className="text-muted small mb-0">100 Health Avenue, Suite 500, Cityville, NY 10001</p>
              </div>
            </div>

            <div className="d-flex gap-3 mb-4">
              <div className="bg-primary bg-opacity-10 text-primary rounded p-3 align-self-start">
                <i className="bi bi-telephone-fill fs-4"></i>
              </div>
              <div>
                <h6 className="fw-semibold text-main mb-1">Support Phone</h6>
                <p className="text-muted small mb-0">+1 (555) 123-4567 (Mon-Fri, 9AM-5PM EST)</p>
              </div>
            </div>

            <div className="d-flex gap-3">
              <div className="bg-primary bg-opacity-10 text-primary rounded p-3 align-self-start">
                <i className="bi bi-envelope-fill fs-4"></i>
              </div>
              <div>
                <h6 className="fw-semibold text-main mb-1">Help Desk Email</h6>
                <p className="text-muted small mb-0">support@bookadoctor.com</p>
              </div>
            </div>
            
            <div className="mt-5 text-center">
              <i className="bi bi-heart-pulse-fill text-danger fs-1 animate-pulse"></i>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="glass-card p-4">
            <h4 className="fw-bold text-main mb-4">Send Message</h4>
            
            {submitted && (
              <div className="alert alert-success alert-dismissible fade show border-0 rounded-3 mb-4" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                Thank you! Your inquiry was submitted. A support representative will email you shortly.
                <button type="button" className="btn-close" onClick={() => setSubmitted(false)} aria-label="Close"></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="contactName" className="form-label text-muted small">Your Name</label>
                  <input
                    type="text"
                    className="form-control form-glass text-main py-2"
                    id="contactName"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="contactEmail" className="form-label text-muted small">Your Email</label>
                  <input
                    type="email"
                    className="form-control form-glass text-main py-2"
                    id="contactEmail"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="contactSubject" className="form-label text-muted small">Subject</label>
                  <input
                    type="text"
                    className="form-control form-glass text-main py-2"
                    id="contactSubject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="contactMessage" className="form-label text-muted small">Message</label>
                  <textarea
                    className="form-control form-glass text-main py-2"
                    id="contactMessage"
                    rows="4"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>
                <div className="col-12 mt-4">
                  <button type="submit" className="btn btn-primary-glow w-100 py-3 fw-medium">
                    Send Inquiry
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
