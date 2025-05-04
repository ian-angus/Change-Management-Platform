import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaEye } from 'react-icons/fa'; // Added FaEdit, FaEye
import { Link } from 'react-router-dom'; // Import Link for navigation
import './Projects.css';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]); // State for employees list
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // State for project being edited
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_owner_id: '', // Changed from owner
    start_date: '',
    end_date: '',
    status: 'Draft', // Default to Draft as per requirements
    stakeholder_ids: [] // For editing stakeholders later
  });

  // Fetch projects and employees
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch projects
      const projectsResponse = await fetch('/api/projects/');
      if (!projectsResponse.ok) {
        throw new Error(`HTTP error! status: ${projectsResponse.status} fetching projects`);
      }
      const projectsData = await projectsResponse.json();
      setProjects(projectsData);

      // Fetch employees for dropdown
      const employeesResponse = await fetch('/api/employees'); // Fetch employees
      if (!employeesResponse.ok) {
        throw new Error(`HTTP error! status: ${employeesResponse.status} fetching employees`);
      }
      const employeesData = await employeesResponse.json();
      setEmployees(employeesData);

    } catch (e) {
      console.error("Failed to load data:", e);
      setError('Failed to load projects or employees. Is the backend running and seeded?');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Reset form and close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      project_owner_id: '',
      start_date: '',
      end_date: '',
      status: 'Draft',
      stakeholder_ids: []
    });
  };

  // Open modal for creating a new project
  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      project_owner_id: '',
      start_date: '',
      end_date: '',
      status: 'Draft',
      stakeholder_ids: []
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing project
  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name || '',
      description: project.description || '',
      project_owner_id: project.project_owner_id || '',
      // Format dates for input type='date'
      start_date: project.start_date ? project.start_date.split('T')[0] : '',
      end_date: project.end_date ? project.end_date.split('T')[0] : '',
      status: project.status || 'Draft',
      stakeholder_ids: project.stakeholders ? project.stakeholders.map(s => s.id) : [] // Store stakeholder IDs
    });
    setIsModalOpen(true);
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects/';
    const method = editingProject ? 'PUT' : 'POST';

    // Ensure owner ID is an integer or null
    const payload = {
        ...formData,
        project_owner_id: formData.project_owner_id ? parseInt(formData.project_owner_id, 10) : null,
        // Convert empty date strings to null for backend
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
    };
    // Remove stakeholder_ids for create/update via main form, handle separately
    delete payload.stakeholder_ids;

    // Basic validation
    if (!payload.name || !payload.project_owner_id || !payload.status) {
        setError('Project Name, Owner, and Status are required.');
        return;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      closeModal();
      fetchData(); // Refresh data
    } catch (e) {
      console.error(`Failed to ${editingProject ? 'update' : 'create'} project:`, e);
      setError(`Failed to ${editingProject ? 'update' : 'create'} project: ${e.message}`);
    }
  };

  // Handle project deletion
  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
           const errorData = await response.json();
           throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        fetchData(); // Refresh the project list
      } catch (e) {
        console.error("Failed to delete project:", e);
        setError(`Failed to delete project: ${e.message}`);
      }
    }
  };

  return (
    <div className="projects-page">
      <div className="page-header">
        <h2>Projects Overview</h2>
        {/* Use specific function for create modal */}
        <button className="btn-primary add-project-btn" onClick={openCreateModal}>
          <FaPlus /> New Project
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <p>Loading projects...</p>
      ) : (
        <div className="table-container"> {/* Added container for responsiveness */}
          <table>
            <thead>
              <tr>
                {/*<th>ID</th> Removed ID for cleaner look */}
                <th>Name</th>
                <th>Owner</th>
                <th>Status</th>
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
                    {/*<td>{project.id}</td>*/}
                    <td>{project.name}</td>
                    <td>{project.owner_name || 'N/A'}</td> {/* Display owner name */}
                    <td><span className={`status-badge status-${project.status?.toLowerCase()}`}>{project.status}</span></td>
                    <td>{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}</td>
                    <td>{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</td>
                    <td>{project.stakeholders?.length || 0}</td>
                    <td>{project.assessment_count || 0}</td>
                    <td className="actions-cell">
                      {/* Link to Project Overview Page (implement later) */}
                      {/* <Link to={`/projects/${project.id}`} className="action-btn" title="View Details"><FaEye /></Link> */}
                      <button onClick={() => openEditModal(project)} className="action-btn" title="Edit Project">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteProject(project.id)} className="action-btn delete-btn" title="Delete Project">
                        <FaTrash />
                      </button>
                      {/* Add Duplicate/Archive later if needed */}
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

      {/* Create/Edit Project Modal */}
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
                <label htmlFor="project_owner_id">Project Owner *</label>
                <select id="project_owner_id" name="project_owner_id" value={formData.project_owner_id} onChange={handleInputChange} required>
                  <option value="">-- Select Owner --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                  ))}
                </select>
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
                  {/* Removed 'Planning', 'Executing', 'On Hold' based on new requirements */}
                </select>
              </div>
              {/* Stakeholder assignment will be handled on the project detail page */}
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

