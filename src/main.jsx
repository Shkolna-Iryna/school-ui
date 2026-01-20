import React, { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './Router.jsx';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
      <App />
  </StrictMode>
)
  