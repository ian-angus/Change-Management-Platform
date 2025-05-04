// /home/ubuntu/melyn_cm_platform/frontend/src/pages/settings/StakeholderGroupManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StakeholderGroupManagement.css'; // Corrected import path

const API_BASE_URL = '/api'; // Use relative path

function StakeholderGroupManagement() {
  const [groups, setGroups] = useState([]);
  const [employees, setEmployees] = useState([]); // For member assignment
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // State for Create/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null); // For editing
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  // State for Member Management Modal
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [groupToManageMembers, setGroupToManageMembers] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]); // IDs of selected employees
  const [memberSearchTerm, setMemberSearchTerm] = useState(''); // NEW: State for search term

  // Fetch groups and employees on component mount
  useEffect(() => {
    fetchGroups();
    fetchEmployees(); // Fetch employees for member selection
  }, []);

  const fetchGroups = () => {
    setLoadingGroups(true);
    setError(null);
    axios.get(`${API_BASE_URL}/stakeholder-groups/`)
      .then(response => {
        setGroups(response.data);
      })
      .catch(err => {
        console.error('Error fetching groups:', err);
        setError('Failed to load stakeholder groups. Please try again.');
      })
      .finally(() => {
        setLoadingGroups(false);
      });
  };

  const fetchEmployees = () => {
    setLoadingEmployees(true);
    axios.get(`${API_BASE_URL}/employees/`)
      .then(response => {
        setEmployees(response.data);
      })
      .catch(err => {
        console.error('Error fetching employees:', err);
        // Handle employee fetch error if needed, maybe disable member management
      })
      .finally(() => {
        setLoadingEmployees(false);
      });
  };

  // --- Modal Handling ---
  const openCreateModal = () => {
    setCurrentGroup(null);
    setGroupName('');
    setGroupDescription('');
    setIsModalOpen(true);
    setError(null);
    setSuccessMessage(null);
  };

  const openEditModal = (group) => {
    setCurrentGroup(group);
    setGroupName(group.name);
    setGroupDescription(group.description || '');
    setIsModalOpen(true);
    setError(null);
    setSuccessMessage(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentGroup(null);
  };

  const handleSaveGroup = () => {
    if (!groupName.trim()) {
      setError('Group name cannot be empty.');
      return;
    }
    setError(null);
    setSuccessMessage(null);

    const payload = {
      name: groupName.trim(),
      description: groupDescription.trim(),
    };

    const request = currentGroup
      ? axios.put(`${API_BASE_URL}/stakeholder-groups/${currentGroup.id}`, payload)
      : axios.post(`${API_BASE_URL}/stakeholder-groups/`, payload);

    request
      .then(response => {
        setSuccessMessage(currentGroup ? 'Group updated successfully!' : 'Group created successfully!');
        closeModal();
        fetchGroups(); // Refresh list
        setTimeout(() => setSuccessMessage(null), 3000);
      })
      .catch(err => {
        console.error('Error saving group:', err);
        setError(err.response?.data?.error || 'Failed to save group.');
      });
  };

  // --- Delete Handling ---
  const handleDeleteGroup = (groupId, groupName) => {
    if (window.confirm(`Are you sure you want to delete the group "${groupName}"? This cannot be undone.`)) {
      setError(null);
      setSuccessMessage(null);
      axios.delete(`${API_BASE_URL}/stakeholder-groups/${groupId}`)
        .then(response => {
          setSuccessMessage(response.data.message || 'Group deleted successfully!');
          fetchGroups(); // Refresh list
          setTimeout(() => setSuccessMessage(null), 3000);
        })
        .catch(err => {
          console.error('Error deleting group:', err);
          setError(err.response?.data?.error || 'Failed to delete group.');
          setTimeout(() => setError(null), 5000);
        });
    }
  };

  // --- Member Management Modal Handling ---
  const openMemberModal = (group) => {
    setGroupToManageMembers(group);
    setMemberSearchTerm(''); // Reset search on open
    // Fetch full group details including members
    axios.get(`${API_BASE_URL}/stakeholder-groups/${group.id}`)
      .then(response => {
        setSelectedMembers(response.data.members.map(m => m.id));
        setIsMemberModalOpen(true);
        setError(null);
        setSuccessMessage(null);
      })
      .catch(err => {
        console.error('Error fetching group members:', err);
        setError('Failed to load group members.');
      });
  };

  const closeMemberModal = () => {
    setIsMemberModalOpen(false);
    setGroupToManageMembers(null);
    setSelectedMembers([]);
    setMemberSearchTerm(''); // Reset search on close
  };

  const handleMemberSelectionChange = (employeeId) => {
    setSelectedMembers(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSaveMembers = () => {
    if (!groupToManageMembers) return;
    setError(null);
    setSuccessMessage(null);

    axios.put(`${API_BASE_URL}/stakeholder-groups/${groupToManageMembers.id}/members`, { employee_ids: selectedMembers })
      .then(response => {
        setSuccessMessage('Group members updated successfully!');
        closeMemberModal();
        fetchGroups(); // Refresh member count in the main table
        setTimeout(() => setSuccessMessage(null), 3000);
      })
      .catch(err => {
        console.error('Error updating members:', err);
        setError(err.response?.data?.error || 'Failed to update members.');
      });
  };

  // NEW: Filter employees based on search term
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  return (
    <div className="stakeholder-group-management settings-section card"> {/* Added settings-section and card */} 
      <h3>Stakeholder Group Management</h3>

      <button className="action-button primary mb-3" onClick={openCreateModal}>
        Create New Group
      </button>

      {/* Status Messages */} 
      {successMessage && <div className="success-message"><p>{successMessage}</p></div>}
      {error && !isModalOpen && !isMemberModalOpen && <div className="error-message"><p>{error}</p></div>} {/* Show main error only if modals are closed */}

      {/* Group Table */} 
      <div className="group-table-container">
        {loadingGroups ? (
          <p>Loading groups...</p>
        ) : groups.length === 0 && !error ? (
          <p>No stakeholder groups found. Create one to get started.</p>
        ) : (
          <table className="settings-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Members</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(group => (
                <tr key={group.id}>
                  <td>{group.name}</td>
                  <td>{group.description || '-'}</td>
                  <td>{group.member_count}</td>
                  <td>{group.updated_at ? new Date(group.updated_at).toLocaleString() : 'N/A'}</td>
                  <td className="action-buttons">
                    {/* Removed icon-button class from Manage Members */}
                    <button
                      className="manage-members-button" 
                      onClick={() => openMemberModal(group)}
                      title="Manage Members"
                    >
                      Manage Members
                    </button>
                    <button
                      className="icon-button edit-button"
                      onClick={() => openEditModal(group)}
                      title="Edit Group"
                    >
                      Edit
                    </button>
                    <button
                      className="icon-button delete-button"
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      title="Delete Group"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Group Modal */} 
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>{currentGroup ? 'Edit Group' : 'Create New Group'}</h4>
            {error && <div className="error-message"><p>{error}</p></div>} {/* Show modal-specific error */}
            <div className="form-group">
              <label htmlFor="group-name">Group Name *</label>
              <input 
                type="text" 
                id="group-name" 
                value={groupName} 
                onChange={(e) => setGroupName(e.target.value)} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="group-description">Description</label>
              <textarea 
                id="group-description" 
                value={groupDescription} 
                onChange={(e) => setGroupDescription(e.target.value)} 
              />
            </div>
            <div className="modal-actions">
              <button className="action-button secondary" onClick={closeModal}>Cancel</button>
              <button className="action-button primary" onClick={handleSaveGroup}>
                {currentGroup ? 'Save Changes' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Members Modal */} 
      {isMemberModalOpen && groupToManageMembers && (
        <div className="modal-overlay">
          <div className="modal-content modal-large"> {/* Larger modal for members */}
            <h4>Manage Members for "{groupToManageMembers.name}"</h4>
            {error && <div className="error-message"><p>{error}</p></div>} {/* Show modal-specific error */}
            
            {/* NEW: Search Input */} 
            <div className="form-group">
              <label htmlFor="member-search">Search Employees</label>
              <input 
                type="text" 
                id="member-search" 
                placeholder="Search by name or email..." 
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
              />
            </div>

            <div className="member-selection-container">
              {loadingEmployees ? (
                <p>Loading employees...</p>
              ) : employees.length === 0 ? (
                <p>No employees available. Please upload employees first.</p>
              ) : filteredEmployees.length === 0 ? (
                 <p>No employees match your search.</p> // NEW: Message for no search results
              ) : (
                <ul className="member-list">
                  {/* Use filteredEmployees here */} 
                  {filteredEmployees.map(emp => (
                    <li key={emp.id}>
                      <label>
                        <input 
                          type="checkbox" 
                          checked={selectedMembers.includes(emp.id)}
                          onChange={() => handleMemberSelectionChange(emp.id)}
                        />
                        {emp.name} ({emp.email})
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="modal-actions">
              <button className="action-button secondary" onClick={closeMemberModal}>Cancel</button>
              <button className="action-button primary" onClick={handleSaveMembers} disabled={loadingEmployees}>
                Save Members
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default StakeholderGroupManagement;

