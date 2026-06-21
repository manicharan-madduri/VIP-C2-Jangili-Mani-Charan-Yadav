import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../api/client';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await apiClient.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.notifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Failed to load notifications in navbar:', error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds for in-app alert simulation
    let interval;
    if (user) {
      interval = setInterval(fetchNotifications, 30000);
    }
    return () => clearInterval(interval);
  }, [user]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      // Update state locally
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg glass-nav fixed-top navbar-dark py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-heart-pulse-fill text-danger me-2 fs-3"></i>
          <span className="fw-bold fs-4 text-gradient">Book a Doctor</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link text-main active px-3" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-main px-3" to="/doctors">Doctors</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-main px-3" to="/about">About</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-main px-3" to="/contact">Contact</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn p-2 text-main"
              aria-label="Toggle Theme"
              title="Toggle Theme"
            >
              {theme === 'light' ? (
                <i className="bi bi-moon-stars-fill text-primary"></i>
              ) : (
                <i className="bi bi-sun-fill text-warning"></i>
              )}
            </button>

            {/* Notification Bell Dropdown */}
            {user && (
              <div className="position-relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="btn btn-link text-main p-1 position-relative border-0 shadow-none"
                  title="Notifications"
                >
                  <i className="bi bi-bell-fill fs-5 text-muted"></i>
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-2 border-dark" style={{ fontSize: '0.65rem' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="dropdown-menu dropdown-menu-end show glass-card p-2 border border-secondary mt-2 position-absolute" style={{ width: '320px', right: 0, zIndex: 1050 }}>
                    <div className="d-flex justify-content-between align-items-center px-2 py-1 border-bottom border-secondary mb-2">
                      <span className="fw-semibold text-main">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="btn btn-link btn-sm p-0 text-primary text-decoration-none" style={{ fontSize: '0.8rem' }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div className="text-center py-3 text-muted" style={{ fontSize: '0.9rem' }}>
                          No notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`p-2 rounded mb-1 border-0 ${!n.read ? 'bg-light bg-opacity-10' : ''}`}
                            style={{ fontSize: '0.8rem', cursor: 'pointer' }}
                            onClick={() => !n.read && handleMarkAsRead(n._id)}
                          >
                            <div className="d-flex justify-content-between text-main">
                              <span>{n.message}</span>
                              {!n.read && <span className="p-1 bg-primary border rounded-circle align-self-start mt-1"></span>}
                            </div>
                            <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Dropdown or Login Buttons */}
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-primary dropdown-toggle d-flex align-items-center gap-2 border border-primary text-main shadow-none"
                  type="button"
                  id="profileDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle fs-5"></i>
                  <span>{user.name.split(' ')[0]}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end glass-card p-1 border border-secondary mt-2" aria-labelledby="profileDropdown">
                  <li>
                    <Link className="dropdown-item text-main rounded py-2" to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'}>
                      <i className="bi bi-speedometer2 me-2 text-primary"></i> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item text-main rounded py-2" to={user.role === 'doctor' ? '/doctor/profile' : '/patient/profile'}>
                      <i className="bi bi-person-fill-gear me-2 text-primary"></i> Edit Profile
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider border-secondary" /></li>
                  <li>
                    <button onClick={handleLogout} className="dropdown-item text-danger rounded py-2">
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-primary border border-primary text-main px-4">Login</Link>
                <Link to="/register" className="btn btn-primary-glow px-4">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
