import React, { useState } from 'react';
import './CreateEditTemplateModal.css';

const CreateEditTemplateModal = ({ isOpen, onClose, onSave, template }) => {
  const [name, setName] = useState(template ? template.name : '');
  const [description, setDescription] = useState(template ? template.description : '');
  const [error, setError] = useState(null);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Template name is required');
      return;
    }
    onSave({ name, description });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{template ? 'Edit Template' : 'Create Template'}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="template-name">Template Name *</label>
          <input
            id="template-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter template name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="template-description">Description</label>
          <textarea
            id="template-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter template description"
            rows="3"
          />
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button onClick={handleSave} className="save-btn">
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEditTemplateModal; 