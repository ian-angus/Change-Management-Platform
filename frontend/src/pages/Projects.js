import React, { useState, useEffect } from 'react';
// Import CSS for styling if needed
// import './Projects.css';

function Projects({ apiBaseUrl }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/projects`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProjects(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to load projects. Please try again later.");
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
          <p>Manage your change management projects here.</p>
          {/* Basic list display - More complex UI to be restored later */}
          {projects.length > 0 ? (
            <ul>
              {projects.map(project => (
                <li key={project.id}>{project.name}</li>
              ))}
            </ul>
          ) : (
            <p>No projects found.</p>
          )}
          {/* Add Project button/modal placeholder */}
          {/* <button>Add New Project</button> */}
        </>
      )}
    </div>
  );
}

export default Projects;

