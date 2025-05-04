import React, { useState, useEffect } from 'react';
import AssessmentTemplateManager from './AssessmentTemplateManager'; // Import the new component
import './Assessments.css'; // Make sure CSS is imported

function Assessments({ apiBaseUrl }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTemplateManager, setShowTemplateManager] = useState(false); // State to toggle template manager

  useEffect(() => {
    // Fetch assessments (existing logic)
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = `${apiBaseUrl}/assessments`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAssessments(data);
      } catch (err) {
        console.error("Failed to fetch assessments:", err);
        setError("Failed to load assessments. Please try again later.");
        setAssessments([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch assessments if template manager is not shown
    if (!showTemplateManager) {
        fetchAssessments();
    }

  }, [apiBaseUrl, showTemplateManager]); // Re-run if template manager visibility changes

  const toggleTemplateManager = () => {
    setShowTemplateManager(!showTemplateManager);
    // Clear assessment list and errors when switching views
    if (!showTemplateManager) {
        setAssessments([]);
        setError(null);
        setLoading(false); // Prevent assessment loading indicator when showing templates
    }
  };

  return (
    <div className="assessments-page">
      <div className="page-header">
        <h2>{showTemplateManager ? 'Assessment Templates' : 'Assessments'}</h2>
        <button onClick={toggleTemplateManager} className="toggle-view-btn">
          {showTemplateManager ? 'View Assessments' : 'Manage Templates'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {showTemplateManager ? (
        <AssessmentTemplateManager apiBaseUrl={apiBaseUrl} />
      ) : (
        <>
          {loading && <p>Loading assessments...</p>}
          {!loading && !error && (
            <>
              <p>Manage assessments deployed for your projects.</p>
              {assessments.length > 0 ? (
                <ul className="assessment-list">
                  {assessments.map(assessment => (
                    <li key={assessment.id}>
                      {assessment.name} (Project: {assessment.project_name || 'N/A'}, Status: {assessment.status})
                      {/* Add buttons like 'View Results', 'Deploy', 'Edit' later */}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No assessments found.</p>
              )}
              {/* Add Assessment button/modal placeholder */}
              {/* <button>Add New Assessment</button> */}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Assessments;

