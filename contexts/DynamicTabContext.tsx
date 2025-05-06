import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import config from '../configs/API';

// Define the shape of dynamic tab data
export interface DynamicTabData {
  title: string;
  html: string | null;
  url: string | null;
  isPremiumOnly: boolean;
}

// Define the context shape
interface DynamicTabContextType {
  tabs: DynamicTabData[];
  loading: boolean;
  error: string | null;
  refreshTabs: () => Promise<void>;
}

// Create the context with default values
const DynamicTabContext = createContext<DynamicTabContextType>({
  tabs: [],
  loading: true,
  error: null,
  refreshTabs: async () => {},
});

// Define props for the provider component
interface DynamicTabProviderProps {
  children: ReactNode;
}

// Create provider component
export const DynamicTabProvider: React.FC<DynamicTabProviderProps> = ({ children }) => {
  const [tabs, setTabs] = useState<DynamicTabData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch dynamic tabs
  const refreshTabs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${config.USER_API}/getdynamiccontent`);

      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.data) {
        setTabs(data.data);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      console.error('Error fetching dynamic tabs:', err);
      setError('Failed to load dynamic content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tabs on initial load
  useEffect(() => {
    refreshTabs();
  }, []);

  return (
    <DynamicTabContext.Provider
      value={{
        tabs,
        loading,
        error,
        refreshTabs
      }}
    >
      {children}
    </DynamicTabContext.Provider>
  );
};

// Custom hook for consuming the context with isPremium filter
export const useDynamicTabs = (isPremium: boolean = false) => {
  const context = useContext(DynamicTabContext);
  
  if (!context) {
    throw new Error('useDynamicTabs must be used within a DynamicTabProvider');
  }
  
  // Filter tabs based on isPremium status
  const filteredTabs = context.tabs.filter(tab => 
    isPremium || !tab.isPremiumOnly // Show all tabs for premium users, or non-premium-only tabs for free users
  );
  
  return {
    tabs: filteredTabs,
    loading: context.loading,
    error: context.error,
    refreshTabs: context.refreshTabs
  };
};
