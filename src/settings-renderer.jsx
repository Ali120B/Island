import React from 'react';
import ReactDOM from 'react-dom/client';
import Settings from './Settings';
import './App.css'; // Reuse existing styles or create new one

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Settings />
    </React.StrictMode>
);
