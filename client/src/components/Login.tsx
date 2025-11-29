import React from 'react';

const Login: React.FC = () => {
  return (
    <div>
      <h1>Form Builder</h1>
      <button onClick={() => window.location.href = 'http://localhost:5000/auth/airtable'}>
        Login with Airtable
      </button>
    </div>
  );
};

export default Login;