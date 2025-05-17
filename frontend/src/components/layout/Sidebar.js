import React, { useState } from 'react'; // Import useState
import { NavLink, useLocation } from 'react-router-dom'; // Import useLocation
import './Sidebar.css';
import { FaTachometerAlt, FaProjectDiagram, FaClipboardList, FaBullhorn, FaUsers, FaCog, FaChevronDown, FaChevronRight, FaLayerGroup, FaUserCog, FaRegListAlt } from 'react-icons/fa'; // Added FaCog, Chevrons, FaLayerGroup, FaUserCog, FaRegListAlt

function Sidebar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommunicationOpen, setIsCommunicationOpen] = useState(false);
  const location = useLocation(); // Get current location

  // Determine if the current path is under /settings
  const isSettingsActive = location.pathname.startsWith('/settings');
  // Determine if the current path is under /communication
  const isCommunicationActive = location.pathname.startsWith('/key-messages') || location.pathname.startsWith('/plans');

  // Toggle Settings submenu
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Toggle Communication submenu
  const toggleCommunication = () => {
    setIsCommunicationOpen(!isCommunicationOpen);
  };

  // Keep settings open if a settings sub-page is active
  React.useEffect(() => {
    if (isSettingsActive) {
      setIsSettingsOpen(true);
    }
    // Optional: Close if navigating away from settings entirely
    // else {
    //   setIsSettingsOpen(false);
    // }
  }, [isSettingsActive]);

  // Keep communication open if a communication sub-page is active
  React.useEffect(() => {
    if (isCommunicationActive) {
      setIsCommunicationOpen(true);
    }
  }, [isCommunicationActive]);

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
            <NavLink to="/my-assessments" className={({ isActive }) => isActive ? "active" : ""}>
              <FaRegListAlt /> My Assessments
            </NavLink>
          </li>
          {/* Communication with Submenu */}
          <li className={isCommunicationOpen ? 'submenu-open' : ''}>
            <button type="button" onClick={toggleCommunication} className={isCommunicationActive ? "active" : ""} style={{ background: 'none', border: 'none', padding: 0, margin: 0, width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <FaBullhorn /> Communication
              <span className="submenu-toggle-icon">
                {isCommunicationOpen ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            </button>
            {isCommunicationOpen && (
              <ul className="submenu">
                <li>
                  <NavLink to="/key-messages" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaClipboardList /> Key Messages
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/plans" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaBullhorn /> Plans
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
          <li>
            <NavLink to="/stakeholders" className={({ isActive }) => isActive ? "active" : ""}>
              <FaUsers /> Stakeholders
            </NavLink>
          </li>
          {/* Settings with Submenu - always last */}
          <li className={isSettingsOpen ? 'submenu-open' : ''}>
            <button type="button" onClick={toggleSettings} className={isSettingsActive ? "active" : ""} style={{ background: 'none', border: 'none', padding: 0, margin: 0, width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <FaCog /> Settings
              <span className="submenu-toggle-icon">
                {isSettingsOpen ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            </button>
            {isSettingsOpen && (
              <ul className="submenu">
                <li>
                  <NavLink to="/settings/employees" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaUserCog /> Employee Management
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings/groups" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaLayerGroup /> Groups
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings/assessment-templates" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaClipboardList /> Assessment Management
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;

