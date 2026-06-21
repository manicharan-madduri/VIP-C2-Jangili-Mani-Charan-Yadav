import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, docsRes] = await Promise.all([
        apiClient.get('/admin/dashboard'),
        apiClient.get('/admin/users'),
        apiClient.get('/admin/doctors')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (docsRes.data.success) setDoctorsList(docsRes.data.doctors);
    } catch (error) {
      console.error('Failed to load admin dashboard:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Approve Doctor profile
  const handleApproveDoctor = async (id) => {
    if (!window.confirm('Approve this doctor profile?')) return;
    try {
      const res = await apiClient.put(`/admin/approve-doctor/${id}`);
      if (res.data.success) {
        setDoctorsList(prev => prev.map(d => d._id === id ? { ...d, approvalStatus: 'approved' } : d));
        alert('Doctor profile approved and activated.');
        // Refresh stats
        fetchDashboardData();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Approval failed');
    }
  };

  // Reject Doctor profile
  const handleRejectDoctor = async (id) => {
    if (!window.confirm('Reject this doctor profile?')) return;
    try {
      const res = await apiClient.put(`/admin/reject-doctor/${id}`);
      if (res.data.success) {
        setDoctorsList(prev => prev.map(d => d._id === id ? { ...d, approvalStatus: 'rejected' } : d));
        alert('Doctor profile rejected.');
        // Refresh stats
        fetchDashboardData();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Rejection failed');
    }
  };

  // Suspend/Delete User
  const handleDeleteUser = async (id) => {
    if (!window.confirm('WARNING: Deleting this user will remove their account and all associated appointments. Proceed?')) return;
    try {
      const res = await apiClient.delete(`/admin/user/${id}`);
      if (res.data.success) {
        setUsers(prev => prev.filter(u => u._id !== id));
        setDoctorsList(prev => prev.filter(d => d.userId?._id !== id));
        alert('Account deleted successfully.');
        // Refresh stats
        fetchDashboardData();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Suspension failed');
    }
  };

  const pendingDoctors = doctorsList.filter(d => d.approvalStatus === 'pending');

  return (
    <div className="container py-5 mt-5 page-fade-in">
      {/* Header */}
      <div className="mb-4">
        <h4 className="fw-bold text-main">Administrator Console</h4>
        <p className="text-muted small">Monitor platform metrics, moderate doctor credentials, and audit users.</p>
      </div>

      {/* Stats Cards Row */}
      {stats && (
        <div className="row g-4 mb-4">
          <div className="col-lg-3 col-sm-6 col-12">
            <div className="glass-card p-4 border-primary">
              <span className="text-muted small">Total Registered</span>
              <h3 className="fw-bold text-main mt-1">{stats.users?.total} Users</h3>
              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                Patients: <b>{stats.users?.patients}</b> | Doctors: <b>{stats.users?.doctors}</b>
              </span>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6 col-12">
            <div className="glass-card p-4 border-warning">
              <span className="text-muted small">Vetting Queue</span>
              <h3 className="fw-bold text-main mt-1">{pendingDoctors.length} Pending</h3>
              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Doctors waiting for verification</span>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6 col-12">
            <div className="glass-card p-4 border-success">
              <span className="text-muted small">Platform Revenue</span>
              <h3 className="fw-bold text-success mt-1">${stats.totalRevenue}</h3>
              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>Completed consultations volume</span>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6 col-12">
            <div className="glass-card p-4 border-secondary">
              <span className="text-muted small">Total Bookings</span>
              <h3 className="fw-bold text-main mt-1">
                {Object.values(stats.appointmentsByStatus).reduce((a, b) => a + b, 0)}
              </h3>
              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                Completed: <b>{stats.appointmentsByStatus?.Completed}</b> | Cancelled: <b>{stats.appointmentsByStatus?.Cancelled}</b>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation tabs */}
      <ul className="nav nav-pills gap-2 p-1 bg-light bg-opacity-10 rounded-3 mb-4 w-fit-content">
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn py-2 px-4 border-0 rounded-3 ${activeTab === 'overview' ? 'btn-primary-glow' : 'text-main'}`}
          >
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('doctors')}
            className={`btn py-2 px-4 border-0 rounded-3 ${activeTab === 'doctors' ? 'btn-primary-glow' : 'text-main'}`}
          >
            Vetting Queue {pendingDoctors.length > 0 && <span className="badge bg-danger ms-1">{pendingDoctors.length}</span>}
          </button>
        </li>
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('users')}
            className={`btn py-2 px-4 border-0 rounded-3 ${activeTab === 'users' ? 'btn-primary-glow' : 'text-main'}`}
          >
            Manage Users
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

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && stats && (
            <div>
              <h5 className="fw-semibold text-main mb-4">Platform Log Activity</h5>
              <div className="row g-4">
                {/* Status distribution */}
                <div className="col-lg-4 col-12">
                  <div className="p-3 border border-secondary rounded-3 bg-light bg-opacity-5 h-100">
                    <h6 className="fw-bold text-main mb-3">Appointments Distribution</h6>
                    <ul className="list-unstyled mb-0 d-flex flex-column gap-2.5">
                      {Object.entries(stats.appointmentsByStatus).map(([status, count]) => (
                        <li key={status} className="d-flex justify-content-between align-items-center small">
                          <span className="text-muted">{status}</span>
                          <span className="badge bg-secondary">{count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recent bookings */}
                <div className="col-lg-8 col-12">
                  <div className="p-3 border border-secondary rounded-3 bg-light bg-opacity-5 h-100">
                    <h6 className="fw-bold text-main mb-3">Recent Bookings Feed</h6>
                    {stats.recentAppointments.length === 0 ? (
                      <div className="text-center py-3 text-muted small">No recent appointments.</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm table-glass small align-middle mb-0">
                          <thead>
                            <tr>
                              <th>Patient</th>
                              <th>Doctor</th>
                              <th>Date</th>
                              <th>Time</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.recentAppointments.map((appt) => (
                              <tr key={appt._id}>
                                <td>{appt.patientId?.name}</td>
                                <td>{appt.doctorId?.userId?.name}</td>
                                <td>{new Date(appt.date).toLocaleDateString()}</td>
                                <td>{appt.time}</td>
                                <td>
                                  <span className={`badge ${
                                    appt.status === 'Approved' ? 'glow-badge-approved' :
                                    appt.status === 'Pending' ? 'glow-badge-pending' :
                                    appt.status === 'Completed' ? 'badge bg-success bg-opacity-25 text-success border border-success' :
                                    'glow-badge-rejected'
                                  }`} style={{ fontSize: '0.65rem' }}>
                                    {appt.status}
                                  </span>
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
            </div>
          )}

          {/* DOCTORS VETTING QUEUE TAB */}
          {activeTab === 'doctors' && (
            <div>
              <h5 className="fw-semibold text-main mb-3">Doctor Verification Requests</h5>
              {doctorsList.length === 0 ? (
                <div className="text-center py-4 text-muted small">No doctor profiles found.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-glass align-middle small mb-0">
                    <thead>
                      <tr>
                        <th>Doctor Name</th>
                        <th>Specialty / Degree</th>
                        <th>Hospital</th>
                        <th>Fee</th>
                        <th>Experience</th>
                        <th>Vetting Status</th>
                        <th className="text-end">Vetting Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctorsList.map((doc) => (
                        <tr key={doc._id}>
                          <td className="fw-semibold text-main">
                            {doc.userId?.name} <br />
                            <small className="text-muted">{doc.userId?.email}</small>
                          </td>
                          <td>
                            {doc.specialization} <br />
                            <small className="text-muted">{doc.qualification}</small>
                          </td>
                          <td className="text-muted">{doc.hospital}</td>
                          <td className="text-success fw-bold">${doc.consultationFee}</td>
                          <td className="text-muted">{doc.experience} Years</td>
                          <td>
                            <span className={`badge ${
                              doc.approvalStatus === 'approved' ? 'glow-badge-approved' :
                              doc.approvalStatus === 'pending' ? 'glow-badge-pending' :
                              'glow-badge-rejected'
                            }`}>
                              {doc.approvalStatus}
                            </span>
                          </td>
                          <td className="text-end">
                            {doc.approvalStatus === 'pending' ? (
                              <div className="d-flex justify-content-end gap-1.5">
                                <button
                                  onClick={() => handleApproveDoctor(doc._id)}
                                  className="btn btn-outline-success btn-sm"
                                  title="Approve Profile"
                                >
                                  <i className="bi bi-shield-check me-1"></i>Approve
                                </button>
                                <button
                                  onClick={() => handleRejectDoctor(doc._id)}
                                  className="btn btn-outline-danger btn-sm"
                                  title="Reject Profile"
                                >
                                  <i className="bi bi-shield-x me-1"></i>Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-muted small italic">Reviewed</span>
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

          {/* USERS ACCOUNT SUSPENSION TAB */}
          {activeTab === 'users' && (
            <div>
              <h5 className="fw-semibold text-main mb-3">Registered Users Audit</h5>
              {users.length === 0 ? (
                <div className="text-center py-4 text-muted small">No other users registered.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-glass align-middle small mb-0">
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>Email Address</th>
                        <th>Phone</th>
                        <th>System Role</th>
                        <th>Created Date</th>
                        <th className="text-end">Operations</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td className="fw-semibold text-main">{u.name}</td>
                          <td className="text-muted">{u.email}</td>
                          <td className="text-muted">{u.phone || 'N/A'}</td>
                          <td>
                            <span className={`badge ${
                              u.role === 'admin' ? 'bg-danger bg-opacity-25 text-danger border border-danger' :
                              u.role === 'doctor' ? 'bg-primary bg-opacity-25 text-primary border border-primary' :
                              'bg-success bg-opacity-25 text-success border border-success'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="text-end">
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="btn btn-outline-danger btn-sm"
                              title="Delete Account"
                            >
                              <i className="bi bi-trash-fill me-1"></i>Suspend
                            </button>
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
    </div>
  );
};

export default AdminDashboard;
