import { secureRequest, RequestMethod } from './tokenedRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../configs/API';
import { is } from 'date-fns/locale';

interface UserData {
  name: string;
  phone: string;
  isPremium: boolean;
  state?: string;
  field?: string;
  jeeMarks?: string;
  cetMarks?: string;
  premiumPlan?: string;
  token?: string;
}

export const storeUserData = async (userData: Partial<UserData>) => {
  try {
    const existingData = await getUserData();
    if(existingData && existingData.phone !== userData.phone) {
      await clearUserData();
    }
    await AsyncStorage.setItem('userData', JSON.stringify({
      ...userData,
    }));
    if(userData.token) 
   { await AsyncStorage.setItem('token', JSON.stringify({
      token: userData.token
    }));}

    if(userData.isPremium) 
    {await AsyncStorage.setItem('plan', JSON.stringify({
      isPremium : userData.isPremium,
      plan: userData.isPremium ? userData.premiumPlan: null,
    }));}

    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};
export const storeUserPlanData = async (userPlanData: any) => {
  try {
    const existingData = await AsyncStorage.getItem('plan');
    await AsyncStorage.setItem('plan', JSON.stringify({
      ...JSON.parse(existingData || '{}'),
      isPremium : userPlanData.isPremium,
    }));

    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

export const getUserPlanData = async () => {
  try {
    const existingData = await AsyncStorage.getItem('plan');

    return JSON.parse(existingData || '{}');
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const refreshUserData:()=>Promise<UserData | null> = async () => {
  try {
    const userData = await getUserData();
    if (!userData) return null;

    const response = await secureRequest(
      `${config.USER_API}/phone/${userData.phone}`,
      RequestMethod.GET);

    if (response.error) {
      throw new Error(response.error);
    }
    console.log('User data refreshed:', response.data);
    
    await storeUserData(response.data as Partial<UserData>);
    return response.data as UserData;
  } catch (error) {
    console.error('Error refreshing user data:', error);
    return null;
  }
}


export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem('userData');
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
};

export const addUserFavoirites = async (collegeId: string) => {
  try {
    const existingData = await AsyncStorage.getItem('favorites');
    const favorites = existingData ? JSON.parse(existingData) : [];

    if (!favorites.includes(collegeId)) {
      favorites.push(collegeId);
      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
  }
}

export const getUserFavorites = async () => {
  try {
    const existingData = await AsyncStorage.getItem('favorites');
    return existingData ? JSON.parse(existingData) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return null;
  }
}

export const removeUserFavoirites = async (collegeId: string) => {
  try {
    const existingData = await AsyncStorage.getItem('favorites');
    const favorites = existingData ? JSON.parse(existingData) : [];

    if (favorites.includes(collegeId)) {
      const updatedFavorites = favorites.filter((id: string) => id !== collegeId);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    }
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
}

export const logout = async (userId:string) => {
  try {
    // Call logout endpoint
    const favourites = await getUserFavorites();
    const { error } = await secureRequest(
      `${config.USER_API}/logout`, 
      RequestMethod.POST,{
        body:{userId, favourites}
      }
    );

    if (error) {
      throw new Error(error);
    }

    // Clear local storage
    await AsyncStorage.multiRemove(['userData', 'plan']);

    return true;
  } catch (error) {
    console.error('Logout failed:', error);
    return false;
  }
};


export const getPremiumStatus = async () => {
  try{
    const data = await getUserData()
    return {isPremium: data?.isPremium, counsellingData: data?.counsellingData}
  } catch (error) {
    console.error('Error getting premium status:', error);
    return {isPremium: false, counsellingData: null};
  }
}

export const getChancesUseCount = async () => {
  try {
    const data = await getUserData();
    if (!data) return 0;
    if (data.isPremium) return -1; // -1 means unlimited (premium user)

    // Get the stored usage data
    const usageData = await AsyncStorage.getItem('chanceCalculatorUsage');
    if (!usageData) return 10; // Default to full usage if no data

    const { date, count } = JSON.parse(usageData);
    const today = new Date().toDateString();

    // If it's a new day, reset the counter
    if (date !== today) {
      await AsyncStorage.setItem('chanceCalculatorUsage', JSON.stringify({
        date: today,
        count: 10
      }));
      return 10;
    }

    return count;
  } catch (error) {
    console.error('Error getting chances use count:', error);
    return 0;
  }
}

export const decrementChancesUseCount = async () => {
  try {
    // For premium users, don't decrement
    const data = await getUserData();
    if (data?.isPremium) return -1;

    const today = new Date().toDateString();
    const usageData = await AsyncStorage.getItem('chanceCalculatorUsage');
    
    let currentCount = 10;
    
    if (usageData) {
      const { date, count } = JSON.parse(usageData);
      
      // If same day, decrement the counter
      if (date === today) {
        currentCount = count;
      }
      // If different day, counter resets to default (10)
    }
    
    // Don't go below 0
    const newCount = Math.max(0, currentCount - 1);
    
    await AsyncStorage.setItem('chanceCalculatorUsage', JSON.stringify({
      date: today,
      count: newCount
    }));
    
    return newCount;
  } catch (error) {
    console.error('Error decrementing chances use count:', error);
    return 0;
  }
}


export const keys = {
   FAVORITES_STORAGE_KEY: 'favorites'
}