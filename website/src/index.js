import React from "react";
import "./styles/index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { hydrate, render } from "react-dom";
import * as serviceWorker from './serviceWorker';

const rootElement = document.getElementById("root");

const toRender = [
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  rootElement,
];

if (rootElement.hasChildNodes()) {
  hydrate(...toRender);
} else {
  render(...toRender);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
// serviceWorker.unregister();