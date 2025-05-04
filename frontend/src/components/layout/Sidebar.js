import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { FaTachometerAlt, FaProjectDiagram, FaClipboardList, FaBullhorn, FaUsers, FaCog } from 'react-icons/fa'; // Added FaCog for Settings

function Sidebar() {
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
          {/* Add Settings link */}
          <li>
            {/* For now, link directly to Employee Management. Submenu can be added later if needed. */}
            <NavLink to="/settings/employees" className={({ isActive }) => isActive ? "active" : ""}>
              <FaCog /> Settings
            </NavLink>
            {/* Example Submenu (implement later if needed)
            <ul className="submenu">
              <li>
                <NavLink to="/settings/employees" className={({ isActive }) => isActive ? "active" : ""}>
                  Employee Management
                </NavLink>
              </li>
            </ul>
            */}
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;

