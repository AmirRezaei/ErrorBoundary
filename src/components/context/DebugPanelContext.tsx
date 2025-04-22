// File: ./src/components/utils/ErrorBoundaryComp/components/DebugPanelContext.tsx

import React, {createContext, ReactNode, useContext} from 'react';

interface DebugPanelContextType {
   isOpen: boolean;
   setIsOpen: (isOpen: boolean) => void;
}

const DebugPanelContext = createContext<DebugPanelContextType | undefined>(undefined);

interface DebugPanelProviderProps {
   children: ReactNode;
   defaultIsOpen?: boolean;
}

export const DebugPanelProvider: React.FC<DebugPanelProviderProps> = ({children, defaultIsOpen = false}) => {
   const [isOpen, setIsOpen] = React.useState(defaultIsOpen);

   return <DebugPanelContext.Provider value={{isOpen, setIsOpen}}>{children}</DebugPanelContext.Provider>;
};

export const useDebugPanel = (): DebugPanelContextType => {
   const context = useContext(DebugPanelContext);
   if (!context) {
      throw new Error('useDebugPanel must be used within a DebugPanelProvider');
   }
   return context;
};
