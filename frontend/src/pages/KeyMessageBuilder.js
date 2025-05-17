import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Row, Col, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaHistory, FaCheck, FaArchive } from 'react-icons/fa';
import apiClient from '../apiClient';
import CreateEditMessageModal from '../components/messages/CreateEditMessageModal';
import MessageHistoryModal from '../components/messages/MessageHistoryModal';
import './KeyMessageBuilder.css';

const KeyMessageBuilder = () => {
    const [messages, setMessages] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        stage_tag: '',
        project_id: ''
    });
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMessages();
        fetchProjects();
    }, [filters]);

    const fetchMessages = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.stage_tag) params.append('stage_tag', filters.stage_tag);
            if (filters.project_id) params.append('project_id', filters.project_id);

            const response = await apiClient.get(`/key-messages?${params.toString()}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await apiClient.get('/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleCreateMessage = async (messageData) => {
        try {
            await apiClient.post('/key-messages', messageData);
            setShowCreateModal(false);
            fetchMessages();
        } catch (error) {
            console.error('Error creating message:', error);
        }
    };

    const handleUpdateMessage = async (messageId, messageData) => {
        try {
            await apiClient.put(`/key-messages/${messageId}`, messageData);
            setShowCreateModal(false);
            fetchMessages();
        } catch (error) {
            console.error('Error updating message:', error);
        }
    };

    const handleApproveMessage = async (messageId) => {
        try {
            await apiClient.post(`/key-messages/${messageId}/approve`);
            fetchMessages();
        } catch (error) {
            console.error('Error approving message:', error);
        }
    };

    const handleArchiveMessage = async (messageId) => {
        try {
            await apiClient.post(`/key-messages/${messageId}/archive`);
            fetchMessages();
        } catch (error) {
            console.error('Error archiving message:', error);
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
        <div className="key-message-builder">
            <div className="header">
                <h1>Key Message Builder</h1>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                    <FaPlus /> Create New Message
                </Button>
            </div>

            <Card className="filters-card">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                >
                                    <option value="">All</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Archived">Archived</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Stage</Form.Label>
                                <Form.Select
                                    value={filters.stage_tag}
                                    onChange={(e) => setFilters({ ...filters, stage_tag: e.target.value })}
                                >
                                    <option value="">All</option>
                                    <option value="Early Change">Early Change</option>
                                    <option value="Mid-Project">Mid-Project</option>
                                    <option value="Go-Live">Go-Live</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Project</Form.Label>
                                <Form.Select
                                    value={filters.project_id}
                                    onChange={(e) => setFilters({ ...filters, project_id: e.target.value })}
                                >
                                    <option value="">All</option>
                                    {projects.map(project => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <div className="messages-list">
                {messages.map(message => (
                    <Card key={message.id} className="message-card">
                        <Card.Body>
                            <div className="message-header">
                                <h3>{message.title}</h3>
                                <div className="message-actions">
                                    {message.status === 'Draft' && (
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleApproveMessage(message.id)}
                                        >
                                            <FaCheck /> Approve
                                        </Button>
                                    )}
                                    {message.status === 'Approved' && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleArchiveMessage(message.id)}
                                        >
                                            <FaArchive /> Archive
                                        </Button>
                                    )}
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedMessage(message);
                                            setShowCreateModal(true);
                                        }}
                                    >
                                        <FaEdit /> Edit
                                    </Button>
                                    <Button
                                        variant="info"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedMessage(message);
                                            setShowHistoryModal(true);
                                        }}
                                    >
                                        <FaHistory /> History
                                    </Button>
                                </div>
                            </div>
                            <div className="message-meta">
                                <Badge bg="info">{message.stage_tag}</Badge>
                                {getStatusBadge(message.status)}
                                <span className="version">v{message.version}</span>
                            </div>
                            <p className="supporting-statement">{message.supporting_statement}</p>
                            <p className="tone-purpose"><strong>Tone/Purpose:</strong> {message.tone_purpose}</p>
                        </Card.Body>
                    </Card>
                ))}
            </div>

            <CreateEditMessageModal
                show={showCreateModal}
                onHide={() => {
                    setShowCreateModal(false);
                    setSelectedMessage(null);
                }}
                onSubmit={selectedMessage ? handleUpdateMessage : handleCreateMessage}
                message={selectedMessage}
                projects={projects}
            />

            <MessageHistoryModal
                show={showHistoryModal}
                onHide={() => {
                    setShowHistoryModal(false);
                    setSelectedMessage(null);
                }}
                messageId={selectedMessage?.id}
            />
        </div>
    );
};

export default KeyMessageBuilder; 