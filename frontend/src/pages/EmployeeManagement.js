import React, { useState, useEffect, useCallback, useRef } from 'react';
import './EmployeeManagement.css';

// Reusable Modal Component (as defined previously)
const Modal = ({ show, onClose, title, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="btn-icon" style={{ fontSize: '1.5em' }}>&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null); // For editing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    job_position: ''
  });
  const [apiError, setApiError] = useState(null); // For modal errors
  const [uploadStatus, setUploadStatus] = useState(''); // For bulk upload feedback
  const fileInputRef = useRef(null); // Ref for file input

  const apiBaseUrl = 'http://localhost:5001/api/employees';

  // Fetch Employees Function
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(apiBaseUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} fetching employees`);
      }
      const data = await response.json();
      setEmployees(data);
    } catch (e) {
      console.error("Failed to load employees:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Modal Handling (Add/Edit)
  const openAddModal = () => {
    setCurrentEmployee(null);
    setFormData({ name: '', email: '', department: '', job_position: '' });
    setApiError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (employee) => {
    setCurrentEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      department: employee.department || '',
      job_position: employee.job_position || ''
    });
    setApiError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEmployee(null);
    setApiError(null);
  };

  // Form Handling (Add/Edit)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // API Operations (Add/Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    const url = currentEmployee ? `${apiBaseUrl}/${currentEmployee.id}` : apiBaseUrl;
    const method = currentEmployee ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      closeModal();
      fetchEmployees();
    } catch (e) {
      console.error(`Failed to ${currentEmployee ? 'update' : 'create'} employee:`, e);
      setApiError(e.message);
    }
  };

  // API Operation (Delete)
  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }
    setApiError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/${employeeId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      fetchEmployees();
    } catch (e) {
      console.error(`Failed to delete employee ${employeeId}:`, e);
      setError(`Failed to delete employee: ${e.message}`);
    }
  };

  // Bulk Upload Handling
  const handleUploadClick = () => {
    fileInputRef.current.click(); // Trigger hidden file input
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    setUploadStatus('Uploading...');
    setError(null); // Clear previous main errors

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const response = await fetch(`${apiBaseUrl}/upload`, {
        method: 'POST',
        body: uploadFormData,
        // No 'Content-Type' header for FormData, browser sets it with boundary
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      setUploadStatus(`Upload successful! Added: ${result.processed_count}, Skipped/Errors: ${result.skipped_count}. Check console for details.`);
      if (result.errors && result.errors.length > 0) {
        console.warn("Bulk Upload Errors:", result.errors);
        // Optionally display errors more prominently
      }
      fetchEmployees(); // Refresh list

    } catch (e) {
      console.error("Bulk upload failed:", e);
      setUploadStatus(`Upload failed: ${e.message}`);
    } finally {
      // Reset file input value so the same file can be selected again
      event.target.value = null;
    }
  };

  return (
    <div className="employee-management-page">
      <h2>Employee Management</h2>

      <div className="page-actions">
        <button className="btn btn-primary" onClick={openAddModal}>+ Add Employee</button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }} // Hide the actual input
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" // Accept CSV and Excel
        />
        <button className="btn btn-secondary" style={{ marginLeft: '10px' }} onClick={handleUploadClick}>Upload List</button>
      </div>

      {/* Display Upload Status */}
      {uploadStatus && <p style={{ color: uploadStatus.startsWith('Upload failed') ? 'red' : 'green', margin: '10px 0' }}>{uploadStatus}</p>}

      {loading && <p>Loading employees...</p>}
      {error && <p className="error-message">Error: {error}</p>}

      {!loading && !error && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Job Position</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.department || 'N/A'}</td>
                  <td>{employee.job_position || 'N/A'}</td>
                  <td>
                    <button className="btn-icon" title="Edit Employee" onClick={() => openEditModal(employee)}>✏️</button>
                    <button className="btn-icon" title="Delete Employee" onClick={() => handleDeleteEmployee(employee.id)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No employees found. Use '+ Add Employee' or 'Upload List' to start.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Add/Edit Modal */}
      <Modal show={isModalOpen} onClose={closeModal} title={currentEmployee ? 'Edit Employee' : 'Add New Employee'}>
        <form onSubmit={handleFormSubmit}>
          {apiError && <p className="error-message" style={{ marginBottom: '15px' }}>Error: {apiError}</p>}
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input type="text" id="department" name="department" value={formData.department} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label htmlFor="job_position">Job Position</label>
            <input type="text" id="job_position" name="job_position" value={formData.job_position} onChange={handleInputChange} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-primary">{currentEmployee ? 'Update Employee' : 'Create Employee'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default EmployeeManagement;

