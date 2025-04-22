// File: ./src/components/utils/ErrorBoundaryComp/components/LogViewer.tsx

import 'react-json-view-lite/dist/index.css';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {Box, Collapse, IconButton, Link, Tooltip, Typography} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import {StackFrame} from '../types';
import {LogEntry} from '../types';
import {formatTimestamp, getLogTypeBackground, getLogTypeColor} from '../utils';
import {useClipboard} from './context/ClipboardContext';
import {useSize} from './SizeContext';

// Update LogViewerProps to use the Log type
interface LogViewerProps {
   logs: LogEntry[];
   openInEditor: (frame: StackFrame) => void;
   onClearLogs?: () => void;
   searchTerm?: string;
   autoScroll: boolean;
   toggleAutoScroll: () => void;
   currentSearchIndex?: number;
   onSearchResultRef?: (ref: HTMLDivElement | null, index: number) => void;
}

const LogViewer: React.FC<LogViewerProps> = ({
   logs,
   openInEditor,
   searchTerm,
   autoScroll,
   currentSearchIndex,
   onSearchResultRef,
}) => {
   const [expandedStackTraces, setExpandedStackTraces] = useState<{[key: number]: boolean}>({});
   const logsEndRef = useRef<HTMLDivElement>(null);
   const {getSizeSettings} = useSize();
   const sizeSettings = getSizeSettings();
   const {copyData} = useClipboard<string>();

   const scrollToBottom = () => {
      logsEndRef.current?.scrollIntoView({behavior: 'smooth'});
   };

   useEffect(() => {
      if (autoScroll) {
         scrollToBottom();
      }
   }, [logs, autoScroll]);

   const toggleStackTrace = (index: number) => {
      setExpandedStackTraces(prev => ({
         ...prev,
         [index]: !prev[index],
      }));
   };

   const escapeHtml = (str: string) => {
      return str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, '');
   };

   const highlightText = (text: string, term: string) => {
      if (!term) return text;
      const regex = new RegExp(`(${term})`, 'gi');
      return text.replace(regex, match => {
         const isCurrentMatch =
            currentSearchIndex !== undefined &&
            text.toLowerCase().indexOf(term.toLowerCase()) === text.toLowerCase().indexOf(match.toLowerCase());
         return `<span style="background-color: #FFD700; color: #000000; ${
            isCurrentMatch ? 'border: 2px solid #ff0000; animation: fadeBorder 2s ease-in-out;' : ''
         }">${match}</span>`;
      });
   };

   const parseStackTrace = (stack: string): StackFrame[] => {
      const lines = stack.trim().split('\n');
      return lines.map(line => {
         const match = line.match(/^([^@]+)@?(.*?)((?::\d+:\d+)|$)/);
         const raw = line;
         if (!match) {
            return {
               functionName: line,
               file: 'unknown',
               line: 0,
               column: 0,
               raw,
            };
         }
         const [, functionName, file, location] = match;
         const [lineNum = '0', column = '0'] = location ? location.slice(1).split(':') : ['0', '0'];
         return {
            functionName: functionName || 'anonymous',
            file: file || 'unknown',
            line: parseInt(lineNum, 10),
            column: parseInt(column, 10),
            raw,
         };
      });
   };

   const formatStackFrame = (frame: StackFrame) => {
      const isSourceFile =
         frame.file?.includes('/src/') ||
         frame.file?.endsWith('.tsx') ||
         frame.file?.endsWith('.jsx') ||
         frame.file?.endsWith('.ts') ||
         frame.file?.endsWith('.js');
      const isNodeModule = frame.file?.includes('/node_modules/');
      const displayFile = frame.file === 'unknown' ? escapeHtml(frame.functionName || '') : frame.file || '';

      return (
         <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25}}>
            <Typography
               sx={{
                  color: getLogTypeColor('error'),
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  minWidth: '180px',
               }}>
               {escapeHtml(frame.functionName || '')}
            </Typography>
            {isSourceFile && frame.file ? (
               <Link
                  href='#'
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                     e.preventDefault();
                     const relativePathMatch = frame.file.match(/\/src\/.*/);
                     const relativePath = relativePathMatch ? relativePathMatch[0] : frame.file;
                     openInEditor({...frame, file: relativePath});
                  }}
                  sx={{
                     color: '#2196F3',
                     fontSize: '0.7rem',
                     fontFamily: 'monospace',
                     textDecoration: 'underline',
                     cursor: 'pointer',
                  }}>
                  {frame.file.split('/src/')[1] || frame.file.split('/').pop()}:{frame.line}:{frame.column}
               </Link>
            ) : isNodeModule && frame.file ? (
               <Link
                  href={frame.file}
                  target='_blank'
                  rel='noopener noreferrer'
                  sx={{
                     color: '#757575',
                     fontSize: '0.7rem',
                     fontFamily: 'monospace',
                     textDecoration: 'underline',
                     cursor: 'pointer',
                  }}>
                  {frame.file.split('/node_modules/')[1] || frame.file.split('/').pop()}:{frame.line}:{frame.column}
               </Link>
            ) : (
               <Typography
                  sx={{
                     color: getLogTypeColor('error'),
                     fontSize: '0.7rem',
                     fontFamily: 'monospace',
                  }}>
                  {displayFile}:{frame.line}:{frame.column}
               </Typography>
            )}
         </Box>
      );
   };

   const renderLogContent = (log: LogViewerProps['logs'][0], logIndex: number) => {
      const logColor = getLogTypeColor(log.type);

      // Common typography styles with size settings
      const commonTypographyStyles = {
         color: logColor,
         fontSize: sizeSettings.text.fontSize,
         lineHeight: sizeSettings.text.lineHeight,
         fontFamily: 'monospace',
         whiteSpace: 'pre-wrap',
         wordBreak: 'break-word',
      };

      // Special handling for error logs
      if (log.type === 'error') {
         const isInvalidFormatString = log.formatString === log.args[0] || !log.formatString;
         const baseMessage = isInvalidFormatString ? log.message.split('\n')[0] : log.formatString;
         const argsToUse = isInvalidFormatString ? log.args.slice(1) : log.args;

         let formattedMessage: string = baseMessage;
         if (argsToUse.length >= 3) {
            let argIndex = 0;
            formattedMessage = baseMessage.replace(/%s/g, () => {
               const value = argsToUse[argIndex] || '[Unprocessed Argument]';
               argIndex++;
               return String(value);
            });
         }

         const stackTraceRaw = argsToUse[4] || log.message.split('\n').slice(1).join('\n');
         const stackFrames = parseStackTrace(String(stackTraceRaw));

         const finalFormattedMessage = formattedMessage
            .replace(/`([^`]+)`/g, (_, match) => `\`${match}\``)
            .replace(/(https?:\/\/[^\s]+)/g, url => {
               return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #2196F3; text-decoration: underline;">${url}</a>`;
            });

         return (
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
               <Typography
                  component='pre'
                  sx={commonTypographyStyles}
                  dangerouslySetInnerHTML={{__html: highlightText(finalFormattedMessage, searchTerm || '')}}
               />
               {stackFrames.length > 0 && (
                  <Box sx={{mt: 0.5}}>
                     <Box
                        sx={{
                           'display': 'flex',
                           'alignItems': 'center',
                           'gap': 0.5,
                           'cursor': 'pointer',
                           '&:hover': {opacity: 0.8},
                        }}
                        onClick={() => toggleStackTrace(logIndex)}>
                        <IconButton size='small' sx={{p: 0}}>
                           {expandedStackTraces[logIndex] ? (
                              <ExpandLessIcon fontSize='small' />
                           ) : (
                              <ExpandMoreIcon fontSize='small' />
                           )}
                        </IconButton>
                        <Typography
                           sx={{
                              ...commonTypographyStyles,
                              fontWeight: 'bold',
                              userSelect: 'none',
                           }}>
                           Stack Trace ({stackFrames.length} frames)
                        </Typography>
                     </Box>
                     <Collapse in={expandedStackTraces[logIndex]}>
                        <Box
                           component='pre'
                           sx={{
                              ...commonTypographyStyles,
                              bgcolor: 'rgba(0, 0, 0, 0.05)',
                              p: 0.5,
                              borderRadius: 1,
                              mt: 0.25,
                           }}>
                           {stackFrames.map((frame: StackFrame, index: number) => (
                              <Box key={index}>{formatStackFrame(frame)}</Box>
                           ))}
                        </Box>
                     </Collapse>
                  </Box>
               )}
            </Box>
         );
      }

      // Common rendering for all other log types
      const renderCommonLog = () => {
         // Process args to find arrays and objects
         const processedData: Array<{name: string; data: unknown}> = [];

         // First, let's handle the timestamp and message
         const timestamp = formatTimestamp(log.timestamp);

         // Check if this is just a regular message without additional arguments
         const isRegularMessage =
            log.args.length === 1 && typeof log.args[0] === 'string' && log.args[0] === log.message;

         // Process arguments to identify objects, arrays, and primitives
         if (!isRegularMessage) {
            for (let i = 0; i < log.args.length; i++) {
               const arg = log.args[i];
               const name = i > 0 && typeof log.args[i - 1] === 'string' ? (log.args[i - 1] as string) : `Arg ${i}`;

               if (Array.isArray(arg)) {
                  processedData.push({name, data: arg});
               } else if (typeof arg === 'object' && arg !== null) {
                  processedData.push({name, data: arg});
               } else if (typeof arg === 'string') {
                  try {
                     const parsed = JSON.parse(arg);
                     if (Array.isArray(parsed) || (typeof parsed === 'object' && parsed !== null)) {
                        processedData.push({name, data: parsed});
                     } else {
                        processedData.push({name, data: arg});
                     }
                  } catch (e) {
                     processedData.push({name, data: arg});
                  }
               } else {
                  processedData.push({name, data: arg});
               }
            }
         }

         // If we have processed data, format it nicely
         if (processedData.length > 0) {
            const formattedArgs = processedData
               .map(({name, data}) => {
                  if (Array.isArray(data)) {
                     return `${name}: ${JSON.stringify(data)}`;
                  } else if (typeof data === 'object' && data !== null) {
                     return `${name}: ${JSON.stringify(data)}`;
                  } else {
                     return `${name}: ${String(data)}`;
                  }
               })
               .join('\n');

            return (
               <Typography
                  sx={commonTypographyStyles}
                  dangerouslySetInnerHTML={{
                     __html: highlightText(
                        `${timestamp} - ${log.type.toUpperCase()}: ${log.message}\n${formattedArgs}`,
                        searchTerm || '',
                     ),
                  }}
               />
            );
         }

         // If no processed data, just show the basic message
         return (
            <Typography
               sx={commonTypographyStyles}
               dangerouslySetInnerHTML={{
                  __html: highlightText(`${timestamp} - ${log.type.toUpperCase()}: ${log.message}`, searchTerm || ''),
               }}
            />
         );
      };

      return renderCommonLog();
   };

   const renderLog = (log: LogViewerProps['logs'][0], index: number) => {
      const isSearchResult =
         searchTerm &&
         (log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.type.toLowerCase().includes(searchTerm.toLowerCase()));

      return (
         <Box
            key={index}
            ref={isSearchResult ? (ref: HTMLDivElement | null) => onSearchResultRef?.(ref, index) : undefined}
            sx={{
               bgcolor: getLogTypeBackground(log.type),
            }}>
            <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0}}>
               <Tooltip title='Copy log'>
                  <IconButton
                     size='small'
                     onClick={() => copyData([JSON.stringify(log, null, 2)], 'json')}
                     sx={{color: getLogTypeColor(log.type), p: 0.5, mt: 0.5}}>
                     <ContentCopyIcon fontSize='small' />
                  </IconButton>
               </Tooltip>
               <Box
                  sx={{
                     mt: 0.5,
                  }}>
                  {renderLogContent(log, index)}
               </Box>
            </Box>
         </Box>
      );
   };

   return (
      <Box
         component='pre'
         sx={{
            'm': 0,
            'fontFamily': 'monospace',
            'fontSize': sizeSettings.text.fontSize,
            'lineHeight': sizeSettings.text.lineHeight,
            'whiteSpace': 'pre-wrap',
            'display': 'flex',
            'flexDirection': 'column',
            'gap': 1,
            '@keyframes fadeBorder': {
               '0%': {borderColor: '#ff0000'},
               '100%': {borderColor: 'transparent'},
            },
         }}>
         {logs.length > 0 ? (
            logs.map((log, index) => renderLog(log, index))
         ) : (
            <Typography sx={{color: '#B0B0B0', fontStyle: 'italic'}}>No logs available</Typography>
         )}
         <div ref={logsEndRef} />
      </Box>
   );
};

export default LogViewer;
