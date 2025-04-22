// File: ./src/components/test/TestError.tsx

/* eslint-disable no-console */
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import React, {useState} from 'react';

interface TestErrorProps {
   show: boolean;
   onClose: () => void;
}

const TestError: React.FC<TestErrorProps> = ({show, onClose}) => {
   const [errorTriggered, setErrorTriggered] = useState(false);

   const generateLogsAndError = () => {
      // Test all console log types
      console.log('This is a regular log message');
      console.info('This is a regular informational message');
      console.warn('This is a regular warning message');
      console.error('This is a regular error message');
      console.debug('This is a regular debug message');

      // Test with objects and arrays
      console.log('Object test:', {name: 'Test', value: 123});
      console.log('Array test:', [1, 2, 3, 4, 5]);
      console.log('Complex object:', {
         nested: {
            array: [1, 2, 3],
            object: {test: 'value'},
         },
      });

      // Log a timestamp
      console.log('Current timestamp:', new Date().toISOString());

      // Log a simple message with a variable
      const testValue = 'Sample Value';
      console.log('Logging a variable:', testValue);

      // Log an array of values
      const valuesArray = [10, 20, 30, 40, 50];
      console.log('Logging an array of values:', valuesArray);

      // Log a message with a function result
      const result = Math.sqrt(16);
      console.log('Log a message with a function result:', result);

      // Test with multiple arguments
      console.log('Multiple arguments:', 'arg1', 123, {test: 'value'});
   };

   const testStorageOperations = () => {
      console.log('Testing localStorage operations:');
      window.localStorage.setItem('testKey', JSON.stringify({test: 'value'}));
      console.log('After setItem:', window.localStorage.getItem('testKey'));
      window.localStorage.removeItem('testKey');
   };

   const setStorageItem = () => {
      console.log('Setting storage item:');
      window.localStorage.setItem('testKey', JSON.stringify({test: 'value'}));
      console.log('Item set successfully');
   };

   const getStorageItem = () => {
      console.log('Getting storage item:');
      const item = window.localStorage.getItem('testKey');
      console.log('Retrieved item:', item);
   };

   const removeStorageItem = () => {
      console.log('Removing storage item:');
      window.localStorage.removeItem('testKey');
      console.log('Item removed successfully');
   };

   const generateException = () => {
      setErrorTriggered(true);
   };

   if (errorTriggered) {
      throw new Error('This is a test error to verify ErrorBoundary functionality');
   }

   return (
      <Dialog
         open={show}
         onClose={onClose}
         sx={{
            '& .MuiDialog-paper': {
               zIndex: 1300,
            },
         }}>
         <DialogTitle>Test Error and Logs Generator</DialogTitle>
         <DialogContent>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300}}>
               <Button variant='contained' color='error' onClick={generateLogsAndError} sx={{textTransform: 'none'}}>
                  Generate Logs and Error
               </Button>
               <Button variant='contained' color='error' onClick={generateException} sx={{textTransform: 'none'}}>
                  Generate Exception
               </Button>
               <Button variant='contained' color='primary' onClick={testStorageOperations} sx={{textTransform: 'none'}}>
                  Test Storage Operations
               </Button>
               <Box sx={{display: 'flex', gap: 1, mt: 1}}>
                  <Button variant='outlined' color='primary' onClick={setStorageItem} sx={{textTransform: 'none'}}>
                     Set Storage
                  </Button>
                  <Button variant='outlined' color='primary' onClick={getStorageItem} sx={{textTransform: 'none'}}>
                     Get Storage
                  </Button>
                  <Button variant='outlined' color='primary' onClick={removeStorageItem} sx={{textTransform: 'none'}}>
                     Remove Storage
                  </Button>
               </Box>
            </Box>
         </DialogContent>
         <DialogActions>
            <Button onClick={onClose} sx={{textTransform: 'none'}}>
               Close
            </Button>
         </DialogActions>
      </Dialog>
   );
};

export default TestError;
