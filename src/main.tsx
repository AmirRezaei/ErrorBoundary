// File: ./src/main.tsx

import './app/globals.css';
import './components/utils/ErrorBoundaryComp/components/LocalStorageWrapper';

import {Box, Typography} from '@mui/material';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import App from './App';
import ErrorBoundary from './components/utils/ErrorBoundaryComp/components/ErrorBoundary';

const rootElement = document.getElementById('root');

if (!rootElement) {
   throw new Error('Root element not found. Please check your HTML file.');
}

const root = createRoot(rootElement);

const fallback = (
   <Box sx={{p: 2, color: 'red', textAlign: 'center'}}>
      <Typography variant='h6'>An error occurred</Typography>
      <Typography>Please refresh the page or contact support.</Typography>
   </Box>
);

root.render(
   <StrictMode>
      <ErrorBoundary fallback={null} defaultDebugPanelOpen={true}>
         <App />
      </ErrorBoundary>
   </StrictMode>,
);
