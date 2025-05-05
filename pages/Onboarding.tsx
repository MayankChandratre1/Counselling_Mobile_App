import { Dimensions, Image, StyleSheet, View, ScrollView } from 'react-native'
import React from 'react'
import CustomText from '../components/General/CustomText'
import { TouchableOpacity } from 'react-native'
import { FONTS } from '../styles/typography'
import { globalStyles } from '../styles/globalStyles'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) / 375; // Base scale factor

const Screen1 = () => (
  <ScrollView contentContainerStyle={styles.screenContentContainer}>
    <CustomText style={styles.welcomeIntro}>
      Welcome to
    </CustomText>
    <CustomText style={styles.welcomeHeading}>
      Maharashtra's 
      <CustomText
        style={styles.trustedText}
      > Most Trusted </CustomText>
      and Reliable Counselling Platform
    </CustomText>
    <View style={styles.imageContainer}>
      <Image 
        source={require('../assets/Yash_aaradhey-2.png')}
        style={styles.roundedImage}
        resizeMode="contain"
      />
    </View>
  </ScrollView>
);

const Screen2 = () => (
  <ScrollView contentContainerStyle={styles.screenContentContainer}>
    {/* Logo and name at the top */}
    <View style={styles.logoContainer}>
      <Image 
        source={require('../assets/Yash_aaradhey_logo.png')}
        style={styles.logo_screen2}
        resizeMode="contain"
      />
      <View style={styles.logoTextContainer}>
        <CustomText style={styles.appByText}>
          App By
        </CustomText>
        <CustomText style={styles.logoText}>
          Yash Aradhye
        </CustomText>
      </View>
    </View>
    
    {/* Relative container for background image and achievements */}
    <View style={styles.backgroundContainer}>
      <Image 
        source={require('../assets/Yash_aaradhey.png')}
        style={styles.backgroundImage}
        resizeMode="contain"
      />
      
      <View style={styles.achievementsContainer}>
        {['100K+ on Youtube', 'Helped 10K+ students', 'Coding Courses'].map((item, index) => (
          <View key={index} style={styles.achievementCard}>
            <CustomText style={styles.achievement}>{item}</CustomText>
          </View>
        ))}
      </View>
    </View>
  </ScrollView>
);

const FeatureItem = ({ title }: { title: string }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <CustomText style={styles.featureIcon}>✓</CustomText>
    </View>
    <CustomText style={styles.featureText}>{title}</CustomText>
  </View>
);

const Screen3 = () => (
  <ScrollView contentContainerStyle={styles.screenContentContainer}>
    <CustomText style={styles.whyJoinUs}>Why Join Us?</CustomText>
    <View style={styles.featuresCard}>
      <View style={styles.featuresContainer}>
        <FeatureItem title="College Description" />
        <FeatureItem title="College Fees" />
        <FeatureItem title="Previous Year Cutoffs" />
        <FeatureItem title="Placement Statistics" />
        <FeatureItem title="Campus Details" />
        <FeatureItem title="Admission Process" />
      </View>
    </View>
  </ScrollView>
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
          <CustomText style={styles.skipButtonText}>Skip</CustomText>
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
          <CustomText style={styles.nextButtonText}>
            {step === 3 ? 'Get Started' : 'Next'}
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa', // Matching Home.tsx background
    fontFamily: FONTS.REGULAR,
  },
  screenContentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 80,
    alignItems: 'center',
  },
  welcomeIntro: {
    fontSize: 18 * scale,
    marginBottom: 10,
    fontFamily: FONTS.REGULAR,
    color: '#666', // Secondary text color from Home.tsx
  },
  trustedText: {
    fontSize: Math.min(36 * scale, 30),
    width: '100%',
    color: '#371981', // Primary color from Home.tsx
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontFamily: FONTS.BOLD,
  },
  welcomeHeading: {
    fontSize: Math.min(36 * scale, 30),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    lineHeight: Math.min(42 * scale, 48),
    fontFamily: FONTS.BOLD,
    color: '#333333',
  },
  imageContainer: {
    backgroundColor: 'rgba(55, 25, 129, 0.15)', // Lighter version of primary color
    borderRadius: Math.min(SCREEN_WIDTH * 0.4, 200),
    width: Math.min(SCREEN_WIDTH * 0.8, 200),
    height: Math.min(SCREEN_WIDTH * 0.8, 200),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    
  },
  roundedImage: {
    width: '100%',
    maxWidth: 200,
    height: '100%',
    opacity: 0.9, // Reduced opacity to better see the content
  
  },
  logoContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  logo_screen2: {
    width: Math.min(SCREEN_WIDTH * 0.2, 80),
    height: Math.min(SCREEN_WIDTH * 0.2, 80),
  },
  logoTextContainer: {
    marginLeft: 15,
  },
  appByText: {
    fontSize: 14 * scale,
    fontFamily: FONTS.REGULAR,
    color: '#666',
  },
  logoText: {
    fontSize: Math.min(28 * scale, 30),
    fontWeight: 'bold',
    color: "#371981", // Primary color from Home.tsx
    fontFamily: FONTS.BOLD,
    height: 30,
  },
  backgroundContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  backgroundImage: {
    position: 'absolute',
    width: SCREEN_WIDTH * 2.5,
    height: SCREEN_WIDTH * 2.5,
    bottom: -SCREEN_WIDTH * 0.6,
    right: -SCREEN_WIDTH * 0.8,
    opacity: 0.4, // Reduced opacity to better see the content
    zIndex: -1,
  },
  achievementsContainer: {
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  achievementCard: {
    marginVertical: 10,
    backgroundColor: '#fff',
    padding: 0,
    borderRadius: 12,
    // Match Home.tsx card shadow
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  achievement: {
    fontSize: Math.min(18 * scale, 18),
    fontWeight: '600',
    color: "#333",
    textAlign: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#371981', // Primary color as accent
  },
  whyJoinUs: {
    fontSize: Math.min(24 * scale, 28),
    fontWeight: 'bold',
    marginBottom: 20,
    color: "#371981", // Primary color from Home.tsx
    fontFamily: FONTS.BOLD,
  },
  featuresCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: '100%',
    // Match Home.tsx card shadow
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
  },
  featuresContainer: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  featureIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#371981', // Primary color
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: Math.min(16 * scale, 16),
    fontFamily: FONTS.MEDIUM,
    color: "#333",
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // Add shadow like in Home.tsx
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
  },
  skipButton: {
    backgroundColor: '#f0f0f0', // Subtle background for skip
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14 * scale,
    fontFamily: FONTS.MEDIUM,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#371981', // Primary color
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nextButton: {
    backgroundColor: '#371981', // Primary color from Home.tsx
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 14 * scale,
    fontWeight: 'bold',
    fontFamily: FONTS.BOLD,
  },
});