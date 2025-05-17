import React, { useState, useEffect } from 'react';
import { Modal, Table, Badge } from 'react-bootstrap';
import apiClient from '../../apiClient';
import './MessageHistoryModal.css';

const MessageHistoryModal = ({ show, onHide, messageId }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (show && messageId) {
            fetchHistory();
        }
    }, [show, messageId]);

    const fetchHistory = async () => {
        try {
            const response = await apiClient.get(`/key-messages/${messageId}/history`);
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching message history:', error);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'Draft': 'secondary',
            'Approved': 'success',
            'Archived': 'dark'
        };
        return <Badge bg={variants[status]}>{status}</Badge>;
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Message History</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Version</th>
                            <th>Title</th>
                            <th>Supporting Statement</th>
                            <th>Tone/Purpose</th>
                            <th>Stage</th>
                            <th>Status</th>
                            <th>Changed By</th>
                            <th>Changed At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(record => (
                            <tr key={record.id}>
                                <td>v{record.version}</td>
                                <td>{record.title}</td>
                                <td className="supporting-statement">{record.supporting_statement}</td>
                                <td>{record.tone_purpose}</td>
                                <td>{record.stage_tag}</td>
                                <td>{getStatusBadge(record.status)}</td>
                                <td>{record.changed_by?.name || 'Unknown'}</td>
                                <td>{new Date(record.changed_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Modal.Body>
        </Modal>
    );
};

export default MessageHistoryModal; 