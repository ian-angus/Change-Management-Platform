import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AssessmentTemplateManager.css'; // Create this CSS file
import { FaEdit, FaCopy, FaTrash, FaPlusCircle, FaEye } from 'react-icons/fa';

const LIKERT_OPTIONS = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree"
];

const typeOptions = [
  { value: "scale", label: "Scale 1-5" },
  { value: "likert", label: "Likert (Strongly Disagree to Strongly Agree)" },
  { value: "multi_select", label: "Option (Multi-select)" },
  { value: "single_select", label: "Option (Single-select)" },
  { value: "long_text", label: "Long Text" },
  { value: "short_text", label: "Short Text" }
];

function QuestionManagerModal({ template, isOpen, onClose, apiBaseUrl, onQuestionsUpdated }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ text: '', type: 'scale', options: ['',''], required: false, helper_text: '', placeholder: '' });
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    fetchQuestions();
    // eslint-disable-next-line
  }, [isOpen]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${apiBaseUrl}/assessment-templates/${template.id}/questions`);
      setQuestions(res.data);
    } catch (err) {
      setError('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ text: '', type: 'scale', options: ['',''], required: false, helper_text: '', placeholder: '' });
    setEditingId(null);
    setFormError(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    if (name === "type" && value === "likert") {
      setForm(f => ({ ...f, type: value, options: [...LIKERT_OPTIONS] }));
    } else if (name === "type" && value === "multi_select") {
      setForm(f => ({ ...f, type: value, options: ["", ""] }));
    } else if (name === "type" && value === "single_select") {
      setForm(f => ({ ...f, type: value, options: ["", ""] }));
    } else if (name === "type") {
      setForm(f => ({ ...f, type: value, options: [] }));
    } else {
      setForm(f => ({ ...f, [name]: inputType === 'checkbox' ? checked : value }));
    }
  };

  const handleOptionChange = (idx, value) => {
    setForm(f => {
      const opts = [...f.options];
      opts[idx] = value;
      return { ...f, options: opts };
    });
  };

  const addOption = () => setForm(f => ({ ...f, options: [...f.options, ''] }));
  const removeOption = (idx) => setForm(f => ({ ...f, options: f.options.filter((_, i) => i !== idx) }));

  const validateForm = () => {
    if (!form.text.trim()) return 'Question text is required.';
    if (["multi_select", "single_select"].includes(form.type) && (!form.options || form.options.length < 2 || form.options.some(opt => !opt.trim()))) return 'Select questions need at least 2 options, all filled.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateForm();
    if (err) return setFormError(err);
    setFormError(null);
    try {
      // Always include all fields, but ensure label and type are present
      const payload = { ...form, label: form.text, type: form.type };
      console.log('Submitting question payload:', payload);
      if (editingId) {
        await axios.put(`${apiBaseUrl}/assessment_questions/${editingId}`, payload);
      } else {
        await axios.post(`${apiBaseUrl}/assessment-templates/${template.id}/questions`, payload);
      }
      resetForm();
      fetchQuestions();
      if (onQuestionsUpdated) onQuestionsUpdated();
    } catch (err) {
      setFormError('Failed to save question.');
    }
  };

  const handleEdit = (q) => {
    setForm({
      text: q.text,
      type: q.type,
      options: q.options || ['',''],
      required: q.required,
      helper_text: q.helper_text || '',
      placeholder: q.placeholder || ''
    });
    setEditingId(q.id);
    setFormError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await axios.delete(`${apiBaseUrl}/assessment_questions/${id}`);
      fetchQuestions();
      if (onQuestionsUpdated) onQuestionsUpdated();
    } catch (err) {
      setError('Failed to delete question.');
    }
  };

  return isOpen ? (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 800 }}>
        <div className="modal-header">
          <h2>Manage Questions for: {template.name}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          {loading ? <p>Loading...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
            <>
              {questions.length === 0 ? <p>No questions yet.</p> : (
                <ol style={{ paddingLeft: 20 }}>
                  {questions.map(q => (
                    <li key={q.id} style={{
                      marginBottom: 10,
                      background: editingId === q.id ? '#e3f2fd' : '#f9f9f9',
                      borderRadius: 6,
                      padding: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: editingId === q.id ? '2px solid #1976d2' : '1px solid #eee'
                    }}>
                      {editingId === q.id ? (
                        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <input
                            type="text"
                            name="text"
                            value={form.text}
                            onChange={handleFormChange}
                            required
                            style={{ marginBottom: 6 }}
                          />
                          <select name="type" value={form.type} onChange={handleFormChange} style={{ marginBottom: 6 }}>
                            {typeOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          {form.type === 'likert' && (
                            <div style={{ display: 'flex', gap: '2rem', margin: '0.5rem 0' }}>
                              {LIKERT_OPTIONS.map((opt, i) => (
                                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <input type="radio" disabled /> {opt}
                                </label>
                              ))}
                            </div>
                          )}
                          {["multi_select", "single_select"].includes(form.type) && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                              {form.options.map((opt, idx) => (
                                <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={e => handleOptionChange(idx, e.target.value)}
                                    required
                                    style={{ width: 100 }}
                                  />
                                  {form.options.length > 2 && <button type="button" onClick={() => removeOption(idx)} style={{ color: 'red' }}>x</button>}
                                </span>
                              ))}
                              <button type="button" onClick={addOption}>Add Option</button>
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button type="submit" title="Save" style={{ background: 'none', border: 'none', color: '#1976d2', fontSize: 20, cursor: 'pointer' }}>✔️</button>
                            <button type="button" title="Cancel" onClick={resetForm} style={{ background: 'none', border: 'none', color: '#c00', fontSize: 20, cursor: 'pointer' }}>❌</button>
                          </div>
                          {formError && <div style={{ color: 'red', marginTop: 4 }}>{formError}</div>}
                        </form>
                      ) : (
                        <>
                          <div>
                            <b>{q.text}</b> {q.type && <span style={{ color: '#888', fontSize: '0.95rem' }}>({typeOptions.find(t => t.value === q.type)?.label || q.type})</span>}
                            {q.type === 'likert' && (
                              <div style={{ display: 'flex', gap: '2rem', margin: '0.5rem 0' }}>
                                {LIKERT_OPTIONS.map((opt, i) => (
                                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <input type="radio" disabled /> {opt}
                                  </label>
                                ))}
                              </div>
                            )}
                            {q.type === 'scale' && (
                              <div style={{ display: 'flex', gap: '2rem', color: '#888', margin: '0.5rem 0' }}>
                                {[1,2,3,4,5].map(n => (
                                  <label key={n} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <input type="radio" disabled /> {n}
                                  </label>
                                ))}
                              </div>
                            )}
                            {q.type === 'multi_select' && q.options && Array.isArray(q.options) && (
                              <div style={{ display: 'flex', gap: '2rem', margin: '0.5rem 0' }}>
                                {q.options.map((opt, i) => (
                                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <input type="checkbox" disabled /> {opt}
                                  </label>
                                ))}
                              </div>
                            )}
                            {q.type === 'single_select' && q.options && Array.isArray(q.options) && (
                              <div style={{ display: 'flex', gap: '2rem', margin: '0.5rem 0' }}>
                                {q.options.map((opt, i) => (
                                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <input type="radio" disabled /> {opt}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                          <span style={{ display: 'flex', gap: 10 }}>
                            <FaEdit className="icon-action" title="Edit" onClick={() => handleEdit(q)} />
                            <FaTrash className="icon-action" title="Delete" onClick={() => handleDelete(q.id)} />
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ol>
              )}
              {editingId === null && (
                <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
                  <h4>Add New Question</h4>
                  <div className="form-group">
                    <label>Question Text *</label>
                    <input type="text" name="text" value={form.text} onChange={handleFormChange} required />
                  </div>
                  <div className="form-group">
                    <label>Type *</label>
                    <select name="type" value={form.type} onChange={handleFormChange}>
                      {typeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  {form.type === 'likert' && (
                    <div className="form-group">
                      <label>Likert Options</label>
                      <div style={{ display: 'flex', gap: '2rem', margin: '0.5rem 0' }}>
                        {LIKERT_OPTIONS.map((opt, idx) => (
                          <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <input type="radio" disabled /> {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  {["multi_select", "single_select"].includes(form.type) && (
                    <div className="form-group">
                      <label>Options *</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        {form.options.map((opt, idx) => (
                          <span key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <input
                              type="text"
                              value={opt}
                              onChange={e => handleOptionChange(idx, e.target.value)}
                              required
                              style={{ width: 100 }}
                            />
                            {form.options.length > 2 && <button type="button" onClick={() => removeOption(idx)} style={{ color: 'red' }}>x</button>}
                          </span>
                        ))}
                        <button type="button" onClick={addOption}>Add Option</button>
                      </div>
                    </div>
                  )}
                  <div className="form-group">
                    <label>Helper Text</label>
                    <input type="text" name="helper_text" value={form.helper_text} onChange={handleFormChange} />
                  </div>
                  <div className="form-group">
                    <label>Placeholder</label>
                    <input type="text" name="placeholder" value={form.placeholder} onChange={handleFormChange} />
                  </div>
                  <div className="form-group">
                    <label><input type="checkbox" name="required" checked={form.required} onChange={handleFormChange} /> Required</label>
                  </div>
                  {formError && <div style={{ color: 'red', marginBottom: 8 }}>{formError}</div>}
                  <div className="form-actions">
                    <button type="submit" className="save-btn">Add Question</button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  ) : null;
}

function AssessmentTemplateManager({ apiBaseUrl }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null); // For create/edit form
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [questionModalTemplate, setQuestionModalTemplate] = useState(null);

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
      await axios.post(`${apiBaseUrl}/assessment-templates/${template.id}/duplicate`);
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

  const removeQuestion = (index) => {
    if (editingTemplate.questions.length <= 1) return; // Keep at least one question
    const updatedQuestions = editingTemplate.questions.filter((_, i) => i !== index);
    setEditingTemplate(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handlePreview = async (template) => {
    setPreviewTemplate(template);
    setLoadingPreview(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/assessment-templates/${template.id}/questions`);
      setPreviewQuestions(response.data);
    } catch (err) {
      setPreviewQuestions([]);
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreview = () => {
    setPreviewTemplate(null);
    setPreviewQuestions([]);
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
        {(editingTemplate.questions || []).map((q, index) => (
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
        <div className="template-table-wrapper">
          <table className="template-table">
            <thead>
              <tr>
                <th style={{ maxWidth: 120 }}>Name</th>
                <th style={{ maxWidth: 220 }}>Description</th>
                <th style={{ width: 60, textAlign: 'center' }}>Questions</th>
                <th style={{ width: 100 }}>Last Updated</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(template => (
                <tr key={template.id}>
                  <td style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{template.name}</td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{template.description || 'No description'}</td>
                  <td style={{ textAlign: 'center', width: 60 }}>{template.question_count}</td>
                  <td style={{ width: 100 }}>{template.last_updated ? new Date(template.last_updated).toLocaleDateString() : 'N/A'}</td>
                  <td style={{ width: 120 }}>
                    <span className="template-actions-icons" style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <FaEye
                        className="icon-action"
                        title="Preview"
                        onClick={() => handlePreview(template)}
                      />
                      <FaEdit
                        className="icon-action"
                        title="Edit"
                        onClick={() => handleEdit(template)}
                      />
                      <FaCopy
                        className="icon-action"
                        title="Duplicate"
                        onClick={() => handleDuplicate(template)}
                      />
                      <FaTrash
                        className="icon-action"
                        title="Delete"
                        onClick={() => handleDelete(template.id)}
                      />
                      <FaPlusCircle
                        className="icon-action"
                        title="Add Question"
                        onClick={() => setQuestionModalTemplate(template)}
                      />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 900 }}>
            <div className="modal-header">
              <h2>Preview: {previewTemplate.name}</h2>
              <button onClick={closePreview} className="close-button">&times;</button>
            </div>
            <div className="modal-body">
              <p><b>Description:</b> {previewTemplate.description || 'No description'}</p>
              <p><b>Questions:</b></p>
              {loadingPreview ? (
                <p>Loading questions...</p>
              ) : previewQuestions.length === 0 ? (
                <p>No questions in this template.</p>
              ) : (
                <ol>
                  {previewQuestions.map((q, idx) => (
                    <li key={q.id} style={{ marginBottom: '1rem' }}>
                      <div><b>{q.text}</b></div>
                      {q.type === 'likert' && (
                        <div style={{ display: 'flex', gap: '2rem', margin: '0.5rem 0' }}>
                          {LIKERT_OPTIONS.map((opt, i) => (
                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <input type="radio" disabled /> {opt}
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === 'scale' && (
                        <div style={{ display: 'flex', gap: '2rem', color: '#888', margin: '0.5rem 0' }}>
                          {[1,2,3,4,5].map(n => (
                            <label key={n} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <input type="radio" disabled /> {n}
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === 'multi_select' && q.options && Array.isArray(q.options) && (
                        <div style={{ display: 'flex', gap: '2rem', margin: '0.5rem 0' }}>
                          {q.options.map((opt, i) => (
                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <input type="checkbox" disabled /> {opt}
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === 'single_select' && q.options && Array.isArray(q.options) && (
                        <div style={{ display: 'flex', gap: '2rem', margin: '0.5rem 0' }}>
                          {q.options.map((opt, i) => (
                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <input type="radio" disabled /> {opt}
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === 'long_text' && <textarea disabled placeholder="Long text answer..." style={{ width: '100%', minHeight: 60 }} />}
                      {q.type === 'short_text' && <input type="text" disabled placeholder="Short text answer..." style={{ width: '60%' }} />}
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={closePreview} className="cancel-btn">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Question Manager Modal */}
      {questionModalTemplate && (
        <QuestionManagerModal
          template={questionModalTemplate}
          isOpen={!!questionModalTemplate}
          onClose={() => setQuestionModalTemplate(null)}
          apiBaseUrl={apiBaseUrl}
          onQuestionsUpdated={fetchTemplates}
        />
      )}
    </div>
  );
}

export default AssessmentTemplateManager;

