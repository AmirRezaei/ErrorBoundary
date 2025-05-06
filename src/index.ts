// File: ./src/index.ts

// Export main component
export {default as ErrorBoundary} from './components/ErrorBoundary.js';

// Export types
export type {ErrorBoundaryProps, ErrorBoundaryState, LogEntry, LogType, StackFrame} from './components/types.js';

// Export utilities
export {formatTimestamp, parseErrorStack} from './components/utils.js';
