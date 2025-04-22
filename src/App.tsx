// File: ./src/App.tsx

import {Box, Typography} from '@mui/material';
import React from 'react';

function AppContent() {
   return <Box sx={{height: '100vh', width: '100vw', overflow: 'hidden'}}></Box>;
}

const App: React.FC = () => {
   try {
      return <AppContent />;
   } catch (error) {
      console.error('App rendering failed:', error);
      return (
         <Box sx={{p: 2, color: 'red'}}>
            <Typography variant='h6'>Application Error</Typography>
            <Typography>Please try refreshing the page or contact support.</Typography>
         </Box>
      );
   }
};

export default App;
