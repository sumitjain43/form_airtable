import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateForm from './components/CreateForm';
import FormViewer from './components/FormViewer';
import ResponseList from './components/ResponseList';

function App() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('userId');
    if (id) {
      localStorage.setItem('userId', id);
      setUserId(id);
      window.history.replaceState({}, '', '/dashboard');
    } else {
      const stored = localStorage.getItem('userId');
      if (stored) setUserId(stored);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={userId ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={userId ? <Dashboard userId={userId} /> : <Navigate to="/" />} />
        <Route path="/create-form" element={userId ? <CreateForm userId={userId} /> : <Navigate to="/" />} />
        <Route path="/form/:formId" element={<FormViewer />} />
        <Route path="/forms/:formId/responses" element={<ResponseList />} />
      </Routes>
    </Router>
  );
}

export default App;