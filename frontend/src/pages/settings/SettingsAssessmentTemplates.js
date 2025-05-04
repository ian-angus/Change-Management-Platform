import React from 'react';
import AssessmentTemplateManager from '../AssessmentTemplateManager'; // Reuse the component

function SettingsAssessmentTemplates({ apiBaseUrl }) {
  return (
    <div className="settings-page settings-assessment-templates">
      <h2>Settings: Assessment Templates</h2>
      <p>Create, view, and manage reusable assessment templates.</p>
      <AssessmentTemplateManager apiBaseUrl={apiBaseUrl} />
    </div>
  );
}

export default SettingsAssessmentTemplates;

