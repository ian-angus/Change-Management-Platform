import React, { useState, useEffect, useCallback } from 'react';
import './AssessmentTemplateManager.css'; // Create this CSS file

function AssessmentTemplateManager({ apiBaseUrl }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null); // For create/edit form
  const [isCreating, setIsCreating] = useState(false);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/assessment_templates`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      console.error("Failed to fetch assessment templates:", err);
      setError("Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCreateNew = () => {
    setEditingTemplate({ name: '', description: '', questions: [{ text: '', type: 'scale' }] }); // Basic structure
    setIsCreating(true);
  };

  const handleEdit = (template) => {
    // Ensure questions is an array, default if not present or invalid
    const questions = Array.isArray(template.questions) ? template.questions : [{ text: '', type: 'scale' }];
    setEditingTemplate({ ...template, questions });
    setIsCreating(false);
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate || !editingTemplate.name.trim()) {
      setError("Template name is required.");
      return;
    }
    // Basic validation for questions
    if (!editingTemplate.questions || editingTemplate.questions.some(q => !q.text.trim())) {
        setError("All questions must have text.");
        return;
    }

    setLoading(true); // Indicate saving
    setError(null);

    const url = isCreating
      ? `${apiBaseUrl}/assessment_templates`
      : `${apiBaseUrl}/assessment_templates/${editingTemplate.id}`;
    const method = isCreating ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTemplate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      setEditingTemplate(null);
      setIsCreating(false);
      fetchTemplates(); // Refresh the list
    } catch (err) {
      console.error("Failed to save template:", err);
      setError(`Failed to save template: ${err.message}`);
      setLoading(false); // Stop loading indicator on error
    }
    // setLoading(false) will be called by fetchTemplates on success
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
      questions: [...prev.questions, { text: '', type: 'scale' }] // Default new question
    }));
  };

  const removeQuestion = (index) => {
    if (editingTemplate.questions.length <= 1) return; // Keep at least one question
    const updatedQuestions = editingTemplate.questions.filter((_, i) => i !== index);
    setEditingTemplate(prev => ({ ...prev, questions: updatedQuestions }));
  };

  // Render Logic
  if (loading) return <p>Loading templates...</p>;

  // Form View
  if (editingTemplate) {
    return (
      <div className="template-form">
        <h3>{isCreating ? 'Create New Template' : 'Edit Template'}</h3>
        {error && <p className="error-message">{error}</p>}
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
          <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
          <button onClick={handleSaveTemplate} className="submit-btn">Save Template</button>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="template-manager">
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleCreateNew} className="create-template-btn">Create New Template</button>
      {templates.length > 0 ? (
        <ul className="template-list">
          {templates.map(template => (
            <li key={template.id}>
              <span>{template.name}</span>
              <div className="template-actions">
                <button onClick={() => handleEdit(template)} className="edit-btn">Edit</button>
                {/* Add Delete button later */}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No assessment templates found. Create one to get started.</p>
      )}
    </div>
  );
}

export default AssessmentTemplateManager;

