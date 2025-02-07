// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, StyleSheet, Text, TextInput, View, TouchableOpacity, Dimensions } from 'react-native';

const Stack = createNativeStackNavigator();

// Splash Screen
const SplashScreen = ({ navigation }:{
  navigation: any
}) => {
  React.useEffect(() => {
    setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2000); // Navigate to Onboarding after 2 seconds
  }, []);

  return (
    <View style={styles.centerContainer}>
      <Image 
        source={require('./assets/Yash_aaradhey_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

// Onboarding Screens
const OnboardingScreen = ({ navigation, route }:any) => {
  const { step } = route.params;
  const screens = [
    {
      title: "Welcome to Our App",
      description: "Discover amazing features that await you"
    },
    {
      title: "Explore More",
      description: "Find what you're looking for easily"
    },
    {
      title: "Get Started",
      description: "Join our community today"
    }
  ];

  return (
    <View style={styles.container}>
      <Image 
        source={require('./assets/Yash_aaradhey.png')}
        style={styles.onboardingImage}
        resizeMode="contain"
      />
      <Text style={styles.title}>{screens[step - 1].title}</Text>
      <Text style={styles.description}>{screens[step - 1].description}</Text>
      
      <View style={styles.dotContainer}>
        {[1, 2, 3].map((dot) => (
          <View
            key={dot}
            style={[styles.dot, step === dot && styles.activeDot]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (step < 3) {
            navigation.navigate('Onboarding', { step: step + 1 });
          } else {
            navigation.navigate('Login');
          }
        }}
      >
        <Text style={styles.buttonText}>
          {step === 3 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Login Screen
const LoginScreen = () => {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome!</Text>
      <Text style={styles.subtitle}>Please sign in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// Main App Component
function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} initialParams={{ step: 1 }} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  onboardingImage: {
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').height * 0.4,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  dotContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#000',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
});

export default App;