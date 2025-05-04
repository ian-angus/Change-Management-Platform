import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // Import CSS for styling

function Sidebar() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };

  return (
    <aside className="app-sidebar">
      <nav>
        <ul>
          <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? "active-link" : ""}>Dashboard</NavLink></li>
          <li><NavLink to="/projects" className={({ isActive }) => isActive ? "active-link" : ""}>Projects</NavLink></li>
          <li><NavLink to="/assessments" className={({ isActive }) => isActive ? "active-link" : ""}>Assessments</NavLink></li>
          <li><NavLink to="/plans" className={({ isActive }) => isActive ? "active-link" : ""}>Plans</NavLink></li>
          <li><NavLink to="/stakeholders" className={({ isActive }) => isActive ? "active-link" : ""}>Stakeholders</NavLink></li>
          {/* Add other main navigation items here */}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <ul>
          <li className="settings-menu">
            <button onClick={toggleSettings} className={`settings-button ${settingsOpen ? 'open' : ''}`}>
              Settings
              <span className="arrow">{settingsOpen ? '\u25B2' : '\u25BC'}</span> {/* Up/Down arrow */}
            </button>
            {settingsOpen && (
              <ul className="submenu">
                <li><NavLink to="/settings/general" className={({ isActive }) => isActive ? "active-link" : ""}>General</NavLink></li>
                <li><NavLink to="/settings/users" className={({ isActive }) => isActive ? "active-link" : ""}>Users</NavLink></li>
                {/* Add other settings sub-items here */}
              </ul>
            )}
          </li>
          {/* Add other footer items like Help, Logout etc. */}
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;

