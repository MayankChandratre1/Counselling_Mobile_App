import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getUserData, getUserPlanData, storeUserPlanData } from '../utils/storage';
import { secureRequest, RequestMethod } from '../utils/tokenedRequest';
import config from '../configs/API';

interface Plan {
  title: string;
  price: number;
  isLocked: boolean;
  opensAt?: PlanTimestamp;
  benefits: string[];
  form: string;
}

interface PlansResponse {
  plans: Plan[];
}

// Define interfaces for the plan data
interface PlanTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

interface PlanDetails {
  planTitle: string;
  purchasedDate: PlanTimestamp;
  expiryDate: PlanTimestamp;
  form: string
}

interface PremiumPlan {
  isPremium: boolean;
  plan?: PlanDetails;
}

// Define the shape of our context
interface PremiumPlanContextType {
  premiumPlan: PremiumPlan | null;
  isLoading: boolean;
  currentPlan: string;
  refreshPlanData: (userId?: string) => Promise<void>;
  setPlanData: (data: PremiumPlan) => void;
  daysLeft: number;
  plans: Plan[];
  loading: boolean;
  error: string | null;
}

// Create the context with default values
const PremiumPlanContext = createContext<PremiumPlanContextType>({
  premiumPlan: null,
  isLoading: true,
  currentPlan: 'Free',
  refreshPlanData: async () => {},
  setPlanData: () => {},
  daysLeft: 0,
  plans: [],
  loading: false,
  error: null,
});

// Define props for the provider component
interface PremiumPlanProviderProps {
  children: ReactNode;
}

// Create a provider component
export const PremiumPlanProvider: React.FC<PremiumPlanProviderProps> = ({ children }) => {
  const [premiumPlan, setPremiumPlan] = useState<PremiumPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPlan, setCurrentPlan] = useState<string>('Free');
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [plans, setPlans] = useState<Plan[]>([]); // Assuming plans is an array of objects
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      //use fetch from your api endpoint to get the plans
      const response = await fetch(`${config.USER_API}/get-premium-plans`); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: PlansResponse = await response.json();
      console.log('Fetched plans:', data.plans);
      
      setPlans(data.plans);
      setError(null);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Failed to load plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate days left in subscription
  const calculateDaysLeft = (expiryDate?: PlanTimestamp) => {
    if (!expiryDate) return 0;
    
    const now = new Date();
    const expiry = new Date(expiryDate._seconds * 1000);
    const timeDiff = expiry.getTime() - now.getTime();
    return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  };

  // Function to fetch premium plan data from storage or API
  const refreshPlanData = async (userId?: string) => {
    try {
      setIsLoading(true);
      
      // Get local stored data first for immediate display
      const storedPlan = await getUserPlanData();
      
      if (storedPlan) {
        setPremiumPlan(storedPlan);
        setCurrentPlan(storedPlan.isPremium ? (storedPlan.plan?.planTitle ?? 'Premium') : 'Free');
        setDaysLeft(calculateDaysLeft(storedPlan.plan?.expiryDate));
      }
      
      // If we don't have a user ID, try to get it
      if (!userId) {
        const userData = await getUserData();
        userId = userData?.phone;
      }
      
      // Only fetch from API if we have a user ID
      if (userId) {
        const response = await secureRequest<any>(`${config.USER_API}/ispremium`, RequestMethod.POST, {
          body: { phone:userId }
        });
        console.log(`${config.USER_API}/ispremium`, userId);
        
        console.log('Premium plan response:', response);
        
        if (response?.data) {
          setPremiumPlan(response.data);
          setCurrentPlan(response.data.isPremium ? (response.data.plan?.planTitle ?? 'Premium') : 'Free');
          setDaysLeft(calculateDaysLeft(response.data.plan?.expiryDate));
          
          // Store the updated data
          await storeUserPlanData(response.data);
        }
      }
    } catch (error) {
      console.error('Error refreshing premium plan data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to directly set plan data (useful for updates from other parts of the app)
  const setPlanData = (data: PremiumPlan) => {
    setPremiumPlan(data);
    setCurrentPlan(data.isPremium ? (data.plan?.planTitle ?? 'Premium') : 'Free');
    setDaysLeft(calculateDaysLeft(data.plan?.expiryDate));
    storeUserPlanData(data).catch(err => console.error('Error storing plan data:', err));
  };

  // Initial load of plan data
  useEffect(() => {
    fetchPlans()
    refreshPlanData();
  }, []);

  return (
    <PremiumPlanContext.Provider
      value={{
        premiumPlan,
        isLoading,
        currentPlan,
        refreshPlanData,
        setPlanData,
        daysLeft,
        plans,
        loading,
        error,
      }}
    >
      {children}
    </PremiumPlanContext.Provider>
  );
};

// Create a custom hook for using this context
export const usePremiumPlan = () => useContext(PremiumPlanContext);
