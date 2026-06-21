import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="glass-card mt-auto border-top border-0 rounded-0 py-5 mt-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="text-gradient fw-bold mb-3">Book a Doctor</h5>
            <p className="text-muted small">
              A comprehensive MERN-stack appointment booking platform connecting patients with top specialists. Experience hassle-free scheduling, medical report lockers, and direct communication.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="#" className="text-muted fs-5"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-muted fs-5"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="text-muted fs-5"><i className="bi bi-linkedin"></i></a>
              <a href="#" className="text-muted fs-5"><i className="bi bi-instagram"></i></a>
            </div>
          </div>
          
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-semibold text-main mb-3">Platform</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2"><Link to="/" className="text-muted text-decoration-none small">Home</Link></li>
              <li className="mb-2"><Link to="/doctors" className="text-muted text-decoration-none small">Find Doctors</Link></li>
              <li className="mb-2"><Link to="/about" className="text-muted text-decoration-none small">About Us</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-muted text-decoration-none small">Contact</Link></li>
            </ul>
          </div>
          
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-semibold text-main mb-3">Services</h6>
            <ul className="list-unstyled mb-0">
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none small">Cardiology</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none small">Pediatrics</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none small">Dermatology</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none small">General Clinic</a></li>
            </ul>
          </div>
          
          <div className="col-lg-4 col-md-6">
            <h6 className="fw-semibold text-main mb-3">Contact Support</h6>
            <p className="text-muted small mb-2">
              <i className="bi bi-geo-alt-fill text-primary me-2"></i> 100 Health Avenue, Suite 500, Cityville
            </p>
            <p className="text-muted small mb-2">
              <i className="bi bi-telephone-fill text-primary me-2"></i> +1 (555) 123-4567
            </p>
            <p className="text-muted small">
              <i className="bi bi-envelope-fill text-primary me-2"></i> support@bookadoctor.com
            </p>
          </div>
        </div>
        
        <hr className="border-secondary opacity-25 my-4" />
        
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="text-muted small mb-0">&copy; {new Date().getFullYear()} Book a Doctor. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-center text-md-end mt-2 mt-md-0">
            <a href="#" className="text-muted text-decoration-none small me-3">Privacy Policy</a>
            <a href="#" className="text-muted text-decoration-none small">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
