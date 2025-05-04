// /home/ubuntu/melyn_cm_platform/frontend/src/pages/settings/AssessmentTemplateBuilder.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AssessmentTemplateBuilder.css'; // Create this CSS file

const API_BASE_URL = '/api'; // Use relative path

function AssessmentTemplateBuilder() {
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // TODO: Add state for modals (create/edit template, manage questions)
  // TODO: Add state for current template being edited/viewed
  // TODO: Add state for questions within the current template

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = () => {
    setLoadingTemplates(true);
    setError(null);
    axios.get(`${API_BASE_URL}/assessment-templates/`)
      .then(response => {
        setTemplates(response.data);
      })
      .catch(err => {
        console.error('Error fetching templates:', err);
        setError('Failed to load assessment templates.');
      })
      .finally(() => {
        setLoadingTemplates(false);
      });
  };

  // --- Placeholder Functions --- 
  const handleCreateTemplate = () => {
    console.log('Create new template');
    setError('Create template functionality not yet implemented.');
    setTimeout(() => setError(null), 3000);
  };

  const handleEditTemplate = (templateId) => {
    console.log(`Edit template ${templateId}`);
    setError('Edit template functionality not yet implemented.');
    setTimeout(() => setError(null), 3000);
  };

  const handleDeleteTemplate = (templateId, templateTitle) => {
    console.log(`Delete template ${templateId}`);
     if (window.confirm(`Are you sure you want to delete the template "${templateTitle}"? This cannot be undone.`)) {
        setError(null);
        setSuccessMessage(null);
        axios.delete(`${API_BASE_URL}/assessment-templates/${templateId}`)
          .then(response => {
            setSuccessMessage(response.data.message || 'Template deleted successfully!');
            fetchTemplates(); // Refresh list
            setTimeout(() => setSuccessMessage(null), 3000);
          })
          .catch(err => {
            console.error('Error deleting template:', err);
            setError(err.response?.data?.error || 'Failed to delete template.');
            setTimeout(() => setError(null), 5000);
          });
     }
  };

  const handleManageQuestions = (templateId) => {
    console.log(`Manage questions for template ${templateId}`);
    setError('Manage questions functionality not yet implemented.');
    setTimeout(() => setError(null), 3000);
  };
  
  const handleSetDefault = (templateId) => {
    console.log(`Set template ${templateId} as default`);
    setError(null);
    setSuccessMessage(null);
    axios.put(`${API_BASE_URL}/assessment-templates/${templateId}/set-default`)
      .then(response => {
        setSuccessMessage('Template set as default successfully!');
        fetchTemplates(); // Refresh list to show updated default status
        setTimeout(() => setSuccessMessage(null), 3000);
      })
      .catch(err => {
        console.error('Error setting default template:', err);
        setError(err.response?.data?.error || 'Failed to set template as default.');
        setTimeout(() => setError(null), 5000);
      });
  };

  return (
    <div className="assessment-template-builder settings-section card">
      <h3>Assessment Template Builder</h3>

      <button className="action-button primary mb-3" onClick={handleCreateTemplate}>
        Create New Template
      </button>

      {/* Status Messages */} 
      {successMessage && <div className="success-message"><p>{successMessage}</p></div>}
      {error && <div className="error-message"><p>{error}</p></div>}

      {/* Template Table */} 
      <div className="template-table-container">
        {loadingTemplates ? (
          <p>Loading templates...</p>
        ) : templates.length === 0 && !error ? (
          <p>No assessment templates found. Create one to get started.</p>
        ) : (
          <table className="settings-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Questions</th>
                <th>Version</th>
                <th>Default</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(template => (
                <tr key={template.id}>
                  <td>{template.title}</td>
                  <td>{template.description || '-'}</td>
                  <td>{template.question_count}</td> 
                  <td>v{template.version}</td>
                  <td>{template.is_default ? 'Yes' : 'No'}</td>
                  <td>{template.updated_at ? new Date(template.updated_at).toLocaleString() : 'N/A'}</td>
                  <td className="action-buttons">
                    <button 
                      className="icon-button manage-questions-button" 
                      onClick={() => handleManageQuestions(template.id)}
                      title="Manage Questions"
                    >
                      Questions
                    </button>
                    <button 
                      className="icon-button edit-button" 
                      onClick={() => handleEditTemplate(template.id)}
                      title="Edit Template"
                    >
                      Edit
                    </button>
                    {!template.is_default && (
                      <button 
                        className="icon-button set-default-button" 
                        onClick={() => handleSetDefault(template.id)}
                        title="Set as Default"
                      >
                        Set Default
                      </button>
                    )}
                    <button 
                      className="icon-button delete-button" 
                      onClick={() => handleDeleteTemplate(template.id, template.title)}
                      title="Delete Template"
                    >
                      Delete
                    </button>
                    {/* Add Duplicate button later */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* TODO: Add Modals for Create/Edit Template and Manage Questions */}

    </div>
  );
}

export default AssessmentTemplateBuilder;

