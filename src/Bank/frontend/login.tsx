import React from 'react';
import { createRoot } from 'react-dom/client';
import { Login } from "./components/Validate.js"; 

const App = () => {
    return (
        <Login userInitial="" passwordInitial="" />
    );
};

const container = document.getElementById('root');

if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}