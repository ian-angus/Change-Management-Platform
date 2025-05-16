import React, { useState } from 'react';

export default function TakeAssessmentModal({ isOpen, onClose, assessment, mode = 'take', userResult = {} }) {
  const [answers, setAnswers] = useState(userResult.answers || {});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !assessment) return null;

  const questions = assessment.questions || [];
  const isView = mode === 'view';

  const handleChange = (qid, value) => {
    setAnswers({ ...answers, [qid]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await assessment.onSubmit(answers);
      onClose();
    } catch (err) {
      setError('Failed to submit assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors">&times;</button>
        <h2 className="text-2xl font-bold mb-4">{assessment.title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {questions.length === 0 ? (
            <div>No questions found.</div>
          ) : (
            questions.map(q => (
              <div key={q.id} className="mb-2">
                <label className="block font-medium mb-1">{q.text}</label>
                {isView ? (
                  <div className="bg-gray-100 rounded px-3 py-2">{answers[q.id] || <span className="text-gray-400">No answer</span>}</div>
                ) : (
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={answers[q.id] || ''}
                    onChange={e => handleChange(q.id, e.target.value)}
                    disabled={isSubmitting}
                  />
                )}
              </div>
            ))
          )}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {!isView && (
            <button type="submit" className="w-full bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition-colors" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
} 