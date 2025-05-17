import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import axios from 'axios';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setIsValidating(false);
      return;
    }

    // Validate token
    axios.post('/api/auth/validate-reset-token', { token })
      .then(response => {
        setIsTokenValid(response.data.valid);
        if (!response.data.valid) {
          setError(response.data.message);
        }
      })
      .catch(err => {
        setError('Failed to validate reset token. Please try again.');
      })
      .finally(() => {
        setIsValidating(false);
      });
  }, [searchParams]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const token = searchParams.get('token');

    try {
      await axios.post('/api/auth/reset-password', {
        token,
        password: form.password
      });
      setSuccess('Password has been reset successfully. You can now log in with your new password.');
      setTimeout(() => navigate('/signin'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isValidating) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
            <p className="mt-4 text-gray-600">Validating reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={() => navigate('/signin')}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close reset password form"
        >
          <IoClose size={24} />
        </button>

        <h2 className="text-3xl font-bold text-blue-900 mb-6">Reset Password</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        {isTokenValid ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">This password reset link is invalid or has expired.</p>
            <button
              onClick={() => navigate('/signin')}
              className="text-blue-700 hover:text-blue-800 font-medium"
            >
              Return to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 