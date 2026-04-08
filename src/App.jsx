import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilePlaceholder from './pages/ProfilePlaceholder';
import { LangProvider } from './LangContext';

const App = () => {
  return (
    <LangProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile-placeholder" element={<ProfilePlaceholder />} />
        </Routes>
      </Router>
    </LangProvider>
  );
};

export default App;