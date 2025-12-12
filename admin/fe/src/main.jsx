import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import router from './routes/router.jsx'; 
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
      <Toaster position="bottom-right" reverseOrder={false} />
  </React.StrictMode>
);