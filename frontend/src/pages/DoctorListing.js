import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';

const DoctorListing = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || '');
  const [hospital, setHospital] = useState('');
  const [minFee, setMinFee] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [experience, setExperience] = useState('');
  const [sortBy, setSortBy] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [pagesCount, setPagesCount] = useState(1);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (specialization) params.append('specialization', specialization);
      if (hospital) params.append('hospital', hospital);
      if (minFee) params.append('minFee', minFee);
      if (maxFee) params.append('maxFee', maxFee);
      if (experience) params.append('experience', experience);
      if (sortBy) params.append('sortBy', sortBy);
      params.append('page', page);
      params.append('limit', 6);

      const res = await apiClient.get(`/doctors?${params.toString()}`);
      if (res.data.success) {
        setDoctors(res.data.doctors);
        setPagesCount(res.data.pagination.pages);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [page, specialization, sortBy]); // refetch on pagination, specialization select, or sorting change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDoctors();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSpecialization('');
    setHospital('');
    setMinFee('');
    setMaxFee('');
    setExperience('');
    setSortBy('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="container py-5 mt-5 page-fade-in">
      <div className="text-center mb-5">
        <h1 className="fw-bold text-main">Consult Our <span className="text-gradient">Medical Specialists</span></h1>
        <p className="text-muted">Book a consultation with our trusted and verified practitioners.</p>
      </div>

      <div className="row g-4">
        {/* Sidebar Filter Panel */}
        <div className="col-lg-3">
          <div className="glass-card p-4 sticky-top" style={{ top: '100px', zIndex: 10 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold text-main mb-0"><i className="bi bi-funnel-fill me-2 text-primary"></i>Filters</h5>
              <button onClick={handleClearFilters} className="btn btn-link btn-sm text-primary text-decoration-none p-0">Clear All</button>
            </div>

            <form onSubmit={handleSearchSubmit}>
              {/* Text Search */}
              <div className="mb-3">
                <label className="form-label text-muted small">Search Name/Clinic</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-glass text-main py-1.5"
                    placeholder="Dr. Name or hospital..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button type="submit" className="btn btn-outline-primary"><i className="bi bi-search"></i></button>
                </div>
              </div>

              {/* Specialization select */}
              <div className="mb-3">
                <label className="form-label text-muted small">Specialty</label>
                <select
                  className="form-select form-glass text-main py-1.5"
                  value={specialization}
                  onChange={(e) => {
                    setSpecialization(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Specialties</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>

              {/* Fee Range */}
              <div className="mb-3">
                <label className="form-label text-muted small">Fee Range ($)</label>
                <div className="d-flex gap-2">
                  <input
                    type="number"
                    className="form-control form-glass text-main py-1.5 w-50"
                    placeholder="Min"
                    value={minFee}
                    onChange={(e) => setMinFee(e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-control form-glass text-main py-1.5 w-50"
                    placeholder="Max"
                    value={maxFee}
                    onChange={(e) => setMaxFee(e.target.value)}
                  />
                </div>
              </div>

              {/* Experience GTE */}
              <div className="mb-4">
                <label className="form-label text-muted small">Min Experience (Years)</label>
                <input
                  type="number"
                  className="form-control form-glass text-main py-1.5"
                  placeholder="e.g. 5"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary-glow w-100 py-2">
                Apply Filters
              </button>
            </form>
          </div>
        </div>

        {/* Doctor Listings Grid */}
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <span className="text-muted small">Showing {doctors.length} doctors</span>
            
            {/* Sorting */}
            <div className="d-flex align-items-center gap-2" style={{ maxWidth: '200px' }}>
              <label className="text-muted small text-nowrap mb-0">Sort By</label>
              <select
                className="form-select form-glass text-main py-1"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">Newest</option>
                <option value="fee_low">Fee: Low to High</option>
                <option value="fee_high">Fee: High to Low</option>
                <option value="experience">Experience</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '50vh' }}>
              <div className="spinner-pulse"></div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="glass-card text-center p-5">
              <i className="bi bi-journal-x text-muted fs-1 mb-2"></i>
              <h4 className="fw-semibold text-main">No Doctors Found</h4>
              <p className="text-muted small">Try modifying your filters or search terms.</p>
              <button onClick={handleClearFilters} className="btn btn-outline-primary mt-2">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {doctors.map((doc) => (
                  <div key={doc._id} className="col-md-6 col-12">
                    <div className="glass-card p-4 h-100 d-flex flex-column">
                      <div className="d-flex gap-3 mb-3">
                        <img
                          src={doc.profileImage}
                          alt={doc.userId?.name}
                          className="rounded-4 border border-secondary"
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        />
                        <div>
                          <h5 className="fw-bold text-main mb-1">{doc.userId?.name}</h5>
                          <span className="badge bg-primary bg-opacity-10 text-primary mb-2 small">{doc.specialization}</span>
                          <div className="text-muted small"><i className="bi bi-building me-1"></i>{doc.hospital}</div>
                        </div>
                      </div>
                      
                      <div className="row g-2 border-top border-secondary border-opacity-10 pt-3 mt-auto mb-3">
                        <div className="col-6">
                          <span className="text-muted small d-block">Experience</span>
                          <span className="fw-medium text-main">{doc.experience} Years</span>
                        </div>
                        <div className="col-6 text-end">
                          <span className="text-muted small d-block">Consultation Fee</span>
                          <span className="fw-bold text-success">${doc.consultationFee}</span>
                        </div>
                      </div>

                      <Link to={`/doctors/${doc._id}`} className="btn btn-outline-primary w-100 py-2">
                        View Profile & Book
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination controls */}
              {pagesCount > 1 && (
                <div className="d-flex justify-content-center gap-2 mt-5">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn btn-outline-secondary text-main"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    Previous
                  </button>
                  {[...Array(pagesCount)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`btn ${page === i + 1 ? 'btn-primary-glow' : 'btn-outline-secondary text-main'}`}
                      style={page !== i + 1 ? { borderColor: 'var(--border-color)' } : {}}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(pagesCount, p + 1))}
                    disabled={page === pagesCount}
                    className="btn btn-outline-secondary text-main"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorListing;
