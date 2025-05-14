import React, { useEffect, useState } from 'react';
import { FaPencilAlt, FaCheck } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

const plans = [
  { name: 'Free', price: '$0', features: ['Basic features', 'Up to 5 users'], current: false },
  { name: 'Professional', price: '$49', features: ['All Free features', 'Advanced analytics', 'Priority support'], current: true },
  { name: 'Enterprise', price: 'Custom', features: ['All Professional features', 'Unlimited users', 'Dedicated support'], current: false },
];

const mockInvoices = [
  { id: 'INV-2024-001', date: '2024-06-01', amount: '$49.00', status: 'Paid' },
  { id: 'INV-2024-002', date: '2024-05-01', amount: '$49.00', status: 'Paid' },
];

export default function Profile() {
  const [user, setUser] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [success, setSuccess] = useState('');
  const [pwForm, setPwForm] = useState({ password: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('brightfoldUser') || '{}');
    setUser(userData);
    setForm(userData);
  }, []);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => { setEditMode(false); setForm(user); };
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = e => {
    e.preventDefault();
    setUser(form);
    localStorage.setItem('brightfoldUser', JSON.stringify(form));
    setEditMode(false);
    setSuccess('Profile updated!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handlePwChange = e => setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  const handlePwSave = e => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (pwForm.password.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }
    if (pwForm.password !== pwForm.confirm) {
      setPwError('Passwords do not match.');
      return;
    }
    setPwSuccess('Password changed successfully!');
    setPwForm({ password: '', confirm: '' });
    setTimeout(() => setPwSuccess(''), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl mb-8 relative">
        {/* Close Button (absolute, always top-right) */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl z-10"
          onClick={() => navigate('/dashboard')}
          aria-label="Close profile"
        >
          <IoClose />
        </button>
        <div className="flex items-center justify-between mb-6 pr-10"> {/* Add pr-10 to avoid overlap with absolute close */}
          <h2 className="text-2xl font-bold text-blue-900">My Profile</h2>
          <div className="flex gap-2 items-center">
            {!editMode && (
              <button onClick={handleEdit} className="text-blue-700 hover:text-blue-900 p-2 rounded-full" aria-label="Edit Profile">
                <FaPencilAlt size={20} />
              </button>
            )}
            {editMode && (
              <>
                <button type="button" onClick={handleCancel} className="text-gray-400 hover:text-gray-700 p-2 rounded-full" aria-label="Cancel Edit">
                  <IoClose size={22} />
                </button>
                <button type="button" onClick={handleSave} className="text-green-600 hover:text-green-800 p-2 rounded-full" aria-label="Save Profile">
                  <FaCheck size={20} />
                </button>
              </>
            )}
          </div>
        </div>
        {success && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{success}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['name','email','organization','role','phone','title','department'].map(field => (
              <div key={field}>
                <label className="block text-gray-500 text-sm mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                <input
                  type="text"
                  name={field}
                  value={form[field] || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            ))}
          </div>
        </form>
      </div>

      {/* Subscription Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl mb-8">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">Subscription</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.name}
              className={`rounded-xl p-6 border-2 shadow-sm flex flex-col items-start gap-2 ${plan.current ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-lg font-bold ${plan.current ? 'text-blue-900' : 'text-gray-900'}`}>{plan.name}</span>
                {plan.current && <span className="ml-2 px-2 py-0.5 text-xs rounded bg-blue-600 text-white">Current</span>}
              </div>
              <div className="text-2xl font-bold mb-2">{plan.price}</div>
              <ul className="mb-4 space-y-1">
                {plan.features.map(f => <li key={f} className="text-gray-700 text-sm">• {f}</li>)}
              </ul>
              {!plan.current && <button className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm">Choose</button>}
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl mb-8">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">Invoices</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
                <th className="py-2 px-4 font-semibold">Invoice #</th>
                <th className="py-2 px-4 font-semibold">Date</th>
                <th className="py-2 px-4 font-semibold">Amount</th>
                <th className="py-2 px-4 font-semibold">Status</th>
                <th className="py-2 px-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map(inv => (
                <tr key={inv.id} className="border-t">
                  <td className="py-2 px-4">{inv.id}</td>
                  <td className="py-2 px-4">{inv.date}</td>
                  <td className="py-2 px-4">{inv.amount}</td>
                  <td className="py-2 px-4">{inv.status}</td>
                  <td className="py-2 px-4">
                    <button className="text-blue-700 hover:underline">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl mb-8">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">Change Password</h3>
        <form onSubmit={handlePwSave} className="space-y-4 max-w-md">
          <div>
            <label className="block text-gray-500 text-sm mb-1">New Password</label>
            <input
              type="password"
              name="password"
              value={pwForm.password}
              onChange={handlePwChange}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirm"
              value={pwForm.confirm}
              onChange={handlePwChange}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              minLength={8}
              required
            />
          </div>
          {pwError && <div className="text-red-600 text-sm">{pwError}</div>}
          {pwSuccess && <div className="text-green-600 text-sm">{pwSuccess}</div>}
          <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors">Change Password</button>
        </form>
      </div>
    </div>
  );
} 