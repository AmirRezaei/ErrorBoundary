// File: ./src/index.ts

// Export main component
export {default as ErrorBoundary} from './components/ErrorBoundary';

// Export types
export type {ErrorBoundaryProps, ErrorBoundaryState, LogEntry, LogType, StackFrame} from './components/types';

// Export utilities
export {formatTimestamp, parseErrorStack} from './components/utils';
