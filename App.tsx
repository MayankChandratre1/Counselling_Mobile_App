import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from './pages/Onboarding';
import { LoginScreen } from './pages/LoginPage';
import TabNavigator from './navigation/TabNavigator';
import { getUserData } from './utils/storage';
import {  View } from 'react-native';
import { SplashScreen } from './pages/Splash';
import Notification from './pages/Notification';
import PremiumButton from './components/General/PremiumButton';
import CollegeDetails from './pages/CollegeDetails';
import PlanDetails from './pages/PlanDetails';
import RegistrationForm from './pages/RegistrationForm';

type RootStackParamList = {
  Onboarding: { step: number };
  Login: undefined;
  Home: undefined;
  Notification: undefined;
  PlanDetails: {
    title: string;
    price: string;
    features: string[];
    isPremium: boolean;
  };
  Counselling: {
    selectedPlan?: string;
  };
  CollegeDetails: { collegeId: string };
  RegistrationForm: {
    planDetails: {
      isPremium: boolean;
      plan: string;
      price: string;
      expiry: number | null;
    };
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const userData = await getUserData();
    setIsLoggedIn(!!userData);
    setIsLoading(false);
    setIsPremium(userData?.isPremium);
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (isLoading || showSplash) {
    return (
      <NavigationContainer>
        <SplashScreen onFinish={handleSplashFinish} />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,  // This ensures headers are hidden everywhere
            animation: 'none'    // Optional: removes transition animations
          }}
        >
          {!isLoggedIn ? (
            <>
              <Stack.Screen 
                name="Onboarding" 
                component={OnboardingScreen} 
                initialParams={{ step: 1 }}
              />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Home" component={TabNavigator} />
              <Stack.Screen name="Notification" component={Notification} />
              <Stack.Screen name="PlanDetails" component={PlanDetails} />
              <Stack.Screen name="RegistrationForm" component={RegistrationForm} />
            </>
          ) : (
            <>
            <Stack.Screen name="Home" component={TabNavigator} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Notification" component={Notification} />
            <Stack.Screen name="CollegeDetails" component={CollegeDetails} />
            <Stack.Screen name="PlanDetails" component={PlanDetails} />
            <Stack.Screen name="RegistrationForm" component={RegistrationForm} />
            </>
          )}
        </Stack.Navigator>
        {/* {isLoggedIn && !isPremium && <PremiumButton />} */}
      </View>
    </NavigationContainer>
  );
};

export default App;