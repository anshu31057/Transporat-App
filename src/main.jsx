import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { TransportProvider } from './context/TransportContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <TransportProvider>
        <App />
      </TransportProvider>
    </BrowserRouter>
  </React.StrictMode>
);
