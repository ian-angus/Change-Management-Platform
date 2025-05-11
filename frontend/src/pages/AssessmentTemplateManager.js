import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AssessmentTemplateManager.css'; // Create this CSS file

function AssessmentTemplateManager({ apiBaseUrl }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null); // For create/edit form
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiBaseUrl}/assessment-templates`);
      setTemplates(Array.isArray(response.data.templates) ? response.data.templates : []);
    } catch (err) {
      console.error("Failed to fetch assessment templates:", err);
      setError("Failed to load templates. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCreateNew = () => {
    setEditingTemplate({ name: '', description: '', questions: [{ text: '', type: 'scale', options: [] }] });
    setIsCreating(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setIsCreating(false);
  };

  const handleDuplicate = async (template) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/assessment-templates/${template.id}/duplicate`);
      setSuccessMessage('Template duplicated successfully');
      fetchTemplates();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to duplicate template:", err);
      setError("Failed to duplicate template. Please try again.");
    }
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }
    try {
      await axios.delete(`${apiBaseUrl}/assessment-templates/${templateId}`);
      setSuccessMessage('Template deleted successfully');
      fetchTemplates();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to delete template:", err);
      setError("Failed to delete template. Please try again.");
    }
  };

  const handleSetDefault = async (templateId) => {
    try {
      await axios.put(`${apiBaseUrl}/assessment-templates/${templateId}/set-default`);
      setSuccessMessage('Default template updated successfully');
      fetchTemplates();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to set default template:", err);
      setError("Failed to set default template. Please try again.");
    }
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      // Map 'name' to 'title' for backend compatibility
      const payload = { ...templateData, title: templateData.name };
      if (isCreating) {
        await axios.post(`${apiBaseUrl}/assessment-templates`, payload);
        setSuccessMessage('Template created successfully');
      } else {
        await axios.put(`${apiBaseUrl}/assessment-templates/${editingTemplate.id}`, payload);
        setSuccessMessage('Template updated successfully');
      }
      setEditingTemplate(null);
      setIsCreating(false);
      fetchTemplates();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to save template:", err);
      setError("Failed to save template. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingTemplate(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...editingTemplate.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], text: value };
    setEditingTemplate(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const addQuestion = () => {
    setEditingTemplate(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', type: 'scale', options: [] }] // Default new question
    }));
  };

  const removeQuestion = (index) => {
    if (editingTemplate.questions.length <= 1) return; // Keep at least one question
    const updatedQuestions = editingTemplate.questions.filter((_, i) => i !== index);
    setEditingTemplate(prev => ({ ...prev, questions: updatedQuestions }));
  };

  // Render Logic
  if (loading) return <div className="loading-state"><p>Loading templates...</p></div>;

  // Form View
  if (editingTemplate) {
    return (
      <div className="template-form">
        <h3>{isCreating ? 'Create New Template' : 'Edit Template'}</h3>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="name">Template Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={editingTemplate.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={editingTemplate.description || ''}
            onChange={handleInputChange}
            rows="3"
          />
        </div>
        <h4>Questions</h4>
        {editingTemplate.questions.map((q, index) => (
          <div key={index} className="question-group">
            <label htmlFor={`question-${index}`}>Question {index + 1} *</label>
            <input
              type="text"
              id={`question-${index}`}
              value={q.text}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              required
            />
            {/* Add question type selector later if needed */}
            {editingTemplate.questions.length > 1 && (
                <button onClick={() => removeQuestion(index)} className="remove-question-btn">Remove</button>
            )}
          </div>
        ))}
        <button onClick={addQuestion} className="add-question-btn">Add Question</button>

        <div className="form-actions">
          <button onClick={() => { setEditingTemplate(null); setIsCreating(false); }} className="cancel-btn">Cancel</button>
          <button onClick={() => handleSaveTemplate(editingTemplate)} className="save-btn">Save Template</button>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="template-manager">
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="template-header">
        <h2>Assessment Templates</h2>
        <button onClick={handleCreateNew} className="create-template-btn">
          Create New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="empty-state">
          <p>No assessment templates found. Create one to get started.</p>
        </div>
      ) : (
        <div className="templates-grid">
          {templates.map(template => (
            <div key={template.id} className="template-card">
              <div className="template-header">
                <h3>{template.name}</h3>
                {template.is_default && <span className="default-badge">Default</span>}
              </div>
              <p className="template-description">{template.description || 'No description'}</p>
              <div className="template-meta">
                <span>{template.question_count} questions</span>
                <span>Last updated: {new Date(template.last_updated).toLocaleDateString()}</span>
              </div>
              <div className="template-actions">
                <button onClick={() => handleEdit(template)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => handleDuplicate(template)} className="duplicate-btn">
                  Duplicate
                </button>
                {!template.is_default && (
                  <button onClick={() => handleSetDefault(template.id)} className="set-default-btn">
                    Set as Default
                  </button>
                )}
                <button onClick={() => handleDelete(template.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AssessmentTemplateManager;

