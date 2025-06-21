import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ArchiveContextType {
  showCancelled: boolean;
  toggleShowCancelled: () => void;
}

const ArchiveContext = createContext<ArchiveContextType | undefined>(undefined);

interface ArchiveProviderProps {
  children: ReactNode;
}

export const ArchiveProvider: React.FC<ArchiveProviderProps> = ({ children }) => {
  const [showCancelled, setShowCancelled] = useState(false);

  const toggleShowCancelled = () => {
    setShowCancelled(prev => !prev);
  };

  return (
    <ArchiveContext.Provider value={{ showCancelled, toggleShowCancelled }}>
      {children}
    </ArchiveContext.Provider>
  );
};

export const useArchive = (): ArchiveContextType => {
  const context = useContext(ArchiveContext);
  if (context === undefined) {
    throw new Error('useArchive must be used within an ArchiveProvider');
  }
  return context;
};