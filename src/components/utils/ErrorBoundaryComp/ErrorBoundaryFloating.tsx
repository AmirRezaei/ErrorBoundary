// File: ./src/components/utils/ErrorBoundaryComp/ErrorBoundaryFloating.tsx

import ErrorLogs from '@mui/icons-material/Adb';
import BugReportIcon from '@mui/icons-material/BugReport';
import {Fab, Toolbar, Tooltip} from '@mui/material';
import React, {useState} from 'react';
import Draggable from 'react-draggable';

import {useDebugPanel} from './components/context/DebugPanelContext';
import TestError from './components/TestError';

const ErrorBoundaryFloating: React.FC = () => {
   // const {theme} = useThemeContext();
   const {isOpen, setIsOpen} = useDebugPanel();
   const [showTestError, setShowTestError] = useState(false);
   const [showLogsPanel, setShowLogsPanel] = useState(false);

   return (
      <>
         {showTestError && (
            <TestError
               show={showLogsPanel}
               onClose={() => {
                  setShowLogsPanel(false);
                  setShowTestError(false);
               }}
            />
         )}
         <Draggable>
            <div style={{position: 'fixed', top: '50%', right: 0, zIndex: 1000}}>
               <Toolbar variant='dense'>
                  {process.env.NODE_ENV === 'development' && (
                     <Tooltip title={showLogsPanel ? 'Hide Generate Logs and Error' : 'Show Generate Logs and Error'}>
                        <Fab
                           color={showLogsPanel ? 'primary' : 'inherit'}
                           onClick={() => {
                              setShowLogsPanel(true);
                              setShowTestError(true);
                           }}>
                           <ErrorLogs />
                        </Fab>
                     </Tooltip>
                  )}
                  {process.env.NODE_ENV === 'development' && (
                     <Tooltip title={isOpen ? 'Hide Debug Console' : 'Show Debug Console'}>
                        <Fab
                           color={isOpen ? 'primary' : 'inherit'}
                           onClick={() => {
                              setIsOpen(!isOpen);
                           }}>
                           <BugReportIcon />
                        </Fab>
                     </Tooltip>
                  )}
               </Toolbar>
            </div>
         </Draggable>
      </>
   );
};

export default ErrorBoundaryFloating;
