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

// New review interface based on CSV data
export interface Review {
  id: string;
  timestamp: string;
  firstName: string;
  lastName: string;
  college: string;
  branch: string;
  district: string;
  gender: string;
  feedback: string;
  photoUrl?: string;
  featured?: boolean;
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
  reviews: Review[];
  loading: boolean;
  error: string | null;
  enabledFeatures: string[];
  refreshData: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [recommendedColleges, setRecommendedColleges] = useState<any[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);

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

  // New function to fetch reviews
  const fetchReviews = async () => {
    try {
      const response = await fetch(`${config.USER_API}/getreviews`);
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.data) {
        setReviews(data.data);
      }
      return data.data || [];
    } catch (err) {
      console.error('Error fetching reviews:', err);
      return [];
    }
  };

  const fetchEnabledFeatures = async () => {
    try {
      const response = await fetch(`${config.USER_API}/getenabledfeatures`);
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Enabled features:', data);
      
      if (data) {
        setEnabledFeatures(data.enabled || []);
      }
      return data.enabled || [];
    } catch (err) {
      console.error('Error fetching enabled features:', err);
      return [];
    }
  }

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchHomePageData(),
        fetchReviews(),
        fetchEnabledFeatures()
      ]);
    };
    fetchAllData();
  }, []);

  const refreshData = async () => {
    await Promise.all([
      fetchHomePageData(),
      fetchReviews(),
      fetchEnabledFeatures()
    ]);
  };

  const value = {
    events,
    updates,
    recommendedColleges,
    reviews,
    loading,
    error,
    enabledFeatures,
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
