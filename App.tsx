import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from './pages/Onboarding';
import { LoginScreen } from './pages/LoginPage';
import TabNavigator from './navigation/TabNavigator';
import { getUserData, storeUserData, storeUserPlanData } from './utils/storage';
import { View, Text, StyleSheet } from 'react-native';
import { SplashScreen } from './pages/Splash';
import Notification from './pages/Notification';
import PremiumButton from './components/General/PremiumButton';
import CollegeDetails from './pages/CollegeDetails';
import PlanDetails from './pages/PlanDetails';
import RegistrationForm from './pages/RegistrationForm';
import MyLists from './pages/Lists/MyLists';
import { RequestMethod, secureRequest } from './utils/tokenedRequest';
import config from './configs/API';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import CustomText from './components/General/CustomText';
import { CollegeProvider } from './contexts/CollegeContext';
import { EventsProvider } from './contexts/EventsContext';
import AllUpdates from './pages/AllUpdates';
import EventDetails from './pages/EventDetails';
import Favourites from './pages/Favourites';
import AllEvents from './pages/AllEvents';
import ListDetailsScreen from './pages/Lists/ListDetailsScreen';
import { PremiumPlanProvider } from './contexts/PremiumPlanContext';

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
  MyLists: undefined;
  AllUpdates: undefined;
  EventDetails: {eventId:string}
  Favourites: undefined;
  AllEvents: undefined;
  ListDetails: { list: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [oneSignalId, setOneSignalId] = useState<string | null>(null);

  // Get OneSignal Player ID
  const getOneSignalPlayerId = async () => {
    try {
      const id = await OneSignal.User.pushSubscription.getIdAsync();
      console.log("OneSignal Player ID:", id);
      setOneSignalId(id);
      return id;
    } catch (error) {
      console.error("Error getting OneSignal Player ID:", error);
      return null;
    }
  };

  // Save OneSignal ID to backend
  const saveOneSignalIdToBackend = async (playerId: string) => {
    try {
      const userData = await getUserData();
      
      // Only proceed if the user is logged in
      if (!userData?.phone) {
        console.log("User not logged in, cannot save OneSignal ID");
        return;
      }
      
      console.log("Saving OneSignal ID to backend:", playerId);
      
      // Make API call to save the OneSignal ID
      const response = await secureRequest(
        `${config.USER_API}/saveOneSignalId`,
        RequestMethod.POST,
        {
          body: {
            phone: userData.phone,
            oneSignalId: playerId
          }
        }
      );
      
      console.log("Saved OneSignal ID to backend:", response);
    } catch (error) {
      console.error("Error saving OneSignal ID to backend:", error);
    }
  };

  // Initialize OneSignal safely in a separate function
  const initOneSignal = () => {
    try {
      // Configure OneSignal
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);
      OneSignal.initialize("46e13d6f-ff0e-4b55-9ecd-a372940c61e2");
      
      // Request notification permission
      OneSignal.Notifications.requestPermission(true);
      
      // Add event listener for notification clicks
      OneSignal.Notifications.addEventListener('click', (event) => {
        console.log('OneSignal: notification clicked:', event);
      });
      
      // Set up subscription observer to capture ID when available
      OneSignal.User.pushSubscription.addEventListener('change', async (event) => {
        console.log('OneSignal: subscription changed:', event);
        
        // If we have a subscription ID, save it
        if (event.current.id) {
          console.log('OneSignal: new subscription ID:', event.current.id);
          setOneSignalId(event.current.id);
          
          // Try to save to backend if user is logged in
          const userData = await getUserData();
          if (userData?.phone) {
            saveOneSignalIdToBackend(event.current.id);
          }
        }
      });
      
      // Try to get the player ID immediately
      getOneSignalPlayerId();
      
    } catch (error) {
      console.error("OneSignal initialization error:", error);
    }
  };

  // Initialize OneSignal when component mounts
  useEffect(() => {
    initOneSignal();
  }, []);

  // Safely check login status
  const checkLoginStatus = async () => {
    try {
      const userData = await getUserData();
      console.log("USERDATA: ", userData);
      setIsLoggedIn(!!userData?.phone);
      
      // If user is logged in and we have a OneSignal ID, save it
      if (userData?.phone && oneSignalId) {
        saveOneSignalIdToBackend(oneSignalId);
      }
      
      return userData;
    } catch (error) {
      console.error("Error checking login status:", error);
      setErrorMessage("Error retrieving user data. Please try again.");
      setIsLoggedIn(false);
      return {};
    }
  };

  // Safely check premium status
  const checkPremiumStatus = async (userData: any) => {
    try {
      // Only proceed if we have a phone number
      if (!userData?.phone) {
        console.log("No phone number found, skipping premium check");
        setIsPremium(false);
        return;
      }
      
      const response = await secureRequest<{isPremium: boolean}>(
        `${config.USER_API}/ispremium`, 
        RequestMethod.POST, 
        {
          body: {
            phone: userData.phone
          }
        }
      );
      
      console.log("Premium status response:", response);
      
      if (response?.data) {
        setIsPremium(!!response.data.isPremium);
        storeUserPlanData(response.data);
        storeUserData({
          ...userData,
          isPremium: response.data.isPremium
        })
      } else {
        setIsPremium(false);
      }
    } catch (error) {
      console.error("Error checking premium status:", error);
      setErrorMessage("Error checking premium status. Using default settings.");
      setIsPremium(false);
    }
  };

  // Main initialization effect
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Get user data first
        const userData = await checkLoginStatus();
        
        // Then check premium status
        await checkPremiumStatus(userData);
      } catch (error) {
        console.error("Error during app initialization:", error);
        setErrorMessage("Error initializing app. Please restart.");
      } finally {
        // Regardless of errors, we should eventually stop loading
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  // Effect to save OneSignal ID to backend when both ID and login status change
  useEffect(() => {
    const updateOneSignalId = async () => {
      if (isLoggedIn && oneSignalId) {
        await saveOneSignalIdToBackend(oneSignalId);
      }
    };
    
    updateOneSignalId();
  }, [isLoggedIn, oneSignalId]);

  // Safety timeout effect - ensure splash screen doesn't stay forever
  useEffect(() => {
    const splashTimeout = setTimeout(() => {
      console.log("Splash screen safety timeout triggered");
      setShowSplash(false);
      setIsLoading(false);
    }, 8000); // 8 second maximum for splash screen
    
    return () => clearTimeout(splashTimeout);
  }, []);

  const handleSplashFinish = () => {
    console.log("Splash animation finished, hiding splash screen");
    setShowSplash(false);
  };

  // Show splash screen with potential error message
  if (isLoading || showSplash) {
    return (
      <NavigationContainer>
        <View style={styles.container}>
          <SplashScreen onFinish={handleSplashFinish} />
          {errorMessage && (
            <CustomText style={styles.errorText}>{errorMessage}</CustomText>
          )}
          {__DEV__ && (
            <CustomText style={styles.debugText}>
              Loading: {isLoading ? 'Yes' : 'No'}, 
              Splash: {showSplash ? 'Yes' : 'No'},
              OneSignal ID: {oneSignalId || 'None'}
            </CustomText>
          )}
        </View>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <CollegeProvider>
        <EventsProvider>
          <PremiumPlanProvider>
            <View style={{ flex: 1 }}>
              <Stack.Navigator 
                screenOptions={{ 
                  headerShown: false,
                  animation: 'none'
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
                    <Stack.Screen name="CollegeDetails" component={CollegeDetails} />
                  </>
                ) : (
                  <>
                    
                    <Stack.Screen name="Home" component={TabNavigator} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Notification" component={Notification} />
                    <Stack.Screen name="CollegeDetails" component={CollegeDetails} />
                    <Stack.Screen name="PlanDetails" component={PlanDetails} />
                    <Stack.Screen name="RegistrationForm" component={RegistrationForm} />
                    <Stack.Screen name="MyLists" component={MyLists} />
                   
                  </>
                )}
                  <Stack.Screen name="AllUpdates" component={AllUpdates} />
                  <Stack.Screen name="AllEvents" component={AllEvents} />
                  <Stack.Screen name="EventDetails" component={EventDetails} />
                  <Stack.Screen name="Favourites" component={Favourites} />
                  <Stack.Screen name="ListDetails" component={ListDetailsScreen} />
              </Stack.Navigator>
              {isLoggedIn && !isPremium && <PremiumButton />}
            </View>
          </PremiumPlanProvider>
        </EventsProvider>
      </CollegeProvider>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  errorText: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
    color: 'white',
    textAlign: 'center',
  },
  debugText: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 5,
    borderRadius: 5,
    color: 'white',
    fontSize: 10,
  }
});

export default App;