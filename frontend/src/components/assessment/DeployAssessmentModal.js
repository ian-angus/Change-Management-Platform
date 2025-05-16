import React, { useState } from 'react';

export default function DeployAssessmentModal({ isOpen, onClose, onDeploy, assessmentType }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    let deployAt = null;
    if (date && time) {
      deployAt = new Date(`${date}T${time}`);
      if (isNaN(deployAt.getTime())) {
        setError('Invalid date or time.');
        setIsSubmitting(false);
        return;
      }
      deployAt = deployAt.toISOString();
    } else if (date || time) {
      setError('Please provide both date and time, or leave both blank for immediate deployment.');
      setIsSubmitting(false);
      return;
    }
    try {
      await onDeploy(deployAt);
      onClose();
    } catch (err) {
      setError('Failed to deploy assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Deploy {assessmentType} Assessment</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Schedule Deployment (optional):</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              disabled={isSubmitting}
            />
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              disabled={isSubmitting}
            />
            <div style={{ fontSize: '0.9em', color: '#666', marginTop: 4 }}>
              Leave blank to deploy immediately.
            </div>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Deploying...' : 'Deploy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 