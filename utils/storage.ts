import { secureRequest, RequestMethod } from './tokenedRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../configs/API';

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
    await AsyncStorage.setItem('token', JSON.stringify({
      token: userData.token
    }));
    await AsyncStorage.setItem('plan', JSON.stringify({
      isPremium : userData.isPremium,
      plan: userData.isPremium ? userData.premiumPlan: null,
    }));

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

export const clearUserData = async () => {
  try {
    await AsyncStorage.removeItem('userData');
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
};

export const logout = async (userId:string) => {
  try {
    // Call logout endpoint
    const { error } = await secureRequest(
      `${config.USER_API}/logout`, 
      RequestMethod.POST,{
        body:{userId}
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
