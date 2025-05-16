import React, { useEffect, useState } from 'react';
import apiClient from '../../apiClient';
import { FaUserPlus, FaUserMinus, FaSearch, FaTimes, FaUserTag } from 'react-icons/fa';
import './AssignStakeholdersModal.css';

function groupByRole(stakeholders) {
  const grouped = {};
  stakeholders.forEach(s => {
    const role = s.job_position || 'Unspecified';
    if (!grouped[role]) grouped[role] = [];
    grouped[role].push(s);
  });
  return grouped;
}

const AssignStakeholdersModal = ({ isOpen, onClose, assessmentId, projectId, onAssignmentChange }) => {
  const [allStakeholders, setAllStakeholders] = useState([]);
  const [assignedStakeholders, setAssignedStakeholders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    Promise.all([
      apiClient.get(`/projects/${projectId}/stakeholders`),
      apiClient.get(`/assessments/${assessmentId}/stakeholders`)
    ])
      .then(([allRes, assignedRes]) => {
        setAllStakeholders(allRes.data || []);
        setAssignedStakeholders(assignedRes.data || []);
      })
      .catch(e => {
        setError('Failed to load stakeholders.');
      })
      .finally(() => setLoading(false));
  }, [isOpen, assessmentId, projectId]);

  const assignedIds = new Set(assignedStakeholders.map(s => s.id));
  const availableStakeholders = allStakeholders.filter(s => !assignedIds.has(s.id));

  const filteredAvailable = availableStakeholders.filter(s => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.email && s.email.toLowerCase().includes(term)) ||
      (s.job_position && s.job_position.toLowerCase().includes(term))
    );
  });
  const filteredAssigned = assignedStakeholders.filter(s => {
    const term = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.email && s.email.toLowerCase().includes(term)) ||
      (s.job_position && s.job_position.toLowerCase().includes(term))
    );
  });

  const handleAssign = async (employeeId) => {
    setSaving(true);
    setError(null);
    try {
      await apiClient.post(`/assessments/${assessmentId}/stakeholders`, { employee_ids: [employeeId] });
      const res = await apiClient.get(`/assessments/${assessmentId}/stakeholders`);
      setAssignedStakeholders(res.data || []);
      if (onAssignmentChange) onAssignmentChange();
    } catch (e) {
      setError('Failed to assign stakeholder.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (employeeId) => {
    setSaving(true);
    setError(null);
    try {
      await apiClient.delete(`/assessments/${assessmentId}/stakeholders/${employeeId}`);
      const res = await apiClient.get(`/assessments/${assessmentId}/stakeholders`);
      setAssignedStakeholders(res.data || []);
      if (onAssignmentChange) onAssignmentChange();
    } catch (e) {
      setError('Failed to remove stakeholder.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content assign-stakeholders-modal">
        <div className="modal-header">
          <h2>Assign Stakeholders</h2>
          <button className="close-button" onClick={onClose}><FaTimes /></button>
        </div>
        <div className="modal-body">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <div className="modal-error">{error}</div>}
          {loading ? (
            <div className="modal-loading">Loading...</div>
          ) : (
            <div className="stakeholder-lists">
              <div className="stakeholder-section">
                <h4>Assigned Stakeholders <span className="count-badge">{assignedStakeholders.length}</span></h4>
                <div className="stakeholder-list">
                  {filteredAssigned.length === 0 ? (
                    <div className="empty-state">No stakeholders assigned.</div>
                  ) : (
                    Object.entries(groupByRole(filteredAssigned)).map(([role, group]) => (
                      <div key={role} className="role-group">
                        <div className="role-header"><FaUserTag /> {role}</div>
                        {group.map(s => (
                          <div key={s.id} className="stakeholder-item assigned">
                            <span className="stakeholder-name">{s.name} <span className="role-badge">{s.job_position || 'Unspecified'}</span></span>
                            <button className="remove-btn" onClick={() => handleRemove(s.id)} disabled={saving}><FaUserMinus /></button>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="stakeholder-section">
                <h4>Available Stakeholders <span className="count-badge">{filteredAvailable.length}</span></h4>
                <div className="stakeholder-list">
                  {filteredAvailable.length === 0 ? (
                    <div className="empty-state">No available stakeholders.</div>
                  ) : (
                    Object.entries(groupByRole(filteredAvailable)).map(([role, group]) => (
                      <div key={role} className="role-group">
                        <div className="role-header"><FaUserTag /> {role}</div>
                        {group.map(s => (
                          <div key={s.id} className="stakeholder-item available">
                            <span className="stakeholder-name">{s.name} <span className="role-badge">{s.job_position || 'Unspecified'}</span></span>
                            <button className="add-btn" onClick={() => handleAssign(s.id)} disabled={saving}><FaUserPlus /></button>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default AssignStakeholdersModal; 