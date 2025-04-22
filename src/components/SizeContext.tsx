// File: ./src/components/utils/ErrorBoundaryComp/components/SizeContext.tsx

import {createContext, ReactNode, useContext, useState} from 'react';

export type SizeOption = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface SizeSettings {
   text: {
      fontSize: string;
      lineHeight: string;
   };
   icon: {
      fontSize: string;
   };
   button: {
      size: 'small' | 'medium' | 'large';
      fontSize: string;
   };
   input: {
      size: 'small' | 'medium';
      fontSize: string;
   };
   tab: {
      fontSize: string;
      iconSize: string;
      minHeight: string;
   };
   spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
   };
}

interface SizeContextType {
   size: SizeOption;
   setSize: React.Dispatch<React.SetStateAction<SizeOption>>;
   getSizeSettings: () => SizeSettings;
}

const SizeContext = createContext<SizeContextType | undefined>(undefined);

const sizeSettingsMap: Record<SizeOption, SizeSettings> = {
   xs: {
      text: {
         fontSize: '0.65rem',
         lineHeight: '1.2',
      },
      icon: {
         fontSize: '0.8rem',
      },
      button: {
         size: 'small',
         fontSize: '0.65rem',
      },
      input: {
         size: 'small',
         fontSize: '0.65rem',
      },
      tab: {
         fontSize: '0.65rem',
         iconSize: '0.8rem',
         minHeight: '24px',
      },
      spacing: {
         xs: 0.25,
         sm: 0.5,
         md: 1,
         lg: 1.5,
         xl: 2,
      },
   },
   sm: {
      text: {
         fontSize: '0.7rem',
         lineHeight: '1.3',
      },
      icon: {
         fontSize: '0.9rem',
      },
      button: {
         size: 'small',
         fontSize: '0.7rem',
      },
      input: {
         size: 'small',
         fontSize: '0.7rem',
      },
      tab: {
         fontSize: '0.7rem',
         iconSize: '0.9rem',
         minHeight: '28px',
      },
      spacing: {
         xs: 0.5,
         sm: 1,
         md: 1.5,
         lg: 2,
         xl: 2.5,
      },
   },
   md: {
      text: {
         fontSize: '0.75rem',
         lineHeight: '1.4',
      },
      icon: {
         fontSize: '1rem',
      },
      button: {
         size: 'medium',
         fontSize: '0.75rem',
      },
      input: {
         size: 'medium',
         fontSize: '0.75rem',
      },
      tab: {
         fontSize: '0.75rem',
         iconSize: '1rem',
         minHeight: '32px',
      },
      spacing: {
         xs: 0.75,
         sm: 1.25,
         md: 2,
         lg: 2.5,
         xl: 3,
      },
   },
   lg: {
      text: {
         fontSize: '0.875rem',
         lineHeight: '1.5',
      },
      icon: {
         fontSize: '1.1rem',
      },
      button: {
         size: 'medium',
         fontSize: '0.875rem',
      },
      input: {
         size: 'medium',
         fontSize: '0.875rem',
      },
      tab: {
         fontSize: '0.875rem',
         iconSize: '1.1rem',
         minHeight: '36px',
      },
      spacing: {
         xs: 1,
         sm: 1.5,
         md: 2.5,
         lg: 3,
         xl: 3.5,
      },
   },
   xl: {
      text: {
         fontSize: '1rem',
         lineHeight: '1.6',
      },
      icon: {
         fontSize: '1.2rem',
      },
      button: {
         size: 'large',
         fontSize: '1rem',
      },
      input: {
         size: 'medium',
         fontSize: '1rem',
      },
      tab: {
         fontSize: '1rem',
         iconSize: '1.2rem',
         minHeight: '40px',
      },
      spacing: {
         xs: 1.25,
         sm: 1.75,
         md: 3,
         lg: 3.5,
         xl: 4,
      },
   },
};

export const SizeProvider: React.FC<{children: ReactNode}> = ({children}) => {
   const [size, setSize] = useState<SizeOption>('xs');

   const getSizeSettings = () => sizeSettingsMap[size];

   return <SizeContext.Provider value={{size, setSize, getSizeSettings}}>{children}</SizeContext.Provider>;
};

export const useSize = () => {
   const context = useContext(SizeContext);
   if (!context) {
      throw new Error('useSize must be used within a SizeProvider');
   }
   return context;
};
