import React, { useState, useEffect } from 'react';
// Import CSS for styling if needed
// import './Stakeholders.css';

function Stakeholders({ apiBaseUrl }) {
  const [stakeholderGroups, setStakeholderGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null); // Example: Assume filtering by project
  const [projects, setProjects] = useState([]); // To populate project dropdown

  // Fetch projects for the dropdown (similar to Projects.js)
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/projects`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects for filter:", err);
        // Handle error fetching projects if necessary
      }
    };
    fetchProjects();
  }, [apiBaseUrl]);

  // Fetch stakeholder groups based on selected project
  useEffect(() => {
    if (!selectedProjectId) {
      setStakeholderGroups([]);
      setLoading(false);
      return; // Don't fetch if no project is selected
    }

    const fetchStakeholderGroups = async () => {
      try {
        setLoading(true);
        const url = `${apiBaseUrl}/stakeholder_groups?project_id=${selectedProjectId}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStakeholderGroups(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch stakeholder groups:", err);
        setError("Failed to load stakeholder groups. Please try again later.");
        setStakeholderGroups([]); // Clear groups on error
      } finally {
        setLoading(false);
      }
    };

    fetchStakeholderGroups();
  }, [apiBaseUrl, selectedProjectId]);

  const handleProjectChange = (event) => {
    setSelectedProjectId(event.target.value);
  };

  return (
    <div className="stakeholders-page">
      <h2>Stakeholders</h2>
      <p>Manage stakeholder groups for your projects.</p>

      {/* Project Filter Dropdown */}
      <div>
        <label htmlFor="project-filter">Filter by Project: </label>
        <select id="project-filter" value={selectedProjectId || ''} onChange={handleProjectChange}>
          <option value="" disabled>Select a project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading stakeholder groups...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && selectedProjectId && (
        <>
          {stakeholderGroups.length > 0 ? (
            <ul>
              {stakeholderGroups.map(group => (
                <li key={group.id}>{group.name}</li>
              ))}
            </ul>
          ) : (
            <p>No stakeholder groups found for this project.</p>
          )}
          {/* Add Group button/modal placeholder */}
          {/* <button>Add New Group</button> */}
        </>
      )}
      {!selectedProjectId && <p>Please select a project to view stakeholder groups.</p>}
    </div>
  );
}

export default Stakeholders;

