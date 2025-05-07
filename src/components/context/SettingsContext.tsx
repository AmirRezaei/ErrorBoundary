// File: ./src/components/context/SettingsContext.tsx

import React, {createContext, useContext, useEffect, useState} from 'react';
import {LogType} from '../types.js';

interface SettingsContextType {
   settings: {
      debugPanel: {
         height: number;
      };
      errorBoundary: {
         activeTab: string;
         activeLogTabs: LogType[];
      };
   };
   updateSettings: (key: keyof SettingsContextType['settings'], value: any) => void;
}

const DEFAULT_SETTINGS = {
   debugPanel: {
      height: 300,
   },
   errorBoundary: {
      activeTab: 'console logs',
      activeLogTabs: ['log', 'error', 'warn', 'info', 'debug'] as LogType[],
   },
};

const STORAGE_KEY = 'ErrorBoundary';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
   const [settings, setSettings] = useState<SettingsContextType['settings']>(() => {
      try {
         const storedSettings = localStorage.getItem(STORAGE_KEY);
         if (!storedSettings) return DEFAULT_SETTINGS;

         const parsed = JSON.parse(storedSettings);
         // Handle both old and new format
         const settings = parsed.ErrorBoundary || parsed;

         return {
            debugPanel: {
               height: settings.debugPanel?.height ?? DEFAULT_SETTINGS.debugPanel.height,
            },
            errorBoundary: {
               activeTab: settings.errorBoundary?.activeTab ?? DEFAULT_SETTINGS.errorBoundary.activeTab,
               activeLogTabs: (settings.errorBoundary?.activeLogTabs ??
                  DEFAULT_SETTINGS.errorBoundary.activeLogTabs) as LogType[],
            },
         };
      } catch (error) {
         console.error('Error loading settings:', error);
         return DEFAULT_SETTINGS;
      }
   });

   useEffect(() => {
      try {
         localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
         console.error('Error saving settings:', error);
      }
   }, [settings]);

   const updateSettings = (key: keyof SettingsContextType['settings'], value: any) => {
      setSettings(prev => ({
         ...prev,
         [key]: {
            ...prev[key],
            ...value,
         },
      }));
   };

   return <SettingsContext.Provider value={{settings, updateSettings}}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
   const context = useContext(SettingsContext);
   if (context === undefined) {
      throw new Error('useSettings must be used within a SettingsProvider');
   }
   return context;
};
