import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaUsers, FaTimes } from 'react-icons/fa';
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
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [manageType, setManageType] = useState('employees');
  const [allEmployees, setAllEmployees] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [projectEmployees, setProjectEmployees] = useState([]);
  const [projectGroups, setProjectGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

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

  const openManageModal = (project) => {
    setSelectedProject(project);
    setShowManageModal(true);
    setManageType('employees');
    setSearchTerm('');
    fetchProjectEmployees(project.id);
    fetchProjectGroups(project.id);
    fetchAllEmployees();
    fetchAllGroups();
  };

  const closeManageModal = () => {
    setShowManageModal(false);
    setSelectedProject(null);
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

  const fetchProjectEmployees = async (projectId) => {
    try {
      const res = await apiClient.get(`/projects/${projectId}/stakeholders`);
      setProjectEmployees(res.data || []);
    } catch (e) { setProjectEmployees([]); }
  };
  const fetchProjectGroups = async (projectId) => {
    try {
      const res = await apiClient.get(`/projects/${projectId}/groups`);
      setProjectGroups(res.data || []);
    } catch (e) { setProjectGroups([]); }
  };
  const fetchAllEmployees = async () => {
    try {
      const res = await apiClient.get('/employees');
      setAllEmployees(res.data.employees || []);
    } catch (e) { setAllEmployees([]); }
  };
  const fetchAllGroups = async () => {
    try {
      const res = await apiClient.get('/groups');
      setAllGroups(res.data || []);
    } catch (e) { setAllGroups([]); }
  };

  const handleAddEmployee = async (employeeId) => {
    setModalLoading(true);
    setModalError('');
    try {
      await apiClient.post(`/projects/${selectedProject.id}/stakeholders`, { employee_id: employeeId });
      fetchProjectEmployees(selectedProject.id);
    } catch (e) {
      setModalError('Failed to add employee.');
    } finally {
      setModalLoading(false);
    }
  };
  const handleRemoveEmployee = async (employeeId) => {
    if (!window.confirm('Remove this employee from the project?')) return;
    setModalLoading(true);
    setModalError('');
    try {
      await apiClient.delete(`/projects/${selectedProject.id}/stakeholders/${employeeId}`);
      fetchProjectEmployees(selectedProject.id);
    } catch (e) {
      setModalError('Failed to remove employee.');
    } finally {
      setModalLoading(false);
    }
  };
  const handleAddGroup = async (groupId) => {
    setModalLoading(true);
    setModalError('');
    try {
      await apiClient.post(`/projects/${selectedProject.id}/groups`, { group_id: groupId });
      fetchProjectGroups(selectedProject.id);
    } catch (e) {
      setModalError('Failed to add group.');
    } finally {
      setModalLoading(false);
    }
  };
  const handleRemoveGroup = async (groupId) => {
    if (!window.confirm('Remove this group from the project?')) return;
    setModalLoading(true);
    setModalError('');
    try {
      await apiClient.delete(`/projects/${selectedProject.id}/groups/${groupId}`);
      fetchProjectGroups(selectedProject.id);
    } catch (e) {
      setModalError('Failed to remove group.');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredEmployees = allEmployees.filter(emp =>
    !projectEmployees.some(pe => pe.id === emp.id) &&
    (emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (emp.job_position && emp.job_position.toLowerCase().includes(searchTerm.toLowerCase())))
  );
  const filteredGroups = allGroups.filter(grp =>
    !projectGroups.some(pg => pg.id === grp.id) &&
    grp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                      <button onClick={() => openManageModal(project)} className="action-btn" title="Manage Employees/Groups">
                        <FaUsers />
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

      {showManageModal && selectedProject && (
        <div className="modal manage-modal">
          <div className="modal-content">
            <button className="modal-close" onClick={closeManageModal}><FaTimes /></button>
            <h2 style={{marginBottom: 8}}>Manage Employees & Groups</h2>
            <h3 style={{marginBottom: 16, color: '#1a365d'}}>{selectedProject.name}</h3>
            <div className="toggle-btn-group" style={{marginBottom: 20, display: 'flex', gap: 8}}>
              <button
                onClick={() => setManageType('employees')}
                className={`toggle-btn${manageType === 'employees' ? ' active' : ''}`}
                style={{
                  background: manageType === 'employees' ? '#1a365d' : '#eaf1fa',
                  color: manageType === 'employees' ? '#fff' : '#1a365d',
                  border: `2px solid #1a365d`,
                  borderRadius: 6,
                  fontWeight: 600,
                  padding: '8px 20px',
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                  boxShadow: manageType === 'employees' ? '0 2px 8px rgba(26,54,93,0.08)' : 'none',
                }}
                aria-pressed={manageType === 'employees'}
              >
                Employees
              </button>
              <button
                onClick={() => setManageType('groups')}
                className={`toggle-btn${manageType === 'groups' ? ' active' : ''}`}
                style={{
                  background: manageType === 'groups' ? '#1a365d' : '#eaf1fa',
                  color: manageType === 'groups' ? '#fff' : '#1a365d',
                  border: `2px solid #1a365d`,
                  borderRadius: 6,
                  fontWeight: 600,
                  padding: '8px 20px',
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                  boxShadow: manageType === 'groups' ? '0 2px 8px rgba(26,54,93,0.08)' : 'none',
                }}
                aria-pressed={manageType === 'groups'}
              >
                Groups
              </button>
            </div>
            <input
              type="text"
              className="search-input"
              placeholder={`Search ${manageType}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ marginBottom: 16, width: '100%' }}
            />
            {modalError && <div className="modal-error">{modalError}</div>}
            {modalLoading && <div className="modal-loading">Loading...</div>}
            {manageType === 'employees' ? (
              <>
                <div className="modal-section assigned-section" style={{background:'#eaf1fa', borderRadius:8, padding:12, marginBottom:16}}>
                  <h4 style={{color:'#1a365d', marginBottom:8}}>Assigned Employees</h4>
                  <ul className="assigned-list">
                    {projectEmployees.length === 0 ? (
                      <li className="empty-state">No employees assigned.</li>
                    ) : (
                      projectEmployees.map(emp => (
                        <li key={emp.id} className="assigned-item" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 0'}}>
                          <span className="assigned-name" style={{fontWeight:600, display:'inline-flex', alignItems:'center'}}><FaUsers style={{color:'#1a365d',marginRight:6}}/>{emp.name} <span style={{fontWeight:400, color:'#555'}}>({emp.job_position})</span></span>
                          <button className="remove-btn" style={{color:'#ff6b00',background:'none',border:'none',cursor:'pointer'}} onClick={() => handleRemoveEmployee(emp.id)} title="Remove"><FaTrash /></button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                <hr className="section-divider" style={{border:'none',borderTop:'1px solid #e0e0e0',margin:'16px 0'}}/>
                <div className="modal-section available-section" style={{background:'#f7f7f7', borderRadius:8, padding:12}}>
                  <h4 style={{color:'#888', marginBottom:8}}>Available Employees</h4>
                  <ul className="available-list">
                    {filteredEmployees.length === 0 ? (
                      <li className="empty-state">No employees to add.</li>
                    ) : (
                      filteredEmployees.map(emp => (
                        <li key={emp.id} className="available-item" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 0'}}>
                          <span className="available-name" style={{fontWeight:600, display:'inline-flex', alignItems:'center'}}><FaUsers style={{color:'#bbb',marginRight:6}}/>{emp.name} <span style={{color:'#888'}}>({emp.job_position})</span></span>
                          <button className="add-btn" style={{color:'#1a365d',background:'none',border:'none',cursor:'pointer'}} onClick={() => handleAddEmployee(emp.id)} title="Add"><FaPlus /></button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="modal-section assigned-section" style={{background:'#eaf1fa', borderRadius:8, padding:12, marginBottom:16}}>
                  <h4 style={{color:'#1a365d', marginBottom:8}}>Assigned Groups</h4>
                  <ul className="assigned-list">
                    {projectGroups.length === 0 ? (
                      <li className="empty-state">No groups assigned.</li>
                    ) : (
                      projectGroups.map(grp => (
                        <li key={grp.id} className="assigned-item" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 0'}}>
                          <span className="assigned-name" style={{fontWeight:600, display:'inline-flex', alignItems:'center'}}><FaUsers style={{color:'#1a365d',marginRight:6}}/>{grp.name}</span>
                          <button className="remove-btn" style={{color:'#ff6b00',background:'none',border:'none',cursor:'pointer'}} onClick={() => handleRemoveGroup(grp.id)} title="Remove"><FaTrash /></button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                <hr className="section-divider" style={{border:'none',borderTop:'1px solid #e0e0e0',margin:'16px 0'}}/>
                <div className="modal-section available-section" style={{background:'#f7f7f7', borderRadius:8, padding:12}}>
                  <h4 style={{color:'#888', marginBottom:8}}>Available Groups</h4>
                  <ul className="available-list">
                    {filteredGroups.length === 0 ? (
                      <li className="empty-state">No groups to add.</li>
                    ) : (
                      filteredGroups.map(grp => (
                        <li key={grp.id} className="available-item" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 0'}}>
                          <span className="available-name" style={{fontWeight:600, display:'inline-flex', alignItems:'center'}}><FaUsers style={{color:'#bbb',marginRight:6}}/>{grp.name}</span>
                          <button className="add-btn" style={{color:'#1a365d',background:'none',border:'none',cursor:'pointer'}} onClick={() => handleAddGroup(grp.id)} title="Add"><FaPlus /></button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </>
            )}
            <div style={{marginTop: 24, textAlign: 'right'}}>
              <button className="btn-secondary" onClick={closeManageModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;

