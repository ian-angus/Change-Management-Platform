import React, { useState, useEffect } from 'react';
// Import CSS for styling if needed
// import './Assessments.css';

function Assessments({ apiBaseUrl }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add state for project filtering if needed
  // const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        // Modify URL if filtering by project
        const url = `${apiBaseUrl}/assessments`; // Add ?project_id=... if needed
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAssessments(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch assessments:", err);
        setError("Failed to load assessments. Please try again later.");
        setAssessments([]); // Clear assessments on error
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [apiBaseUrl]); // Add selectedProjectId to dependency array if filtering

  return (
    <div className="assessments-page">
      <h2>Assessments</h2>
      {/* Add project filter dropdown here if needed */}
      {loading && <p>Loading assessments...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <>
          <p>Manage assessments for your projects.</p>
          {/* Basic list display - More complex UI (tiles, modals) to be restored later */}
          {assessments.length > 0 ? (
            <ul>
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
    </div>
  );
}

export default Assessments;

