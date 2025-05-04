import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet, Navigate } from 'react-router-dom'; // Import Outlet and Navigate
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Assessments from './pages/Assessments';
import Plans from './pages/Plans';
import Stakeholders from './pages/Stakeholders';
// Settings sub-pages
import EmployeeManagement from './pages/settings/EmployeeManagement'; 
import StakeholderGroupManagement from './pages/settings/StakeholderGroupManagement'; 
import './App.css';

// Settings Layout Component
const SettingsLayout = () => (
  <div>
    {/* No need for a separate H2 here as sub-components have their own */}
    <Outlet /> {/* Nested routes will render here */}
  </div>
);

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
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/stakeholders" element={<Stakeholders />} />
              
              {/* --- Nested Settings Routes --- */}
              <Route path="/settings" element={<SettingsLayout />}> 
                {/* Redirect base /settings to the first sub-page */}
                <Route index element={<Navigate to="employees" replace />} /> 
                <Route path="employees" element={<EmployeeManagement />} />
                <Route path="groups" element={<StakeholderGroupManagement />} />
                {/* Add more settings routes here */}
              </Route>

              {/* Add route for Reports if implemented */}
              {/* <Route path="/reports" element={<Reports />} /> */}

              {/* Optional: Add a 404 or default route */}
              {/* <Route path="*" element={<NotFound />} /> */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

