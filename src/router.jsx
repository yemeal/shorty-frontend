import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage.jsx';
import ProfilePlaceholder from './ProfilePlaceholder.jsx';

const Router = () => (
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/profile-placeholder' element={<ProfilePlaceholder />} />
    </Routes>
  </BrowserRouter>
);

export default Router;
