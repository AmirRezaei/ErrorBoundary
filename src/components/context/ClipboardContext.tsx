// File: ./src/components/context/ClipboardContext.tsx

import {createContext, JSX, ReactNode, useContext} from 'react';

interface ClipboardContextType<T> {
   copyData: (data: T[], format: 'text' | 'json', formatter?: (item: T) => string) => Promise<void>;
}

const ClipboardContext = createContext<ClipboardContextType<unknown> | undefined>(undefined);

interface ClipboardProviderProps<T> {
   children: ReactNode;
}

export const ClipboardProvider = <T,>({children}: ClipboardProviderProps<T>): JSX.Element => {
   const copyData = async (data: T[], format: 'text' | 'json', formatter?: (item: T) => string): Promise<void> => {
      try {
         let textToCopy: string;

         if (format === 'json') {
            textToCopy = JSON.stringify(data, null, 2);
         } else {
            textToCopy = formatter ? data.map(formatter).join('\n') : data.map(item => JSON.stringify(item)).join('\n');
         }

         await navigator.clipboard.writeText(textToCopy);
      } catch (error) {
         console.error('Failed to copy to clipboard:', error);
         throw new Error('Failed to copy to clipboard');
      }
   };

   const value: ClipboardContextType<T> = {copyData};

   return (
      <ClipboardContext.Provider value={value as ClipboardContextType<unknown>}>{children}</ClipboardContext.Provider>
   );
};

export const useClipboard = <T,>(): ClipboardContextType<T> => {
   const context = useContext(ClipboardContext);
   if (!context) {
      throw new Error('useClipboard must be used within a ClipboardProvider');
   }
   return context as ClipboardContextType<T>;
};
