import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateEditTemplateModal from './CreateEditTemplateModal';
import './AssessmentManagement.css';

const AssessmentManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/assessment-templates');
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleCreateTemplate = () => {
    setCurrentTemplate(null);
    setIsModalOpen(true);
  };

  const handleEditTemplate = (template) => {
    setCurrentTemplate(template);
    setIsModalOpen(true);
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      if (currentTemplate) {
        await axios.put(`/api/assessment-templates/${currentTemplate.id}`, templateData);
      } else {
        await axios.post('/api/assessment-templates', templateData);
      }
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  return (
    <div className="assessment-management">
      <h1>Assessment Management</h1>
      <button onClick={handleCreateTemplate}>Create Template</button>
      <div className="templates-list">
        {templates.map((template) => (
          <div key={template.id} className="template-card">
            <h3>{template.name}</h3>
            <p>{template.description}</p>
            <button onClick={() => handleEditTemplate(template)}>Edit</button>
          </div>
        ))}
      </div>
      <CreateEditTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTemplate}
        template={currentTemplate}
      />
    </div>
  );
};

export default AssessmentManagement; 