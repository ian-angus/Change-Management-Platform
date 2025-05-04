import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Assessments from './pages/Assessments';
import Plans from './pages/Plans';
import Stakeholders from './pages/Stakeholders';
// Import Settings Pages
import SettingsEmployeeManagement from './pages/settings/SettingsEmployeeManagement';
import SettingsGroupManagement from './pages/settings/SettingsGroupManagement';
import SettingsAssessmentTemplates from './pages/settings/SettingsAssessmentTemplates';

import './App.css'; // Main App CSS

function App() {
  // Use environment variable for API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
  console.log("API Base URL:", API_BASE_URL);

  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="main-layout">
          <Sidebar />
          <main className="content-area">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects apiBaseUrl={API_BASE_URL} />} />
              <Route path="/assessments" element={<Assessments apiBaseUrl={API_BASE_URL} />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/stakeholders" element={<Stakeholders apiBaseUrl={API_BASE_URL} />} />
              {/* Settings Routes */}
              <Route path="/settings/employees" element={<SettingsEmployeeManagement apiBaseUrl={API_BASE_URL} />} />
              <Route path="/settings/groups" element={<SettingsGroupManagement apiBaseUrl={API_BASE_URL} />} />
              <Route path="/settings/templates" element={<SettingsAssessmentTemplates apiBaseUrl={API_BASE_URL} />} />
              {/* Add a default route for /settings or redirect? */}
              {/* <Route path="/settings" element={<Navigate to="/settings/employees" replace />} /> */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

