import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';
// Import FaCog for Settings icon and angle icons for submenu
import { 
  FaTachometerAlt, FaProjectDiagram, FaClipboardList, FaBullhorn, 
  FaUsers, FaChartBar, FaCog, FaAngleDown, FaAngleRight, FaUserEdit, FaUserFriends
} from 'react-icons/fa';

function Sidebar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation(); // Get current location

  // Function to toggle settings submenu
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Determine if the current path is under /settings
  const isSettingsActive = location.pathname.startsWith('/settings');

  // Keep settings open if a settings sub-page is active
  React.useEffect(() => {
    if (isSettingsActive) {
      setIsSettingsOpen(true);
    }
  }, [isSettingsActive]);

  return (
    <aside className="app-sidebar">
      <nav>
        <ul>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
              <FaTachometerAlt /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/projects" className={({ isActive }) => isActive ? "active" : ""}>
              <FaProjectDiagram /> Projects
            </NavLink>
          </li>
          <li>
            <NavLink to="/assessments" className={({ isActive }) => isActive ? "active" : ""}>
              <FaClipboardList /> Assessments
            </NavLink>
          </li>
          <li>
            <NavLink to="/plans" className={({ isActive }) => isActive ? "active" : ""}>
              <FaBullhorn /> Plans
            </NavLink>
          </li>
          <li>
            <NavLink to="/stakeholders" className={({ isActive }) => isActive ? "active" : ""}>
              <FaUsers /> Stakeholders
            </NavLink>
          </li>
          {/* Add Reports link if implemented */}
          {/*
          <li>
            <NavLink to="/reports" className={({ isActive }) => isActive ? "active" : ""}>
              <FaChartBar /> Reports
            </NavLink>
          </li>
          */}
          
          {/* --- Settings Parent Menu --- */}
          <li className={`settings-menu ${isSettingsActive ? 'active-parent' : ''}`}>
            <div className="settings-toggle" onClick={toggleSettings}>
              <FaCog /> Settings
              <span className="submenu-arrow">
                {isSettingsOpen ? <FaAngleDown /> : <FaAngleRight />}
              </span>
            </div>
            {/* --- Settings Submenu (Collapsible) --- */}
            {isSettingsOpen && (
              <ul className="submenu">
                <li>
                  <NavLink to="/settings/employees" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaUserEdit /> Employee Management
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings/groups" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaUserFriends /> Group Management
                  </NavLink>
                </li>
                {/* Add more settings sub-items here later */}
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;

