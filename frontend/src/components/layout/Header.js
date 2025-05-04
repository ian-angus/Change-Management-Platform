import React from 'react';
import './Header.css'; // Import CSS for styling
// Logo is placed in public/images
const logoUrl = process.env.PUBLIC_URL + '/images/brightfold-logo.png';

function Header() {
  return (
    <header className="app-header">
      <div className="logo-container">
        {/* Use the image logo */}
        <img src={logoUrl} alt="BrightFold Logo" className="logo-image" />
        {/* Remove or comment out the text logo */}
        {/* <span className="logo-text">BrightFold Platform</span> */}
      </div>
      <div className="header-actions">
        {/* Placeholder for user profile, notifications, etc. */}
        {/* <button>User</button> */}
      </div>
    </header>
  );
}

export default Header;

