import React, { useState, useCallback } from 'react';
import axios from 'axios';
import './EmployeeUpload.css'; // Create this CSS file

const EmployeeUpload = ({ onUploadSuccess, apiBaseUrl }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadResponse, setUploadResponse] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setUploadError(null);
        setUploadResponse(null);
    };

    const handleUpload = useCallback(async () => {
        if (!selectedFile) {
            setUploadError('Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        setUploading(true);
        setUploadError(null);
        setUploadResponse(null);

        try {
            const response = await axios.post(`${apiBaseUrl}/employees/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUploadResponse(response.data);
            // alert('File uploaded successfully!'); // Or use a toast notification
            if (onUploadSuccess) {
                onUploadSuccess(); // Callback to refresh employee list
            }
        } catch (err) {
            console.error('Error uploading file:', err);
            if (err.response && err.response.data && err.response.data.error) {
                setUploadError(err.response.data.error);
            } else {
                setUploadError('Failed to upload file. Please try again.');
            }
            // alert('Failed to upload file.');
        }
        setUploading(false);
        setSelectedFile(null); // Clear the file input after attempt
        if (document.getElementById('employee-file-input')) {
            document.getElementById('employee-file-input').value = '';
        }
    }, [selectedFile, apiBaseUrl, onUploadSuccess]);

    return (
        <div className="employee-upload-container">
            <h4>Upload Employee Spreadsheet</h4>
            <div className="upload-area">
                <input 
                    type="file" 
                    id="employee-file-input"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                    onChange={handleFileChange} 
                />
                <button onClick={handleUpload} disabled={!selectedFile || uploading}>
                    {uploading ? 'Uploading...' : 'Upload File'}
                </button>
            </div>
            {uploadError && <div className="upload-error-message">{uploadError}</div>}
            {uploadResponse && (
                <div className="upload-response">
                    <p>{uploadResponse.message}</p>
                    {uploadResponse.imported_count !== undefined && <p>Imported: {uploadResponse.imported_count}</p>}
                    {uploadResponse.skipped_count !== undefined && <p>Skipped: {uploadResponse.skipped_count}</p>}
                    {uploadResponse.errors && uploadResponse.errors.length > 0 && (
                        <div>
                            <p>Errors/Warnings:</p>
                            <ul>
                                {uploadResponse.errors.map((err, index) => (
                                    <li key={index}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmployeeUpload;

