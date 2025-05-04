import React, { useState, useEffect } from 'react';
import ManageProjectEmployeesModal from './ManageProjectEmployeesModal'; // Import the modal component
import './Projects.css'; // Make sure CSS is imported

function Projects({ apiBaseUrl }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

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

  const handleOpenManageModal = (project) => {
    setSelectedProject(project);
    setShowManageModal(true);
  };

  const handleCloseManageModal = () => {
    setShowManageModal(false);
    setSelectedProject(null);
    // Optionally refetch project data or employee data if changes were made
  };

  return (
    <div className="projects-page">
      <h2>Projects</h2>
      {loading && <p>Loading projects...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <>
          {/* Add Project button/modal placeholder - To be implemented later */}
          {/* <button className="add-project-btn">Add New Project</button> */}

          {projects.length > 0 ? (
            <>
              <p>Manage your change management projects here.</p>
              <ul className="project-list">
                {projects.map(project => (
                  <li key={project.id} className="project-item">
                    <span>{project.name}</span>
                    <button onClick={() => handleOpenManageModal(project)} className="manage-employees-btn">
                      Manage Employees
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p>No projects found. You can add a new project to get started.</p> // Display message when no projects exist
          )}
        </>
      )}

      {/* Render the modal */}
      {showManageModal && selectedProject && (
        <ManageProjectEmployeesModal
          project={selectedProject}
          apiBaseUrl={apiBaseUrl}
          onClose={handleCloseManageModal}
        />
      )}
    </div>
  );
}

export default Projects;

