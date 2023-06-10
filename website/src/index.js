import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import * as serviceWorker from './serviceWorker';

const rootElement = document.getElementById('root');

const toRender = (
  // <React.StrictMode>
  <BrowserRouter basename="/">
    <App />
  </BrowserRouter>
  // </React.StrictMode>
);
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, toRender);
} else {
  createRoot(rootElement).render(toRender);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
// serviceWorker.unregister();
