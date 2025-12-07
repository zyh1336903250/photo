import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  // StrictMode is nice, but sometimes causes double invocation of effects which can be tricky with MediaPipe initialization. 
  // Kept here for best practices, handled in useHandTracking with refs.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);