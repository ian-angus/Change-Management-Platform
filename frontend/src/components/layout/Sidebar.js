import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { FaTachometerAlt, FaProjectDiagram, FaClipboardList, FaBullhorn, FaUsers, FaChartBar } from 'react-icons/fa'; // Example icons

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
          {/* Add Reports link if implemented */}
          {/*
          <li>
            <NavLink to="/reports" className={({ isActive }) => isActive ? "active" : ""}>
              <FaChartBar /> Reports
            </NavLink>
          </li>
          */}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;

