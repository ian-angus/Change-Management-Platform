import React, { useState } from 'react';
import './CreateEditTemplateModal.css';

const CreateEditTemplateModal = ({ isOpen, onClose, onSave, template }) => {
  const [name, setName] = useState(template ? template.name : '');
  const [description, setDescription] = useState(template ? template.description : '');
  const [questions, setQuestions] = useState(template ? template.questions : [{ text: '', type: 'scale', options: [] }]);
  const [error, setError] = useState(null);

  const questionTypes = [
    { value: 'scale', label: 'Rating Scale' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'text', label: 'Text Response' },
    { value: 'boolean', label: 'Yes/No' }
  ];

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', type: 'scale', options: [] }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    
    // Reset options if type changes
    if (field === 'type') {
      updatedQuestions[index].options = [];
    }
    
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = [];
    }
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleAddOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = [];
    }
    updatedQuestions[questionIndex].options.push('');
    setQuestions(updatedQuestions);
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updatedQuestions);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length <= 1) {
      setError('Template must have at least one question');
      return;
    }
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError('Template name is required');
      return false;
    }
    if (questions.some(q => !q.text.trim())) {
      setError('All questions must have text');
      return false;
    }
    if (questions.some(q => q.type === 'multiple_choice' && (!q.options || q.options.length < 2))) {
      setError('Multiple choice questions must have at least 2 options');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    setError(null);
    if (!validateForm()) {
      return;
    }
    onSave({ name, description, questions });
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

        <div className="questions-section">
          <h3>Questions</h3>
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="question-container">
              <div className="question-header">
                <h4>Question {qIndex + 1}</h4>
                {questions.length > 1 && (
                  <button 
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="remove-question-btn"
                    title="Remove question"
                  >
                    &times;
                  </button>
                )}
              </div>

              <div className="form-group">
                <label htmlFor={`question-text-${qIndex}`}>Question Text *</label>
                <input
                  id={`question-text-${qIndex}`}
                  type="text"
                  value={question.text}
                  onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                  placeholder="Enter question text"
                />
              </div>

              <div className="form-group">
                <label htmlFor={`question-type-${qIndex}`}>Question Type</label>
                <select
                  id={`question-type-${qIndex}`}
                  value={question.type}
                  onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                >
                  {questionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {question.type === 'multiple_choice' && (
                <div className="options-container">
                  <label>Options *</label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="option-row">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                      />
                      <button
                        onClick={() => handleRemoveOption(qIndex, oIndex)}
                        className="remove-option-btn"
                        title="Remove option"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddOption(qIndex)}
                    className="add-option-btn"
                  >
                    Add Option
                  </button>
                </div>
              )}
            </div>
          ))}

          <button onClick={handleAddQuestion} className="add-question-btn">
            Add Question
          </button>
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