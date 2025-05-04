import React, { useState } from 'react';
import './CreateProjectModal.css'; // Create this CSS file

function CreateProjectModal({ apiBaseUrl, onClose }) {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!projectName.trim()) {
      setError('Project name is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          description: description,
          // Add other fields if needed, e.g., start_date, end_date
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Project created successfully
      onClose(true); // Pass true to indicate success
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(`Failed to create project: ${err.message}`);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content create-project-modal">
        <h3>Create New Project</h3>
        <button onClick={() => onClose(false)} className="close-modal-btn">&times;</button>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="projectName">Project Name *</label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
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
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectModal;

