import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Assessments from './pages/Assessments';
import Plans from './pages/Plans'; // Assuming Plans page exists
import Stakeholders from './pages/Stakeholders'; // Assuming Stakeholders page exists
// Import other pages like Settings if they exist
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
              <Route path="/stakeholders" element={<Stakeholders />} />
              {/* Add routes for Settings, etc. */}
              {/* <Route path="/settings" element={<Settings />} /> */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

