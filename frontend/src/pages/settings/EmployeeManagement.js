// /home/ubuntu/melyn_cm_platform/frontend/src/pages/settings/EmployeeManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployeeManagement.css'; // Create this CSS file

const API_BASE_URL = '/api'; // Use relative path

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
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
        // Attempt to reset file input visually - might need refinement
        const fileInput = document.getElementById('employee-file-input');
        if (fileInput) fileInput.value = ''; 
        fetchEmployees(); // Refresh the employee list
        setTimeout(() => setSuccessMessage(null), 3000); // Clear success message after 3s
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
        setTimeout(() => setError(null), 5000); // Clear error message after 5s
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
      setError(null); // Clear previous errors
      setSuccessMessage(null);
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

  return (
    <div className="employee-management settings-section card">
      <h1 className="settings-heading-blue">Settings: Employee Management</h1>
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
                      Edit
                    </button>
                    <button
                      className="icon-button delete-button"
                      onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                      title="Delete Employee"
                    >
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
  );
}

export default EmployeeManagement;

