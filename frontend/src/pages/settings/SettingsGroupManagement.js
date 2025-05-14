import React, { useState, useEffect, useCallback } from 'react';
import CreateStakeholderGroupModal from '../CreateStakeholderGroupModal'; // Reuse the modal
// import './SettingsGroupManagement.css'; // Add CSS if needed

function SettingsGroupManagement({ apiBaseUrl }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch all stakeholder groups (assuming a global endpoint or modify as needed)
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming an endpoint exists to get ALL groups, or groups not tied to a project
      // If groups are always project-specific, this page might need rethinking
      // For now, let's assume /stakeholder_groups without project_id gets all
      const response = await fetch(`${apiBaseUrl}/stakeholder_groups`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      console.error("Failed to fetch stakeholder groups:", err);
      setError("Failed to load groups.");
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleOpenCreateModal = () => {
    // For creating a group here, we might not have a project ID.
    // The backend API POST /stakeholder_groups might need adjustment
    // to handle creation without a project_id, or this UI needs adjustment.
    // For now, let's assume we can create without a project ID or pass null/undefined.
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = (groupCreated) => {
    setShowCreateModal(false);
    if (groupCreated) {
      fetchGroups(); // Refresh the list
    }
  };

  return (
    <div className="settings-page settings-group-management">
      <h2>Settings: Group Management</h2>
      <p>Create, view, and manage stakeholder groups for your organization.</p>
      {/* Note: Functionality might need refinement based on whether groups are global or project-specific */} 

      <button onClick={handleOpenCreateModal} className="add-group-btn">
        Create New Group
      </button>

      {error && <p className="error-message">{error}</p>}
      {loading && <p>Loading groups...</p>}

      {!loading && !error && (
        <>
          {groups.length > 0 ? (
            <ul className="stakeholder-group-list"> {/* Reuse class from Stakeholders.css or CreateStakeholderGroupModal.css */} 
              {groups.map(group => (
                <li key={group.id}>
                  {group.name}
                  {/* Add Assign Members / Edit / Delete buttons later */}
                  {/* Display project name if available: (Project: {group.project_name || 'Global'}) */} 
                </li>
              ))}
            </ul>
          ) : (
            <p>No stakeholder groups found.</p>
          )}
        </>
      )}

      {/* Create Group Modal - Passing null for projectId, adjust API/modal if needed */}
      {showCreateModal && (
        <CreateStakeholderGroupModal
          projectId={null} // Or adjust based on API requirements
          apiBaseUrl={apiBaseUrl}
          onClose={handleCloseCreateModal}
        />
      )}
    </div>
  );
}

export default SettingsGroupManagement;

