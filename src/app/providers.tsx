// File: ./src/app/providers.tsx

// ./src/app/providers.tsx
'use client';
import CssBaseline from '@mui/material/CssBaseline';
import {createTheme, ThemeProvider} from '@mui/material/styles';

const theme = createTheme({
   palette: {
      primary: {
         main: '#2E3B55',
      },
      // Define other palette options
   },
   // Define other theme options
});

const Providers = ({children}: {children: React.ReactNode}) => {
   return (
      <ThemeProvider theme={theme}>
         <CssBaseline />
         {children}
      </ThemeProvider>
   );
};

export default Providers;
