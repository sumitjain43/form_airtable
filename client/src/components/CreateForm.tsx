import React, { useEffect, useState } from 'react';

interface Base {
  id: string;
  name: string;
}

interface Table {
  id: string;
  name: string;
}

interface Field {
  id: string;
  name: string;
  type: string;
}

interface Question {
  questionKey: string;
  airtableFieldId: string;
  label: string;
  type: string;
  required: boolean;
  conditionalRules: any;
}

const CreateForm: React.FC<{ userId: string }> = ({ userId }) => {
  const [bases, setBases] = useState<Base[]>([]);
  const [selectedBase, setSelectedBase] = useState('');
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetch('/api/bases', { headers: { 'user-id': userId } })
      .then(res => res.json())
      .then(setBases);
  }, [userId]);

  const handleBaseChange = (baseId: string) => {
    setSelectedBase(baseId);
    fetch(`/api/bases/${baseId}/tables`, { headers: { 'user-id': userId } })
      .then(res => res.json())
      .then(setTables);
  };

  const handleTableChange = (tableId: string) => {
    setSelectedTable(tableId);
    fetch(`/api/bases/${selectedBase}/tables/${tableId}/fields`, { headers: { 'user-id': userId } })
      .then(res => res.json())
      .then(setFields);
  };

  useEffect(() => {
    if (fields.length > 0) {
      setQuestions(fields.map(f => ({
        questionKey: f.id,
        airtableFieldId: f.id,
        label: f.name,
        type: mapType(f.type),
        required: false,
        conditionalRules: null
      })));
    }
  }, [fields]);

  const mapType = (type: string) => {
    switch (type) {
      case 'singleLineText': return 'shortText';
      case 'multilineText': return 'longText';
      case 'singleSelect': return 'singleSelect';
      case 'multipleSelects': return 'multiSelect';
      case 'attachment': return 'attachment';
      default: return 'shortText';
    }
  };

  const updateQuestion = (key: string, field: string, value: any) => {
    setQuestions(qs => qs.map(q => q.questionKey === key ? { ...q, [field]: value } : q));
  };

  const handleSubmit = () => {
    fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'user-id': userId },
      body: JSON.stringify({ baseId: selectedBase, tableId: selectedTable, questions })
    }).then(() => alert('Form created'));
  };

  return (
    <div>
      <h1>Create Form</h1>
      <select onChange={e => handleBaseChange(e.target.value)}>
        <option>Select Base</option>
        {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
      <select onChange={e => handleTableChange(e.target.value)}>
        <option>Select Table</option>
        {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </select>
      {questions.map(q => (
        <div key={q.questionKey}>
          <input value={q.label} onChange={e => updateQuestion(q.questionKey, 'label', e.target.value)} />
          <input type="checkbox" checked={q.required} onChange={e => updateQuestion(q.questionKey, 'required', e.target.checked)} /> Required
        </div>
      ))}
      <button onClick={handleSubmit}>Create Form</button>
    </div>
  );
};

export default CreateForm;