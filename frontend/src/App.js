import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectOverview from './pages/ProjectOverview';
import Assessments from './pages/Assessments';
import Plans from './pages/Plans';
import Stakeholders from './pages/Stakeholders';
import EmployeeManagement from './pages/EmployeeManagement';
import GroupManagement from './pages/GroupManagement';
import SettingsAssessmentTemplates from './pages/settings/SettingsAssessmentTemplates';
import Settings from './pages/Settings';
import Homepage from './pages/Homepage';
import Register from './pages/Register';
import SignIn from './pages/SignIn';
import Profile from './pages/Profile';
import MyAssessments from './pages/MyAssessments';
// Import Reports page if it exists
// import Reports from './pages/Reports';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isRegisterPage = location.pathname === '/register';
  const isSignInPage = location.pathname === '/signin';

  return (
    <div className="app">
      {/* Only show Header and Sidebar if not on homepage, register page, or sign in page */}
      {!isHomePage && !isRegisterPage && !isSignInPage && <Header />}
      <div className="app-body">
        {!isHomePage && !isRegisterPage && !isSignInPage && <Sidebar />}
        <main className="app-content" style={isHomePage ? { width: '100%', padding: 0 } : {}}>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId" element={<ProjectOverview />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/stakeholders" element={<Stakeholders />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/employees" element={<EmployeeManagement />} />
            <Route path="/settings/groups" element={<GroupManagement />} />
            <Route path="/settings/assessment-templates" element={<SettingsAssessmentTemplates apiBaseUrl="/api" />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-assessments" element={<MyAssessments />} />
            {/* Add route for Reports if implemented */}
            {/* <Route path="/reports" element={<Reports />} /> */}
            {/* Optional: Add a catch-all or redirect for /settings if needed */}
            {/* <Route path="/settings" element={<Navigate to="/settings/employees" replace />} /> */}
          </Routes>
        </main>
      </div>
      {/* Optional Footer */}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

