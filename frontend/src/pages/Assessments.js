import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Use axios for consistency
import { FaPlus, FaPaperPlane, FaTrash, FaChartBar, FaEdit } from 'react-icons/fa'; // Import icons ADDED FaTrash, FaChartBar, FaEdit (Removed FaTimes)
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2'; // Import Radar chart
import './Assessments.css'; // Assuming you have or will create this CSS file

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// Use relative path for API calls, relying on proxy in development
const API_BASE_URL = '/api';

// --- Dummy Assessment Templates (Replace with API call later) ---
const DUMMY_ASSESSMENT_TEMPLATES = [
  // { id: 'change_characteristics', name: 'Change Characteristics', description: 'Assess the scope, scale, and impact of the change.' }, // REMOVED
  { id: 'organizational_attributes', name: 'Organizational Attributes', description: "Evaluate the organization's culture, structure, and history with change." },
  { id: 'pct', name: 'PCT Assessment', description: 'Prosci Project Change Triangle assessment (Leadership, Project Management, Change Management).' },
  { id: 'adkar', name: 'ADKAR Assessment (Initial)', description: 'Assess individual readiness across Awareness, Desire, Knowledge, Ability, and Reinforcement.' },
  { id: 'sponsor_assessment', name: 'Sponsor Assessment', description: 'Evaluate the effectiveness and engagement of the primary sponsor.' },
];
// ----------------------------------------------------------------

// --- NEW: Dummy Assessment Content (Placeholder) ---
const DUMMY_ASSESSMENT_CONTENT = {
  "Change Characteristics": [
    { id: "cc_q1", text: "Describe the nature and scope of your change.", type: "textarea" },
    { id: "cc_q2", text: "Which groups are most severely impacted?", type: "textarea" },
    { id: "cc_q3", text: "Which groups are least impacted?", type: "textarea" },
    { id: "cc_q4", text: "Number of impacted Front-line employees:", type: "number" },
    { id: "cc_q5", text: "Number of impacted Managers and supervisors:", type: "number" },
    { id: "cc_q6", text: "Number of impacted Executives and stakeholders:", type: "number" },
    {
      id: "cc_q7",
      text: "What areas of your organization will be changing?",
      type: "checkbox_group",
      options: [
        "Process",
        "Job roles",
        "System or technology",
        "Staffing levels",
        "Organization",
        "Merger"
      ],
      allow_other: true // Indicates an "Other" text input should be available
    },
    {
      id: "cc_q8",
      text: "What is the amount of change?",
      type: "radio",
      options: [
        "Radical and dramatic (disruptive)",
        "Incremental (progressive)"
      ]
    },
    { id: "cc_q9", text: "Project initiation date:", type: "date" },
    { id: "cc_q10", text: "Design initiation date:", type: "date" },
    { id: "cc_q11", text: "Design complete date:", type: "date" },
    { id: "cc_q12", text: "Implementation initiation date:", type: "date" },
    { id: "cc_q13", text: "Implementation complete date:", type: "date" },
    { id: "cc_q14", text: "Full cut-over complete date:", type: "date" },
  ],
  // Add content for other assessment types later
};
// ------------------------------------------------------

// --- NEW: Dummy Users and Groups (Placeholder) ---
const DUMMY_USERS = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com' },
  { id: 2, name: 'Bob Johnson', email: 'bob@example.com' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com' },
];
const DUMMY_GROUPS = [
  { id: 'g1', name: 'Management Team', userIds: [1, 4] },
  { id: 'g2', name: 'Development Team', userIds: [2, 3] },
  { id: 'g3', name: 'All Employees', userIds: [1, 2, 3, 4] },
];
// ---------------------------------------------------

// Helper function to prepare ADKAR data for Radar chart
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
        backgroundColor: 'rgba(0, 123, 255, 0.2)', // BrightFold Primary Blue with transparency
        borderColor: 'rgba(0, 123, 255, 1)', // BrightFold Primary Blue
        borderWidth: 1,
        pointBackgroundColor: 'rgba(0, 123, 255, 1)',
      },
    ],
  };
};

// Chart options for Radar chart
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
  // --- NEW: Initialize selectedProjectId from sessionStorage ---
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    return sessionStorage.getItem('selectedProjectId') || '';
  });
  // -----------------------------------------------------------
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // State for Add Assessment Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [assessmentTemplates] = useState(DUMMY_ASSESSMENT_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [addAssessmentError, setAddAssessmentError] = useState(null);

  // --- MODIFIED: State for Deploy Assessment Flow ---
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false); // NEW: For content review
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false); // Existing: Now for recipients/schedule
  const [deployAssessmentDetails, setDeployAssessmentDetails] = useState({ id: null, type: '', content: [] }); // Added content
  // NEW: State for recipient selection
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [deployScheduleDate, setDeployScheduleDate] = useState("");
  const [deployError, setDeployError] = useState(null);
  // --- NEW: State for Results Modal ---
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [resultsDetails, setResultsDetails] = useState({ id: null, type: "", results: null }); // Store assessment details and results
  // --- NEW: State for Completion Modal ---
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [completionAssessmentDetails, setCompletionAssessmentDetails] = useState({ id: null, type: "", content: [] });
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [completionError, setCompletionError] = useState(null);
  // -----------------------------------
  // ----------------------------------
  // ---------------------------------------------

  // Fetch projects for the dropdown
  useEffect(() => {
    console.log("Effect: Fetching projects...");
    setLoadingProjects(true);
    axios.get(`${API_BASE_URL}/projects/`)
      .then(response => {
        console.log("Effect: Projects fetched successfully:", response.data);
        setProjects(response.data);
      })
      .catch(error => {
        console.error('Effect: Error fetching projects:', error);
        setError('Failed to load projects. Cannot select assessments.');
      })
      .finally(() => {
        console.log("Effect: Finished fetching projects.");
        setLoadingProjects(false);
      });
  }, []); // Runs only once on mount

  // Function to fetch assessments for the selected project (using useCallback)
  const fetchAssessments = useCallback((projectId) => {
    console.log(`Callback: fetchAssessments called with projectId: ${projectId} (type: ${typeof projectId})`);
    if (!projectId || projectId === '') {
      console.log("Callback: fetchAssessments - projectId is empty, clearing assessments.");
      setAssessments([]);
      setLoadingAssessments(false);
      return;
    }
    console.log(`Callback: fetchAssessments - Fetching for project ID ${projectId}`);
    setLoadingAssessments(true);
    setError(null);
    axios.get(`${API_BASE_URL}/assessments/?project_id=${projectId}`)
      .then(response => {
        console.log(`Callback: Assessments fetched for project ${projectId}:`, response.data);
        setAssessments(response.data);
      })
      .catch(error => {
        console.error(`Callback: Error fetching assessments for project ${projectId}:`, error);
        setError('Failed to load assessments. Is the backend running?');
        setAssessments([]); // Clear assessments on error
      })
      .finally(() => {
        console.log(`Callback: Finished fetching assessments for project ${projectId}`);
        setLoadingAssessments(false);
      });
  }, []); // Dependencies: empty, as it doesn't rely on component state/props directly

  // Effect to fetch assessments when selectedProjectId changes
  useEffect(() => {
    console.log(`Effect[selectedProjectId]: Triggered. Value is now: ${selectedProjectId} (type: ${typeof selectedProjectId})`);
    fetchAssessments(selectedProjectId);
  }, [selectedProjectId, fetchAssessments]); // Add fetchAssessments as dependency due to useCallback

  const handleProjectChange = (event) => {
    const newProjectId = event.target.value;
    console.log(`Handler: handleProjectChange - Event triggered. Value from event.target.value: ${newProjectId} (type: ${typeof newProjectId})`);
    console.log(`Handler: handleProjectChange - Current selectedProjectId BEFORE update: ${selectedProjectId}`);
    setSelectedProjectId(newProjectId);
    // --- NEW: Save selectedProjectId to sessionStorage ---
    sessionStorage.setItem('selectedProjectId', newProjectId);
    // ---------------------------------------------------
    console.log(`Handler: handleProjectChange - Called setSelectedProjectId with ${newProjectId}. State update queued.`);
  };

  // Find selected project based on potentially string ID
  const selectedProject = projects.find(p => p.id.toString() === selectedProjectId);

  // --- Add Assessment Modal Functions ---
  const openAddModal = () => {
    console.log("Handler: openAddModal - Opening Add Assessment Modal...");
    if (!selectedProjectId) {
        console.error("Handler: openAddModal - Cannot open modal without a selected project.");
        setError("Please select a project before adding an assessment.");
        return;
    }
    setSelectedTemplateId('');
    setAddAssessmentError(null);
    setSuccessMessage(null);
    setError(null); // Clear general errors too
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    console.log("Handler: closeAddModal - Closing Add Assessment Modal...");
    setIsAddModalOpen(false);
  };

  const handleTemplateSelect = (templateId) => {
    console.log(`Handler: handleTemplateSelect - Selected template ID: ${templateId}`);
    setSelectedTemplateId(templateId);
  };

  const handleAddAssessment = () => {
    console.log("Handler: handleAddAssessment - Attempting to add assessment...");
    if (!selectedTemplateId) {
      setAddAssessmentError('Please select an assessment template.');
      return;
    }
    if (!selectedProjectId) {
      setAddAssessmentError('Error: No project selected.');
      return;
    }
    setAddAssessmentError(null);
    const selectedTemplate = assessmentTemplates.find(t => t.id === selectedTemplateId);
    if (!selectedTemplate) {
        setAddAssessmentError('Invalid template selected.');
        return;
    }
    const newAssessmentData = {
      project_id: parseInt(selectedProjectId), // Ensure it's an integer for the backend
      assessment_type: selectedTemplate.name
    };
    console.log("Handler: handleAddAssessment - Sending data:", newAssessmentData);
    axios.post(`${API_BASE_URL}/assessments/`, newAssessmentData)
      .then(response => {
        console.log("Handler: handleAddAssessment - Success:", response.data);
        setSuccessMessage(response.data.message || 'Assessment added successfully!');
        fetchAssessments(selectedProjectId); // Refresh list
        closeAddModal();
        setTimeout(() => setSuccessMessage(null), 3000);
      })
      .catch(err => {
        console.error('Handler: handleAddAssessment - Error:', err);
        const errorMsg = err.response?.data?.error || 'Failed to add assessment. Please try again.';
        setAddAssessmentError(errorMsg);
      });
  };
  // -------------------------------------

  // --- NEW: Project Change Characteristics Handler ---
  const handleProjectCharacteristicsClick = () => {
    console.log("Handler: handleProjectCharacteristicsClick - Clicked");
    if (!selectedProjectId) {
      setError("Please select a project first.");
      return;
    }

    const existingAssessment = assessments.find(
      a => a.assessment_type === 'Change Characteristics'
    );

    if (existingAssessment) {
      console.log(`Handler: handleProjectCharacteristicsClick - Found existing CC assessment (ID: ${existingAssessment.id}). Opening for completion/edit.`);
      handleCompleteAssessmentClick(existingAssessment.id, existingAssessment.assessment_type);
    } else {
      console.log("Handler: handleProjectCharacteristicsClick - No existing CC assessment found. Creating new one...");
      const newAssessmentData = {
        project_id: parseInt(selectedProjectId),
        assessment_type: 'Change Characteristics'
      };
      axios.post(`${API_BASE_URL}/assessments/`, newAssessmentData)
        .then(response => {
          console.log("Handler: handleProjectCharacteristicsClick - New CC assessment created:", response.data);
          const newAssessment = response.data.assessment; // Assuming backend returns the created assessment object
          setSuccessMessage(response.data.message || 'Change Characteristics assessment created.');
          fetchAssessments(selectedProjectId); // Refresh list to include the new one
          // Open the completion modal for the newly created assessment
          handleCompleteAssessmentClick(newAssessment.id, newAssessment.assessment_type);
          setTimeout(() => setSuccessMessage(null), 3000);
        })
        .catch(err => {
          console.error('Handler: handleProjectCharacteristicsClick - Error creating CC assessment:', err);
          const errorMsg = err.response?.data?.error || 'Failed to create Change Characteristics assessment.';
          setError(errorMsg);
        });
    }
  };
  // --------------------------------------------------

  // --- NEW: Assessment Review Modal Functions ---
  const openReviewModal = (assessmentId, assessmentType) => {
    console.log(`Handler: openReviewModal - Opening Review Modal for ID: ${assessmentId}, Type: ${assessmentType}`);
    // Fetch or use dummy content based on assessmentType
    const content = DUMMY_ASSESSMENT_CONTENT[assessmentType] || [];
    setDeployAssessmentDetails({ id: assessmentId, type: assessmentType, content: content });
    setSuccessMessage(null); // Clear general messages
    setError(null);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    console.log("Handler: closeReviewModal - Closing Review Modal...");
    setIsReviewModalOpen(false);
  };

  const handleProceedToDeploy = () => {
    console.log("Handler: handleProceedToDeploy - Proceeding from Review to Deploy Options...");
    closeReviewModal();
    openDeployModal(deployAssessmentDetails.id, deployAssessmentDetails.type); // Pass details
  };
  // ---------------------------------------------

  // --- MODIFIED: Deploy Assessment Modal Functions ---
  const openDeployModal = (assessmentId, assessmentType) => {
    console.log(`Handler: openDeployModal - Opening Deploy Options Modal for ID: ${assessmentId}, Type: ${assessmentType}`);
    // Reset state for new deployment
    setSelectedGroups([]);
    setSelectedUsers([]);
    setDeployScheduleDate("");
    setDeployError(null);
    setSuccessMessage(null);
    setError(null);
    // Keep deployAssessmentDetails from review step
    setIsDeployModalOpen(true);
  };

  const closeDeployModal = () => {
    console.log("Handler: closeDeployModal - Closing Deploy Options Modal...");
    setIsDeployModalOpen(false);
    setDeployAssessmentDetails({ id: null, type: '', content: [] }); // Clear details
  };

  // NEW: Handlers for recipient selection
  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleDeployAssessment = () => {
    console.log("Handler: handleDeployAssessment - Attempting to deploy...");
    if (!deployAssessmentDetails.id) {
      setDeployError('Error: Assessment ID is missing.');
      return;
    }
    if (selectedGroups.length === 0 && selectedUsers.length === 0) {
      setDeployError('Please select at least one recipient group or user.');
      return;
    }
    setDeployError(null);

    // Combine selected user IDs from groups and individual selections
    let recipientUserIds = [...selectedUsers];
    selectedGroups.forEach(groupId => {
      const group = DUMMY_GROUPS.find(g => g.id === groupId);
      if (group) {
        group.userIds.forEach(userId => {
          if (!recipientUserIds.includes(userId)) {
            recipientUserIds.push(userId);
          }
        });
      }
    });

    console.log("Handler: handleDeployAssessment - Deploying assessment ID:", deployAssessmentDetails.id);
    console.log("Handler: handleDeployAssessment - Selected Groups:", selectedGroups);
    console.log("Handler: handleDeployAssessment - Selected Users:", selectedUsers);
    console.log("Handler: handleDeployAssessment - Combined Recipient User IDs:", recipientUserIds);
    console.log("Handler: handleDeployAssessment - Schedule Date:", deployScheduleDate);

    // *** Backend Call Placeholder ***
    // In a real app, you'd send recipientUserIds and deployScheduleDate to the backend
    // For now, we just update the status locally via the existing endpoint
    axios.post(`${API_BASE_URL}/assessments/${deployAssessmentDetails.id}/deploy`)
      .then(response => {
        console.log("Handler: handleDeployAssessment - Success:", response.data);
        setSuccessMessage(response.data.message || 'Assessment deployed successfully!');
        fetchAssessments(selectedProjectId); // Refresh list
        closeDeployModal();
        setTimeout(() => setSuccessMessage(null), 3000);
      })
      .catch(err => {
        console.error('Handler: handleDeployAssessment - Error:', err);
        const errorMsg = err.response?.data?.error || 'Failed to deploy assessment. Please try again.';
        setDeployError(errorMsg);
      });
  };

  // Combined handler for the deploy icon click (starts the review step)
  const handleDeployButtonClick = (assessmentId, assessmentType) => {
    console.log(`Handler: handleDeployButtonClick - Clicked deploy icon for ID: ${assessmentId}, Type: ${assessmentType}`);
    openReviewModal(assessmentId, assessmentType);
  };
  // ---------------------------------------------------

  // --- Delete Assessment Function ---
  const handleDeleteAssessment = (assessmentId, assessmentType) => {
    console.log(`Handler: handleDeleteAssessment - Attempting to delete ID: ${assessmentId}, Type: ${assessmentType}`);
    // Optional: Add a confirmation dialog
    if (!window.confirm(`Are you sure you want to delete the assessment "${assessmentType}" (ID: ${assessmentId})? This action cannot be undone.`)) {
      console.log("Handler: handleDeleteAssessment - Deletion cancelled by user.");
      return;
    }

    setSuccessMessage(null);
    setError(null);

    axios.delete(`${API_BASE_URL}/assessments/${assessmentId}`)
      .then(response => {
        console.log("Handler: handleDeleteAssessment - Success:", response.data);
        setSuccessMessage(response.data.message || 'Assessment deleted successfully!');
        fetchAssessments(selectedProjectId); // Refresh the list after deletion
        setTimeout(() => setSuccessMessage(null), 3000);
      })
      .catch(err => {
        console.error('Handler: handleDeleteAssessment - Error:', err);
        const errorMsg = err.response?.data?.error || 'Failed to delete assessment. Please try again.';
        setError(errorMsg);
        // Optionally clear error after a few seconds
        setTimeout(() => setError(null), 5000);
      });
  };
  // ---------------------------------

  // --- NEW: Assessment Completion Modal Functions ---
  const openCompletionModal = (assessmentId, assessmentType) => {
    console.log(`Handler: openCompletionModal - Opening Completion Modal for ID: ${assessmentId}, Type: ${assessmentType}`);
    const content = DUMMY_ASSESSMENT_CONTENT[assessmentType] || [];
    const existingAssessment = assessments.find(a => a.id === assessmentId);
    const initialAnswers = existingAssessment?.results || {}; // Load existing answers if available

    // Initialize answers for all questions if not present
    content.forEach(q => {
      if (!(q.id in initialAnswers)) {
        if (q.type === 'checkbox_group') {
          initialAnswers[q.id] = { selected: [], other: '' }; // Initialize checkbox state
        } else {
          initialAnswers[q.id] = ''; // Default for others
        }
      }
    });

    setCompletionAssessmentDetails({ id: assessmentId, type: assessmentType, content: content });
    setCurrentAnswers(initialAnswers);
    setCompletionError(null);
    setSuccessMessage(null);
    setError(null);
    setIsCompletionModalOpen(true);
  };

  const closeCompletionModal = () => {
    console.log("Handler: closeCompletionModal - Closing Completion Modal...");
    setIsCompletionModalOpen(false);
    setCompletionAssessmentDetails({ id: null, type: '', content: [] });
    setCurrentAnswers({});
  };

  const handleAnswerChange = (questionId, value, optionValue = null, isCheckbox = false, isOther = false) => {
    setCurrentAnswers(prevAnswers => {
      const newAnswers = { ...prevAnswers };
      if (isCheckbox) {
        const currentSelection = newAnswers[questionId]?.selected || [];
        if (isOther) {
          // Handle 'Other' text input for checkbox group
          newAnswers[questionId] = { ...newAnswers[questionId], other: value };
        } else {
          // Handle regular checkbox toggle
          const updatedSelection = value
            ? [...currentSelection, optionValue] // Add option
            : currentSelection.filter(item => item !== optionValue); // Remove option
          newAnswers[questionId] = { ...newAnswers[questionId], selected: updatedSelection };
        }
      } else {
        newAnswers[questionId] = value;
      }
      console.log("Updated Answers State:", newAnswers);
      return newAnswers;
    });
  };

  const handleSubmitAnswers = () => {
    console.log("Handler: handleSubmitAnswers - Submitting answers for assessment ID:", completionAssessmentDetails.id);
    console.log("Handler: handleSubmitAnswers - Answers being sent:", currentAnswers);
    setCompletionError(null);

    axios.post(`${API_BASE_URL}/assessments/${completionAssessmentDetails.id}/submit`, { results: currentAnswers })
      .then(response => {
        console.log("Handler: handleSubmitAnswers - Success:", response.data);
        setSuccessMessage(response.data.message || 'Assessment answers submitted successfully!');
        fetchAssessments(selectedProjectId); // Refresh list to show 'Completed' status
        closeCompletionModal();
        setTimeout(() => setSuccessMessage(null), 3000);
      })
      .catch(err => {
        console.error('Handler: handleSubmitAnswers - Error:', err);
        const errorMsg = err.response?.data?.error || 'Failed to submit answers. Please try again.';
        setCompletionError(errorMsg);
      });
  };

  // Handler for the complete/edit icon click
  const handleCompleteAssessmentClick = (assessmentId, assessmentType) => {
    console.log(`Handler: handleCompleteAssessmentClick - Clicked complete/edit icon for ID: ${assessmentId}, Type: ${assessmentType}`);
    openCompletionModal(assessmentId, assessmentType);
  };
  // --------------------------------------------------

  // --- NEW: Results Modal Functions ---
  const openResultsModal = (assessmentId, assessmentType) => {
    console.log(`Handler: openResultsModal - Opening Results Modal for ID: ${assessmentId}, Type: ${assessmentType}`);
    const assessment = assessments.find(a => a.id === assessmentId);
    if (assessment && assessment.results) {
      setResultsDetails({ id: assessmentId, type: assessmentType, results: assessment.results });
      setSuccessMessage(null);
      setError(null);
      setIsResultsModalOpen(true);
    } else {
      console.error(`Handler: openResultsModal - Could not find results for assessment ID: ${assessmentId}`);
      setError("Could not load results for this assessment.");
    }
  };

  const closeResultsModal = () => {
    console.log("Handler: closeResultsModal - Closing Results Modal...");
    setIsResultsModalOpen(false);
    setResultsDetails({ id: null, type: "", results: null }); // Clear details
  };

  // Handler for the results icon click
  const handleViewResults = (assessmentId, assessmentType) => {
    console.log(`Handler: handleViewResults - Clicked results icon for ID: ${assessmentId}, Type: ${assessmentType}`);
    openResultsModal(assessmentId, assessmentType);
  };
  // -----------------------------------

  // --- Helper to render assessment content/form/results ---
  const renderAssessmentContent = (content, mode = 'review', currentAnswers = {}, handleAnswerChange = null) => {
    if (!content || content.length === 0) {
      return <p>No content defined for this assessment type.</p>;
    }

    return content.map((item) => {
      const answer = currentAnswers[item.id];

      switch (mode) {
        case 'complete':
          // Render form inputs for completion
          switch (item.type) {
            case 'textarea':
              return (
                <div key={item.id} className="form-group">
                  <label htmlFor={item.id}>{item.text}</label>
                  <textarea
                    id={item.id}
                    value={answer || ''}
                    onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                  />
                </div>
              );
            case 'number':
              return (
                <div key={item.id} className="form-group">
                  <label htmlFor={item.id}>{item.text}</label>
                  <input
                    type="number"
                    id={item.id}
                    value={answer || ''}
                    onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                  />
                </div>
              );
            case 'date':
              return (
                <div key={item.id} className="form-group">
                  <label htmlFor={item.id}>{item.text}</label>
                  <input
                    type="date"
                    id={item.id}
                    value={answer || ''}
                    onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                  />
                </div>
              );
            case 'radio':
              return (
                <div key={item.id} className="form-group">
                  <label>{item.text}</label>
                  {item.options.map(option => (
                    <div key={option} className="radio-option">
                      <input
                        type="radio"
                        id={`${item.id}-${option}`}
                        name={item.id}
                        value={option}
                        checked={answer === option}
                        onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                      />
                      <label htmlFor={`${item.id}-${option}`}>{option}</label>
                    </div>
                  ))}
                </div>
              );
            case 'checkbox_group':
              const currentSelection = answer?.selected || [];
              const otherValue = answer?.other || '';
              return (
                <div key={item.id} className="form-group">
                  <label>{item.text}</label>
                  {item.options.map(option => (
                    <div key={option} className="checkbox-option">
                      <input
                        type="checkbox"
                        id={`${item.id}-${option}`}
                        name={item.id}
                        value={option}
                        checked={currentSelection.includes(option)}
                        onChange={(e) => handleAnswerChange(item.id, e.target.checked, option, true, false)}
                      />
                      <label htmlFor={`${item.id}-${option}`}>{option}</label>
                    </div>
                  ))}
                  {item.allow_other && (
                    <div className="checkbox-option other-option">
                      <label htmlFor={`${item.id}-other`}>Other:</label>
                      <input
                        type="text"
                        id={`${item.id}-other`}
                        value={otherValue}
                        onChange={(e) => handleAnswerChange(item.id, e.target.value, null, true, true)}
                      />
                    </div>
                  )}
                </div>
              );
            default:
              return <p key={item.id}>Unsupported question type: {item.type}</p>;
          }

        case 'results':
          // Render formatted results
          let displayAnswer = 'No answer provided';
          if (answer !== undefined && answer !== null && answer !== '') {
            if (item.type === 'checkbox_group') {
              const selected = answer.selected || [];
              const other = answer.other || '';
              displayAnswer = selected.join(', ');
              if (other) {
                displayAnswer += (displayAnswer ? ', ' : '') + `Other: ${other}`;
              }
              if (!displayAnswer) displayAnswer = 'No options selected';
            } else if (item.type === 'date' && answer) {
              // Attempt to format date nicely, fallback to original string
              try {
                displayAnswer = new Date(answer + 'T00:00:00').toLocaleDateString(); // Add time to avoid timezone issues
              } catch (e) {
                displayAnswer = answer; // Fallback
              }
            } else {
              displayAnswer = String(answer);
            }
          }
          return (
            <div key={item.id} className="result-item">
              <p><strong>{item.text}</strong></p>
              <p>{displayAnswer}</p>
            </div>
          );

        case 'review': // Default mode
        default:
          // Render read-only content for review
          return (
            <div key={item.id} className="review-item">
              <p><strong>{item.text}</strong></p>
              {item.type === 'textarea' && <p><em>(Text answer required)</em></p>}
              {item.type === 'number' && <p><em>(Number required)</em></p>}
              {item.type === 'date' && <p><em>(Date required)</em></p>}
              {item.options && (
                <ul>
                  {item.options.map(option => <li key={option}>{option}</li>)}
                  {item.allow_other && <li>Other (Specify)</li>}
                </ul>
              )}
            </div>
          );
      }
    });
  };
  // --------------------------------------------------------

  return (
    <div className="assessments-container">
      {/* --- Fixed Top Section --- */} 
      <div className="fixed-top-section">
        <h2>Assessments</h2>

        {/* Project Selection */} 
        <div className="project-selector card">
          <label htmlFor="project-select">Select Project:</label>
          {loadingProjects ? (
            <p>Loading projects...</p>
          ) : error && !projects.length ? (
            <p className="error-message">{error}</p>
          ) : (
            <select
              id="project-select"
              value={selectedProjectId}
              onChange={handleProjectChange}
              disabled={projects.length === 0}
            >
              <option value="">-- Select a Project --</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
          {selectedProject && <p>Selected: <strong>{selectedProject.name}</strong></p>}
        </div>

        {/* Toolbar */} 
        <div className="toolbar card">
          <button
            className="action-button"
            onClick={handleProjectCharacteristicsClick}
            disabled={!selectedProjectId}
            title={!selectedProjectId ? "Select a project first" : "Manage Project Change Characteristics"}
          >
            Project Change Characteristics
          </button>
          <button
            className="action-button primary"
            onClick={openAddModal}
            disabled={!selectedProjectId}
            title={!selectedProjectId ? "Select a project first" : "Add a new standard assessment"}
          >
            <FaPlus /> Add Assessment
          </button>
        </div>
      </div>
      {/* --- End Fixed Top Section --- */} 

      {/* --- Scrollable Content Section --- */} 
      <div className="scrollable-content-section">
        {/* Status Messages */} 
        {successMessage && <div className="card success-message"><p>{successMessage}</p></div>}
        {error && <div className="card error-message"><p>{error}</p></div>}

        {/* Loading/Empty State */} 
        {loadingAssessments && <p>Loading assessments...</p>}
        {!loadingAssessments && !error && selectedProjectId && assessments.length === 0 && (
          <div className="card info-message">
            <p>No assessments found for this project. Click "+ Add Assessment" or "Project Change Characteristics" to get started.</p>
          </div>
        )}
        {!selectedProjectId && !loadingProjects && (
           <div className="card info-message">
            <p>Please select a project to view or add assessments.</p>
          </div>
        )}

        {/* Assessment Table Structure */} 
        {!loadingAssessments && !error && assessments.length > 0 && (
          <div className="assessment-display-grid">
            {/* -- NEW: Two-Table Structure for Fixed Headers -- */}
            <div className="card assessment-table-container">
              {/* Fixed Header Table */}
              <table className="assessments-table fixed-header-table">
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
              </table>

              {/* Scrollable Body Table Container */}
              <div className="scrollable-body-container">
                <table className="assessments-table scrollable-body-table">
                  {/* Note: No thead here */}
                  <tbody>
                    {assessments.map(assessment => (
                      <tr key={assessment.id}>
                        <td>{assessment.id}</td>
                        <td>{assessment.assessment_type}</td>
                        <td>
                          <span className={`status-badge status-${assessment.status?.toLowerCase().replace(' ', '-')}`}>
                            {assessment.status || 'N/A'}
                          </span>
                        </td>
                        <td>{assessment.completion_date ? new Date(assessment.completion_date).toLocaleString() : 'N/A'}</td>
                        <td>{assessment.risk_level || 'N/A'}</td>
                        <td>{assessment.readiness_score ? `${assessment.readiness_score}%` : 'N/A'}</td>
                        <td>{assessment.results ? 'View Details' : 'N/A'}</td>
                        <td className="action-buttons">
                          {/* NEW: Complete/Edit Assessment Button (conditional) */}
                          {assessment.status !== 'Completed' && assessment.status !== 'Deployed' && (
                            <button
                              className="icon-button complete-button"
                              onClick={() => handleCompleteAssessmentClick(assessment.id, assessment.assessment_type)}
                              title="Complete Assessment"
                            >
                              <FaEdit />
                            </button>
                          )}
                          <button
                            className="icon-button deploy-button"
                            onClick={() => handleDeployButtonClick(assessment.id, assessment.assessment_type)}
                            title="Deploy Assessment"
                            disabled={assessment.status !== 'Completed'} // Only allow deploy if completed
                          >
                            <FaPaperPlane />
                          </button>
                          <button
                            className="icon-button delete-button"
                            onClick={() => handleDeleteAssessment(assessment.id, assessment.assessment_type)}
                            title="Delete Assessment"
                          >
                            <FaTrash />
                          </button>
                          {/* NEW: View Results Button (conditional) */}
                          {(assessment.status === 'Completed' || assessment.status === 'Deployed') && assessment.results && (
                            <button
                              className="icon-button results-button"
                              onClick={() => handleViewResults(assessment.id, assessment.assessment_type)}
                              title="View Results"
                            >
                              <FaChartBar /> {/* Using a chart icon for results */}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* --- End Scrollable Content Section --- */} 

      {/* --- Modals --- */} 

      {/* Add Assessment Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <h3>Add New Assessment</h3>
            {addAssessmentError && <p className="error-message">{addAssessmentError}</p>}
            <div className="form-group">
              <label>Select Assessment Type:</label>
              {assessmentTemplates.map(template => (
                <div key={template.id} className="radio-option">
                  <input
                    type="radio"
                    id={`template-${template.id}`}
                    name="assessmentTemplate"
                    value={template.id}
                    checked={selectedTemplateId === template.id}
                    onChange={() => handleTemplateSelect(template.id)}
                  />
                  <label htmlFor={`template-${template.id}`}>{template.name}</label>
                  <p className="template-description">{template.description}</p>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="action-button" onClick={closeAddModal}>Cancel</button>
              <button className="action-button primary" onClick={handleAddAssessment} disabled={!selectedTemplateId}>Add Assessment</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Assessment Modal (NEW) */}
      {isReviewModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card wide-modal">
            <h3>Review Assessment: {deployAssessmentDetails.type}</h3>
            <div className="modal-body scrollable-modal-body">
              {renderAssessmentContent(deployAssessmentDetails.content, 'review')}
            </div>
            <div className="modal-actions">
              <button className="action-button" onClick={closeReviewModal}>Cancel</button>
              <button className="action-button primary" onClick={handleProceedToDeploy}>Proceed to Deploy Options</button>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Options Modal (MODIFIED) */}
      {isDeployModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card wide-modal">
            <h3>Deploy Options: {deployAssessmentDetails.type}</h3>
            {deployError && <p className="error-message">{deployError}</p>}
            <div className="modal-body scrollable-modal-body deploy-options-body">
              {/* Recipient Selection */}
              <div className="recipient-selection">
                <h4>Select Recipients</h4>
                <div className="recipient-columns">
                  <div className="recipient-column">
                    <h5>Groups</h5>
                    {DUMMY_GROUPS.map(group => (
                      <div key={group.id} className="checkbox-option">
                        <input
                          type="checkbox"
                          id={`group-${group.id}`}
                          checked={selectedGroups.includes(group.id)}
                          onChange={() => handleGroupToggle(group.id)}
                        />
                        <label htmlFor={`group-${group.id}`}>{group.name}</label>
                      </div>
                    ))}
                  </div>
                  <div className="recipient-column">
                    <h5>Individual Users</h5>
                    {DUMMY_USERS.map(user => (
                      <div key={user.id} className="checkbox-option">
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserToggle(user.id)}
                        />
                        <label htmlFor={`user-${user.id}`}>{user.name} ({user.email})</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Schedule Deployment */}
              <div className="schedule-deployment form-group">
                <h4>Schedule Deployment (Optional)</h4>
                <label htmlFor="deploy-schedule">Deploy on:</label>
                <input
                  type="datetime-local"
                  id="deploy-schedule"
                  value={deployScheduleDate}
                  onChange={(e) => setDeployScheduleDate(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="action-button" onClick={closeDeployModal}>Cancel</button>
              <button
                className="action-button primary"
                onClick={handleDeployAssessment}
                disabled={selectedGroups.length === 0 && selectedUsers.length === 0}
              >
                Confirm & Deploy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal (NEW) */}
      {isCompletionModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card wide-modal">
            <h3>Complete Assessment: {completionAssessmentDetails.type}</h3>
            {completionError && <p className="error-message">{completionError}</p>}
            <div className="modal-body scrollable-modal-body">
              {renderAssessmentContent(completionAssessmentDetails.content, 'complete', currentAnswers, handleAnswerChange)}
            </div>
            <div className="modal-actions">
              <button className="action-button" onClick={closeCompletionModal}>Cancel</button>
              <button className="action-button primary" onClick={handleSubmitAnswers}>Submit Answers</button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal (NEW) */}
      {isResultsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card wide-modal">
            <h3>Assessment Results: {resultsDetails.type}</h3>
            <div className="modal-body scrollable-modal-body">
              {resultsDetails.type === 'ADKAR Assessment (Initial)' && prepareAdkarChartData(resultsDetails) ? (
                <div className="chart-container" style={{ height: '400px' }}>
                  <Radar data={prepareAdkarChartData(resultsDetails)} options={radarChartOptions} />
                </div>
              ) : resultsDetails.results ? (
                 renderAssessmentContent(DUMMY_ASSESSMENT_CONTENT[resultsDetails.type] || [], 'results', resultsDetails.results)
              ) : (
                <p>No results data available for this assessment.</p>
              )}
            </div>
            <div className="modal-actions">
              <button className="action-button primary" onClick={closeResultsModal}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Assessments;

