import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { RequestMethod, secureRequest } from '../utils/tokenedRequest';
import config from '../configs/API';

// Define types for our data
export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  type: string;
  link?: string;
}

export interface Update {
  id: string;
  title: string;
  subtitle: string;
  type: 'video' | 'news' | 'event';
  date: string;
  link?: string;
  thumbnail?: string;
}

interface HomePageData {
  events: Event[];
  updates: Update[];
  recommended_colleges: any[];
}

interface EventsContextType {
  events: Event[];
  updates: Update[];
  recommendedColleges: any[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [recommendedColleges, setRecommendedColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomePageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${config.USER_API}/gethomepage`,
      );
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      const data = await response.json();
      if (data) {
        setEvents(data.events || []);
        setUpdates(data.updates || []);
        setRecommendedColleges(data.recommended_colleges || []);
      }
    } catch (err) {
      console.error('Error fetching home page data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchHomePageData();
  }, []);

  const refreshData = async () => {
    await fetchHomePageData();
  };

  const value = {
    events,
    updates,
    recommendedColleges,
    loading,
    error,
    refreshData
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
};

export const useEventsContext = (): EventsContextType => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEventsContext must be used within an EventsProvider');
  }
  return context;
};
