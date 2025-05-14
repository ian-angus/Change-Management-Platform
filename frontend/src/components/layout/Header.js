import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import logo from '../../assets/BrightFold_Logo_Transparent.png'; // Adjust path as needed
import { FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';

function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState({ name: 'Change Manager' });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('brightfoldUser'));
      if (userData && userData.name) {
        setUser(userData);
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('brightfoldUser');
    navigate('/');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <img src={logo} alt="BrightFold Logo" className="header-logo" />
        {/* Tagline removed as requested */}
        {/* <span className="header-tagline">Helping You Manage the People Side of Change</span> */}
      </div>
      <div className="header-user" ref={dropdownRef}>
        <button
          className="user-menu-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="avatar">
            {getInitials(user.name)}
          </div>
          <span className="welcome-message">Welcome, {user.name}</span>
          <FaChevronDown className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`} />
        </button>
        
        {isDropdownOpen && (
          <div className="user-dropdown">
            <button onClick={() => navigate('/profile')} className="dropdown-item">
              <FaUser /> My Profile
            </button>
            <div className="dropdown-divider"></div>
            <button onClick={handleLogout} className="dropdown-item text-red-600">
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;

