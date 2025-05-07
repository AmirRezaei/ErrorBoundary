// File: ./src/components/context/DebugPanelContext.tsx

import React, {createContext, ReactNode, useContext} from 'react';

interface DebugPanelContextType {
   isOpen: boolean;
   setIsOpen: (isOpen: boolean) => void;
}

const DebugPanelContext = createContext<DebugPanelContextType | undefined>(undefined);

interface DebugPanelProviderProps {
   children: ReactNode;
   defaultIsOpen: boolean;
}

export const DebugPanelProvider: React.FC<DebugPanelProviderProps> = ({children, defaultIsOpen}) => {
   const [isOpen, setIsOpen] = React.useState(() => {
      console.log('Initializing DebugPanel with defaultIsOpen:', defaultIsOpen);
      return defaultIsOpen;
   });

   const handleSetIsOpen = React.useCallback((value: boolean) => {
      console.log('Setting DebugPanel state to:', value);
      setIsOpen(value);
   }, []);

   // Effect to ensure the panel is visible on mount if defaultIsOpen is true
   React.useEffect(() => {
      console.log('DebugPanel mount effect, defaultIsOpen:', defaultIsOpen);
      if (defaultIsOpen) {
         setIsOpen(true);
      }
   }, [defaultIsOpen]);

   // Log state changes
   React.useEffect(() => {
      console.log('DebugPanel state changed to:', isOpen);
   }, [isOpen]);

   return (
      <DebugPanelContext.Provider value={{isOpen, setIsOpen: handleSetIsOpen}}>{children}</DebugPanelContext.Provider>
   );
};

export const useDebugPanel = (): DebugPanelContextType => {
   const context = useContext(DebugPanelContext);
   if (!context) {
      throw new Error('useDebugPanel must be used within a DebugPanelProvider');
   }
   return context;
};
