import React from 'react';
import ReactDOM from 'react-dom/client';

import ErrorBoundary from '@TutorShared/components/ErrorBoundary';
import App from '@CourseBuilderComponents/App';
import { HashRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('tutor-course-builder') as HTMLElement);

root.render(
  <React.StrictMode>
    <HashRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HashRouter>
  </React.StrictMode>,
);
