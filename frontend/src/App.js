import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectOverview from './pages/ProjectOverview';
import Assessments from './pages/Assessments';
import Plans from './pages/Plans';
import Stakeholders from './pages/Stakeholders';
import EmployeeManagement from './pages/EmployeeManagement'; // Import EmployeeManagement
import GroupManagement from './pages/GroupManagement'; // Import GroupManagement
import SettingsAssessmentTemplates from './pages/settings/SettingsAssessmentTemplates';
// Import Reports page if it exists
// import Reports from './pages/Reports';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <div className="app-body">
          <Sidebar />
          <main className="app-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:projectId" element={<ProjectOverview />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/stakeholders" element={<Stakeholders />} />
              {/* Add route for Employee Management under Settings */}
              <Route path="/settings/employees" element={<EmployeeManagement />} />
              {/* Add route for Group Management under Settings */}
              <Route path="/settings/groups" element={<GroupManagement />} />
              <Route path="/settings/assessment-templates" element={<SettingsAssessmentTemplates apiBaseUrl="/api" />} />
              {/* Add route for Reports if implemented */}
              {/* <Route path="/reports" element={<Reports />} /> */}
              {/* Optional: Add a catch-all or redirect for /settings if needed */}
              {/* <Route path="/settings" element={<Navigate to="/settings/employees" replace />} /> */}
            </Routes>
          </main>
        </div>
        {/* Optional Footer */}
        {/* <Footer /> */}
      </div>
    </Router>
  );
}

export default App;

