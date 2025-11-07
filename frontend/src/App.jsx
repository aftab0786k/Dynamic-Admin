// src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import PublicFormsList from "./pages/PublicFormsList";
import FormPage from "./pages/FormPage";
import FormSubmissions from "./pages/FormSubmissions";
import AdminForms from "./pages/AdminForms";
import AdminFormBuilder from "./pages/AdminFormBuilder";
import "./App.css";

function AppShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const toggleMenu = () => setIsMenuOpen((s) => !s);

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="logo">
              <div className="logo-icon">⚡</div>
              <span className="logo-text">DynamicPro</span>
            </div>
          </div>

          <div className="nav-links">
            <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
              <span className="nav-icon">🏠</span>
              <span>Home</span>
            </Link>

            <Link to="/user" className={`nav-link ${location.pathname === "/user" ? "active" : ""}`}>
              <span className="nav-icon">👤</span>
              <span>User Portal</span>
            </Link>

            <Link to="/admin" className={`nav-link ${location.pathname.startsWith("/admin") ? "active" : ""}`}>
              <span className="nav-icon">⚙️</span>
              <span>Admin</span>
            </Link>
          </div>

          <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <div className={`mobile-menu ${isMenuOpen ? "active" : ""}`}>
          <Link to="/" className={`mobile-nav-link ${location.pathname === "/" ? "active" : ""}`} onClick={() => setIsMenuOpen(false)}>
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </Link>

          <Link to="/user" className={`mobile-nav-link ${location.pathname === "/user" ? "active" : ""}`} onClick={() => setIsMenuOpen(false)}>
            <span className="nav-icon">👤</span>
            <span>User Portal</span>
          </Link>

          <Link to="/admin" className={`mobile-nav-link ${location.pathname.startsWith("/admin") ? "active" : ""}`} onClick={() => setIsMenuOpen(false)}>
            <span className="nav-icon">⚙️</span>
            <span>Admin</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user" element={<PublicFormsList />} />
          <Route path="/forms/:id" element={<FormPage />} />
          <Route path="/forms/:id/submissions" element={<FormSubmissions />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminForms />} />
          <Route path="/admin/new" element={<AdminFormBuilder />} />
          <Route path="/admin/edit/:id" element={<AdminFormBuilder />} />

          <Route path="*" element={<div className="p-8 text-center">Page not found</div>} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>DynamicPro</h3>
            <p>Building the future, one component at a time.</p>
          </div>
          <div className="footer-section">
            <p>&copy; {new Date().getFullYear()} DynamicPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppShell;
