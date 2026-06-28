import React, { useContext, useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import './MainLayout.css';
import { IconMenu, IconClose, IconChevron } from '../components/Icons/CustomIcons';
import { AuthContext } from '../contexts/AuthContext';

export default function MainLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="mc-layout">
      {/* Floating Nav Pill */}
      <nav className={`mc-nav-pill-container ${scrolled ? 'scrolled' : ''}`}>
        <div className="mc-nav-pill">
          <div className="nav-left">
            <div className="mc-logo" onClick={() => navigate('/')}>
              <div className="logo-circles">
                <div className="circle-red"></div>
                <div className="circle-yellow"></div>
              </div>
              <span className="logo-text">TrungLe Hub</span>
            </div>
          </div>

          <div className="nav-center desktop-only">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Trang chủ</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Các công cụ</NavLink>
            {user && (
              <NavLink to="/wallet" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Quản lý Ví</NavLink>
            )}
            <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>News and trends</NavLink>
          </div>

          <div className="nav-right desktop-only">
            {user?.role === 'admin' && (
              <NavLink to="/admin" className="nav-link admin-link">Admin</NavLink>
            )}
            {!user ? (
              <>
                <NavLink to="/login" className="nav-link">Log In</NavLink>
                <NavLink to="/register" className="btn-ink" style={{ marginLeft: '12px' }}>Sign Up</NavLink>
              </>
            ) : (
              <button onClick={handleLogout} className="btn-outline">Log Out</button>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="nav-mobile-toggle mobile-only">
            <button className="icon-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <IconClose className="icon-sm" /> : <IconMenu className="icon-sm" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay fade-in">
          <div className="mobile-menu-content slide-down">
            <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</NavLink>
            <NavLink to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Các công cụ</NavLink>
            {user && <NavLink to="/wallet" onClick={() => setIsMobileMenuOpen(false)}>Quản lý Ví</NavLink>}
            <NavLink to="/about" onClick={() => setIsMobileMenuOpen(false)}>News and trends</NavLink>
            
            <div className="mobile-menu-divider"></div>
            
            {user?.role === 'admin' && (
              <NavLink to="/admin" onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</NavLink>
            )}
            {!user ? (
              <>
                <NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)}>Log In</NavLink>
                <NavLink to="/register" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</NavLink>
              </>
            ) : (
              <button onClick={handleLogout} className="mobile-logout">Log Out</button>
            )}
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      {location.pathname !== '/' && (
        <div className="mc-breadcrumbs-container">
          <div className="mc-breadcrumbs">
            <Link to="/" className="breadcrumb-link">Trang chủ</Link>
            {location.pathname.includes('/dashboard') && !location.pathname.includes('/tool/form-automation') && (
              <>
                <IconChevron className="breadcrumb-separator" />
                <span className="breadcrumb-current">Các công cụ</span>
              </>
            )}
            {location.pathname.includes('/tool/form-automation') && (
              <>
                <IconChevron className="breadcrumb-separator" />
                <Link to="/dashboard" className="breadcrumb-link">Các công cụ</Link>
                <IconChevron className="breadcrumb-separator" />
                <span className="breadcrumb-current">Form Automation</span>
              </>
            )}
            {location.pathname.includes('/wallet') && (
              <>
                <IconChevron className="breadcrumb-separator" />
                <span className="breadcrumb-current">Quản lý Ví</span>
              </>
            )}
            {location.pathname.includes('/about') && (
              <>
                <IconChevron className="breadcrumb-separator" />
                <span className="breadcrumb-current">News and trends</span>
              </>
            )}
            {location.pathname.includes('/admin') && (
              <>
                <IconChevron className="breadcrumb-separator" />
                <span className="breadcrumb-current">Quản trị</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={`mc-main-content ${location.pathname === '/' ? 'full-width' : 'contained'}`}>
        <Outlet />
      </main>

      {/* Mastercard Style Footer */}
      <footer className="mc-footer">
        <div className="footer-content">
          <h2>We're always here when you need us</h2>
          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <span>© 2026 TrungLe Hub. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
