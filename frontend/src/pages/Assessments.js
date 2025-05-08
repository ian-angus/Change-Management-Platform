import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient'; // Import the new apiClient
import { FaPlus, FaTimes, FaPaperPlane } from 'react-icons/fa';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import './Assessments.css';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const DUMMY_ASSESSMENT_TEMPLATES = [
  { id: 'change_characteristics', name: 'Change Characteristics', description: 'Assess the scope, scale, and impact of the change.' },
  { id: 'organizational_attributes', name: 'Organizational Attributes', description: "Evaluate the organization's culture, structure, and history with change." },
  { id: 'pct', name: 'PCT Assessment', description: 'Prosci Project Change Triangle assessment (Leadership, Project Management, Change Management).' },
  { id: 'adkar', name: 'ADKAR Assessment (Initial)', description: 'Assess individual readiness across Awareness, Desire, Knowledge, Ability, and Reinforcement.' },
  { id: 'sponsor_assessment', name: 'Sponsor Assessment', description: 'Evaluate the effectiveness and engagement of the primary sponsor.' },
];

const prepareAdkarChartData = (assessment) => {
  if (!assessment || assessment.assessment_type !== 'ADKAR Assessment (Initial)' || !assessment.results) {
    return null;
  }
  const labels = Object.keys(assessment.results);
  const dataPoints = Object.values(assessment.results);
  return {
    labels: labels,
    datasets: [
      {
        label: 'ADKAR Score',
        data: dataPoints,
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        borderColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(0, 123, 255, 1)',
      },
    ],
  };
};

const radarChartOptions = {
  scales: {
    r: {
      angleLines: { display: true, color: 'rgba(0, 0, 0, 0.1)' },
      suggestedMin: 0,
      suggestedMax: 100,
      ticks: { stepSize: 20, backdropColor: 'rgba(255, 255, 255, 0.75)' },
      pointLabels: { font: { size: 12 } },
      grid: { color: 'rgba(0, 0, 0, 0.1)' }
    },
  },
  plugins: {
    legend: { position: 'top' },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) { label += ': '; }
          if (context.parsed.r !== null) { label += context.parsed.r + '%'; }
          return label;
        }
      }
    }
  },
  maintainAspectRatio: false
};

function Assessments() {
  const [assessments, setAssessments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assessmentTemplates] = useState(DUMMY_ASSESSMENT_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [addAssessmentError, setAddAssessmentError] = useState(null);

  useEffect(() => {
    setLoadingProjects(true);
    apiClient.get('/projects/') // Use apiClient, remove /api
      .then(response => {
        setProjects(response.data);
        setLoadingProjects(false);
      })
      .catch(error => {
        console.error('Error fetching projects:', error);
        const errorMsg = error.response?.data?.error || error.message || "An unknown error occurred";
        setError(`Failed to load projects: ${errorMsg}. Cannot select assessments.`);
        setLoadingProjects(false);
      });
  }, []);

  const fetchAssessments = (projectId) => {
    if (!projectId) {
      setAssessments([]);
      setLoadingAssessments(false);
      return;
    }
    setLoadingAssessments(true);
    setError(null);
    apiClient.get(`/assessments?project_id=${projectId}`) // Use apiClient, remove /api
      .then(response => {
        setAssessments(response.data);
        setLoadingAssessments(false);
      })
      .catch(error => {
        console.error('Error fetching assessments:', error);
        const errorMsg = error.response?.data?.error || error.message || "An unknown error occurred";
        setError(`Failed to load assessments: ${errorMsg}. Is the backend running?`);
        setLoadingAssessments(false);
      });
  };

  useEffect(() => {
    fetchAssessments(selectedProjectId);
  }, [selectedProjectId]);

  const handleProjectChange = (event) => {
    setSelectedProjectId(event.target.value);
  };

  const selectedProject = projects.find(p => p.id === parseInt(selectedProjectId));

  const openAddModal = () => {
    setSelectedTemplateId('');
    setAddAssessmentError(null);
    setSuccessMessage(null);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId);
  };

  const handleAddAssessment = () => {
    if (!selectedTemplateId) {
      setAddAssessmentError('Please select an assessment template.');
      return;
    }
    setAddAssessmentError(null);
    const selectedTemplate = assessmentTemplates.find(t => t.id === selectedTemplateId);
    if (!selectedTemplate) {
        setAddAssessmentError('Invalid template selected.');
        return;
    }
    const newAssessmentData = {
      project_id: parseInt(selectedProjectId),
      assessment_type: selectedTemplate.name
    };
    apiClient.post('/assessments/', newAssessmentData) // Use apiClient, remove /api
      .then(response => {
        setSuccessMessage(response.data.message || 'Assessment added successfully!');
        fetchAssessments(selectedProjectId);
        closeAddModal();
        setTimeout(() => setSuccessMessage(null), 3000);
      })
      .catch(err => {
        console.error('Error adding assessment:', err);
        const errorMsg = err.response?.data?.error || err.message || 'Failed to add assessment. Please try again.';
        setAddAssessmentError(errorMsg);
      });
  };

  const handleDeployAssessment = (assessmentId, assessmentType) => {
    if (window.confirm(`Are you sure you want to deploy the "${assessmentType}" assessment (ID: ${assessmentId})?`)) {
        setError(null);
        setSuccessMessage(null);
        apiClient.post(`/assessments/${assessmentId}/deploy`, {}) // Use apiClient, remove /api
          .then(response => {
            setSuccessMessage(response.data.message || `Assessment ${assessmentId} deployed successfully.`);
            fetchAssessments(selectedProjectId);
            setTimeout(() => setSuccessMessage(null), 3000);
          })
          .catch(err => {
            console.error(`Error deploying assessment ${assessmentId}:`, err);
            const errorMsg = err.response?.data?.error || err.message || 'Failed to deploy assessment.';
            setError(errorMsg);
            setTimeout(() => setError(null), 5000);
          });
    }
  };

  const adkarAssessment = assessments.find(a => a.assessment_type === 'ADKAR Assessment (Initial)');
  const adkarChartData = prepareAdkarChartData(adkarAssessment);

  return (
    <div className="assessments-page page-content">
      <h1 className="page-title">Assessments</h1>
      <div className="project-selection-area card">
        <div className="form-group">
          <label htmlFor="project-select">Select Project:</label>
          {loadingProjects ? (
            <p>Loading projects...</p>
          ) : (
            <select 
              id="project-select" 
              value={selectedProjectId} 
              onChange={handleProjectChange} 
              className="form-control"
              disabled={projects.length === 0}
            >
              <option value="" disabled>-- Select a Project --</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name} (ID: {project.id})
                </option>
              ))}
            </select>
          )}
        </div>
        {projects.length === 0 && !loadingProjects && !error && (
            <p className="info-message">No projects available. Please create a project first.</p>
        )}
      </div>
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {selectedProjectId ? (
        <div className="assessments-content">
          <div className="toolbar">
             <h2 className="sub-title">Assessments for {selectedProject?.name || 'Selected Project'}</h2>
             <button 
                className="button button-primary" 
                onClick={openAddModal} 
                disabled={!selectedProjectId}
             >
                <FaPlus /> Add Assessment
             </button> 
          </div>
          {loadingAssessments && <p>Loading assessments...</p>}
          {!loadingAssessments && !error && assessments.length === 0 && (
            <div className="card info-message">
              <p>No assessments found for this project. Click "+ Add Assessment" to get started.</p>
            </div>
          )}
          {!loadingAssessments && !error && assessments.length > 0 && (
            <div className="assessment-display-grid">
              <div className="card assessment-table-container">
                <table className="assessments-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Last Modified/Deployed</th>
                      <th>Risk</th>
                      <th>Readiness</th>
                      <th>Results Summary / Completion</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map(assessment => (
                      <tr key={assessment.id}>
                        <td data-label="ID">{assessment.id}</td>
                        <td data-label="Type">{assessment.assessment_type}</td>
                        <td data-label="Status">{assessment.status}</td>
                        <td data-label="Last Modified">{assessment.completion_date ? new Date(assessment.completion_date).toLocaleDateString() : 'N/A'}</td>
                        <td data-label="Risk">{assessment.risk_level || 'N/A'}</td>
                        <td data-label="Readiness">{assessment.readiness_score !== null ? `${assessment.readiness_score}%` : 'N/A'}</td>
                        <td data-label="Results Summary">
                          {assessment.results ? (
                              <pre style={{ fontSize: '0.8em', whiteSpace: 'pre-wrap', margin: 0 }}>
                                  {JSON.stringify(assessment.results, null, 2)}
                              </pre>
                          ) : 'N/A'}
                        </td>
                        <td data-label="Actions">
                          <button 
                            className="button button-secondary button-icon" 
                            onClick={() => handleDeployAssessment(assessment.id, assessment.assessment_type)}
                            disabled={assessment.status === 'Deployed' || assessment.status === 'Completed'}
                            title={assessment.status === 'Deployed' || assessment.status === 'Completed' ? 'Assessment already deployed/completed' : 'Deploy Assessment'}
                          >
                            <FaPaperPlane />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {adkarChartData && (
                <div className="card chart-container">
                  <h3>ADKAR Assessment Results</h3>
                  <div className="chart-wrapper">
                    <Radar data={adkarChartData} options={radarChartOptions} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
         !loadingProjects && !error && (
            <div className="card info-message">
                <p>Please select a project from the dropdown above to view or manage its assessments.</p>
            </div>
         )
      )}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Assessment to Project: {selectedProject?.name}</h3>
              <button onClick={closeAddModal} className="close-button"><FaTimes /></button>
            </div>
            <div className="modal-body">
              {addAssessmentError && <div className="alert alert-danger">{addAssessmentError}</div>}
              <p>Select an assessment template to add:</p>
              <ul className="template-list">
                {assessmentTemplates.map(template => (
                  <li 
                    key={template.id} 
                    onClick={() => handleTemplateSelect(template.id)}
                    className={selectedTemplateId === template.id ? 'selected' : ''}
                  >
                    <strong>{template.name}</strong>
                    <p style={{ margin: '5px 0 0', fontSize: '0.9em', color: '#666' }}>{template.description}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="modal-footer">
              <button type="button" className="button" onClick={closeAddModal}>Cancel</button>
              <button 
                type="button" 
                className="button button-primary" 
                onClick={handleAddAssessment}
                disabled={!selectedTemplateId}
              >
                Add Selected Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Assessments;

