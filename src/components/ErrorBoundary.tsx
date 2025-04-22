// File: ./src/components/ErrorBoundary.tsx

/* eslint-disable no-console */
import React, {useEffect, useState} from 'react';

import {ClipboardProvider, useClipboard} from './context/ClipboardContext';
import {DebugPanelProvider, useDebugPanel} from './context/DebugPanelContext';
import DebugPanel from './DebugPanel';
import ErrorBoundaryFloating from './ErrorBoundaryFloating';
import {SizeProvider} from './SizeContext';
import {ErrorBoundaryProps, ErrorBoundaryState, LogEntry, LogType, StackFrame} from './types';
import {formatTimestamp, LOG_TYPES, parseErrorStack} from './utils';

const originalConsole = {
   log: console.log,
   error: console.error,
   warn: console.warn,
   info: console.info,
   debug: console.debug,
};

interface ErrorBoundaryWithDebugToolsProps extends ErrorBoundaryProps {
   defaultDebugPanelOpen?: boolean;
}

/**
 * Base error boundary component that handles error catching and logging
 */
const BaseErrorBoundary: React.FC<ErrorBoundaryProps> = ({children, fallback, onError}) => {
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
   const [state, setState] = useState<ErrorBoundaryState>({
      hasError: false,
      error: null,
      errorInfo: null,
      activeTab: 'console logs',
      activeLogTab: ['log'],
      logs: [],
      lastErrorTabVisit: Date.now(),
      newErrorCount: 0,
   });

   useEffect(() => {
      const createConsoleMethod = (type: LogType) => {
         return (...args: unknown[]) => {
            originalConsole[type](...args);
            let formatString = '';
            let message: string;
            const logArgs = args.map(arg => {
               if (typeof arg === 'object' && arg !== null) {
                  return arg;
               }
               return String(arg);
            });

            if (typeof args[0] === 'string' && args[0].includes('%')) {
               formatString = args[0];
               message = formatConsoleMessage(formatString, args.slice(1));
            } else {
               message = logArgs.join(' ');
            }

            setTimeout(() => {
               setState(prevState => ({
                  ...prevState,
                  logs: [
                     ...prevState.logs,
                     {type, formatString, args: logArgs, message, timestamp: new Date().toISOString()},
                  ].slice(-200),
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

   const formatConsoleMessage = (formatString: string, args: unknown[]): string => {
      let index = 0;
      return formatString.replace(/%[sdfoO]/g, () => {
         const arg = args[index++] ?? 'undefined';
         if (typeof arg === 'object' && arg !== null) {
            try {
               return JSON.stringify(arg, null, 2);
            } catch {
               return String(arg);
            }
         }
         return String(arg);
      });
   };

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
         {showPanel && (
            <SizeProvider>
               <DebugPanel
                  state={state}
                  setState={setState}
                  showPanel={showPanel}
                  stackFrames={[]}
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
         )}
      </>
   );
};

/**
 * Comprehensive error boundary component that includes debug tools and providers
 */
export const ErrorBoundaryWithDebugTools: React.FC<ErrorBoundaryWithDebugToolsProps> = ({
   children,
   fallback,
   onError,
   defaultDebugPanelOpen = false,
}) => {
   return (
      <DebugPanelProvider defaultIsOpen={defaultDebugPanelOpen}>
         <ClipboardProvider>
            <BaseErrorBoundary fallback={fallback} onError={onError}>
               <ErrorBoundaryFloating />
               {children}
            </BaseErrorBoundary>
         </ClipboardProvider>
      </DebugPanelProvider>
   );
};

export default ErrorBoundaryWithDebugTools;
