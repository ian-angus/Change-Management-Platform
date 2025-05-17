import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const CreateEditMessageModal = ({ show, onHide, onSubmit, message, projects }) => {
    const [formData, setFormData] = useState({
        title: '',
        supporting_statement: '',
        tone_purpose: '',
        stage_tag: '',
        project_id: ''
    });

    useEffect(() => {
        if (message) {
            setFormData({
                title: message.title,
                supporting_statement: message.supporting_statement,
                tone_purpose: message.tone_purpose,
                stage_tag: message.stage_tag,
                project_id: message.project_id
            });
        } else {
            setFormData({
                title: '',
                supporting_statement: '',
                tone_purpose: '',
                stage_tag: '',
                project_id: ''
            });
        }
    }, [message]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message) {
            onSubmit(message.id, formData);
        } else {
            onSubmit(formData);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{message ? 'Edit Key Message' : 'Create New Key Message'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Enter message title"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Supporting Statement</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="supporting_statement"
                            value={formData.supporting_statement}
                            onChange={handleChange}
                            required
                            rows={4}
                            placeholder="Enter supporting statement"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Tone/Purpose</Form.Label>
                        <Form.Control
                            type="text"
                            name="tone_purpose"
                            value={formData.tone_purpose}
                            onChange={handleChange}
                            required
                            placeholder="Enter tone or purpose"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Stage</Form.Label>
                        <Form.Select
                            name="stage_tag"
                            value={formData.stage_tag}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select stage</option>
                            <option value="Early Change">Early Change</option>
                            <option value="Mid-Project">Mid-Project</option>
                            <option value="Go-Live">Go-Live</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Project</Form.Label>
                        <Form.Select
                            name="project_id"
                            value={formData.project_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select project</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                        {message ? 'Save Changes' : 'Create Message'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CreateEditMessageModal; 