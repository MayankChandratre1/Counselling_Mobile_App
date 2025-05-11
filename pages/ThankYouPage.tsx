import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions,
  StatusBar,
  Platform,
  Text
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import LottieView from 'lottie-react-native';
import CustomText from '../components/General/CustomText';
import { FONTS } from '../styles/typography';

const { width, height } = Dimensions.get('window');

const ThankYouPage = ({ navigation, route }: any) => {
  const planDetails = route.params?.planDetails;
  
  // Animation reference
  const animationRef = React.useRef<LottieView>(null);
  
  useEffect(() => {
    // Play the animation when component mounts
    if (animationRef.current) {
      animationRef.current.play();
    }
  }, []);
  
  const handleExploreFeatures = () => {
    navigation.navigate('Tab', { screen: 'Counselling' });
  };
  
  const handleRegistrationForm = () => {
    navigation.navigate('RegistrationForm');
  };
  
  // Format price for display
  const formatPrice = (price: string) => {
    return `₹${price}`;
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        bounces={false}
      >
        {/* Animation or Success Icon */}
        <View style={styles.animationContainer}>
          {Platform.OS === 'ios' || Platform.OS === 'android' ? (
            <FeatherIcon
              name="check-circle"
              size={100}
              color={"#4CAF50"}
            />
          ) : (
            <View style={styles.successIconContainer}>
              <MaterialIcons name="check-circle" size={100} color="#4CAF50" />
            </View>
          )}
        </View>
        
        {/* Thank You Message */}
        <View style={styles.headerContainer}>
          <Text style={[styles.headerText]}>
            Thank You for Enrolling!
          </Text>
          <CustomText style={styles.subHeaderText}>
            Your premium journey begins now
          </CustomText>
        </View>
        
        {/* Plan Details Card */}
        {planDetails && (
          <View style={styles.planCard}>
            <View style={styles.planHeaderRow}>
              <View style={styles.planBadge}>
                <MaterialIcons name="stars" size={16} color="#FFD700" />
                <CustomText style={styles.planBadgeText}>Premium</CustomText>
              </View>
              <CustomText style={styles.planPrice}>{formatPrice(planDetails.price)}</CustomText>
            </View>
            
            <CustomText style={styles.planName}>{planDetails.plan}</CustomText>
            
            
            
            <View style={styles.planDetailRow}>
              <MaterialIcons name="check-circle" size={18} color="#4CAF50" />
              <CustomText style={styles.planDetailText}>
                Access to premium counseling services
              </CustomText>
            </View>
            
            <View style={styles.planDetailRow}>
              <MaterialIcons name="check-circle" size={18} color="#4CAF50" />
              <CustomText style={styles.planDetailText}>
                Personalized Counselling
              </CustomText>
            </View>
          </View>
        )}
        
      
        
        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleExploreFeatures}
          >
            <CustomText style={styles.primaryButtonText}>
              Explore Premium Features
            </CustomText>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleRegistrationForm}
          >
            <CustomText style={styles.secondaryButtonText}>
              Complete Registration Form
            </CustomText>
          </TouchableOpacity>
        </View>
        
       
      </ScrollView>
    </SafeAreaView>
  );
};

export default ThankYouPage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  contentContainer: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  animationContainer: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  animation: {
    width: 180,
    height: 180,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    fontFamily: FONTS.BOLD,
    padding: 10,
    marginBottom: 10,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: FONTS.REGULAR,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: width * 0.9,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70020',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  planBadgeText: {
    color: '#B8860B',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: FONTS.MEDIUM,
  },
  planPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#371981',
    fontFamily: FONTS.BOLD,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    fontFamily: FONTS.BOLD,
  },
  planDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  planDetailText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
    fontFamily: FONTS.REGULAR,
  },
  nextStepsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: width * 0.9,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    fontFamily: FONTS.BOLD,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontFamily: FONTS.MEDIUM,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: FONTS.REGULAR,
  },
  ctaContainer: {
    width: width * 0.9,
    marginVertical: 10,
  },
  primaryButton: {
    backgroundColor: '#371981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#371981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    fontFamily: FONTS.BOLD,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#371981',
  },
  secondaryButtonText: {
    color: '#371981',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.MEDIUM,
  },
  supportContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    fontFamily: FONTS.REGULAR,
  },
  supportEmail: {
    fontSize: 14,
    color: '#371981',
    fontWeight: '600',
    marginTop: 4,
    fontFamily: FONTS.MEDIUM,
  },
});