import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();
  
  // States
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');

  // Report Upload Form State
  const [uploadDoctorId, setUploadDoctorId] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  // Reschedule Form State
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [apptsRes, reportsRes, docsRes] = await Promise.all([
        apiClient.get('/appointments'),
        apiClient.get('/reports'),
        apiClient.get('/doctors')
      ]);

      if (apptsRes.data.success) setAppointments(apptsRes.data.appointments);
      if (reportsRes.data.success) setReports(reportsRes.data.reports);
      if (docsRes.data.success) setDoctors(docsRes.data.doctors);
    } catch (error) {
      console.error('Failed to load patient dashboard:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Cancel Appointment
  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await apiClient.put(`/appointments/${id}`, { status: 'Cancelled' });
      if (res.data.success) {
        setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'Cancelled' } : a));
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Cancellation failed');
    }
  };

  // Reschedule Form Submission
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    setRescheduleError('');
    setRescheduleLoading(true);

    try {
      const res = await apiClient.put(`/appointments/${rescheduleAppointmentId}`, {
        date: rescheduleDate,
        time: rescheduleTime
      });

      if (res.data.success) {
        setAppointments(prev => prev.map(a => a._id === rescheduleAppointmentId ? {
          ...a,
          date: rescheduleDate,
          time: rescheduleTime,
          status: 'Pending'
        } : a));
        setRescheduleAppointmentId(null);
        setRescheduleDate('');
        setRescheduleTime('');
        alert('Appointment rescheduled and sent for doctor approval.');
      }
    } catch (err) {
      setRescheduleError(err.response?.data?.error || 'Rescheduling failed.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Report File Upload
  const handleReportUpload = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!uploadDoctorId || !uploadFile) {
      setUploadError('Please select a doctor and choose a file');
      return;
    }

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('doctorId', uploadDoctorId);
    formData.append('reportFile', uploadFile);

    try {
      const res = await apiClient.post('/reports/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setUploadSuccess('Medical report uploaded successfully!');
        setUploadDoctorId('');
        setUploadFile(null);
        // Clear input element
        e.target.reset();
        
        // Refresh reports list
        const reportsRes = await apiClient.get('/reports');
        if (reportsRes.data.success) setReports(reportsRes.data.reports);
      }
    } catch (err) {
      setUploadError(err.response?.data?.error || 'File upload failed. Ensure size is under 5MB.');
    } finally {
      setUploadLoading(false);
    }
  };

  // Delete Report
  const handleDeleteReport = async (id) => {
    if (!window.confirm('Delete this medical report?')) return;
    try {
      await apiClient.delete(`/reports/${id}`);
      setReports(prev => prev.filter(r => r._id !== id));
    } catch (error) {
      alert(error.response?.data?.error || 'Deletion failed');
    }
  };

  // Calculations for stats card
  const upcomingCount = appointments.filter(a => ['Pending', 'Approved'].includes(a.status)).length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const reportsCount = reports.length;

  return (
    <div className="container py-5 mt-5 page-fade-in">
      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold text-main">Hello, <span className="text-gradient">{user.name}</span></h4>
        <p className="text-muted small">Access your healthcare calendar, locker, and prescriptions records.</p>
      </div>

      {/* Stats row */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="glass-card p-4 border-primary">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small">Active Bookings</span>
                <h3 className="fw-bold text-main mt-1">{upcomingCount}</h3>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary rounded p-3">
                <i className="bi bi-calendar-event fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-card p-4 border-success">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small">Consultations Completed</span>
                <h3 className="fw-bold text-main mt-1">{completedCount}</h3>
              </div>
              <div className="bg-success bg-opacity-10 text-success rounded p-3">
                <i className="bi bi-file-earmark-check fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-card p-4 border-warning">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small">Reports Uploaded</span>
                <h3 className="fw-bold text-main mt-1">{reportsCount}</h3>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning rounded p-3">
                <i className="bi bi-file-medical fs-3"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <ul className="nav nav-pills gap-2 p-1 bg-light bg-opacity-10 rounded-3 mb-4 w-fit-content">
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`btn py-2 px-4 border-0 rounded-3 ${activeTab === 'appointments' ? 'btn-primary-glow' : 'text-main'}`}
          >
            My Appointments
          </button>
        </li>
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`btn py-2 px-4 border-0 rounded-3 ${activeTab === 'prescriptions' ? 'btn-primary-glow' : 'text-main'}`}
          >
            Prescriptions
          </button>
        </li>
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('locker')}
            className={`btn py-2 px-4 border-0 rounded-3 ${activeTab === 'locker' ? 'btn-primary-glow' : 'text-main'}`}
          >
            Medical Locker
          </button>
        </li>
      </ul>

      {/* Main dashboard content */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-pulse"></div>
        </div>
      ) : (
        <div className="glass-card p-4">
          
          {/* APPOINTMENTS TAB */}
          {activeTab === 'appointments' && (
            <div>
              <h5 className="fw-semibold text-main mb-3">Appointment Schedules</h5>
              {appointments.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No appointments scheduled. <a href="/doctors">Book one now</a>.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-glass align-middle small mb-0">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Hospital</th>
                        <th>Date</th>
                        <th>Slot</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => (
                        <tr key={appt._id}>
                          <td className="fw-semibold text-main">{appt.doctorId?.userId?.name}</td>
                          <td className="text-muted">{appt.doctorId?.hospital}</td>
                          <td className="text-main">{new Date(appt.date).toLocaleDateString()}</td>
                          <td className="text-muted">{appt.time}</td>
                          <td className="text-muted text-truncate" style={{ maxWidth: '150px' }}>{appt.reason}</td>
                          <td>
                            <span className={`badge ${
                              appt.status === 'Approved' ? 'glow-badge-approved' :
                              appt.status === 'Pending' ? 'glow-badge-pending' :
                              appt.status === 'Completed' ? 'badge bg-success bg-opacity-25 text-success border border-success' :
                              'glow-badge-rejected'
                            }`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="text-end">
                            {['Pending', 'Approved'].includes(appt.status) && (
                              <div className="d-flex justify-content-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setRescheduleAppointmentId(appt._id);
                                    // Set default reschedule input placeholders to current values
                                    setRescheduleTime(appt.time);
                                  }}
                                  className="btn btn-outline-primary btn-sm"
                                  title="Reschedule"
                                >
                                  <i className="bi bi-clock-history"></i>
                                </button>
                                <button
                                  onClick={() => handleCancelAppointment(appt._id)}
                                  className="btn btn-outline-danger btn-sm"
                                  title="Cancel"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PRESCRIPTIONS TAB */}
          {activeTab === 'prescriptions' && (
            <div>
              <h5 className="fw-semibold text-main mb-3">Clinical Prescription Records</h5>
              {appointments.filter(a => a.prescription).length === 0 ? (
                <div className="text-center py-4 text-muted small">No prescriptions found.</div>
              ) : (
                <div className="row g-4">
                  {appointments.filter(a => a.prescription).map((appt) => (
                    <div key={appt._id} className="col-md-6 col-12">
                      <div className="p-3 border border-secondary rounded-3 bg-light bg-opacity-5">
                        <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-10 pb-2 mb-2">
                          <span className="fw-bold text-main">{appt.doctorId?.userId?.name}</span>
                          <span className="text-muted small">{new Date(appt.date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-muted small mb-2"><b>Visit Reason:</b> {appt.reason}</div>
                        <div className="p-2 bg-light bg-opacity-10 rounded border border-secondary text-main font-monospace small" style={{ whiteSpace: 'pre-line' }}>
                          {appt.prescription}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MEDICAL LOCKER TAB */}
          {activeTab === 'locker' && (
            <div>
              <div className="row g-4">
                {/* Upload Form */}
                <div className="col-lg-4 col-12">
                  <div className="p-3 border border-secondary rounded-3 bg-light bg-opacity-5">
                    <h6 className="fw-bold text-main mb-3">Upload Medical File</h6>
                    
                    {uploadSuccess && <div className="alert alert-success py-1.5 small">{uploadSuccess}</div>}
                    {uploadError && <div className="alert alert-danger py-1.5 small">{uploadError}</div>}
                    
                    <form onSubmit={handleReportUpload}>
                      <div className="mb-3">
                        <label className="form-label text-muted small">Choose Doctor</label>
                        <select
                          className="form-select form-glass text-main py-1.5 small"
                          required
                          value={uploadDoctorId}
                          onChange={(e) => setUploadDoctorId(e.target.value)}
                        >
                          <option value="">-- Select Doctor --</option>
                          {doctors.map((doc) => (
                            <option key={doc._id} value={doc._id}>{doc.userId?.name} ({doc.specialization})</option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-muted small">Choose File (PDF/Image)</label>
                        <input
                          type="file"
                          required
                          className="form-control form-glass text-main py-1.5 small"
                          onChange={(e) => setUploadFile(e.target.files[0])}
                        />
                      </div>

                      <button type="submit" disabled={uploadLoading} className="btn btn-primary-glow w-100 py-2 small">
                        {uploadLoading ? 'Uploading...' : 'Upload File'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Uploaded Reports List */}
                <div className="col-lg-8 col-12">
                  <h6 className="fw-bold text-main mb-3">Your Digital Health Locker</h6>
                  {reports.length === 0 ? (
                    <div className="text-center py-4 text-muted small">Locker is empty. Upload medical files to share.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover table-glass align-middle small mb-0">
                        <thead>
                          <tr>
                            <th>File Name</th>
                            <th>Associated Doctor</th>
                            <th>Uploaded At</th>
                            <th>Type</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reports.map((report) => (
                            <tr key={report._id}>
                              <td className="fw-semibold text-main">
                                <a
                                  href={`http://localhost:5000${report.fileUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary text-decoration-none"
                                >
                                  {report.fileName}
                                </a>
                              </td>
                              <td className="text-muted">{report.doctorId?.userId?.name}</td>
                              <td className="text-muted">{new Date(report.uploadedAt).toLocaleDateString()}</td>
                              <td><span className="badge bg-secondary">{report.fileType}</span></td>
                              <td className="text-end">
                                <button
                                  onClick={() => handleDeleteReport(report._id)}
                                  className="btn btn-outline-danger btn-sm border-0"
                                  title="Delete Report"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Reschedule Booking Modal (Bootstrap Styled Inline) */}
      {rescheduleAppointmentId && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content glass-card p-4 border border-secondary shadow-lg">
              <div className="modal-header border-0 pb-0 d-flex justify-content-between align-items-center">
                <h6 className="modal-title fw-bold text-main">Reschedule Date & Time</h6>
                <button type="button" className="btn-close shadow-none" onClick={() => setRescheduleAppointmentId(null)} aria-label="Close"></button>
              </div>

              <div className="modal-body pt-3">
                {rescheduleError && <div className="alert alert-danger py-1.5 small mb-2">{rescheduleError}</div>}
                
                <form onSubmit={handleRescheduleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-muted small">New Date</label>
                    <input
                      type="date"
                      className="form-control form-glass text-main py-1.5 small"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small">New Time Slot</label>
                    <select
                      className="form-select form-glass text-main py-1.5 small"
                      required
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                    >
                      <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                      <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                      <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                      <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                      <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                    </select>
                  </div>

                  <div className="d-flex justify-content-end gap-2 border-top border-secondary border-opacity-10 pt-3 mt-3">
                    <button type="button" className="btn btn-sm btn-outline-secondary text-main" onClick={() => setRescheduleAppointmentId(null)}>Cancel</button>
                    <button type="submit" disabled={rescheduleLoading} className="btn btn-sm btn-primary-glow px-3">
                      {rescheduleLoading ? 'Saving...' : 'Reschedule'}
                    </button>
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

export default PatientDashboard;
