import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Form {
  _id: string;
  // add other fields
}

interface Form {
  _id: string;
  // add other fields
}

const Dashboard: React.FC<{ userId: string }> = ({ userId }) => {
  const [forms, setForms] = useState<Form[]>([]);

  useEffect(() => {
    fetch('/api/forms', {
      headers: { 'user-id': userId }
    })
      .then(res => res.json())
      .then(setForms);
  }, [userId]);

  return (
    <div>
      <h1>Dashboard</h1>
      <Link to="/create-form">Create New Form</Link>
      <ul>
        {forms.map(form => (
          <li key={form._id}>
            {form._id} <Link to={`/forms/${form._id}/responses`}>View Responses</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;