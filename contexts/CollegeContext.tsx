import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collegeDataManager, College } from '../utils/college-data-store';

interface CollegeContextType {
  colleges: College[];
  isLoading: boolean;
  error: string | null;
  searchColleges: (query: string) => College[];
  filterColleges: (options: { status?: string; city?: string }) => College[];
  getCollegeById: (id: string) => College | undefined;
  refreshColleges: () => Promise<void>;
}

const CollegeContext = createContext<CollegeContextType | undefined>(undefined);

interface CollegeProviderProps {
  children: ReactNode;
}

export const CollegeProvider: React.FC<CollegeProviderProps> = ({ children }) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadColleges = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const collegeData = await collegeDataManager.initialize();
      setColleges(collegeData);
    } catch (err) {
      setError('Failed to load college data');
      console.error('Error initializing college data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadColleges();
  }, []);

  const searchColleges = (query: string): College[] => {
    return collegeDataManager.searchColleges(query);
  };

  const filterColleges = (options: { status?: string; city?: string }): College[] => {
    return collegeDataManager.filterColleges(options);
  };

  const getCollegeById = (id: string): College | undefined => {
    return collegeDataManager.getCollegeById(id);
  };

  const refreshColleges = async (): Promise<void> => {
    await loadColleges();
  };

  const value = {
    colleges,
    isLoading,
    error,
    searchColleges,
    filterColleges,
    getCollegeById,
    refreshColleges
  };

  return <CollegeContext.Provider value={value}>{children}</CollegeContext.Provider>;
};

export const useCollegeContext = (): CollegeContextType => {
  const context = useContext(CollegeContext);
  if (context === undefined) {
    throw new Error('useCollegeContext must be used within a CollegeProvider');
  }
  return context;
};
