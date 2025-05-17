import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function TakeAssessmentModal({ isOpen, onClose, assessment, mode = 'take', userResult = {} }) {
  const [answers, setAnswers] = useState(userResult.answers || {});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 mt-24 flex flex-col"
        style={{ maxHeight: '80vh' }}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold m-0">{assessment.title || assessment.assessment_type || 'Assessment (No Title)'}</h2>
            {(assessment.template && assessment.template.description) || assessment.description ? (
              <p className="text-gray-600 mt-1">{(assessment.template && assessment.template.description) || assessment.description}</p>
            ) : (
              <p className="text-gray-400 mt-1">No description provided.</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="Close"
            type="button"
          >
            &times;
          </button>
        </div>
        {/* Divider below header/description */}
        <div className="w-full border-t border-gray-200" />
        {/* Modal Content */}
        <div className="p-8 overflow-y-auto bg-gray-50 rounded-b-2xl" style={{ flex: 1 }}>
          <form onSubmit={handleSubmit} className="space-y-8">
            {questions.length === 0 ? (
              <div>No questions found.</div>
            ) : (
              questions.map(q => (
                <div key={q.id} className="mb-6">
                  <label className="block font-bold text-lg mb-2 text-gray-800">{q.text}</label>
                  {isView ? (
                    <div className="bg-gray-100 rounded px-3 py-2 min-h-[2.5em]">{answers[q.id] || <span className="text-gray-400">No answer</span>}</div>
                  ) : q.type === 'radio' && Array.isArray(q.options) ? (
                    <div className="flex flex-wrap gap-6 mb-2">
                      {q.options.map(opt => (
                        <label key={opt} className="inline-flex items-center gap-2 cursor-pointer text-base">
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => handleChange(q.id, opt)}
                            disabled={isSubmitting}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : q.type === 'textarea' ? (
                    <textarea
                      className="w-full border rounded px-3 py-2 min-h-[3em] bg-white"
                      value={answers[q.id] || ''}
                      onChange={e => handleChange(q.id, e.target.value)}
                      disabled={isSubmitting}
                      placeholder={q.placeholder || ''}
                    />
                  ) : (
                    <input
                      type="text"
                      className="w-full border rounded px-3 py-2 bg-white"
                      value={answers[q.id] || ''}
                      onChange={e => handleChange(q.id, e.target.value)}
                      disabled={isSubmitting}
                      placeholder={q.placeholder || ''}
                    />
                  )}
                  {q.helper_text && <div className="text-gray-500 text-xs mt-1">{q.helper_text}</div>}
                </div>
              ))
            )}
            {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
            <div className="flex justify-end gap-4 mt-8">
              <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300 transition-colors" disabled={isSubmitting}>
                Close
              </button>
              {!isView && (
                <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition-colors" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
} 