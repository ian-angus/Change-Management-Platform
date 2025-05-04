import React, { useState, useEffect } from 'react';
// Import CSS for styling if needed
import './Projects.css'; // Make sure CSS is imported

function Projects({ apiBaseUrl }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state on new fetch
        const response = await fetch(`${apiBaseUrl}/projects`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to load projects. Please check the connection or try again later.");
        setProjects([]); // Clear projects on error
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [apiBaseUrl]); // Re-run effect if apiBaseUrl changes

  return (
    <div className="projects-page">
      <h2>Projects</h2>
      {loading && <p>Loading projects...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <>
          {/* Add Project button/modal placeholder - To be implemented later */}
          {/* <button>Add New Project</button> */}

          {projects.length > 0 ? (
            <> 
              <p>Manage your change management projects here.</p>
              <ul>
                {projects.map(project => (
                  <li key={project.id}>{project.name}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>No projects found. You can add a new project to get started.</p> // Display message when no projects exist
          )}
        </>
      )}
    </div>
  );
}

export default Projects;

