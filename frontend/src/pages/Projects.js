import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import './Projects.css'; // Assuming you have a CSS file for Projects styling

function Projects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', status: 'Planning', start_date: '', end_date: '' });

  // Fetch projects from backend
  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/projects/'); // Using proxy
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProjects(data);
    } catch (e) {
      console.error("Failed to load projects:", e);
      setError('Failed to load projects. Is the backend running?');
      // Load dummy data on error
      setProjects([
        { id: 1, name: 'Project Alpha (Dummy)', description: 'Implement new CRM system', status: 'Executing', start_date: '2025-04-01', end_date: '2025-10-31' },
        { id: 2, name: 'Project Beta (Dummy)', description: 'Organizational Restructure', status: 'Planning', start_date: '2025-06-15', end_date: null },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({ ...newProject, [name]: value });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/projects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // const createdProject = await response.json(); // Get the created project data if needed
      setIsModalOpen(false);
      setNewProject({ name: '', description: '', status: 'Planning', start_date: '', end_date: '' }); // Reset form
      fetchProjects(); // Refresh the project list
    } catch (e) {
      console.error("Failed to create project:", e);
      setError('Failed to create project.'); // Show error to user
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        fetchProjects(); // Refresh the project list
      } catch (e) {
        console.error("Failed to delete project:", e);
        setError('Failed to delete project.'); // Show error to user
      }
    }
  };

  return (
    <div className="projects-page">
      <div className="page-header">
        <h2>Projects Overview</h2>
        <button className="btn-primary add-project-btn" onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Create Project
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <p>Loading projects...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? (
              projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.id}</td>
                  <td>{project.name}</td>
                  <td>{project.description}</td>
                  <td>{project.status}</td>
                  <td>{project.start_date || 'N/A'}</td>
                  <td>{project.end_date || 'N/A'}</td>
                  <td className="actions-cell">
                    <button onClick={() => handleDeleteProject(project.id)} title="Delete Project">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No projects found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            <h3>Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label htmlFor="name">Project Name</label>
                <input type="text" id="name" name="name" value={newProject.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={newProject.description} onChange={handleInputChange}></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={newProject.status} onChange={handleInputChange}>
                  <option value="Planning">Planning</option>
                  <option value="Executing">Executing</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="start_date">Start Date</label>
                <input type="date" id="start_date" name="start_date" value={newProject.start_date} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="end_date">End Date</label>
                <input type="date" id="end_date" name="end_date" value={newProject.end_date} onChange={handleInputChange} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;

