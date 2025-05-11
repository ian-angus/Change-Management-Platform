import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './EmployeeManagement.css';
import EmployeeUpload from './EmployeeUpload';
import EmployeeTable from './EmployeeTable';
import EmployeeFormModal from './EmployeeFormModal';
import DeleteConfirmationModal from './DeleteConfirmationModal'; // Import DeleteConfirmationModal

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false); // State for delete modal
    const [deletingEmployee, setDeletingEmployee] = useState(null); // Employee to be deleted
    const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete operation

    // TODO: Add pagination, search, and filter states & logic
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchParams, setSearchParams] = useState({ name: '', email: '', department: '', role_id: '' });

    const API_BASE_URL = '/api';

    const fetchEmployees = useCallback(async (page = 1, params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({ page, per_page: 10, ...params }).toString();
            const response = await axios.get(`${API_BASE_URL}/employees?${queryParams}`);
            setEmployees(response.data.employees || []);
            setTotalPages(response.data.total_pages || 1);
            setCurrentPage(response.data.current_page || 1);
        } catch (err) {
            setError('Failed to fetch employees. Please try again.');
            console.error("Error fetching employees:", err);
        }
        setLoading(false);
    }, [API_BASE_URL]);

    const fetchRoles = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/roles`);
            setRoles(response.data || []);
        } catch (err) {
            console.error("Error fetching roles:", err);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        fetchEmployees(currentPage, searchParams);
        fetchRoles();
    }, [fetchEmployees, fetchRoles, currentPage, searchParams]);

    const handleAddEmployeeClick = () => {
        setEditingEmployee(null);
        setShowFormModal(true);
    };

    const handleEditEmployeeClick = (employee) => {
        setEditingEmployee(employee);
        setShowFormModal(true);
    };

    const handleDeleteEmployeeClick = (employee) => {
        setDeletingEmployee(employee);
        setShowDeleteModal(true);
    };

    const confirmDeleteEmployee = async () => {
        if (!deletingEmployee) return;
        setIsDeleting(true);
        setError(null);
        try {
            await axios.delete(`${API_BASE_URL}/employees/${deletingEmployee.id}`);
            fetchEmployees(currentPage, searchParams); // Refresh the list
            setShowDeleteModal(false);
            setDeletingEmployee(null);
        } catch (err) {
            setError('Failed to delete employee.');
            console.error("Error deleting employee:", err);
        }
        setIsDeleting(false);
    };

    const handleFormModalClose = () => {
        setShowFormModal(false);
        setEditingEmployee(null);
    };

    const handleFormModalSave = async (employeeData) => {
        // setLoading(true); // Handled by isSaving in modal
        setError(null);
        try {
            if (editingEmployee) {
                await axios.put(`${API_BASE_URL}/employees/${editingEmployee.id}`, employeeData);
            } else {
                await axios.post(`${API_BASE_URL}/employees`, employeeData);
            }
            fetchEmployees(currentPage, searchParams); // Refresh list
            handleFormModalClose();
        } catch (err) {
            const errorMsg = (err.response && err.response.data && err.response.data.error) 
                ? err.response.data.error 
                : (editingEmployee ? 'Failed to update employee.' : 'Failed to add employee.');
            setError(errorMsg); // Set error for display in main component or pass to modal
            console.error("Error saving employee:", err);
            throw err; // Re-throw to be caught by modal's submit handler if needed
        }
        // setLoading(false); // Handled by isSaving in modal
    };
    
    // TODO: Handlers for search and filter changes
    const handleSearchFilterChange = (newSearchParams) => {
        setSearchParams(prev => ({ ...prev, ...newSearchParams }));
        setCurrentPage(1); // Reset to first page on new search/filter
    };

    return (
        <div className="employee-management-container">
            <h2>Employee Management</h2>
            
            {error && <div className="error-message" style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', border: '1px solid #f5c6cb', marginBottom: '15px' }}>{error}</div>}

            <EmployeeUpload onUploadSuccess={() => fetchEmployees(1, searchParams)} apiBaseUrl={API_BASE_URL} />

            <div className="table-controls" style={{ margin: "20px 0" }}>
                {/* Basic Search Example - can be expanded into a separate component */}
                <input 
                    type="text" 
                    placeholder="Search by Name..." 
                    value={searchParams.name}
                    onChange={(e) => handleSearchFilterChange({ name: e.target.value })}
                    style={{ padding: '8px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                {/* Add more filters for email, department, role as needed */}
            </div>

            <button onClick={handleAddEmployeeClick} className="add-employee-btn" style={{ marginBottom: '20px' }}>
                Add New Employee
            </button>

            {loading && !employees.length ? <p>Loading employees...</p> : (
                <EmployeeTable 
                    employees={employees} 
                    onEdit={handleEditEmployeeClick} 
                    onDelete={handleDeleteEmployeeClick} 
                />
            )}
            
            {/* TODO: Pagination controls */}
            {totalPages > 1 && (
                <div className="pagination-controls" style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button onClick={() => fetchEmployees(currentPage - 1, searchParams)} disabled={currentPage <= 1 || loading}>
                        Previous
                    </button>
                    <span style={{ margin: '0 10px' }}>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => fetchEmployees(currentPage + 1, searchParams)} disabled={currentPage >= totalPages || loading}>
                        Next
                    </button>
                </div>
            )}

            {showFormModal && (
                <EmployeeFormModal 
                    employee={editingEmployee} 
                    roles={roles}
                    onClose={handleFormModalClose} 
                    onSave={handleFormModalSave} 
                    apiBaseUrl={API_BASE_URL} // Though onSave now handles API call directly
                />
            )}

            {showDeleteModal && deletingEmployee && (
                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => { setShowDeleteModal(false); setDeletingEmployee(null); }}
                    onConfirm={confirmDeleteEmployee}
                    itemName={deletingEmployee.name}
                    isLoading={isDeleting}
                />
            )}

        </div>
    );
};

export default EmployeeManagement;

