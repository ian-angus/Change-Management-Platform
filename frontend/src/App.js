import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Assessments from './pages/Assessments';
import Plans from './pages/Plans';
import Stakeholders from './pages/Stakeholders';
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
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/stakeholders" element={<Stakeholders />} />
              {/* Add route for Reports if implemented */}
              {/* <Route path="/reports" element={<Reports />} /> */}
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

