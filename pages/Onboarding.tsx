import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Degree from '../assets/svg/Degree'

const Screen1 = () => (
  <View style={styles.screenContainer}>
    <Text style={{
        fontSize: 18,
    }}>
        Welcome to
    </Text>
    <Text style={styles.welcomeHeading}>
       Maharashtra's 
       <Text
        style={{
            color: '#006FFD',
            fontWeight: 'bold',
            textDecorationLine: 'underline'
        }}
       > Most Trusted </Text>
       and Reliable Counselling Platform
    </Text>
    <View style={styles.imageContainer}>
      <Image 
        source={require('../assets/Yash_aaradhey-2.png')}
        style={styles.roundedImage}
        resizeMode="contain"
      />
    </View>
  </View>
);

const Screen2 = () => (
  <View style={styles.screen2Container}>
    <View style={styles.logoContainer}>
      <Image 
        source={require('../assets/Yash_aaradhey_logo.png')}
        style={styles.logo_screen2}
        resizeMode="contain"
      />
      <View style={{
        marginLeft: 20,
      }}>
        <View>
            <Text style={{
                fontSize: 18,
            }}>
                App By
            </Text>  
        </View>
            <Text style={styles.logoText}>
                Yash Aaradhey
            </Text>
      </View>
    </View>
    <Image 
      source={require('../assets/Yash_aaradhey.png')}
      style={styles.backgroundImage}
      resizeMode="contain"
    />
    <View style={styles.achievementsContainer}>
      <Text style={styles.achievement}>100K+ on Youtube</Text>
      <Text style={styles.achievement}>Helped 10K+ students</Text>
      <Text style={styles.achievement}>Coding Courses</Text>
    </View>
  </View>
);

const FeatureItem = ({ title }: { title: string }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureText}>{title}</Text>
  </View>
);

const Screen3 = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.whyJoinUs}>Why Join Us?</Text>
    <View style={styles.featuresContainer}>
      <FeatureItem title="College Description" />
      <FeatureItem title="College Fees" />
      <FeatureItem title="Previous Year Cutoffs" />
      <FeatureItem title="Placement Statistics" />
      <FeatureItem title="Campus Details" />
      <FeatureItem title="Admission Process" />
    </View>
  </View>
);

export const OnboardingScreen = ({ navigation, route }:any) => {
  const { step } = route.params;
  
  const renderScreen = () => {
    switch(step) {
      case 1: return <Screen1 />;
      case 2: return <Screen2 />;
      case 3: return <Screen3 />;
      default: return <Screen1 />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.dotContainer}>
          {[1, 2, 3].map((dot) => (
            <View
              key={dot}
              style={[styles.dot, step === dot && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            if (step < 3) {
              navigation.navigate('Onboarding', { step: step + 1 });
            } else {
              navigation.navigate('Login');
            }
          }}
        >
          <Text style={styles.nextButtonText}>
            {step === 3 ? 'Next' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  logo_screen2: {
    width: 100,
    height: 100,
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
    flex:1,
    justifyContent: 'center',
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
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  welcomeHeading: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  imageContainer: {
    backgroundColor: '#64A6FA99',
    borderRadius: 200,
    padding: 20,
    overflow: 'hidden',
    width: 300,
    height: 300,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  roundedImage: {
    width: 350,
    height: 350,
    objectFit: 'cover',
  },
  screen2Container: {
    flex: 1,
    width: '100%',
    opacity: 0.9,
  },
  logoContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    flexDirection: 'column',  
    color:"#006FFD"  
  },
  backgroundImage: {
    position: 'absolute',
    bottom: 24,
    height: 600,
    width: '130%',
    objectFit: 'cover',
    opacity: 0.5,
    left: -70,
  },
  achievementsContainer: {
    padding: 20,
    position: 'absolute',
    bottom: 24,
    width: '100%',
  },
  achievement: {
    fontSize: 24,
    fontWeight: 'bold',
    color:"#fff",
    marginVertical: 10,
    textAlign: 'center',
    width: '100%',
    backgroundColor: '#64A6FA',
    padding:20,
    borderRadius: 20,
  },
  whyJoinUs: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color:"#64A6FA",
  },
  featuresContainer: {
    width: '100%',
    paddingHorizontal: 40,
  },
  featureItem: {
   
    marginVertical: 10,
    textAlign: 'center',
    width: '100%',
    backgroundColor: '#64A6FA',
    padding:20,
    borderRadius: 20,
  },
  featureText: {
    marginLeft: 15,
    fontSize: 20,
    fontWeight: 'bold',
    color:"#fff",
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  skipButton: {
    backgroundColor: '#64A6FA99',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});