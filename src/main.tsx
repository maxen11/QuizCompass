import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { DatabaseProvider } from "./contexts/DatabaseContext.tsx";


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DatabaseProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </DatabaseProvider>
  </React.StrictMode>,
)
