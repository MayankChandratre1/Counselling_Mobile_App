import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from './pages/Onboarding';
import { LoginScreen } from './pages/LoginPage';
import TabNavigator from './navigation/TabNavigator';
import { getUserData } from './utils/storage';
import { ActivityIndicator, View } from 'react-native';
import { SplashScreen } from './pages/Splash';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const userData = await getUserData();
    setIsLoggedIn(!!userData);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} /> 
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
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
          </>
        ) : (
          <>
          <Stack.Screen name="Home" component={TabNavigator} />
          <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;