import React, { useState, useEffect } from 'react';
import { FaChartLine, FaUsers, FaTasks, FaMapMarkedAlt, FaPlus, FaUpload, FaAddressBook, FaDownload } from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [userName, setUserName] = useState('User');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Get user name from localStorage (prefer 'brightfoldUser' if available)
    let user = JSON.parse(localStorage.getItem('brightfoldUser')) || JSON.parse(localStorage.getItem('user'));
    let firstName = 'User';
    if (user?.name) {
      firstName = user.name.split(' ')[0];
      setUserName(firstName);
    } else {
      setUserName('User');
    }

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Sample data for Stakeholder Sentiment (Line Chart)
  const sentimentData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sentiment Score',
        data: [65, 70, 68, 75, 80, 78, 85],
        fill: false,
        borderColor: '#ff6b00',
        backgroundColor: '#ff6b00',
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#ff6b00',
      },
    ],
  };
  const sentimentOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  };

  // Sample data for Participation Rates (Bar Chart)
  const participationData = {
    labels: ['Dept A', 'Dept B', 'Dept C', 'Dept D', 'Dept E'],
    datasets: [
      {
        label: 'Participation (%)',
        data: [85, 72, 90, 60, 78],
        backgroundColor: '#1a365d',
        borderRadius: 8,
      },
    ],
  };
  const participationOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20 },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  };

  return (
    <div className="dashboard">
      {/* Header with greeting and profile */}
      <header className="dashboard-header">
        <div className="greeting-section">
          <h1>{greeting}, {userName}</h1>
          <p className="subtitle">Here's what's happening today</p>
        </div>
        <div className="profile-section">
          <div className="theme-toggle">
            <button className="theme-toggle-btn">
              <span className="light-icon">☀️</span>
              <span className="dark-icon">🌙</span>
            </button>
          </div>
          <div className="user-profile">
            <img src="/default-avatar.png" alt="Profile" className="avatar" />
            <span className="user-name">{userName}</span>
          </div>
        </div>
      </header>

      {/* Main dashboard grid */}
      <div className="dashboard-grid">
        {/* Change Initiatives Overview */}
        <section className="dashboard-card initiatives-overview">
          <h2>Change Initiatives Overview</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Active Projects</h3>
              <div className="metric-value">12</div>
              <div className="metric-trend positive">↑ 2 this week</div>
            </div>
            <div className="metric-card">
              <h3>Upcoming Milestones</h3>
              <div className="metric-value">5</div>
              <div className="metric-trend">Next: 2 days</div>
            </div>
            <div className="metric-card warning">
              <h3>Overdue Tasks</h3>
              <div className="metric-value">3</div>
              <div className="metric-trend negative">↑ 1 today</div>
            </div>
            <div className="metric-card success">
              <h3>Change Success Rate</h3>
              <div className="metric-value">87%</div>
              <div className="metric-trend positive">↑ 5% this month</div>
            </div>
          </div>
        </section>

        {/* Engagement & Sentiment Analytics */}
        <section className="dashboard-card engagement-analytics">
          <h2>Engagement & Sentiment</h2>
          <div className="analytics-grid">
            <div className="chart-container">
              <h3>Stakeholder Sentiment</h3>
              <div className="chart-placeholder" style={{ background: 'none', height: '220px' }}>
                <Line data={sentimentData} options={sentimentOptions} height={180} />
              </div>
            </div>
            <div className="chart-container">
              <h3>Participation Rates</h3>
              <div className="chart-placeholder" style={{ background: 'none', height: '220px' }}>
                <Bar data={participationData} options={participationOptions} height={180} />
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity Feed */}
        <section className="dashboard-card activity-feed">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="activity-item">
                <img src="/default-avatar.png" alt="User" className="activity-avatar" />
                <div className="activity-content">
                  <p className="activity-text">John Doe completed task "Update stakeholder map"</p>
                  <span className="activity-time">2 hours ago</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* My Tasks & Responsibilities */}
        <section className="dashboard-card my-tasks">
          <h2>My Tasks</h2>
          <div className="tasks-list">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="task-item">
                <input type="checkbox" id={`task-${index}`} />
                <label htmlFor={`task-${index}`}>
                  <span className="task-title">Review change impact assessment</span>
                  <span className="task-due">Due tomorrow</span>
                </label>
                <span className="task-priority high">High</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stakeholder Map Preview */}
        <section className="dashboard-card stakeholder-map">
          <h2>Stakeholder Map</h2>
          <div className="map-preview">
            <FaMapMarkedAlt className="map-icon" />
            <p>Interactive stakeholder map will be displayed here</p>
          </div>
        </section>

        {/* Quick Access Panel */}
        <section className="dashboard-card quick-access">
          <h2>Quick Access</h2>
          <div className="quick-access-grid">
            <button className="quick-access-btn">
              <FaPlus className="btn-icon" />
              <span>New Initiative</span>
            </button>
            <button className="quick-access-btn">
              <FaUpload className="btn-icon" />
              <span>Upload Plan</span>
            </button>
            <button className="quick-access-btn">
              <FaAddressBook className="btn-icon" />
              <span>Stakeholder Directory</span>
            </button>
            <button className="quick-access-btn">
              <FaDownload className="btn-icon" />
              <span>Download Reports</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;

