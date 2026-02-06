import { createContext, useContext, useMemo, useState } from 'react';
import { sampleEntries } from '../utils/sampleData';
import { generateId } from '../utils/id';

const TransportContext = createContext(null);

export const TransportProvider = ({ children }) => {
  const [entries, setEntries] = useState(sampleEntries);

  const addEntry = (entry) => {
    setEntries((prev) => [{ ...entry, id: generateId() }, ...prev]);
  };

  const contextValue = useMemo(
    () => ({
      entries,
      addEntry
    }),
    [entries]
  );

  return <TransportContext.Provider value={contextValue}>{children}</TransportContext.Provider>;
};

export const useTransportContext = () => {
  const context = useContext(TransportContext);

  if (!context) {
    throw new Error('useTransportContext must be used within TransportProvider');
  }

  return context;
};
