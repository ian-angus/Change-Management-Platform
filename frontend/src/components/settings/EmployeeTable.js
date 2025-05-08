import React from 'react';
import './EmployeeTable.css'; // Create this CSS file

const EmployeeTable = ({ 
    employees, 
    onEdit, 
    onDelete, 
    // TODO: Add props for pagination, sorting, filtering if handled by this component
    // For now, assume parent handles data fetching and filtering
}) => {

    if (!employees || employees.length === 0) {
        return <p>No employees found.</p>;
    }

    return (
        <div className="employee-table-container">
            <table className="employee-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Date Added</th>
                        <th>Source</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((employee) => (
                        <tr key={employee.id}>
                            <td>{employee.name}</td>
                            <td>{employee.email}</td>
                            <td>{employee.department || 'N/A'}</td>
                            <td>{employee.role_name || 'N/A'}</td>
                            <td>{employee.date_added ? new Date(employee.date_added).toLocaleDateString() : 'N/A'}</td>
                            <td>{employee.source || 'N/A'}</td>
                            <td>
                                <button onClick={() => onEdit(employee)} className="action-btn edit-btn">
                                    Edit
                                </button>
                                <button onClick={() => onDelete(employee.id)} className="action-btn delete-btn">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* TODO: Add pagination controls if needed */}
        </div>
    );
};

export default EmployeeTable;

