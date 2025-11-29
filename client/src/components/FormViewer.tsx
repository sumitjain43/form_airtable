import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { shouldShowQuestion } from '../utils/conditionalLogic';

interface Question {
  questionKey: string;
  label: string;
  type: string;
  required: boolean;
  conditionalRules: any;
}

interface Form {
  _id: string;
  questions: Question[];
}

const FormViewer: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch(`/api/forms/${formId}`)
      .then(res => res.json())
      .then(setForm);
  }, [formId]);

  const handleChange = (key: string, value: any) => {
    setAnswers({ ...answers, [key]: value });
  };

  const handleSubmit = () => {
    fetch(`/api/forms/${formId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    }).then(res => res.json()).then(() => alert('Submitted'));
  };

  if (!form) return <div>Loading</div>;

  return (
    <div>
      <h1>Form</h1>
      {form.questions.filter(q => shouldShowQuestion(q.conditionalRules, answers)).map(q => (
        <div key={q.questionKey}>
          <label>{q.label}</label>
          {renderField(q, answers[q.questionKey], (value) => handleChange(q.questionKey, value))}
        </div>
      ))}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

const renderField = (q: Question, value: any, onChange: (value: any) => void) => {
  switch (q.type) {
    case 'shortText':
      return <input value={value || ''} onChange={e => onChange(e.target.value)} />;
    case 'longText':
      return <textarea value={value || ''} onChange={e => onChange(e.target.value)} />;
    case 'singleSelect':
      return <select value={value || ''} onChange={e => onChange(e.target.value)}>
        <option value="">Select</option>
        {/* assume options not set, so empty */}
      </select>;
    case 'multiSelect':
      return <input value={Array.isArray(value) ? value.join(',') : ''} onChange={e => onChange(e.target.value.split(','))} />;
    case 'attachment':
      return <input type="file" onChange={e => onChange(e.target.files)} />;
    default:
      return <input value={value || ''} onChange={e => onChange(e.target.value)} />;
  }
};

export default FormViewer;