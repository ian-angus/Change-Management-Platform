import React, { useState, useEffect, useCallback } from 'react';
// import './SettingsEmployeeManagement.css'; // Add CSS if needed

function SettingsEmployeeManagement({ apiBaseUrl }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Fetch all employees
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/employees`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadError(null);
    setUploadSuccess(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Assuming a backend endpoint exists at POST /employees/upload
      const response = await fetch(`${apiBaseUrl}/employees/upload`, {
        method: 'POST',
        body: formData,
        // No 'Content-Type' header needed, browser sets it for FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }

      const result = await response.json();
      setUploadSuccess(result.message || 'File uploaded successfully!');
      setFile(null); // Clear the file input
      document.getElementById('employee-file-input').value = ''; // Reset file input visually
      fetchEmployees(); // Refresh the employee list
    } catch (err) {
      console.error("File upload failed:", err);
      setUploadError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="settings-page settings-employee-management">
      <h2>Settings: Employee Management</h2>
      <p>View, add, or update employee information. You can upload a CSV file with employee data.</p>

      <div className="employee-upload-section">
        <h4>Upload Employee File</h4>
        <p>Upload a CSV file with columns: Name, Email, Role (matching existing role names or IDs).</p>
        <input type="file" id="employee-file-input" accept=".csv" onChange={handleFileChange} disabled={uploading} />
        <button onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
        {uploading && <p>Uploading, please wait...</p>}
        {uploadError && <p className="error-message">{uploadError}</p>}
        {uploadSuccess && <p className="success-message">{uploadSuccess}</p>}
      </div>

      <div className="employee-list-section">
        <h4>Current Employees</h4>
        {error && <p className="error-message">{error}</p>}
        {loading && <p>Loading employees...</p>}
        {!loading && !error && (
          <>
            {employees.length > 0 ? (
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    {/* Add Actions column later */}
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>{emp.email}</td>
                      <td>{emp.role_name || 'N/A'}</td>
                      {/* Add Edit/Delete actions later */}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No employees found.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SettingsEmployeeManagement;

