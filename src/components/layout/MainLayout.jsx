import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './MainLayout.css';
import { FiHome, FiSettings, FiActivity, FiInfo } from "react-icons/fi";

export default function MainLayout() {
  return (
    <div className="main-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Tool Library</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <FiHome /> Trang chủ
          </NavLink>
          <NavLink to="/tool/form-automation" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FiActivity /> Form Automation
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FiInfo /> Giới thiệu
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FiSettings /> Cài đặt chung
          </NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
