import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="app-footer">
      <p>&copy; {new Date().getFullYear()} BrightFold Inc. All rights reserved.</p>
      {/* Add other footer content if needed */}
    </footer>
  );
}

export default Footer;

