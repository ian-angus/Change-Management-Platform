// /home/ubuntu/melyn_cm_platform/frontend/src/pages/Settings.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Settings.css'; // Create this CSS file later
import { FaUser, FaCreditCard, FaFileInvoiceDollar, FaBell, FaLock } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import SubscriptionPlan from "../components/SubscriptionPlan";
import InvoiceHistory from "../components/InvoiceHistory";
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = '/api'; // Use relative path

const settingsSections = [
  { id: "profile", name: "Profile", icon: FaUser },
  { id: "subscription", name: "Subscription", icon: FaCreditCard },
  { id: "invoices", name: "Invoices", icon: FaFileInvoiceDollar },
  { id: "notifications", name: "Notifications", icon: FaBell },
  { id: "security", name: "Security", icon: FaLock },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("profile");
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    role: "",
    phone: "",
    title: "",
    department: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Load user data from localStorage
    const userData = JSON.parse(localStorage.getItem("brightfoldUser") || "{}");
    setUser(userData);
    setFormData({
      name: userData.name || "",
      email: userData.email || "",
      organization: userData.organization || "",
      role: userData.role || "",
      phone: userData.phone || "",
      title: userData.title || "",
      department: userData.department || "",
    });
  }, []);

  const fetchEmployees = () => {
    setLoadingEmployees(true);
    setError(null);
    axios.get(`${API_BASE_URL}/employees`)
      .then(response => {
        setEmployees(response.data.employees);
      })
      .catch(err => {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees. Please try again.');
      })
      .finally(() => {
        setLoadingEmployees(false);
      });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save to localStorage (replace with API call in production)
    localStorage.setItem("brightfoldUser", JSON.stringify({ ...user, ...formData }));
    setSuccessMessage("Profile updated successfully!");
    setIsEditing(false);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setSuccessMessage(null); // Clear previous messages
    setError(null);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    axios.post(`${API_BASE_URL}/employees/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        setSuccessMessage(response.data.message || 'File uploaded successfully!');
        setSelectedFile(null); // Clear file input
        document.getElementById('employee-file-input').value = ''; // Reset file input visually
        fetchEmployees(); // Refresh the employee list
      })
      .catch(err => {
        console.error('Error uploading file:', err);
        const errorMsg = err.response?.data?.error || 'File upload failed.';
        const errorDetails = err.response?.data?.details;
        if (errorDetails && Array.isArray(errorDetails)) {
          setError(`${errorMsg}: ${errorDetails.join(' ')}`);
        } else {
          setError(errorMsg);
        }
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  // Placeholder functions for Edit/Delete - Implement later
  const handleEditEmployee = (employeeId) => {
    console.log(`Edit employee ${employeeId}`);
    // TODO: Implement edit functionality (e.g., open modal)
    setError('Edit functionality not yet implemented.');
    setTimeout(() => setError(null), 3000);
  };

  const handleDeleteEmployee = (employeeId, employeeName) => {
    console.log(`Delete employee ${employeeId}`);
    if (window.confirm(`Are you sure you want to delete employee "${employeeName}"?`)) {
      axios.delete(`${API_BASE_URL}/employees/${employeeId}`)
        .then(response => {
          setSuccessMessage(response.data.message || 'Employee deleted successfully!');
          fetchEmployees(); // Refresh list
          setTimeout(() => setSuccessMessage(null), 3000);
        })
        .catch(err => {
          console.error('Error deleting employee:', err);
          setError(err.response?.data?.error || 'Failed to delete employee.');
          setTimeout(() => setError(null), 5000);
        });
    } else {
      console.log('Deletion cancelled.');
    }
  };

  if (loading) {
    return <div className="settings-loading">Loading settings...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
              <nav className="space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    {section.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeSection === "profile" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Profile Information</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {successMessage && (
                  <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
                    {successMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {activeSection === "subscription" && <SubscriptionPlan />}

            {activeSection === "invoices" && <InvoiceHistory />}

            {activeSection === "notifications" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h3>
                {/* Notification settings will go here */}
              </div>
            )}

            {activeSection === "security" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h3>
                {/* Security settings will go here */}
              </div>
            )}

            {/* Section 1: Employee Management */}
            <div className="settings-section card">
              <h2>Settings: Employee Management</h2>
              <p>Upload, view, and manage employees for your organization.</p>

              {/* Upload Area */} 
              <div className="upload-area form-group">
                <label htmlFor="employee-file-input">Upload Employee Spreadsheet (.xlsx, .csv):</label>
                <div className="upload-controls">
                  <input
                    type="file"
                    id="employee-file-input"
                    accept=".xlsx, .csv"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  <button
                    className="action-button primary"
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
                <p className="form-text text-muted">
                  Required columns: Name, Email address, Department, Role.
                </p>
              </div>

              {/* Status Messages */} 
              {successMessage && <div className="success-message"><p>{successMessage}</p></div>}
              {error && <div className="error-message"><p>{error}</p></div>}

              {/* Employee Table */} 
              <div className="employee-table-container">
                <h4>Current Employees</h4>
                {loadingEmployees ? (
                  <p>Loading employees...</p>
                ) : employees.length === 0 && !error ? (
                  <p>No employees found. Upload a spreadsheet to add employees.</p>
                ) : (
                  <table className="settings-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(emp => (
                        <tr key={emp.id}>
                          <td>{emp.name}</td>
                          <td>{emp.email}</td>
                          <td>{emp.department || 'N/A'}</td>
                          <td>{emp.role || 'N/A'}</td>
                          <td className="action-buttons">
                            <button
                              className="icon-button edit-button"
                              onClick={() => handleEditEmployee(emp.id)}
                              title="Edit Employee"
                            >
                              {/* Add Edit Icon later */}
                              Edit
                            </button>
                            <button
                              className="icon-button delete-button"
                              onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                              title="Delete Employee"
                            >
                              {/* Add Delete Icon later */}
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Section 2: Group Management */}
            <div className="settings-section card">
              <h2>Settings: Group Management</h2>
              <p>Create, view, and manage stakeholder groups for your organization.</p>
              {/* Add your group management UI here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

