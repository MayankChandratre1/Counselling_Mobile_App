import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  name: string;
  phone: string;
  isPremium: boolean;
  state?: string;
  field?: string;
  jeeMarks?: string;
  cetMarks?: string;
}

export const storeUserData = async (userData: Partial<UserData>) => {
  try {
    const existingData = await getUserData();
    await AsyncStorage.setItem('userData', JSON.stringify({
      ...existingData,
      ...userData,
      isPremium: existingData?.isPremium || false,
    }));
    return true;
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
