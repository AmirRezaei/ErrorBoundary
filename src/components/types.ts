// File: ./src/components/types.ts

import React, {ErrorInfo} from 'react';

export interface ErrorBoundaryProps {
   children: React.ReactNode;
   fallback?: React.ReactNode;
   defaultDebugPanelOpen?: boolean;
   showTestTooltip?: boolean;
   logLimit: number;
   onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface ErrorBoundaryState {
   hasError: boolean;
   error: Error | null;
   errorInfo: ErrorInfo | null;
   activeTab: string;
   logs: LogEntry[];
   activeLogTab: LogType[];
   lastErrorTabVisit: number;
   newErrorCount: number;
}

export interface LogEntry {
   type: LogType;
   formatString: string;
   args: unknown[];
   message: string;
   timestamp: string;
}

export interface StackFrame {
   file: string;
   line: number;
   column: number;
   functionName?: string;
   raw: string;
}

export type LogType = 'log' | 'error' | 'warn' | 'info' | 'debug';

export interface ParsedLogMessage {
   mainMessage: string;
   arguments: {value: unknown; type: 'component' | 'string' | 'object' | 'number' | 'other'}[];
   urls: string[];
   stackFrames: StackFrame[];
}

export interface StorageViewerProps {
   storage: Storage | Record<string, any>;
   storageType?: 'localStorage' | 'sessionStorage';
}

export interface LogViewerProps {
   logs: LogEntry[];
   openInEditor: (frame: StackFrame) => void;
   onClearLogs?: () => void;
   searchTerm?: string;
}

export interface DebugPanelProps {
   state: ErrorBoundaryState;
   setState: React.Dispatch<React.SetStateAction<ErrorBoundaryState>>;
   showPanel: boolean;
   stackFrames: StackFrame[];
   groupedLogs: Record<LogType, LogEntry[]>;
   openInEditor: (frame: StackFrame) => void;
   copyToClipboard: () => void;
   copyLogsByType: (types: LogType[], format: 'text' | 'json') => void;
   copyStackTrace: () => void;
   clearLogs?: () => void;
}

export type SizeOption = 'small' | 'medium' | 'large';

export interface SizeSettings {
   button: {
      height: string;
      padding: string;
      fontSize: string;
   };
   text: {
      fontSize: string;
      lineHeight: string;
   };
   icon: {
      size: string;
   };
   input: {
      height: string;
      padding: string;
      fontSize: string;
   };
}

export interface SizeContextType {
   size: SizeOption;
   setSize: (size: SizeOption) => void;
   getSizeSettings: () => SizeSettings;
}
