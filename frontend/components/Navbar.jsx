'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Car, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout, loading } = useAuth();

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => document.body.classList.remove('menu-open');
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    router.push(isAuthenticated ? '/dashboard' : '/');
  };

  const isActive = (href) => pathname === href;

  return (
    <nav className="navbar">
      <a href="/" onClick={handleLogoClick} className="navbar-brand">
        <div className="navbar-logo-icon">
          <Car size={24} />
        </div>
        <span className="navbar-logo-text">PERFECT WHEELS</span>
      </a>

      <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <Link
          href="/"
          className={`navbar-link ${isActive('/') && !isAuthenticated ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          Home
        </Link>
        <Link
          href="/vehicles"
          className={`navbar-link ${isActive('/vehicles') ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          Vehicles
        </Link>
        {isAuthenticated && (
          <Link
            href="/dashboard"
            className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
        )}
        {isAuthenticated && (
          <Link
            href="/booking-history"
            className={`navbar-link ${isActive('/booking-history') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Booking History
          </Link>
        )}
        {isAuthenticated && (
          <Link
            href="/my-enquiries"
            className={`navbar-link ${isActive('/my-enquiries') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            My Enquiries
          </Link>
        )}
        {isAuthenticated && user?.role === 'ADMIN' && (
          <Link
            href="/admin"
            className={`navbar-link ${isActive('/admin') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Late Fines
          </Link>
        )}
        {isAuthenticated && user?.role === 'ADMIN' && (
          <Link
            href="/admin/enquiries"
            className={`navbar-link ${isActive('/admin/enquiries') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Enquiry Dash
          </Link>
        )}
        <Link
          href="/enquiry"
          className={`navbar-link ${isActive('/enquiry') ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          Enquiry
        </Link>
        <Link
          href="/contact"
          className={`navbar-link ${isActive('/contact') ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          Contact Us
        </Link>

        {!loading && (
          isAuthenticated ? (
            <div className="navbar-auth-group">
              <button className="navbar-logout" onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth-group">
              <Link
                href="/login"
                className={`navbar-link ${isActive('/login') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="navbar-link navbar-join-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                Join Now
              </Link>
            </div>
          )
        )}
      </div>

      <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
    </nav>
  );
};
