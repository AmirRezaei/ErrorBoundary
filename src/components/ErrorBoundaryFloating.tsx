// File: ./src/components/ErrorBoundaryFloating.tsx

import ErrorLogs from '@mui/icons-material/Adb';
import BugReportIcon from '@mui/icons-material/BugReport';
import {Fab, Toolbar, Tooltip} from '@mui/material';
import React, {useRef, useState, useCallback} from 'react';
import Draggable from 'react-draggable';

import {useDebugPanel} from './context/DebugPanelContext.js';
import TestError from './TestError.js';

interface ErrorBoundaryFloatingProps {
   showTestTooltip?: boolean;
}

const ErrorBoundaryFloating: React.FC<ErrorBoundaryFloatingProps> = ({showTestTooltip = false}) => {
   // const {theme} = useThemeContext();
   const {isOpen, setIsOpen} = useDebugPanel();
   const [showTestError, setShowTestError] = useState(false);
   const [showLogsPanel, setShowLogsPanel] = useState(false);
   const draggableRef = useRef<HTMLDivElement>(null);

   const handleDebugPanelToggle = useCallback(() => {
      setIsOpen(!isOpen);
   }, [isOpen, setIsOpen]);

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
         <Draggable nodeRef={draggableRef as React.RefObject<HTMLElement>}>
            <div ref={draggableRef} style={{position: 'fixed', top: '50%', right: 0, zIndex: 1000}}>
               <Toolbar variant='dense'>
                  {process.env.NODE_ENV === 'development' && showTestTooltip && (
                     <Tooltip title={showLogsPanel ? 'Hide Generate Logs and Error' : 'Show Generate Logs and Error'}>
                        <Fab
                           color={showLogsPanel ? 'primary' : 'inherit'}
                           onClick={() => {
                              setShowLogsPanel(true);
                              setShowTestError(true);
                           }}
                           size='small'>
                           <ErrorLogs />
                        </Fab>
                     </Tooltip>
                  )}
                  {process.env.NODE_ENV === 'development' && (
                     <Tooltip title={isOpen ? 'Hide Debug Console' : 'Show Debug Console'}>
                        <Fab color={isOpen ? 'primary' : 'inherit'} onClick={handleDebugPanelToggle} size='small'>
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
