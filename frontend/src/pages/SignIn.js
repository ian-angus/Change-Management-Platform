import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import axios from 'axios';

export default function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting to sign in with:', { email: form.email }); // Debug log
      const response = await axios.post('/api/auth/login', form);
      console.log('Sign in response:', response.data); // Debug log
      
      const { access_token, user } = response.data;
      
      // Store the token and user info
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('brightfoldUser', JSON.stringify(user));
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Sign in error:', err.response?.data || err); // Debug log
      setError(err.response?.data?.error || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setForgotPasswordMessage('');
    setError('');

    if (!form.email) {
      setError('Please enter your email address');
      return;
    }

    try {
      const response = await axios.post('/api/auth/forgot-password', { email: form.email });
      setForgotPasswordMessage(
        <div>
          <p>{response.data.message}</p>
          <p className="mt-2">Click the link below to reset your password:</p>
          <a 
            href={response.data.reset_link}
            className="text-blue-700 hover:text-blue-800 underline break-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            {response.data.reset_link}
          </a>
        </div>
      );
      // Clear the email field after successful submission
      setForm({ ...form, email: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process request. Please try again.');
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close sign in form"
        >
          <IoClose size={24} />
        </button>

        <h2 className="text-3xl font-bold text-blue-900 mb-6">
          {showForgotPassword ? 'Reset Password' : 'Sign In'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {forgotPasswordMessage && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            {forgotPasswordMessage}
          </div>
        )}

        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-sm text-blue-700 hover:text-blue-800 font-medium"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-700 hover:text-blue-800 font-medium"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-blue-700 hover:text-blue-800 font-medium"
              >
                Create one
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 