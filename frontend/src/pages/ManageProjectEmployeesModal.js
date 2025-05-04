import React, { useState, useEffect, useCallback } from 'react';
import './ManageProjectEmployeesModal.css'; // Create this CSS file for styling

function ManageProjectEmployeesModal({ project, apiBaseUrl, onClose }) {
  const [projectEmployees, setProjectEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loadingProjectEmployees, setLoadingProjectEmployees] = useState(true);
  const [loadingAllEmployees, setLoadingAllEmployees] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  // Fetch employees currently in the project
  const fetchProjectEmployees = useCallback(async () => {
    setLoadingProjectEmployees(true);
    try {
      const response = await fetch(`${apiBaseUrl}/projects/${project.id}/employees`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setProjectEmployees(data);
    } catch (err) {
      console.error("Failed to fetch project employees:", err);
      setError("Failed to load project employees.");
    } finally {
      setLoadingProjectEmployees(false);
    }
  }, [apiBaseUrl, project.id]);

  // Fetch all employees for adding
  const fetchAllEmployees = useCallback(async () => {
    setLoadingAllEmployees(true);
    try {
      const response = await fetch(`${apiBaseUrl}/employees`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setAllEmployees(data);
    } catch (err) {
      console.error("Failed to fetch all employees:", err);
      setError("Failed to load all employees.");
    } finally {
      setLoadingAllEmployees(false);
    }
  }, [apiBaseUrl]);

  // Fetch all roles for adding by role
  const fetchRoles = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const response = await fetch(`${apiBaseUrl}/roles`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setRoles(data);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      setError("Failed to load roles.");
    } finally {
      setLoadingRoles(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchProjectEmployees();
    fetchAllEmployees();
    fetchRoles();
  }, [fetchProjectEmployees, fetchAllEmployees, fetchRoles]);

  const handleAddEmployee = async (employeeId) => {
    try {
      const response = await fetch(`${apiBaseUrl}/projects/${project.id}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: employeeId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      // Refetch project employees to update the list
      fetchProjectEmployees();
    } catch (err) {
      console.error("Failed to add employee:", err);
      setError(`Failed to add employee: ${err.message}`);
    }
  };

  const handleAddByRole = async () => {
    if (!selectedRole) return;
    const roleId = parseInt(selectedRole, 10);
    const employeesInRole = allEmployees.filter(emp => emp.role_id === roleId);
    const projectEmployeeIds = projectEmployees.map(emp => emp.id);

    // Filter out employees already in the project
    const employeesToAdd = employeesInRole.filter(emp => !projectEmployeeIds.includes(emp.id));

    if (employeesToAdd.length === 0) {
        setError("All employees with this role are already in the project.");
        return;
    }

    setError(null); // Clear previous errors

    // Add employees one by one (or modify backend to accept multiple)
    for (const employee of employeesToAdd) {
        await handleAddEmployee(employee.id);
        // Add a small delay if needed to avoid overwhelming the server, though likely unnecessary
        // await new Promise(resolve => setTimeout(resolve, 100));
    }
    // Optionally show a success message after adding all
  };

  // Filter employees available to add (not already in project)
  const availableEmployees = allEmployees.filter(emp =>
    !projectEmployees.some(projEmp => projEmp.id === emp.id) &&
    (emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     emp.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Manage Employees for {project.name}</h3>
        <button onClick={onClose} className="close-modal-btn">&times;</button>

        {error && <p className="error-message">{error}</p>}

        <div className="modal-section">
          <h4>Current Project Employees</h4>
          {loadingProjectEmployees ? (
            <p>Loading...</p>
          ) : projectEmployees.length > 0 ? (
            <ul className="employee-list current-employees">
              {projectEmployees.map(emp => (
                <li key={emp.id}>{emp.name} ({emp.email})
                  {/* Add Remove button later */}
                  {/* <button onClick={() => handleRemoveEmployee(emp.id)}>Remove</button> */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No employees assigned to this project yet.</p>
          )}
        </div>

        <div className="modal-section add-employees-section">
          <h4>Add Employees</h4>
          <div className="add-by-search">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {loadingAllEmployees ? (
              <p>Loading employees...</p>
            ) : availableEmployees.length > 0 ? (
              <ul className="employee-list available-employees">
                {availableEmployees.map(emp => (
                  <li key={emp.id}>
                    {emp.name} ({emp.email})
                    <button onClick={() => handleAddEmployee(emp.id)} className="add-btn">Add</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No matching employees found or all are already added.</p>
            )}
          </div>

          <div className="add-by-role">
            <h5>Add by Role</h5>
            {loadingRoles ? (
                <p>Loading roles...</p>
            ) : (
                <>
                    <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="role-select">
                        <option value="" disabled>Select a role</option>
                        {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                    <button onClick={handleAddByRole} disabled={!selectedRole} className="add-role-btn">
                        Add All with Role
                    </button>
                </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default ManageProjectEmployeesModal;

