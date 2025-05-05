// /home/ubuntu/melyn_cm_platform/frontend/src/pages/GroupManagement.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './GroupManagement.css';
import { FaEdit, FaTrashAlt, FaUsersCog, FaPlus, FaSearch, FaTimes } from 'react-icons/fa'; // Added FaSearch, FaTimes

// Dynamically determine API base URL based on frontend hostname
const getApiBaseUrl = () => {
    const hostname = window.location.hostname;
    // Assuming manus.computer structure: <port>-<hash>-<domain>
    if (hostname.includes("manus.computer")) {
        const parts = hostname.split("-");
        // Replace the port part (e.g., 3000) with the backend port (5001)
        parts[0] = "5001";
        return `https://${parts.join("-")}`;
    } else {
        // Fallback for local development (if needed, adjust as necessary)
        return "http://localhost:5001";
    }
};
const API_BASE_URL = getApiBaseUrl();

// --- Helper Components ---

// Simple Search Input Component
function SearchInput({ value, onChange, placeholder }) {
    return (
        <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="search-input"
            />
        </div>
    );
}

// --- Main Component ---

function GroupManagement() {
    const [groups, setGroups] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [showManageMembersModal, setShowManageMembersModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [currentGroup, setCurrentGroup] = useState(null); // Group being edited, deleted, or managed
    const [currentGroupMembers, setCurrentGroupMembers] = useState([]); // Members of the group being managed
    const [groupFormData, setGroupFormData] = useState({ name: '', description: '' });
    const [memberSearchTerm, setMemberSearchTerm] = useState('');
    const [selectedEmployeesToAdd, setSelectedEmployeesToAdd] = useState(new Set());

    // --- Data Fetching ---
    const fetchGroups = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/groups`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setGroups(data);
        } catch (e) {
            console.error("Failed to fetch groups:", e);
            setError('Failed to load groups. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchEmployees = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/employees`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setEmployees(data);
        } catch (e) {
            console.error("Failed to fetch employees:", e);
            setError('Failed to load employees for member management.');
        }
    }, []);

    const fetchGroupDetails = useCallback(async (groupId) => {
        setIsLoading(true); // Use loading state for detail fetch too
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCurrentGroup(data); // Update current group with full details
            setCurrentGroupMembers(data.members || []);
        } catch (e) {
            console.error("Failed to fetch group details:", e);
            setError('Failed to load group members.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGroups();
        fetchEmployees();
    }, [fetchGroups, fetchEmployees]);

    // --- Modal Handling ---
    const handleOpenAddModal = () => {
        setCurrentGroup(null);
        setGroupFormData({ name: '', description: '' });
        setShowAddEditModal(true);
    };

    const handleOpenEditModal = (group) => {
        setCurrentGroup(group);
        setGroupFormData({ name: group.name, description: group.description || '' });
        setShowAddEditModal(true);
    };

    const handleOpenManageMembersModal = (group) => {
        setSelectedEmployeesToAdd(new Set()); // Reset selections
        setMemberSearchTerm(""); // Reset search
        fetchEmployees(); // Ensure employees are fetched/refreshed when modal opens
        fetchGroupDetails(group.id); // Fetch full details including members
        setShowManageMembersModal(true);
    };

    const handleOpenDeleteConfirmModal = (group) => {
        setCurrentGroup(group);
        setShowDeleteConfirmModal(true);
    };

    const handleCloseModals = () => {
        setShowAddEditModal(false);
        setShowManageMembersModal(false);
        setShowDeleteConfirmModal(false);
        setCurrentGroup(null);
        setCurrentGroupMembers([]);
        setError(null);
    };

    // --- Form & Member Selection Handling ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setGroupFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMemberSearchChange = (e) => {
        setMemberSearchTerm(e.target.value);
    };

    const handleEmployeeSelectionChange = (employeeId) => {
        setSelectedEmployeesToAdd(prev => {
            const newSet = new Set(prev);
            if (newSet.has(employeeId)) {
                newSet.delete(employeeId);
            } else {
                newSet.add(employeeId);
            }
            return newSet;
        });
    };

    // --- API Actions ---
    const handleSaveGroup = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        const url = currentGroup
            ? `${API_BASE_URL}/api/groups/${currentGroup.id}`
            : `${API_BASE_URL}/api/groups`;
        const method = currentGroup ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(groupFormData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            await fetchGroups();
            handleCloseModals();
        } catch (e) {
            console.error("Failed to save group:", e);
            setError(e.message || 'Failed to save group.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (!currentGroup) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/groups/${currentGroup.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            await fetchGroups();
            handleCloseModals();
        } catch (e) {
            console.error("Failed to delete group:", e);
            setError('Failed to delete group.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSelectedMembers = async () => {
        if (!currentGroup || selectedEmployeesToAdd.size === 0) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/groups/${currentGroup.id}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employee_ids: Array.from(selectedEmployeesToAdd) }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const updatedGroupData = await response.json();
            setCurrentGroupMembers(updatedGroupData.group.members || []); // Update members list in modal
            setSelectedEmployeesToAdd(new Set()); // Clear selection
            await fetchGroups(); // Refresh main group list (for member count)
        } catch (e) {
            console.error("Failed to add members:", e);
            setError(e.message || 'Failed to add members.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveMember = async (employeeId) => {
        if (!currentGroup) return;
        // Optional: Add a confirmation step here
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/groups/${currentGroup.id}/members/${employeeId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const updatedGroupData = await response.json();
            setCurrentGroupMembers(updatedGroupData.group.members || []); // Update members list in modal
            await fetchGroups(); // Refresh main group list (for member count)
        } catch (e) {
            console.error("Failed to remove member:", e);
            setError(e.message || 'Failed to remove member.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Filtering Logic for Member Management ---
    const availableEmployeesToAdd = useMemo(() => {
        const currentMemberIds = new Set(currentGroupMembers.map(m => m.id));
        return employees
            .filter(emp => !currentMemberIds.has(emp.id)) // Exclude current members
            .filter(emp => { // Filter by search term
                if (!memberSearchTerm) return true;
                const searchTermLower = memberSearchTerm.toLowerCase();
                return (
                    emp.name.toLowerCase().includes(searchTermLower) ||
                    emp.email.toLowerCase().includes(searchTermLower) ||
                    (emp.department && emp.department.toLowerCase().includes(searchTermLower)) ||
                    (emp.job_position && emp.job_position.toLowerCase().includes(searchTermLower))
                );
            });
    }, [employees, currentGroupMembers, memberSearchTerm]);

    // --- Rendering ---
    return (
        <div className="group-management-container">
            <h1>Group Management</h1>
            <button onClick={handleOpenAddModal} className="add-button">
                <FaPlus /> New Group
            </button>

            {isLoading && !showManageMembersModal && <p>Loading groups...</p>}
            {error && !showAddEditModal && !showDeleteConfirmModal && !showManageMembersModal && <p className="error-message">{error}</p>}

            <div className="groups-list">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Members</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.map(group => (
                            <tr key={group.id}>
                                <td>{group.name}</td>
                                <td>{group.description || '-'}</td>
                                <td>{group.member_count ?? 0}</td>
                                <td className="action-buttons">
                                    <button onClick={() => handleOpenManageMembersModal(group)} title="Manage Members">
                                        <FaUsersCog />
                                    </button>
                                    <button onClick={() => handleOpenEditModal(group)} title="Edit Group">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleOpenDeleteConfirmModal(group)} title="Delete Group">
                                        <FaTrashAlt />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {groups.length === 0 && !isLoading && (
                            <tr>
                                <td colSpan="4">No groups found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */} 
            {showAddEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{currentGroup ? 'Edit Group' : 'Add New Group'}</h2>
                        <form onSubmit={handleSaveGroup}>
                            {/* ... (form fields as before) ... */}
                             <div className="form-group">
                                <label htmlFor="name">Group Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={groupFormData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={groupFormData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>
                            {error && <p className="error-message">{error}</p>}
                            <div className="modal-actions">
                                <button type="button" onClick={handleCloseModals} className="cancel-button">Cancel</button>
                                <button type="submit" disabled={isLoading} className="save-button">
                                    {isLoading ? 'Saving...' : 'Save Group'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */} 
            {showDeleteConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Deletion</h2>
                        <p>Are you sure you want to delete the group "<strong>{currentGroup?.name}</strong>"?</p>
                        {error && <p className="error-message">{error}</p>}
                        <div className="modal-actions">
                            <button type="button" onClick={handleCloseModals} className="cancel-button">Cancel</button>
                            <button onClick={handleDeleteGroup} disabled={isLoading} className="delete-button">
                                {isLoading ? 'Deleting...' : 'Delete Group'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Members Modal */} 
            {showManageMembersModal && currentGroup && (
                <div className="modal-overlay">
                    <div className="modal-content manage-members-modal">
                        <h2>Manage Members for "{currentGroup.name}"</h2>
                        {error && <p className="error-message">{error}</p>}
                        {isLoading && <p>Loading details...</p>}

                        <div className="member-management-layout">
                            {/* Current Members Section */} 
                            <div className="member-section current-members-section">
                                <h3>Current Members ({currentGroupMembers.length})</h3>
                                <ul className="member-list">
                                    {currentGroupMembers.length > 0 ? (
                                        currentGroupMembers.map(member => (
                                            <li key={member.id}>
                                                <span>{member.name} ({member.email})</span>
                                                <button
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    disabled={isLoading}
                                                    className="remove-member-button"
                                                    title="Remove Member"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </li>
                                        ))
                                    ) : (
                                        <li>No members assigned yet.</li>
                                    )}
                                </ul>
                            </div>

                            {/* Add Members Section */} 
                            <div className="member-section add-members-section">
                                <h3>Add Employees</h3>
                                <SearchInput
                                    value={memberSearchTerm}
                                    onChange={handleMemberSearchChange}
                                    placeholder="Search employees by name, email, dept..."
                                />
                                <ul className="employee-list-to-add scrollable-list">
                                    {availableEmployeesToAdd.length > 0 ? (
                                        availableEmployeesToAdd.map(emp => (
                                            <li key={emp.id}>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedEmployeesToAdd.has(emp.id)}
                                                        onChange={() => handleEmployeeSelectionChange(emp.id)}
                                                        disabled={isLoading}
                                                    />
                                                    {emp.name} ({emp.email})
                                                    <small> - {emp.department || 'N/A'} / {emp.job_position || 'N/A'}</small>
                                                </label>
                                            </li>
                                        ))
                                    ) : (
                                        <li>{memberSearchTerm ? 'No matching employees found.' : 'All employees are already members or none exist.'}</li>
                                    )}
                                </ul>
                                <button
                                    onClick={handleAddSelectedMembers}
                                    disabled={isLoading || selectedEmployeesToAdd.size === 0}
                                    className="add-members-button"
                                >
                                    {isLoading ? 'Adding...' : `Add Selected (${selectedEmployeesToAdd.size})`}
                                </button>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={handleCloseModals} className="cancel-button">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GroupManagement;

