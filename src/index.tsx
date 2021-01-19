import React, { StrictMode } from 'react';
import { render } from 'react-dom';
import App from './App';
import './wdyr';

const AppRoot = () => (
  <StrictMode>
    <App />
  </StrictMode>
);

render(<AppRoot />, document.getElementById('root'));
