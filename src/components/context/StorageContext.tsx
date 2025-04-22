// File: ./src/components/utils/ErrorBoundaryComp/components/StorageContext.tsx

import isEqual from 'lodash/isEqual';
import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';

interface StorageContextType {
   storageData: Record<string, any>;
   setItem: (key: string, value: string) => void;
   removeItem: (key: string) => void;
   clear: () => void;
   refresh: () => void;
   recentlyUpdated: Set<string>;
   snapshot: Record<string, any> | null;
   takeSnapshot: () => void;
   clearSnapshot: () => void;
   generateDiff: () => Record<string, any>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

const getStorageData = (storage: Storage): Record<string, any> => {
   const data: Record<string, any> = {};
   for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) {
         try {
            data[key] = JSON.parse(storage.getItem(key) || '{}');
         } catch {
            data[key] = storage.getItem(key);
         }
      }
   }
   return data;
};

export const StorageProvider: React.FC<{children: React.ReactNode; storage: Storage}> = ({children, storage}) => {
   const [storageData, setStorageData] = useState<Record<string, any>>(() => getStorageData(storage));
   const [recentlyUpdated, setRecentlyUpdated] = useState<Set<string>>(new Set());
   const [snapshot, setSnapshot] = useState<Record<string, any> | null>(null);

   const updateStorageData = useCallback((newData: Record<string, any>) => {
      setStorageData(prev => {
         if (isEqual(prev, newData)) {
            return prev;
         }
         return newData;
      });
   }, []);

   const addRecentlyUpdated = useCallback((key: string) => {
      setRecentlyUpdated(prev => {
         const next = new Set(prev);
         next.add(key);
         return next;
      });
      setTimeout(() => {
         setRecentlyUpdated(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
         });
      }, 1000);
   }, []);

   useEffect(() => {
      const handleStorageChange = (event: StorageEvent | CustomEvent) => {
         if (event.type === 'storage') {
            const {key} = event as StorageEvent;
            if (key) {
               addRecentlyUpdated(key);
            }
            const newData = getStorageData(storage);
            updateStorageData(newData);
         } else if (event.type === 'localStorage-change') {
            const {detail} = event as CustomEvent<{
               key: string | null;
               oldValue: string | null;
               newValue: string | null;
               action: string;
            }>;
            if (detail.key) {
               addRecentlyUpdated(detail.key);
            }
            const newData = getStorageData(storage);
            updateStorageData(newData);
         }
      };

      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('localStorage-change', handleStorageChange as EventListener);

      return () => {
         window.removeEventListener('storage', handleStorageChange);
         window.removeEventListener('localStorage-change', handleStorageChange as EventListener);
      };
   }, [storage, updateStorageData, addRecentlyUpdated]);

   const setItem = useCallback(
      (key: string, value: string) => {
         storage.setItem(key, value);
         addRecentlyUpdated(key);
      },
      [storage, addRecentlyUpdated],
   );

   const removeItem = useCallback(
      (key: string) => {
         storage.removeItem(key);
         addRecentlyUpdated(key);
      },
      [storage, addRecentlyUpdated],
   );

   const clear = useCallback(() => {
      storage.clear();
      Object.keys(storageData).forEach(key => addRecentlyUpdated(key));
   }, [storage, storageData, addRecentlyUpdated]);

   const refresh = useCallback(() => {
      const newData = getStorageData(storage);
      updateStorageData(newData);
   }, [storage, updateStorageData]);

   const takeSnapshot = useCallback(() => {
      setSnapshot(storageData);
   }, [storageData]);

   const clearSnapshot = useCallback(() => {
      setSnapshot(null);
   }, []);

   const generateDiff = useCallback(() => {
      if (!snapshot) return {};

      const diff: Record<string, any> = {};

      const compareObjects = (oldObj: any, newObj: any, currentDiff: Record<string, any> = {}) => {
         const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

         allKeys.forEach(key => {
            if (!(key in newObj)) {
               // Field is removed
               currentDiff[key] = {
                  operation: 'removed',
                  value: oldObj[key],
               };
            } else if (!(key in oldObj)) {
               // Field is added
               currentDiff[key] = {
                  operation: 'added',
                  value: newObj[key],
               };
            } else if (
               typeof oldObj[key] === 'object' &&
               oldObj[key] !== null &&
               typeof newObj[key] === 'object' &&
               newObj[key] !== null
            ) {
               // Recursively compare nested objects
               const nestedDiff: Record<string, any> = {};
               compareObjects(oldObj[key], newObj[key], nestedDiff);
               if (Object.keys(nestedDiff).length > 0) {
                  currentDiff[key] = nestedDiff;
               }
            } else if (!isEqual(oldObj[key], newObj[key])) {
               // Handle modified fields
               currentDiff[key] = {
                  ...currentDiff[key], // Preserve existing changes for this key
                  operation: 'modified',
                  from: oldObj[key],
                  to: newObj[key],
               };
            }
         });

         return currentDiff;
      };

      // Start the comparison
      compareObjects(snapshot, storageData, diff);
      return diff;
   }, [snapshot, storageData]);

   return (
      <StorageContext.Provider
         value={{
            storageData,
            setItem,
            removeItem,
            clear,
            refresh,
            recentlyUpdated,
            snapshot,
            takeSnapshot,
            clearSnapshot,
            generateDiff,
         }}>
         {children}
      </StorageContext.Provider>
   );
};

export const useStorage = (): StorageContextType => {
   const context = useContext(StorageContext);
   if (!context) {
      throw new Error('useStorage must be used within a StorageProvider');
   }
   return context;
};
