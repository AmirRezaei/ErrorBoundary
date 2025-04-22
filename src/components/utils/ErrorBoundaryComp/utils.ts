// File: ./src/components/utils/ErrorBoundaryComp/utils.ts

import {LogType, StackFrame} from './types';

export const LOG_TYPES: LogType[] = ['error', 'warn', 'log', 'info', 'debug'];
export const TABS = ['error', 'logs', 'stack', 'env', 'storage'];

export const getLogTypeColor = (type: LogType) => {
   switch (type) {
      case 'error':
         return '#F44336';
      case 'warn':
         return '#FFCA28';
      case 'info':
         return '#2196F3';
      case 'debug':
         return '#757575';
      default:
         return '#FFFFFF';
   }
};

export const getLogTypeBackground = (type: LogType) => {
   switch (type) {
      case 'error':
         return 'rgba(244, 67, 54, 0.1)';
      case 'warn':
         return 'rgba(255, 202, 40, 0.1)';
      case 'info':
         return 'rgba(33, 150, 243, 0.1)';
      case 'debug':
         return 'rgba(117, 117, 117, 0.1)';
      default:
         return 'rgba(255, 255, 255, 0.1)';
   }
};

export const getLogTypeButtonColor = (type: LogType) => {
   switch (type) {
      case 'error':
         return {'bgcolor': '#F44336', '&:hover': {bgcolor: '#D32F2F'}};
      case 'warn':
         return {'bgcolor': '#FFCA28', '&:hover': {bgcolor: '#FFB300'}};
      case 'info':
         return {'bgcolor': '#2196F3', '&:hover': {bgcolor: '#1976D2'}};
      case 'debug':
         return {'bgcolor': '#757575', '&:hover': {bgcolor: '#616161'}};
      default:
         return {'bgcolor': '#90CAF9', '&:hover': {bgcolor: '#42A5F5'}};
   }
};

export const parseStackFrame = (line: string): StackFrame | null => {
   // Handle React component stack format
   const reactComponentMatch = line.match(/^\s*([A-Za-z0-9]+)(?:\s+([A-Za-z0-9]+\.(?:tsx|jsx|js|ts))(?::(\d+))?)?/);
   if (reactComponentMatch) {
      return {
         functionName: reactComponentMatch[1],
         file: reactComponentMatch[2] || 'unknown',
         line: reactComponentMatch[3] ? parseInt(reactComponentMatch[3], 10) : 0,
         column: 0,
         raw: line.trim(),
      };
   }

   // Handle Chrome format
   const chromeMatch = line.match(/at\s+(.*?)\s+\((.*?):(\d+):(\d+)\)/);
   if (chromeMatch) {
      return {
         functionName: chromeMatch[1],
         file: chromeMatch[2],
         line: parseInt(chromeMatch[3], 10),
         column: parseInt(chromeMatch[4], 10),
         raw: line,
      };
   }

   // Handle Firefox format
   const firefoxMatch = line.match(/(.*?)@(.*?):(\d+):(\d+)/);
   if (firefoxMatch) {
      return {
         functionName: firefoxMatch[1],
         file: firefoxMatch[2],
         line: parseInt(firefoxMatch[3], 10),
         column: parseInt(firefoxMatch[4], 10),
         raw: line,
      };
   }

   // Handle Node format
   const nodeMatch = line.match(/at\s+(.*?):(\d+):(\d+)/);
   if (nodeMatch) {
      return {
         file: nodeMatch[1],
         line: parseInt(nodeMatch[2], 10),
         column: parseInt(nodeMatch[3], 10),
         raw: line,
      };
   }

   return null;
};

export const parseErrorStack = (error: Error): StackFrame[] => {
   if (!error.stack) return [];

   // Split the stack into lines and process each line
   const lines = error.stack.split('\n');
   const stackFrames: StackFrame[] = [];

   // Process each line
   for (const line of lines) {
      const frame = parseStackFrame(line);
      if (frame) {
         stackFrames.push(frame);
      }
   }

   return stackFrames;
};

export const formatTimestamp = (timestamp: string) => {
   const date = new Date(timestamp);
   return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
   });
};

// Helper function to determine argument type
const getArgType = (arg: unknown): 'component' | 'string' | 'object' | 'number' | 'other' => {
   if (typeof arg === 'string' && /^[A-Z][a-zA-Z0-9]*$/.test(arg)) {
      return 'component';
   }
   if (typeof arg === 'string') {
      return 'string';
   }
   if (typeof arg === 'object' && arg !== null) {
      return 'object';
   }
   if (typeof arg === 'number') {
      return 'number';
   }
   return 'other';
};

export interface ParsedLogMessage {
   mainMessage: string;
   arguments: {value: unknown; type: 'component' | 'string' | 'object' | 'number' | 'other'}[];
   urls: string[];
   stackFrames: StackFrame[];
}

export interface ComponentStack {
   name: string;
   components: Array<{
      name: string;
      file: string;
      line: number;
      column: number;
   }>;
}

export interface ErrorWithComponentStack extends Error {
   componentStack?: ComponentStack;
}

export const parseLogMessage = (
   formatString: string | undefined,
   args: unknown[],
   message: string,
): ParsedLogMessage => {
   const argumentsList: ParsedLogMessage['arguments'] = [];
   const urls: string[] = [];
   const stackFrames: StackFrame[] = [];

   // Extract URLs first
   const urlRegex = /(https?:\/\/[^\s]+)/g;
   let mainMessage = message.replace(urlRegex, match => {
      urls.push(match);
      return `__URL_${urls.length - 1}__`;
   });

   // Check if any argument is an error with component stack
   const errorWithStack = args.find(arg => arg instanceof Error && 'componentStack' in arg) as
      | ErrorWithComponentStack
      | undefined;

   if (errorWithStack?.componentStack) {
      // Convert component stack to stack frames
      errorWithStack.componentStack.components.forEach(component => {
         stackFrames.push({
            functionName: component.name,
            file: component.file,
            line: component.line,
            column: component.column,
            raw: `${component.name} ${component.file}:${component.line}:${component.column}`,
         });
      });
   }

   // Extract regular stack frames from message
   const lines = mainMessage.split('\n');
   let stackStartIndex = -1;
   for (let i = 0; i < lines.length; i++) {
      if (parseStackFrame(lines[i])) {
         stackStartIndex = i;
         break;
      }
   }
   if (stackStartIndex !== -1) {
      const stackLines = lines.slice(stackStartIndex);
      stackFrames.push(
         ...stackLines.map(line => parseStackFrame(line)).filter((frame): frame is StackFrame => frame !== null),
      );
      mainMessage = lines.slice(0, stackStartIndex).join('\n');
   }

   // Process format string and arguments
   if (formatString && formatString.includes('%')) {
      let argIndex = 0;
      mainMessage = formatString.replace(/%[sdfoO]/g, () => {
         const arg = args[argIndex++] ?? 'undefined';
         const argType = getArgType(arg);
         argumentsList.push({value: arg, type: argType});
         return String(arg);
      });
   } else {
      // If no format string, process all arguments
      args.forEach(arg => {
         const argType = getArgType(arg);
         argumentsList.push({value: arg, type: argType});
      });
   }

   // Restore URLs in the final message
   mainMessage = mainMessage.replace(/__URL_(\d+)__/g, (_, index) => urls[parseInt(index, 10)]);

   // Clean up any remaining format specifiers
   mainMessage = mainMessage.replace(/%[sdfoO]/g, '[Unprocessed Argument]');

   // Remove duplicate stack frames
   const uniqueStackFrames = stackFrames.filter(
      (frame, index, self) =>
         index ===
         self.findIndex(f => f.functionName === frame.functionName && f.file === frame.file && f.line === frame.line),
   );

   return {
      mainMessage: mainMessage.trim(),
      arguments: argumentsList,
      urls,
      stackFrames: uniqueStackFrames,
   };
};
