import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';
import App from './src/App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootElement);

// render tanpa JSX
root.render(
    React.createElement(
    React.StrictMode,
    null,
    React.createElement(App)
    )
);
