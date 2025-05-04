import React from 'react';
import './Dashboard.css'; // Assuming you have a CSS file for Dashboard styling

function Dashboard() {
  return (
    <div className="dashboard-page">
      <h2>Dashboard Overview</h2>
      <p>Welcome to the BrightFold Change Management Platform dashboard.</p>
      {/* Add dashboard widgets, charts, or summaries here */}
      <div className="dashboard-widgets">
        <div className="widget">
          <h3>Active Projects</h3>
          <p>3</p> {/* Example data */}
        </div>
        <div className="widget">
          <h3>Upcoming Assessments</h3>
          <p>5</p> {/* Example data */}
        </div>
        <div className="widget">
          <h3>Pending Plan Actions</h3>
          <p>8</p> {/* Example data */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

