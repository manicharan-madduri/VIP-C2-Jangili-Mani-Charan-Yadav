import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  
  // States
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');

  // Prescription Modal State
  const [prescribeApptId, setPrescribeApptId] = useState(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [prescriptionError, setPrescriptionError] = useState('');
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [apptsRes, reportsRes] = await Promise.all([
        apiClient.get('/appointments'),
        apiClient.get('/reports')
      ]);

      if (apptsRes.data.success) setAppointments(apptsRes.data.appointments);
      if (reportsRes.data.success) setReports(reportsRes.data.reports);
    } catch (error) {
      console.error('Failed to load doctor dashboard:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Approve/Reject Appointment
  const handleUpdateStatus = async (id, status) => {
    const verb = status === 'Approved' ? 'approve' : 'reject';
    if (!window.confirm(`Are you sure you want to ${verb} this appointment?`)) return;

    try {
      const res = await apiClient.put(`/appointments/${id}`, { status });
      if (res.data.success) {
        setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
        alert(`Appointment status updated to ${status}.`);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Action failed');
    }
  };

  // Submit Prescription
  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    setPrescriptionError('');
    
    if (!prescriptionNotes.trim()) {
      setPrescriptionError('Prescription notes cannot be empty');
      return;
    }

    setPrescriptionLoading(true);
    try {
      const res = await apiClient.put(`/appointments/${prescribeApptId}/prescription`, {
        prescription: prescriptionNotes
      });

      if (res.data.success) {
        setAppointments(prev => prev.map(a => a._id === prescribeApptId ? {
          ...a,
          prescription: prescriptionNotes,
          status: 'Completed'
        } : a));
        
        setPrescribeApptId(null);
        setPrescriptionNotes('');
        alert('Prescription added and appointment marked as completed.');
      }
    } catch (err) {
      setPrescriptionError(err.response?.data?.error || 'Failed to submit prescription.');
    } finally {
      setPrescriptionLoading(false);
    }
  };

  // Calculations for stats
  const pendingCount = appointments.filter(a => a.status === 'Pending').length;
  const approvedCount = appointments.filter(a => a.status === 'Approved').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;

  return (
    <div className="container py-5 mt-5 page-fade-in">
      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold text-main">Welcome, <span className="text-gradient">{user.name}</span></h4>
        <p className="text-muted small">Manage consultations, review patient files, and write digital prescriptions.</p>
      </div>

      {/* Stats row */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="glass-card p-4 border-warning">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small">Pending Requests</span>
                <h3 className="fw-bold text-main mt-1">{pendingCount}</h3>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning rounded p-3">
                <i className="bi bi-calendar-plus fs-3"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-card p-4 border-primary">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small">Approved Schedules</span>
                <h3 className="fw-bold text-main mt-1">{approvedCount}</h3>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary rounded p-3">
                <i className="bi bi-calendar-check fs-3"></i>
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
                <i className="bi bi-check2-circle fs-3"></i>
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
            Manage Appointments
          </button>
        </li>
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('records')}
            className={`btn py-2 px-4 border-0 rounded-3 ${activeTab === 'records' ? 'btn-primary-glow' : 'text-main'}`}
          >
            Shared Patient Records
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
              <h5 className="fw-semibold text-main mb-3">Consultation Schedule Queue</h5>
              {appointments.length === 0 ? (
                <div className="text-center py-4 text-muted small">No patient bookings scheduled at this time.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-glass align-middle small mb-0">
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Email / Phone</th>
                        <th>Date</th>
                        <th>Time Slot</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appt) => (
                        <tr key={appt._id}>
                          <td className="fw-semibold text-main">{appt.patientId?.name}</td>
                          <td className="text-muted">
                            {appt.patientId?.email} <br />
                            <small>{appt.patientId?.phone}</small>
                          </td>
                          <td className="text-main">{new Date(appt.date).toLocaleDateString()}</td>
                          <td className="text-muted">{appt.time}</td>
                          <td className="text-muted text-truncate" style={{ maxWidth: '180px' }}>{appt.reason}</td>
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
                            <div className="d-flex justify-content-end gap-1.5">
                              {appt.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleUpdateStatus(appt._id, 'Approved')}
                                    className="btn btn-outline-success btn-sm"
                                    title="Approve"
                                  >
                                    <i className="bi bi-check-lg"></i>
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(appt._id, 'Rejected')}
                                    className="btn btn-outline-danger btn-sm"
                                    title="Reject"
                                  >
                                    <i className="bi bi-x-lg"></i>
                                  </button>
                                </>
                              )}
                              
                              {appt.status === 'Approved' && (
                                <button
                                  onClick={() => {
                                    setPrescribeApptId(appt._id);
                                    setPrescriptionNotes(appt.prescription || '');
                                  }}
                                  className="btn btn-primary-glow btn-sm px-2.5"
                                  title="Add Prescription"
                                >
                                  <i className="bi bi-prescription me-1"></i>Prescribe
                                </button>
                              )}
                              
                              {appt.status === 'Completed' && (
                                <button
                                  onClick={() => {
                                    setPrescribeApptId(appt._id);
                                    setPrescriptionNotes(appt.prescription || '');
                                  }}
                                  className="btn btn-outline-secondary btn-sm"
                                  title="View/Edit Prescription"
                                >
                                  <i className="bi bi-eye"></i> Notes
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* RECORDS TAB */}
          {activeTab === 'records' && (
            <div>
              <h5 className="fw-semibold text-main mb-3">Uploaded Patient Reports Locker</h5>
              {reports.length === 0 ? (
                <div className="text-center py-4 text-muted small">No patient files have been shared with you yet.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-glass align-middle small mb-0">
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Shared Document / File</th>
                        <th>Upload Date</th>
                        <th>Type</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report._id}>
                          <td className="fw-semibold text-main">{report.patientId?.name}</td>
                          <td>{report.fileName}</td>
                          <td className="text-muted">{new Date(report.uploadedAt).toLocaleDateString()}</td>
                          <td><span className="badge bg-secondary">{report.fileType}</span></td>
                          <td className="text-end">
                            <a
                              href={`http://localhost:5000${report.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-primary btn-sm"
                            >
                              <i className="bi bi-download me-1"></i>Download
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Prescription Add Modal (Bootstrap Styled Inline Glass) */}
      {prescribeApptId && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card p-4 border border-secondary shadow-lg">
              <div className="modal-header border-0 pb-0 d-flex justify-content-between align-items-center">
                <h6 className="modal-title fw-bold text-main">Write Prescription Notes</h6>
                <button type="button" className="btn-close shadow-none" onClick={() => { setPrescribeApptId(null); setPrescriptionNotes(''); }} aria-label="Close"></button>
              </div>

              <div className="modal-body pt-3">
                {prescriptionError && <div className="alert alert-danger py-1.5 small mb-2">{prescriptionError}</div>}
                
                <form onSubmit={handlePrescriptionSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Clinical Notes / Dosage details</label>
                    <textarea
                      className="form-control form-glass text-main font-monospace py-2"
                      rows="6"
                      placeholder="e.g.&#10;Rx:&#10;1. Paracetamol 500mg - Twice daily after meals (3 days)&#10;2. Rest & Hydrate."
                      required
                      value={prescriptionNotes}
                      onChange={(e) => setPrescriptionNotes(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="d-flex justify-content-end gap-2 border-top border-secondary border-opacity-10 pt-3 mt-4">
                    <button type="button" className="btn btn-sm btn-outline-secondary text-main" onClick={() => { setPrescribeApptId(null); setPrescriptionNotes(''); }}>Close</button>
                    <button type="submit" disabled={prescriptionLoading} className="btn btn-sm btn-primary-glow px-4">
                      {prescriptionLoading ? 'Saving...' : 'Save Prescription'}
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

export default DoctorDashboard;
