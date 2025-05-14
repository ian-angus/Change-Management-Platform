// /home/ubuntu/melyn_cm_platform/frontend/src/pages/settings/AssessmentTemplateBuilder.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AssessmentTemplateBuilder.css'; // Create this CSS file for styling

function AssessmentTemplateBuilder() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get('/api/assessment_templates')
      .then(res => setTemplates(res.data.templates))
      .catch(err => {
        setError('Failed to load assessment templates.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="assessment-template-builder settings-section card">
      <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#FF6B00' }}>Assessment Management</h2>
      <div className="template-header-row">
        <button className="action-button primary" style={{ background: 'linear-gradient(90deg, #FF6B00 0%, #FF2D55 100%)', color: '#fff', fontFamily: 'Poppins, sans-serif', borderRadius: '8px', padding: '10px 20px', fontWeight: 600 }}>
          + Create New Template
        </button>
      </div>
      
      {loading ? (
        <div className="loading-state" style={{ textAlign: 'center', color: '#888', fontFamily: 'Open Sans, sans-serif', marginTop: '3rem' }}>
          <p>Loading templates...</p>
        </div>
      ) : error ? (
        <div className="error-state" style={{ textAlign: 'center', color: '#FF2D55', fontFamily: 'Open Sans, sans-serif', marginTop: '3rem' }}>
          <p>{error}</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', color: '#888', fontFamily: 'Open Sans, sans-serif', marginTop: '3rem' }}>
          <p style={{ fontSize: '1.2rem' }}>No assessment templates yet.</p>
          <p style={{ fontSize: '1rem' }}>Click <span style={{ color: '#FF6B00', fontWeight: 600 }}>"+ Create New Template"</span> to get started.</p>
        </div>
      ) : (
        <div className="template-cards-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'flex-start' }}>
          {templates.map(template => (
            <div key={template.id} className="template-card" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '1.5rem', minWidth: '300px', maxWidth: '350px', flex: '1 1 300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', color: '#1A73E8', marginBottom: '0.5rem' }}>{template.title}</h3>
                <p style={{ color: '#666', fontFamily: 'Open Sans, sans-serif', marginBottom: '0.5rem' }}>{template.description || <span style={{ color: '#bbb' }}>No description</span>}</p>
                <div style={{ fontSize: '0.95rem', color: '#888', marginBottom: '0.5rem' }}>
                  <span>Questions: <b>{template.question_count}</b></span> &nbsp;|&nbsp; <span>Version: v{template.version}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>
                  Status: <span style={{ color: template.status === 'Ready' ? '#00C48C' : '#FF6B00', fontWeight: 600 }}>{template.status}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#aaa' }}>Last updated: {template.last_updated ? new Date(template.last_updated).toLocaleString() : 'N/A'}</div>
              </div>
              <div className="template-card-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="action-button" style={{ background: '#1A73E8', color: '#fff', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>Edit</button>
                <button className="action-button" style={{ background: '#FF6B00', color: '#fff', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>Duplicate</button>
                <button className="action-button" style={{ background: '#FF2D55', color: '#fff', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>Delete</button>
                {!template.is_default && (
                  <button className="action-button" style={{ background: '#00C48C', color: '#fff', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>Set Default</button>
                )}
                <button className="action-button" style={{ background: '#F4B400', color: '#fff', borderRadius: '6px', padding: '6px 14px', fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>Preview</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AssessmentTemplateBuilder;

