// File: ./src/main.tsx

// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import {Box, Typography} from '@mui/material';
import {ErrorBoundary} from './components/ErrorBoundary.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
   <React.StrictMode>
      <ErrorBoundary>
         <Box>
            <Typography variant='h1'>Hello World</Typography>
         </Box>
      </ErrorBoundary>
   </React.StrictMode>,
);
