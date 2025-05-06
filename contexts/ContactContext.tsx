import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import config from '../configs/API';

// Define the shape of our context
interface ContactContextType {
  contactData: any;
  loading: boolean;
  error: string | null;
  refreshContactData: () => Promise<void>;
}

// Create the context with default values
const ContactContext = createContext<ContactContextType>({
  contactData: null,
  loading: false,
  error: null,
  refreshContactData: async () => {},
});

// Define props for the provider component
interface ContactProviderProps {
  children: ReactNode;
}

// Create a provider component
export const ContactProvider: React.FC<ContactProviderProps> = ({ children }) => {
  const [contactData, setContactData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch contact data from API
  const refreshContactData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${config.USER_API}/getcontact`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched contact data:', data);
      
      setContactData(data);
    } catch (err) {
      console.error('Error fetching contact data:', err);
      setError('Failed to load contact information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch contact data on initial load
  useEffect(() => {
    refreshContactData();
  }, []);

  return (
    <ContactContext.Provider
      value={{
        contactData,
        loading,
        error,
        refreshContactData,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};

// Create a custom hook for using this context
export const useContact = () => useContext(ContactContext);
