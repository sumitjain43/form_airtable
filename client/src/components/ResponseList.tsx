import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Response {
  _id: string;
  answers: Record<string, any>;
  createdAt: string;
}

const ResponseList: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [responses, setResponses] = useState<Response[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    fetch(`/api/forms/${formId}/responses`, {
      headers: { 'user-id': userId }
    })
      .then(res => res.json())
      .then(setResponses);
  }, [formId]);

  return (
    <div>
      <h1>Responses</h1>
      {responses.map(r => (
        <div key={r._id}>
          <p>{r.createdAt}</p>
          <pre>{JSON.stringify(r.answers, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};

export default ResponseList;