// File: ./src/components/StorageViewer.tsx

import 'react-json-view-lite/dist/index.css';

import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ExportIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import ImportIcon from '@mui/icons-material/Upload';
import {Box, Button, IconButton, Tooltip, Typography} from '@mui/material';
import React, {useCallback, useRef, useState} from 'react';
import {collapseAllNested, darkStyles, JsonView} from 'react-json-view-lite';

import {useClipboard} from './context/ClipboardContext';
import {useStorage} from './context/StorageContext';
import {StorageViewerProps} from './types';

const StorageViewer: React.FC<StorageViewerProps> = () => {
   const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [isSnapshotActive, setIsSnapshotActive] = useState(false);
   const [diffStatus, setDiffStatus] = useState<Record<string, 'added' | 'removed' | 'modified' | null>>({});
   const {copyData} = useClipboard<any>();

   const {
      storageData,
      setItem,
      removeItem,
      clear,
      refresh,
      recentlyUpdated,
      takeSnapshot,
      clearSnapshot,
      generateDiff,
   } = useStorage();

   const toggleExpand = (key: string) => {
      setExpandedKeys(prev => {
         const next = new Set(prev);
         if (next.has(key)) {
            next.delete(key);
         } else {
            next.add(key);
         }
         return next;
      });
   };

   const copyToClipboard = (value: any) => {
      const text = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
      copyData([text], 'text');
   };

   const copyAllStorage = () => {
      copyData([JSON.stringify(storageData, null, 2)], 'json');
   };

   const deleteItem = useCallback(
      (key: string) => {
         removeItem(key);
      },
      [removeItem],
   );

   const deleteAll = useCallback(() => {
      clear();
   }, [clear]);

   const exportData = () => {
      const blob = new Blob([JSON.stringify(storageData, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `storage-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
   };

   const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = e => {
         try {
            const data = JSON.parse(e.target?.result as string);
            Object.entries(data).forEach(([key, value]) => {
               setItem(key, JSON.stringify(value));
            });
         } catch (error) {
            console.error('Failed to import data:', error);
         }
      };
      reader.readAsText(file);
   };

   const handleSnapshotToggle = useCallback(() => {
      if (isSnapshotActive) {
         clearSnapshot();
         setIsSnapshotActive(false);
         setDiffStatus({});
      } else {
         takeSnapshot();
         setIsSnapshotActive(true);
         const diff = generateDiff();
         const newDiffStatus: Record<string, 'added' | 'removed' | 'modified' | null> = {};

         // Process the diff to create a status map, handling nested paths
         Object.entries(diff).forEach(([path, change]) => {
            if (typeof change === 'object' && 'status' in change) {
               // Remove array indices from the path
               const cleanPath = path.replace(/\.\d+(?=\.|$)/g, '');
               newDiffStatus[cleanPath] = change.status;
            }
         });

         setDiffStatus(newDiffStatus);
      }
   }, [isSnapshotActive, takeSnapshot, clearSnapshot, generateDiff]);

   const copyDiffToClipboard = useCallback(() => {
      const diff = generateDiff();
      copyData([diff], 'json');
      // Clear snapshot after copying diff
      clearSnapshot();
      setIsSnapshotActive(false);
      setDiffStatus({});
   }, [generateDiff, clearSnapshot, copyData]);

   const getStatusColor = (status: 'added' | 'removed' | 'modified' | null) => {
      switch (status) {
         case 'added':
            return '#4CAF50';
         case 'removed':
            return '#F44336';
         case 'modified':
            return '#FFC107';
         default:
            return '#90CAF9';
      }
   };

   const getStatusForPath = (path: string): 'added' | 'removed' | 'modified' | null => {
      // Remove array indices from the path before checking status
      const cleanPath = path.replace(/\.\d+(?=\.|$)/g, '');
      return diffStatus[cleanPath] || null;
   };

   const renderValue = (key: string, value: any, parentPath: string = '') => {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      const isJson = typeof value === 'object' && value !== null;
      const isRecentlyUpdated = recentlyUpdated.has(key);
      const status = getStatusForPath(currentPath);
      const statusColor = getStatusColor(status);

      return (
         <Box
            key={currentPath}
            sx={{
               'mb': 0.5,
               'animation': isRecentlyUpdated ? 'flashBackground 1s ease-in-out' : 'none',
               '@keyframes flashBackground': {
                  '0%': {backgroundColor: '#90CAF920'},
                  '100%': {backgroundColor: 'transparent'},
               },
            }}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
               <Tooltip title='Copy value'>
                  <IconButton size='small' onClick={() => copyToClipboard(value)} sx={{color: statusColor, p: 0.25}}>
                     <ContentCopyIcon fontSize='small' />
                  </IconButton>
               </Tooltip>
               <Tooltip title='Delete item'>
                  <IconButton size='small' onClick={() => deleteItem(key)} sx={{color: '#F44336', p: 0.25}}>
                     <DeleteIcon fontSize='small' />
                  </IconButton>
               </Tooltip>
               {isJson ? (
                  <Button
                     size='small'
                     onClick={() => toggleExpand(currentPath)}
                     sx={{color: statusColor, p: 0, minWidth: 'auto', fontSize: '0.7rem'}}>
                     {expandedKeys.has(currentPath) ? '▼' : '▶'} {key}
                     {status && (
                        <Typography
                           component='span'
                           sx={{
                              ml: 0.5,
                              fontSize: '0.6rem',
                              color: statusColor,
                              textTransform: 'uppercase',
                           }}>
                           ({status})
                        </Typography>
                     )}
                  </Button>
               ) : (
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                     <Typography sx={{color: statusColor, fontSize: '0.7rem'}}>{key}:</Typography>
                     <Typography sx={{color: '#B0B0B0', fontSize: '0.7rem'}}>{String(value)}</Typography>
                     {status && (
                        <Typography
                           component='span'
                           sx={{
                              ml: 0.5,
                              fontSize: '0.6rem',
                              color: statusColor,
                              textTransform: 'uppercase',
                           }}>
                           ({status})
                        </Typography>
                     )}
                  </Box>
               )}
            </Box>
            {isJson && expandedKeys.has(key) && (
               <Box sx={{ml: 1.5, mt: 0.25}}>
                  <JsonView
                     data={value}
                     clickToExpandNode={true}
                     shouldExpandNode={collapseAllNested}
                     style={{...darkStyles}}
                  />
               </Box>
            )}
         </Box>
      );
   };

   return (
      <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
         <Box
            sx={{
               display: 'flex',
               alignItems: 'center',
               gap: 1,
               p: 1,
               bgcolor: '#1E1E1E',
               borderBottom: '1px solid #424242',
            }}>
            <Tooltip title='Import data'>
               <IconButton size='small' onClick={() => fileInputRef.current?.click()} sx={{color: '#90CAF9'}}>
                  <ImportIcon fontSize='small' />
               </IconButton>
            </Tooltip>
            <input type='file' ref={fileInputRef} style={{display: 'none'}} accept='.json' onChange={handleImport} />
            <Tooltip title='Export all data'>
               <IconButton size='small' onClick={exportData} sx={{color: '#90CAF9'}}>
                  <ExportIcon fontSize='small' />
               </IconButton>
            </Tooltip>
            <Tooltip title='Copy all storage data'>
               <IconButton size='small' onClick={copyAllStorage} sx={{color: '#90CAF9'}}>
                  <ContentCopyIcon fontSize='small' />
               </IconButton>
            </Tooltip>
            <Tooltip title='Refresh storage data'>
               <IconButton size='small' onClick={refresh} sx={{color: '#90CAF9'}}>
                  <RefreshIcon fontSize='small' />
               </IconButton>
            </Tooltip>
            <Tooltip title='Delete all data'>
               <IconButton size='small' onClick={deleteAll} sx={{color: '#F44336'}}>
                  <DeleteForeverIcon fontSize='small' />
               </IconButton>
            </Tooltip>
            <Tooltip title={isSnapshotActive ? 'Clear snapshot and copy diff' : 'Take snapshot'}>
               <IconButton
                  size='small'
                  onClick={isSnapshotActive ? copyDiffToClipboard : handleSnapshotToggle}
                  sx={{color: isSnapshotActive ? '#4CAF50' : '#90CAF9'}}>
                  <CameraAltIcon fontSize='small' />
               </IconButton>
            </Tooltip>
         </Box>
         <Box sx={{flexGrow: 1, overflow: 'auto', p: 1}}>
            {Object.entries(storageData).length > 0 ? (
               Object.entries(storageData).map(([key, value]) => renderValue(key, value))
            ) : (
               <Typography sx={{color: '#B0B0B0', fontStyle: 'italic', fontSize: '0.7rem'}}>
                  No data available
               </Typography>
            )}
         </Box>
      </Box>
   );
};

export default StorageViewer;
