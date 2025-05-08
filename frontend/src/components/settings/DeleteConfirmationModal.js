import React from 'react';
import './DeleteConfirmationModal.css'; // Create this CSS file

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, isLoading }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-backdrop-delete">
            <div className="modal-content-delete">
                <h4>Confirm Deletion</h4>
                <p>Are you sure you want to delete "{itemName || 'this item'}"?</p>
                <p className="warning-text">This action cannot be undone.</p>
                {/* Placeholder for warning if employee is assigned to group/project - for MVP, a generic warning is fine */}
                <div className="form-actions-delete">
                    <button onClick={onConfirm} className="btn-confirm-delete" disabled={isLoading}>
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                    <button onClick={onClose} className="btn-cancel-delete" disabled={isLoading}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;

