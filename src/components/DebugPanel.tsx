// File: ./src/components/DebugPanel.tsx

import 'react-json-view-lite/dist/index.css';

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BugReportIcon from '@mui/icons-material/BugReport';
import CodeIcon from '@mui/icons-material/Code';
import DeleteIcon from '@mui/icons-material/Delete';
import LogIcon from '@mui/icons-material/Description';
import ErrorIcon from '@mui/icons-material/Error';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import InfoIcon from '@mui/icons-material/Info';
import LastPageIcon from '@mui/icons-material/LastPage';
import ListIcon from '@mui/icons-material/List';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import StorageIcon from '@mui/icons-material/Storage';
import WarningIcon from '@mui/icons-material/Warning';
import {
   Box,
   Button,
   IconButton,
   Link,
   Paper,
   Tab,
   Tabs,
   TextField,
   ToggleButton,
   ToggleButtonGroup,
   Tooltip,
   Typography,
} from '@mui/material';
import {Resizable} from 're-resizable';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {Portal} from 'react-portal';

import {StorageProvider} from './context/StorageContext.js';
import LogViewer from './LogViewer.js';
import {useSize} from './SizeContext.js';
import {SizeSelector} from './SizeSelector.js';
import StorageViewer from './StorageViewer.js';
import {DebugPanelProps, LogType} from './types.js';
import {getLogTypeColor} from './utils.js';

const getLogTypeIcon = (type: LogType) => {
   switch (type) {
      case 'error':
         return <ErrorIcon fontSize='small' />;
      case 'warn':
         return <WarningIcon fontSize='small' />;
      case 'info':
         return <InfoIcon fontSize='small' />;
      case 'debug':
         return <LogIcon fontSize='small' />;
      case 'log':
         return <LogIcon fontSize='small' />;
      default:
         return <LogIcon fontSize='small' />;
   }
};

const DebugPanel: React.FC<DebugPanelProps> = ({
   state,
   setState,
   stackFrames,
   groupedLogs,
   openInEditor,
   copyLogsByType,
   copyStackTrace,
   clearLogs,
   showPanel,
}) => {
   const {hasError, error, activeTab, activeLogTab = ['log']} = state;
   const [searchTerm, setSearchTerm] = useState<string>('');
   const [autoScroll, setAutoScroll] = useState(true);
   const [currentSearchIndex, setCurrentSearchIndex] = useState<number>(-1);
   const searchResultsRef = useRef<HTMLDivElement[]>([]);
   const {getSizeSettings} = useSize();
   const sizeSettings = getSizeSettings();

   React.useEffect(() => {
      console.log('DebugPanel visibility changed:', showPanel);
   }, [showPanel]);

   const toggleAutoScroll = () => {
      setAutoScroll(prev => !prev);
   };

   const combinedLogs = useMemo(() => {
      const logs = activeLogTab.flatMap(type => groupedLogs[type]);
      return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
   }, [groupedLogs, activeLogTab]);

   const filteredLogs = useMemo(() => {
      if (!searchTerm) {
         setCurrentSearchIndex(-1);
         return combinedLogs;
      }
      const term = searchTerm.toLowerCase();
      const results = combinedLogs.filter(
         log => log.message.toLowerCase().includes(term) || log.type.toLowerCase().includes(term),
      );
      setCurrentSearchIndex(results.length > 0 ? 0 : -1);
      return results;
   }, [combinedLogs, searchTerm]);

   const navigateToSearchResult = (index: number) => {
      if (index >= 0 && index < searchResultsRef.current.length) {
         setCurrentSearchIndex(index);
         searchResultsRef.current[index].scrollIntoView({
            behavior: 'smooth',
            block: 'center',
         });
      }
   };

   const handleFirst = () => {
      if (searchResultsRef.current.length > 0) {
         navigateToSearchResult(0);
      }
   };

   const handlePrevious = () => {
      if (currentSearchIndex > 0) {
         navigateToSearchResult(currentSearchIndex - 1);
      }
   };

   const handleNext = () => {
      if (currentSearchIndex < searchResultsRef.current.length - 1) {
         navigateToSearchResult(currentSearchIndex + 1);
      }
   };

   const handleLast = () => {
      if (searchResultsRef.current.length > 0) {
         navigateToSearchResult(searchResultsRef.current.length - 1);
      }
   };

   const handleTabChange = useCallback(
      (_: React.SyntheticEvent, newValue: string) => {
         setState(prevState => ({
            ...prevState,
            activeTab: newValue,
            lastErrorTabVisit: newValue === 'error' ? Date.now() : prevState.lastErrorTabVisit,
            newErrorCount: newValue === 'error' ? 0 : prevState.newErrorCount,
         }));
      },
      [setState],
   );

   const handleLogTypeChange = useCallback(
      (_: React.MouseEvent<HTMLElement>, newLogTypes: LogType[]) => {
         if (newLogTypes.length > 0) {
            setState(prevState => ({...prevState, activeLogTab: newLogTypes}));
         }
      },
      [setState],
   );

   return (
      <Portal>
         <Resizable
            defaultSize={{height: 300, width: '100vw'}}
            minHeight={100}
            maxHeight='80vh'
            enable={{top: true, right: false, bottom: false, left: false}}
            handleStyles={{
               top: {
                  background: '#424242',
                  height: '8px',
                  cursor: 'ns-resize',
                  width: '100%',
               },
            }}
            style={{
               position: 'fixed',
               bottom: 0,
               left: 0,
               width: '100vw',
               zIndex: 1300,
               display: showPanel ? 'block' : 'none',
               visibility: showPanel ? 'visible' : 'hidden',
               opacity: showPanel ? 1 : 0,
               transition: 'opacity 0.2s ease-in-out',
            }}>
            <Paper
               elevation={6}
               sx={{
                  width: '100vw',
                  height: '100%',
                  bgcolor: '#1E1E1E',
                  color: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 1300,
               }}>
               <Box
                  sx={{
                     display: 'flex',
                     justifyContent: 'space-between',
                     alignItems: 'center',
                     p: 1,
                     bgcolor: '#121212',
                     borderBottom: '1px solid #424242',
                  }}>
                  <Tabs
                     value={activeTab}
                     onChange={handleTabChange}
                     sx={{
                        'bgcolor': '#1E1E1E',
                        'borderBottom': 1,
                        'borderColor': '#424242',
                        '& .MuiTab-root': {
                           'color': '#B0B0B0',
                           'minHeight': sizeSettings.tab.minHeight,
                           'fontSize': sizeSettings.tab.fontSize,
                           'padding': `${sizeSettings.spacing.xs} ${sizeSettings.spacing.sm}`,
                           '& .MuiSvgIcon-root': {
                              fontSize: sizeSettings.tab.iconSize,
                           },
                        },
                        '& .MuiTabs-flexContainer': {
                           minHeight: sizeSettings.tab.minHeight,
                        },
                        '& .Mui-selected': {color: '#FFFFFF !important', fontWeight: 'bold'},
                     }}>
                     <Tab label='Error' value='error' icon={<BugReportIcon fontSize='small' />} iconPosition='start' />
                     <Tab
                        label='Console Logs'
                        value='console logs'
                        icon={<ListIcon fontSize='small' />}
                        iconPosition='start'
                     />
                     <Tab label='Stack Trace' value='stack' icon={<CodeIcon fontSize='small' />} iconPosition='start' />
                     <Tab
                        label='Storage'
                        value='storage'
                        icon={<StorageIcon fontSize='small' />}
                        iconPosition='start'
                     />
                  </Tabs>
                  <SizeSelector />
               </Box>
               <Box sx={{flexGrow: 1, overflow: 'auto', p: 1, height: 'calc(100% - 80px)'}}>
                  {activeTab === 'error' && (
                     <Box sx={{height: '100%', overflow: 'auto'}}>
                        {hasError && error ? (
                           <>
                              <Typography variant='subtitle1' sx={{color: '#F44336', mb: 0.5, fontSize: '0.875rem'}}>
                                 Error Message
                              </Typography>
                              <Typography sx={{color: '#B0B0B0', fontSize: '0.75rem'}}>{error.message}</Typography>
                           </>
                        ) : (
                           <Typography sx={{color: '#B0B0B0', fontStyle: 'italic', fontSize: '0.75rem'}}>
                              No error occurred
                           </Typography>
                        )}
                     </Box>
                  )}
                  {activeTab === 'console logs' && (
                     <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                        <Paper
                           variant='outlined'
                           sx={{
                              flexGrow: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              overflow: 'hidden',
                              bgcolor: '#1E1E1E',
                              borderColor: '#424242',
                           }}>
                           <Box
                              sx={{
                                 display: 'flex',
                                 border: '1px solid #424242',
                                 alignItems: 'center',
                                 flexWrap: 'wrap',
                                 bgcolor: '#1E1E1E',
                                 p: 0.5,
                                 gap: 1,
                              }}>
                              <Tooltip title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}>
                                 <IconButton
                                    size='small'
                                    onClick={toggleAutoScroll}
                                    sx={{
                                       'color': autoScroll ? '#90CAF9' : '#B0B0B0',
                                       'bgcolor': '#2C2C2C',
                                       '&:hover': {bgcolor: '#424242'},
                                    }}>
                                    <AutoFixHighIcon />
                                 </IconButton>
                              </Tooltip>
                              <Tooltip title='Clear all logs'>
                                 <IconButton
                                    size='small'
                                    onClick={clearLogs}
                                    sx={{
                                       'color': '#F44336',
                                       'bgcolor': '#2C2C2C',
                                       '&:hover': {bgcolor: '#424242'},
                                    }}>
                                    <DeleteIcon />
                                 </IconButton>
                              </Tooltip>
                              <ToggleButtonGroup
                                 size='small'
                                 value={activeLogTab}
                                 onChange={handleLogTypeChange}
                                 aria-label='log type filter'
                                 sx={{
                                    '& .MuiToggleButtonGroup-grouped': {
                                       'margin': 0.5,
                                       'border': 0,
                                       'borderRadius': 1,
                                       '&.Mui-disabled': {
                                          border: 0,
                                       },
                                    },
                                    '& .MuiToggleButtonGroup-grouped:not(:first-of-type)': {
                                       marginLeft: -1,
                                       borderLeft: '1px solid transparent',
                                    },
                                 }}>
                                 {['log', 'error', 'warn', 'info', 'debug'].map(type => {
                                    const logType = type as LogType;
                                    const isSelected = activeLogTab.includes(logType);
                                    const color = getLogTypeColor(logType);
                                    return (
                                       <ToggleButton
                                          key={type}
                                          value={type}
                                          aria-label={type}
                                          sx={{
                                             'display': 'flex',
                                             'alignItems': 'center',
                                             'gap': 0.5,
                                             'color': isSelected
                                                ? logType === 'log' || logType === 'warn'
                                                   ? '#000000'
                                                   : '#FFFFFF'
                                                : color,
                                             'bgcolor': isSelected ? color : 'transparent',
                                             '&:hover': {
                                                bgcolor: isSelected ? color : `${color}20`,
                                             },
                                             '&.Mui-selected': {
                                                'color':
                                                   logType === 'log' || logType === 'warn' ? '#000000' : '#FFFFFF',
                                                'bgcolor': color,
                                                '&:hover': {
                                                   bgcolor: color,
                                                },
                                             },
                                          }}>
                                          {getLogTypeIcon(logType)}
                                          {`${type.toUpperCase()} (${groupedLogs[logType].length})`}
                                       </ToggleButton>
                                    );
                                 })}
                              </ToggleButtonGroup>
                           </Box>
                           <Box sx={{p: 1}}>
                              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                 <TextField
                                    placeholder='Search logs...'
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    size={sizeSettings.input.size}
                                    InputProps={{
                                       startAdornment: (
                                          <SearchIcon
                                             sx={{
                                                color: '#B0B0B0',
                                                fontSize: sizeSettings.icon.fontSize,
                                                mr: sizeSettings.spacing.xs,
                                             }}
                                          />
                                       ),
                                    }}
                                    sx={{
                                       '& .MuiInputBase-root': {
                                          'color': '#FFFFFF',
                                          'backgroundColor': '#2C2C2C',
                                          'fontSize': sizeSettings.input.fontSize,
                                          '&:hover': {
                                             backgroundColor: '#424242',
                                          },
                                       },
                                       '& .MuiOutlinedInput-notchedOutline': {
                                          borderColor: '#424242',
                                       },
                                    }}
                                 />
                                 <Box sx={{display: 'flex', gap: 0.5}}>
                                    <Tooltip title='First result'>
                                       {!searchTerm || searchResultsRef.current.length === 0 ? (
                                          <span>
                                             <IconButton
                                                size='small'
                                                disabled
                                                sx={{
                                                   color: '#666666',
                                                   backgroundColor: '#1E1E1E',
                                                }}>
                                                <FirstPageIcon />
                                             </IconButton>
                                          </span>
                                       ) : (
                                          <IconButton
                                             size='small'
                                             onClick={handleFirst}
                                             sx={{
                                                'color': '#FFFFFF',
                                                'backgroundColor': '#2C2C2C',
                                                '&:hover': {
                                                   backgroundColor: '#424242',
                                                },
                                             }}>
                                             <FirstPageIcon />
                                          </IconButton>
                                       )}
                                    </Tooltip>
                                    <Tooltip title='Previous result'>
                                       {!searchTerm || currentSearchIndex <= 0 ? (
                                          <span>
                                             <IconButton
                                                size='small'
                                                disabled
                                                sx={{
                                                   color: '#666666',
                                                   backgroundColor: '#1E1E1E',
                                                }}>
                                                <NavigateBeforeIcon />
                                             </IconButton>
                                          </span>
                                       ) : (
                                          <IconButton
                                             size='small'
                                             onClick={handlePrevious}
                                             sx={{
                                                'color': '#FFFFFF',
                                                'backgroundColor': '#2C2C2C',
                                                '&:hover': {
                                                   backgroundColor: '#424242',
                                                },
                                             }}>
                                             <NavigateBeforeIcon />
                                          </IconButton>
                                       )}
                                    </Tooltip>
                                    <Tooltip title='Next result'>
                                       {!searchTerm || currentSearchIndex >= searchResultsRef.current.length - 1 ? (
                                          <span>
                                             <IconButton
                                                size='small'
                                                disabled
                                                sx={{
                                                   color: '#666666',
                                                   backgroundColor: '#1E1E1E',
                                                }}>
                                                <NavigateNextIcon />
                                             </IconButton>
                                          </span>
                                       ) : (
                                          <IconButton
                                             size='small'
                                             onClick={handleNext}
                                             sx={{
                                                'color': '#FFFFFF',
                                                'backgroundColor': '#2C2C2C',
                                                '&:hover': {
                                                   backgroundColor: '#424242',
                                                },
                                             }}>
                                             <NavigateNextIcon />
                                          </IconButton>
                                       )}
                                    </Tooltip>
                                    <Tooltip title='Last result'>
                                       {!searchTerm || searchResultsRef.current.length === 0 ? (
                                          <span>
                                             <IconButton
                                                size='small'
                                                disabled
                                                sx={{
                                                   color: '#666666',
                                                   backgroundColor: '#1E1E1E',
                                                }}>
                                                <LastPageIcon />
                                             </IconButton>
                                          </span>
                                       ) : (
                                          <IconButton
                                             size='small'
                                             onClick={handleLast}
                                             sx={{
                                                'color': '#FFFFFF',
                                                'backgroundColor': '#2C2C2C',
                                                '&:hover': {
                                                   backgroundColor: '#424242',
                                                },
                                             }}>
                                             <LastPageIcon />
                                          </IconButton>
                                       )}
                                    </Tooltip>
                                 </Box>
                                 <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 0.5, gap: 1}}>
                                    <Tooltip title='Copy logs to clipboard'>
                                       <Button
                                          size={sizeSettings.button.size}
                                          variant='contained'
                                          sx={{
                                             'bgcolor': '#424242',
                                             'color': '#FFFFFF',
                                             'fontSize': sizeSettings.button.fontSize,
                                             'minHeight': sizeSettings.tab.minHeight,
                                             'padding': `${sizeSettings.spacing.xs} ${sizeSettings.spacing.sm}`,
                                             'lineHeight': 1,
                                             '&:hover': {
                                                bgcolor: '#616161',
                                             },
                                          }}
                                          onClick={() => {
                                             copyLogsByType(activeLogTab, 'text');
                                          }}>
                                          Copy
                                       </Button>
                                    </Tooltip>
                                 </Box>
                                 <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 0.5, gap: 1}}>
                                    <Tooltip title='Copy logs to clipboard'>
                                       <Button
                                          size={sizeSettings.button.size}
                                          variant='contained'
                                          sx={{
                                             'bgcolor': '#424242',
                                             'color': '#FFFFFF',
                                             'fontSize': sizeSettings.button.fontSize,
                                             'minHeight': sizeSettings.tab.minHeight,
                                             'padding': `${sizeSettings.spacing.xs} ${sizeSettings.spacing.sm}`,
                                             '&:hover': {
                                                bgcolor: '#616161',
                                             },
                                          }}
                                          onClick={() => {
                                             copyLogsByType(activeLogTab, 'json');
                                          }}>
                                          Copy JSON
                                       </Button>
                                    </Tooltip>
                                 </Box>
                              </Box>
                           </Box>
                           <Box sx={{p: 1, flexGrow: 1, overflow: 'auto'}}>
                              <LogViewer
                                 logs={filteredLogs}
                                 openInEditor={openInEditor}
                                 searchTerm={searchTerm}
                                 autoScroll={autoScroll}
                                 toggleAutoScroll={toggleAutoScroll}
                                 currentSearchIndex={currentSearchIndex}
                                 onSearchResultRef={(ref, index) => {
                                    if (ref) {
                                       searchResultsRef.current[index] = ref;
                                    }
                                 }}
                              />
                           </Box>
                        </Paper>
                     </Box>
                  )}
                  {activeTab === 'stack' && (
                     <Box sx={{height: '100%', overflow: 'auto'}}>
                        {error && error.stack ? (
                           <>
                              <Box sx={{display: 'flex', gap: 0.5, mb: 0.5}}>
                                 <Tooltip title='Copy stack trace to clipboard'>
                                    <Button
                                       size='small'
                                       variant='contained'
                                       sx={{
                                          'bgcolor': '#90CAF9',
                                          'color': '#FFFFFF',
                                          '&:hover': {bgcolor: '#42A5F5'},
                                          'fontSize': '0.7rem',
                                       }}
                                       onClick={copyStackTrace}>
                                       Copy Stack
                                    </Button>
                                 </Tooltip>
                              </Box>
                              <Box
                                 component='pre'
                                 sx={{
                                    m: 0,
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                    whiteSpace: 'pre-wrap',
                                 }}>
                                 {stackFrames.map((frame, index) => {
                                    // Determine if the frame is a source file (local project file)
                                    const isSourceFile =
                                       frame.file?.includes('/src/') ||
                                       frame.file?.endsWith('.tsx') ||
                                       frame.file?.endsWith('.jsx') ||
                                       frame.file?.endsWith('.ts') ||
                                       frame.file?.endsWith('.js');
                                    return (
                                       <Box key={index} sx={{mb: 0.25}}>
                                          {isSourceFile && frame.file ? (
                                             <Link
                                                component='button'
                                                onClick={() => {
                                                   // Clean file path to be relative to src
                                                   const srcMatch = frame.file.match(/src\/.*/);
                                                   const filePath = srcMatch ? srcMatch[0] : frame.file;
                                                   openInEditor({...frame, file: filePath});
                                                }}
                                                sx={{
                                                   'color': '#90CAF9',
                                                   'textDecoration': 'none',
                                                   'cursor': 'pointer',
                                                   'display': 'flex',
                                                   'alignItems': 'center',
                                                   'gap': 0.25,
                                                   'fontFamily': 'monospace',
                                                   'fontSize': '0.75rem',
                                                   '&:hover': {color: '#42A5F5', textDecoration: 'underline'},
                                                }}>
                                                <OpenInNewIcon fontSize='small' />
                                                {frame.raw}
                                             </Link>
                                          ) : (
                                             <Typography
                                                sx={{
                                                   color: '#B0B0B0',
                                                   fontFamily: 'monospace',
                                                   fontSize: '0.75rem',
                                                }}>
                                                {frame.raw}
                                             </Typography>
                                          )}
                                       </Box>
                                    );
                                 })}
                              </Box>
                           </>
                        ) : (
                           <Typography sx={{color: '#B0B0B0', fontStyle: 'italic', fontSize: '0.75rem'}}>
                              No stack trace available
                           </Typography>
                        )}
                     </Box>
                  )}
                  {activeTab === 'storage' && (
                     <Box sx={{height: '100%', overflow: 'auto'}}>
                        <Box sx={{display: 'flex', gap: 2, height: '100%'}}>
                           <StorageProvider storage={window.localStorage}>
                              <Box sx={{flex: 1, height: '100%'}}>
                                 <Typography variant='h6' sx={{color: '#FFFFFF', mb: 1}}>
                                    Local Storage
                                 </Typography>
                                 <StorageViewer storageType='localStorage' storage={window.localStorage} />
                              </Box>
                           </StorageProvider>
                           <StorageProvider storage={window.sessionStorage}>
                              <Box sx={{flex: 1, height: '100%'}}>
                                 <Typography variant='h6' sx={{color: '#FFFFFF', mb: 1}}>
                                    Session Storage
                                 </Typography>
                                 <StorageViewer storageType='sessionStorage' storage={window.sessionStorage} />
                              </Box>
                           </StorageProvider>
                        </Box>
                     </Box>
                  )}
               </Box>
            </Paper>
         </Resizable>
      </Portal>
   );
};

export default DebugPanel;
