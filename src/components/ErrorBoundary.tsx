// File: ./src/components/ErrorBoundary.tsx

/* eslint-disable no-console */
import React, {useEffect, useState, useCallback} from 'react';

import {ClipboardProvider, useClipboard} from './context/ClipboardContext.js';
import {DebugPanelProvider, useDebugPanel} from './context/DebugPanelContext.js';
import DebugPanel from './DebugPanel.js';
import ErrorBoundaryFloating from './ErrorBoundaryFloating.js';
import {SizeProvider} from './SizeContext.js';
import {ErrorBoundaryProps, ErrorBoundaryState, LogEntry, LogType, StackFrame} from './types.js';
import {formatTimestamp, LOG_TYPES, parseErrorStack, parseLogMessage} from './utils.js';
import {SettingsProvider, useSettings} from './context/SettingsContext.js';

const originalConsole = {
   log: console.log,
   error: console.error,
   warn: console.warn,
   info: console.info,
   debug: console.debug,
};

/**
 * Base error boundary component that handles error catching and logging
 */
const BaseErrorBoundary: React.FC<ErrorBoundaryProps> = ({children, fallback, onError, logLimit = 200}) => {
   const {isOpen: showPanel} = useDebugPanel();
   const {copyData: copyErrorData} = useClipboard<{
      error: {message: string; name: string; stack: string};
      componentStack: string;
      timestamp: string;
      environment: {userAgent: string; url: string; path: string};
      consoleLogs: LogEntry[];
   }>();
   const {copyData: copyLogData} = useClipboard<LogEntry>();
   const {copyData: copyStackData} = useClipboard<{stackTrace: string; componentStack: string}>();
   const {settings, updateSettings} = useSettings();
   const [state, setState] = useState<ErrorBoundaryState>(() => ({
      hasError: false,
      error: null,
      errorInfo: null,
      activeTab: settings.errorBoundary.activeTab,
      activeLogTab: settings.errorBoundary.activeLogTabs as LogType[],
      logs: [],
      lastErrorTabVisit: Date.now(),
      newErrorCount: 0,
   }));

   // Update state when settings change
   useEffect(() => {
      setState(prev => ({
         ...prev,
         activeTab: settings.errorBoundary.activeTab,
         activeLogTab: settings.errorBoundary.activeLogTabs as LogType[],
      }));
   }, [settings.errorBoundary.activeTab, settings.errorBoundary.activeLogTabs]);

   // Add effect to log state changes for debugging
   useEffect(() => {
      console.log('Debug Panel State:', {showPanel, isOpen: showPanel});
   }, [showPanel]);

   useEffect(() => {
      const createConsoleMethod = (type: LogType) => {
         return (...args: unknown[]) => {
            originalConsole[type](...args);
            const timestamp = new Date().toISOString();
            const {mainMessage, arguments: logArgs} = parseLogMessage(
               typeof args[0] === 'string' && args[0].includes('%') ? args[0] : undefined,
               args,
               args.join(' '),
            );

            setTimeout(() => {
               setState(prevState => ({
                  ...prevState,
                  logs: [
                     ...prevState.logs,
                     {
                        type,
                        formatString: typeof args[0] === 'string' && args[0].includes('%') ? args[0] : '',
                        args: logArgs.map(a => a.value),
                        message: mainMessage,
                        timestamp,
                     },
                  ].slice(-logLimit),
               }));
            }, 0);
         };
      };

      // Override console methods
      console.log = createConsoleMethod('log');
      console.error = createConsoleMethod('error');
      console.warn = createConsoleMethod('warn');
      console.info = createConsoleMethod('info');
      console.debug = createConsoleMethod('debug');

      // Add error event listener
      const handleError = (event: ErrorEvent) => {
         const errorInfo: React.ErrorInfo = {
            componentStack: event.error?.stack || '',
         };
         setState(prevState => ({
            ...prevState,
            hasError: true,
            error: event.error,
            errorInfo,
            activeTab: 'error',
            newErrorCount: prevState.newErrorCount + 1,
         }));

         if (onError) {
            onError(event.error, errorInfo);
         }
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
         const errorInfo: React.ErrorInfo = {
            componentStack: event.reason?.stack || '',
         };
         setState(prevState => ({
            ...prevState,
            hasError: true,
            error: event.reason,
            errorInfo,
            activeTab: 'error',
            newErrorCount: prevState.newErrorCount + 1,
         }));

         if (onError) {
            onError(event.reason, errorInfo);
         }
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      // Cleanup
      return () => {
         console.log = originalConsole.log;
         console.error = originalConsole.error;
         console.warn = originalConsole.warn;
         console.info = originalConsole.info;
         console.debug = originalConsole.debug;
         window.removeEventListener('error', handleError);
         window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
   }, [onError]);

   const openInEditor = async (frame: StackFrame) => {
      try {
         let filePath = frame.file;
         // Remove query parameters and base URL
         filePath = filePath.split('?')[0];
         filePath = filePath.replace(/^https?:\/\/[^/]+/, '');
         // Remove leading slash
         if (filePath.startsWith('/')) {
            filePath = filePath.substring(1);
         }
         const response = await fetch(
            `/__open-in-editor?file=${encodeURIComponent(filePath)}&line=${frame.line}&column=${frame.column}`,
         );
         if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to open editor`);
         }
      } catch (error) {
         console.error('Failed to open editor:', error);
      }
   };

   const copyToClipboard = async () => {
      const {error, errorInfo, logs} = state;
      const errorDetails = {
         error: {
            message: error?.message || 'No error message available',
            name: error?.name || 'No error name available',
            stack: error?.stack || 'No stack trace available',
         },
         componentStack: errorInfo?.componentStack || 'No component stack available',
         timestamp: new Date().toISOString(),
         environment: {
            userAgent: navigator.userAgent,
            url: window.location.href,
            path: window.location.pathname,
         },
         consoleLogs: logs,
      };

      const formatter = (details: typeof errorDetails) => `
Error Details for LLM Analysis:
-----------------------------
Error Message: ${details.error.message}
Error Type: ${details.error.name}
Timestamp: ${details.timestamp}

Environment:
- Browser: ${details.environment.userAgent}
- URL: ${details.environment.url}
- Path: ${details.environment.path}

Stack Trace:
${details.error.stack}

Component Stack:
${details.componentStack}

Recent Console Logs:
${details.consoleLogs
   .map(log => `[${formatTimestamp(log.timestamp)}] ${log.type.toUpperCase()}: ${log.message}`)
   .join('\n')}

Instructions for LLM:
-------------------
Please analyze this error and provide:
1. A clear explanation of what went wrong
2. Potential causes and solutions
3. Code fixes or improvements if applicable
4. Best practices to prevent similar errors
`;

      await copyErrorData([errorDetails], 'text', formatter);
   };

   const copyLogsByType = async (types: LogType[], format: 'text' | 'json' = 'text') => {
      const {logs} = state;
      const filteredLogs = logs.filter(log => types.includes(log.type));

      if (format === 'json') {
         await copyLogData(filteredLogs, 'json');
      } else {
         const formatter = (log: LogEntry) =>
            `[${formatTimestamp(log.timestamp)}] ${log.type.toUpperCase()}: ${log.message}`;
         await copyLogData(filteredLogs, 'text', formatter);
      }
   };

   const copyStackTrace = async () => {
      const {error, errorInfo} = state;
      const stackDetails = {
         stackTrace: error?.stack || 'No stack trace available',
         componentStack: errorInfo?.componentStack || 'No component stack available',
      };

      const formatter = (details: typeof stackDetails) =>
         `Stack Trace:\n${details.stackTrace}\n\nComponent Stack:\n${details.componentStack}`;

      await copyStackData([stackDetails], 'text', formatter);
   };

   const clearLogs = () => {
      setState(prevState => ({
         ...prevState,
         logs: [],
      }));
   };

   const handleTabChange = useCallback(
      (_: React.SyntheticEvent, newValue: string) => {
         setState(prevState => ({
            ...prevState,
            activeTab: newValue,
            lastErrorTabVisit: newValue === 'error' ? Date.now() : prevState.lastErrorTabVisit,
            newErrorCount: newValue === 'error' ? 0 : prevState.newErrorCount,
         }));
         updateSettings('errorBoundary', {activeTab: newValue});
      },
      [setState, updateSettings],
   );

   const handleLogTypeChange = useCallback(
      (_: React.MouseEvent<HTMLElement>, newLogTypes: LogType[]) => {
         if (newLogTypes.length > 0) {
            setState(prevState => ({...prevState, activeLogTab: newLogTypes}));
            updateSettings('errorBoundary', {activeLogTabs: newLogTypes});
         }
      },
      [setState, updateSettings],
   );

   if (state.hasError) {
      if (fallback) {
         return <>{fallback}</>;
      }

      return (
         <SizeProvider>
            <DebugPanel
               state={state}
               setState={setState}
               showPanel={showPanel}
               stackFrames={state.error ? parseErrorStack(state.error) : []}
               groupedLogs={LOG_TYPES.reduce(
                  (acc, type) => ({...acc, [type]: state.logs.filter(log => log.type === type)}),
                  {} as Record<LogType, typeof state.logs>,
               )}
               openInEditor={openInEditor}
               copyToClipboard={copyToClipboard}
               copyLogsByType={copyLogsByType}
               copyStackTrace={copyStackTrace}
               clearLogs={clearLogs}
            />
         </SizeProvider>
      );
   }

   return (
      <>
         {children}
         <SizeProvider>
            <DebugPanel
               state={state}
               setState={setState}
               showPanel={showPanel}
               stackFrames={state.error ? parseErrorStack(state.error) : []}
               groupedLogs={LOG_TYPES.reduce(
                  (acc, type) => ({...acc, [type]: state.logs.filter(log => log.type === type)}),
                  {} as Record<LogType, typeof state.logs>,
               )}
               openInEditor={openInEditor}
               copyToClipboard={copyToClipboard}
               copyLogsByType={copyLogsByType}
               copyStackTrace={copyStackTrace}
               clearLogs={clearLogs}
            />
         </SizeProvider>
      </>
   );
};

/**
 * Comprehensive error boundary component that includes debug tools and providers
 */
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
   children,
   fallback,
   onError,
   defaultDebugPanelOpen = true,
   showTestTooltip = false,
   logLimit = 200,
}) => {
   return (
      <SettingsProvider>
         <DebugPanelProvider defaultIsOpen={defaultDebugPanelOpen}>
            <ClipboardProvider>
               <BaseErrorBoundary fallback={fallback} onError={onError} logLimit={logLimit}>
                  <ErrorBoundaryFloating showTestTooltip={showTestTooltip} />
                  {children}
               </BaseErrorBoundary>
            </ClipboardProvider>
         </DebugPanelProvider>
      </SettingsProvider>
   );
};

export default ErrorBoundary;
