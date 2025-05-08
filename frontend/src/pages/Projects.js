import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import './Projects.css';
import apiClient from '../apiClient'; // Import the new apiClient

// Define PMI Phases (match backend)
const PMI_PHASES = ["Initiating", "Planning", "Executing", "Monitoring & Controlling", "Closing"];

function Projects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'Draft',
    project_phase: 'Initiating',
  });

  // Fetch projects
  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use apiClient and remove /api prefix from URL
      const projectsResponse = await apiClient.get('/projects/'); 
      // Axios directly gives data or throws an error for non-2xx responses
      setProjects(projectsResponse.data);
    } catch (e) {
      console.error("Failed to load projects:", e);
      const errorMsg = e.response?.data?.error || e.message || "An unknown error occurred";
      setError(`Failed to load projects: ${errorMsg}. Is the backend running and seeded?`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'Draft',
      project_phase: 'Initiating',
    });
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'Draft',
      project_phase: 'Initiating',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name || '',
      description: project.description || '',
      start_date: project.start_date ? project.start_date.split('T')[0] : '',
      end_date: project.end_date ? project.end_date.split('T')[0] : '',
      status: project.status || 'Draft',
      project_phase: project.project_phase || 'Initiating',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Adjust URL for apiClient (remove /api prefix)
    const url = editingProject ? `/projects/${editingProject.id}` : '/projects/';
    const method = editingProject ? 'put' : 'post'; // Axios methods are lowercase

    const payload = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
    };

    if (!payload.name || !payload.status || !payload.project_phase) {
        setError('Project Name, Status, and Phase are required.');
        return;
    }

    try {
      // Use apiClient with dynamic method
      await apiClient[method](url, payload);
      closeModal();
      fetchProjects();
    } catch (e) {
      console.error(`Failed to ${editingProject ? 'update' : 'create'} project:`, e);
      const errorMsg = e.response?.data?.error || e.message || "An unknown error occurred";
      setError(`Failed to ${editingProject ? 'update' : 'create'} project: ${errorMsg}`);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        // Use apiClient and adjust URL
        await apiClient.delete(`/projects/${projectId}`);
        fetchProjects();
      } catch (e) {
        console.error("Failed to delete project:", e);
        const errorMsg = e.response?.data?.error || e.message || "An unknown error occurred";
        setError(`Failed to delete project: ${errorMsg}`);
      }
    }
  };

  return (
    <div className="projects-page">
      <div className="page-header">
        <h2>Projects Overview</h2>
        <button className="btn-primary add-project-btn" onClick={openCreateModal}>
          <FaPlus /> New Project
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <p>Loading projects...</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Phase</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Stakeholders</th>
                <th>Assessments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.name}</td>
                    <td><span className={`status-badge status-${project.status?.toLowerCase()}`}>{project.status}</span></td>
                    <td>{project.project_phase || 'N/A'}</td>
                    <td>{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}</td>
                    <td>{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</td>
                    <td>{project.stakeholders?.length || 0}</td>
                    <td>{project.assessment_count || 0}</td>
                    <td className="actions-cell">
                      <button onClick={() => openEditModal(project)} className="action-btn" title="Edit Project">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteProject(project.id)} className="action-btn delete-btn" title="Delete Project">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No projects found. Use the '+ New Project' button to create one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <h3>{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Project Name *</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleInputChange}></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="start_date">Start Date</label>
                <input type="date" id="start_date" name="start_date" value={formData.start_date} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="end_date">End Date</label>
                <input type="date" id="end_date" name="end_date" value={formData.end_date} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select id="status" name="status" value={formData.status} onChange={handleInputChange} required>
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="project_phase">Project Phase *</label>
                <select id="project_phase" name="project_phase" value={formData.project_phase} onChange={handleInputChange} required>
                  {PMI_PHASES.map(phase => (
                    <option key={phase} value={phase}>{phase}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">{editingProject ? 'Save Changes' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;

