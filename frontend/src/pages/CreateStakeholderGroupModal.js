import React, { useState } from 'react';
import './CreateStakeholderGroupModal.css'; // Create this CSS file

function CreateStakeholderGroupModal({ projectId, apiBaseUrl, onClose }) {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!groupName.trim()) {
      setError('Group name is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/stakeholder_groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          description: description,
          project_id: projectId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Group created successfully
      onClose(true); // Pass true to indicate success
    } catch (err) {
      console.error('Failed to create stakeholder group:', err);
      setError(`Failed to create group: ${err.message}`);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content create-group-modal">
        <h3>Create New Stakeholder Group</h3>
        <button onClick={() => onClose(false)} className="close-modal-btn">&times;</button>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="groupName">Group Name *</label>
            <input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              disabled={submitting}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => onClose(false)} disabled={submitting} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="submit-btn">
              {submitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateStakeholderGroupModal;

