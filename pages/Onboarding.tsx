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
          Yash Aaradhey
        </CustomText>
      </View>
    </View>
    
    <View style={styles.achievementsContainer}>
      <CustomText style={styles.achievement}>100K+ on Youtube</CustomText>
      <CustomText style={styles.achievement}>Helped 10K+ students</CustomText>
      <CustomText style={styles.achievement}>Coding Courses</CustomText>
    </View>
    
    <Image 
      source={require('../assets/Yash_aaradhey.png')}
      style={styles.backgroundImage}
      resizeMode="contain"
    />
  </ScrollView>
);

const FeatureItem = ({ title }: { title: string }) => (
  <View style={styles.featureItem}>
    <CustomText style={styles.featureText}>{title}</CustomText>
  </View>
);

const Screen3 = () => (
  <ScrollView contentContainerStyle={styles.screenContentContainer}>
    <CustomText style={styles.whyJoinUs}>Why Join Us?</CustomText>
    <View style={styles.featuresContainer}>
      <FeatureItem title="College Description" />
      <FeatureItem title="College Fees" />
      <FeatureItem title="Previous Year Cutoffs" />
      <FeatureItem title="Placement Statistics" />
      <FeatureItem title="Campus Details" />
      <FeatureItem title="Admission Process" />
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
    backgroundColor: '#ffffff',
    fontFamily: FONTS.REGULAR,
  },
  screenContentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeIntro: {
    fontSize: 18 * scale,
    marginBottom: 10,
    fontFamily: FONTS.REGULAR,
    color: '#333333',
  },
  trustedText: {
    color: '#006FFD',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontFamily: FONTS.BOLD,
  },
  welcomeHeading: {
    fontSize: Math.min(36 * scale, 42),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    lineHeight: Math.min(42 * scale, 48),
    fontFamily: FONTS.BOLD,
    color: '#333333',
  },
  imageContainer: {
    backgroundColor: '#64A6FA99',
    borderRadius: Math.min(SCREEN_WIDTH * 0.4, 200),
    width: Math.min(SCREEN_WIDTH * 0.8, 300),
    height: Math.min(SCREEN_WIDTH * 0.8, 300),
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  roundedImage: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  logo_screen2: {
    width: Math.min(SCREEN_WIDTH * 0.25, 100),
    height: Math.min(SCREEN_WIDTH * 0.25, 100),
  },
  logoTextContainer: {
    marginLeft: 20,
  },
  appByText: {
    fontSize: 16 * scale,
    fontFamily: FONTS.REGULAR,
  },
  logoText: {
    fontSize: Math.min(32 * scale, 36),
    fontWeight: 'bold',
    color: "#006FFD",
    fontFamily: FONTS.BOLD,
  },
  backgroundImage: {
    position: 'absolute',
    bottom: 0,
    width: SCREEN_WIDTH * 1.3,
    height: SCREEN_HEIGHT * 0.5,
    opacity: 0.7,
    zIndex: -1,
  },
  achievementsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  achievement: {
    fontSize: Math.min(24 * scale, 28),
    fontWeight: 'bold',
    color: "#fff",
    marginVertical: 10,
    textAlign: 'center',
    backgroundColor: '#64a6fa',
    padding: 16,
    borderRadius: 20,
  },
  whyJoinUs: {
    fontSize: Math.min(24 * scale, 28),
    fontWeight: 'bold',
    marginBottom: 30,
    color: "#64A6FA",
    fontFamily: FONTS.BOLD,
  },
  featuresContainer: {
    width: '100%',
  },
  featureItem: {
    marginVertical: 10,
    backgroundColor: '#64A6FA',
    padding: 16,
    borderRadius: 20,
  },
  featureText: {
    fontSize: Math.min(18 * scale, 20),
    fontWeight: 'bold',
    textAlign: 'center',
    color: "#fff",
    fontFamily: FONTS.BOLD,
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
  },
  skipButton: {
    backgroundColor: '#64A6FA30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14 * scale,
    fontFamily: FONTS.REGULAR,
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
    backgroundColor: '#64A6FA',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nextButton: {
    backgroundColor: '#007AFF',
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