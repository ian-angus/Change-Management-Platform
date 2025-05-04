import React, { useState, useEffect, useCallback } from 'react';
import ManageProjectEmployeesModal from './ManageProjectEmployeesModal'; // Import the employee management modal
import CreateProjectModal from './CreateProjectModal'; // Import the project creation modal
import './Projects.css'; // Make sure CSS is imported

function Projects({ apiBaseUrl }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = useCallback(async () => {
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
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]); // Use the memoized fetchProjects

  const handleOpenManageModal = (project) => {
    setSelectedProject(project);
    setShowManageModal(true);
  };

  const handleCloseManageModal = () => {
    setShowManageModal(false);
    setSelectedProject(null);
    // Optionally refetch project data or employee data if changes were made
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = (projectCreated) => {
    setShowCreateModal(false);
    if (projectCreated) {
      fetchProjects(); // Refetch projects if a new one was created
    }
  };

  return (
    <div className="projects-page">
      <div className="page-header">
        <h2>Projects</h2>
        <button onClick={handleOpenCreateModal} className="add-project-btn">
          Create New Project
        </button>
      </div>

      {loading && <p>Loading projects...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && (
        <>
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
            <p>No projects found. Create a new project to get started.</p> // Updated message
          )}
        </>
      )}

      {/* Render the modals */}
      {showManageModal && selectedProject && (
        <ManageProjectEmployeesModal
          project={selectedProject}
          apiBaseUrl={apiBaseUrl}
          onClose={handleCloseManageModal}
        />
      )}
      {showCreateModal && (
        <CreateProjectModal
          apiBaseUrl={apiBaseUrl}
          onClose={handleCloseCreateModal}
        />
      )}
    </div>
  );
}

export default Projects;

