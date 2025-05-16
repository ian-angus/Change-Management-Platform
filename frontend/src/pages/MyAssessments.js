import React, { useEffect, useState } from 'react';
import apiClient from '../apiClient';
import { FaLock, FaUnlock, FaPlay, FaEye } from 'react-icons/fa';
import TakeAssessmentModal from '../components/assessment/TakeAssessmentModal';

const MyAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('take'); // 'take' or 'view'
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [userResult, setUserResult] = useState({});

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = () => {
    setLoading(true);
    apiClient.get('/my-assessments')
      .then(res => {
        setAssessments(res.data.assessments || []);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load assessments');
        setLoading(false);
      });
  };

  // Helper to fetch template questions by assessment_type
  const fetchQuestions = async (assessmentType) => {
    // Get all templates, find by name
    const templatesRes = await apiClient.get('/assessment-templates');
    const template = (templatesRes.data.templates || []).find(t => t.name === assessmentType);
    if (!template) throw new Error('Template not found');
    // Get questions for this template
    const templateDetail = await apiClient.get(`/assessment-templates/${template.id}`);
    return templateDetail.data.questions || [];
  };

  // Helper to fetch user result for an assessment
  const fetchUserResult = async (assessmentId) => {
    // For now, just return empty; backend endpoint for per-user results can be added
    return {};
  };

  // Helper to submit answers
  const submitAnswers = async (assessmentId, answers) => {
    // PATCH or POST to /api/assessments/<id>/submit or similar (to be implemented in backend)
    await apiClient.post(`/assessments/${assessmentId}/submit`, { answers });
    fetchAssessments();
  };

  const handleLaunch = async (assessment) => {
    try {
      setError(null);
      setModalMode('take');
      setActiveAssessment(null);
      setActiveQuestions([]);
      setUserResult({});
      const questions = await fetchQuestions(assessment.title);
      setActiveAssessment({ ...assessment, questions, onSubmit: (answers) => submitAnswers(assessment.id, answers) });
      setActiveQuestions(questions);
      setShowModal(true);
    } catch (err) {
      setError('Failed to load assessment questions.');
    }
  };

  const handleView = async (assessment) => {
    try {
      setError(null);
      setModalMode('view');
      setActiveAssessment(null);
      setActiveQuestions([]);
      // Fetch questions and user result
      const questions = await fetchQuestions(assessment.title);
      const userResult = await fetchUserResult(assessment.id);
      setActiveAssessment({ ...assessment, questions, onSubmit: () => {}, });
      setActiveQuestions(questions);
      setUserResult(userResult);
      setShowModal(true);
    } catch (err) {
      setError('Failed to load assessment for viewing.');
    }
  };

  return (
    <div className="my-assessments-page">
      <h2>My Assessments</h2>
      {/* Placeholder for notification banner */}
      {/* <NotificationBanner /> */}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <table className="my-assessments-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {assessments.length === 0 ? (
              <tr><td colSpan={4}>No assessments assigned to you.</td></tr>
            ) : (
              assessments.map(a => {
                let status = a.locked ? 'Locked' : (a.status === 'taken' ? 'Taken' : 'Unlocked');
                let canLaunch = !a.locked && a.status !== 'taken';
                let canView = a.status === 'taken';
                return (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{a.due_time ? new Date(a.due_time).toLocaleString() : '-'}</td>
                    <td>
                      {status === 'Locked' && <FaLock title="Locked" />} 
                      {status === 'Unlocked' && <FaUnlock title="Unlocked" />} 
                      {status === 'Taken' && <FaEye title="Taken" />} 
                    </td>
                    <td>
                      {canLaunch ? (
                        <button className="launch-btn" onClick={() => handleLaunch(a)}><FaPlay /> Launch</button>
                      ) : canView ? (
                        <button className="view-btn" onClick={() => handleView(a)}><FaEye /> View</button>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
      <TakeAssessmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        assessment={activeAssessment}
        mode={modalMode}
        userResult={userResult}
      />
    </div>
  );
};

export default MyAssessments; 