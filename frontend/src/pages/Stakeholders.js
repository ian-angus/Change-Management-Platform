import React, { useState, useEffect } from 'react';
import CreateStakeholderGroupModal from './CreateStakeholderGroupModal'; // Import the modal
import './Stakeholders.css'; // Make sure CSS is imported

function Stakeholders({ apiBaseUrl }) {
  const [stakeholderGroups, setStakeholderGroups] = useState([]);
  const [loading, setLoading] = useState(false); // Initially false until project selected
  const [error, setError] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch projects for the dropdown
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
        setError("Failed to load projects for filtering.");
      }
    };
    fetchProjects();
  }, [apiBaseUrl]);

  // Fetch stakeholder groups based on selected project
  const fetchStakeholderGroups = async (projectId) => {
      if (!projectId) return;
      try {
        setLoading(true);
        setError(null);
        const url = `${apiBaseUrl}/stakeholder_groups?project_id=${projectId}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStakeholderGroups(data);
      } catch (err) {
        console.error("Failed to fetch stakeholder groups:", err);
        setError("Failed to load stakeholder groups. Please try again later.");
        setStakeholderGroups([]); // Clear groups on error
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (selectedProjectId) {
        fetchStakeholderGroups(selectedProjectId);
    }
  }, [apiBaseUrl, selectedProjectId]);

  const handleProjectChange = (event) => {
    const newProjectId = event.target.value;
    setSelectedProjectId(newProjectId);
    setStakeholderGroups([]); // Clear groups when project changes
    if (!newProjectId) {
        setLoading(false); // Stop loading if no project selected
    }
  };

  const handleOpenCreateModal = () => {
    if (!selectedProjectId) {
        setError("Please select a project before adding a group.");
        return;
    }
    setError(null);
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = (groupCreated) => {
    setShowCreateModal(false);
    if (groupCreated) {
        // Refetch groups for the current project
        fetchStakeholderGroups(selectedProjectId);
    }
  };

  return (
    <div className="stakeholders-page">
      <h2>Stakeholders</h2>
      <p>Manage stakeholder groups for your projects.</p>

      {/* Project Filter Dropdown */}
      <div className="filter-container">
        <label htmlFor="project-filter">Filter by Project: </label>
        <select id="project-filter" value={selectedProjectId || ''} onChange={handleProjectChange}>
          <option value="" disabled={projects.length > 0}>Select a project</option>
          {projects.length === 0 && <option value="" disabled>Loading projects...</option>}
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
        <button onClick={handleOpenCreateModal} disabled={!selectedProjectId} className="add-group-btn">
            Add New Group
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
      {loading && <p>Loading stakeholder groups...</p>}

      {!loading && !error && selectedProjectId && (
        <>
          {stakeholderGroups.length > 0 ? (
            <ul className="stakeholder-group-list">
              {stakeholderGroups.map(group => (
                <li key={group.id}>
                    {group.name}
                    {/* Add Edit/Delete buttons later */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No stakeholder groups found for this project.</p>
          )}
        </>
      )}
      {!selectedProjectId && !loading && <p>Please select a project to view or add stakeholder groups.</p>}

      {/* Create Group Modal */}
      {showCreateModal && selectedProjectId && (
        <CreateStakeholderGroupModal
            projectId={selectedProjectId}
            apiBaseUrl={apiBaseUrl}
            onClose={handleCloseCreateModal}
        />
      )}
    </div>
  );
}

export default Stakeholders;

