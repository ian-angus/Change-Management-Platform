import React, { useState } from 'react'; // Import useState
import { NavLink, useLocation } from 'react-router-dom'; // Import useLocation
import './Sidebar.css';
import { FaTachometerAlt, FaProjectDiagram, FaClipboardList, FaBullhorn, FaUsers, FaCog, FaChevronDown, FaChevronRight, FaLayerGroup, FaUserCog } from 'react-icons/fa'; // Added FaCog, Chevrons, FaLayerGroup, FaUserCog

function Sidebar() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation(); // Get current location

  // Determine if the current path is under /settings
  const isSettingsActive = location.pathname.startsWith('/settings');

  // Toggle Settings submenu
  const toggleSettings = (e) => {
    // Prevent navigation if clicking the main Settings item itself
    // Check if the closest anchor's href is exactly '#' to target the main toggle link
    const anchor = e.target.closest('a');
    if (anchor && anchor.getAttribute('href') === '#') {
        e.preventDefault();
        setIsSettingsOpen(!isSettingsOpen);
    }
    // Allow navigation if clicking a submenu item (NavLink)
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
          {/* Settings with Submenu */}
          <li className={isSettingsOpen ? 'submenu-open' : ''}>
            {/* Make the main Settings item clickable to toggle, but don't navigate */}
            <a href="#" onClick={toggleSettings} className={isSettingsActive ? "active" : ""}>
              <FaCog /> Settings
              <span className="submenu-toggle-icon">
                {isSettingsOpen ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            </a>
            {isSettingsOpen && (
              <ul className="submenu">
                <li>
                  <NavLink to="/settings/employees" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaUserCog /> Employee Management {/* Added icon */}
                  </NavLink>
                </li>
                {/* Add Groups sub-item */}
                <li>
                  <NavLink to="/settings/groups" className={({ isActive }) => isActive ? "active" : ""}>
                     <FaLayerGroup /> Groups {/* Added icon */}
                  </NavLink>
                </li>
                {/* Assessment Management sub-item */}
                <li>
                  <NavLink to="/settings/assessment-templates" className={({ isActive }) => isActive ? "active" : ""}>
                    <FaClipboardList /> Assessment Management
                  </NavLink>
                </li>
                {/* Add other settings sub-items here later */}
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;

