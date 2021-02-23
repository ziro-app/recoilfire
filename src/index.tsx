import React, { StrictMode } from 'react';
import { render } from 'react-dom';
import { load as FontLoader } from 'webfontloader';
import App from './App';
import './wdyr';

const AppRoot = () => (
  <StrictMode>
    <App />
  </StrictMode>
);

FontLoader({
  google: { families: ['Rubik:500,600', 'Work Sans:300,400,500', 'Karla'] }
});

render(<AppRoot />, document.getElementById('root'));
