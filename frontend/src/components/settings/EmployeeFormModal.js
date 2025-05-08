import React, { useState, useEffect } from 'react';
import './EmployeeFormModal.css'; // Create this CSS file

const EmployeeFormModal = ({ employee, roles, onClose, onSave, apiBaseUrl }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        role_id: '' // Store role_id for submission
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (employee) {
            setFormData({
                name: employee.name || '',
                email: employee.email || '',
                department: employee.department || '',
                role_id: employee.role_id || ''
            });
        } else {
            setFormData({
                name: '',
                email: '',
                department: '',
                role_id: ''
            });
        }
        setFormErrors({}); // Clear errors when modal opens or employee changes
    }, [employee]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Basic real-time validation feedback (optional)
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Name is required.';
        if (!formData.email.trim()) {
            errors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid.';
        }
        // Add other validations as needed (e.g., department, role)
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            await onSave(formData); // Parent component handles actual API call
            // onClose(); // Parent will close on successful save from its own logic
        } catch (error) {
            // Error is typically handled by the parent `onSave` function which calls the API
            // If onSave doesn't throw or if we want modal-specific error display:
            // setFormErrors({ submit: 'Failed to save employee. Please try again.' });
            console.error("Error in form submission (modal level):", error);
        }
        setIsSaving(false);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>{employee ? 'Edit Employee' : 'Add New Employee'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name <span className="required">*</span></label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                        />
                        {formErrors.name && <span className="error-text">{formErrors.name}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email <span className="required">*</span></label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                        />
                        {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="department">Department</label>
                        <input 
                            type="text" 
                            id="department" 
                            name="department" 
                            value={formData.department} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role_id">Role</label>
                        <select 
                            id="role_id" 
                            name="role_id" 
                            value={formData.role_id} 
                            onChange={handleChange}
                        >
                            <option value="">Select Role</option>
                            {roles && roles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                    </div>
                    {formErrors.submit && <div className="error-text submit-error">{formErrors.submit}</div>}
                    <div className="form-actions">
                        <button type="submit" className="btn-save" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Employee'}
                        </button>
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={isSaving}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeFormModal;

