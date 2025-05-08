import React from 'react';
import './Header.css';
import logo from '../../assets/BrightFold_Logo_Transparent.png'; // Adjust path as needed

function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <img src={logo} alt="BrightFold Logo" className="header-logo" />
        {/* Tagline removed as requested */}
        {/* <span className="header-tagline">Helping You Manage the People Side of Change</span> */}
      </div>
      <div className="header-user">
        <span className="welcome-message">Welcome, Change Manager</span>
        {/* Add user profile/logout options here if needed */}
      </div>
    </header>
  );
}

export default Header;

