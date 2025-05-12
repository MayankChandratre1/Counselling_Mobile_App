import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, Dimensions, Animated, Platform, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import CustomText from '../General/CustomText'
import config from '../../configs/API'
import { useNavigation } from '@react-navigation/native'
import { usePremiumPlan } from '../../contexts/PremiumPlanContext'
const { USER_API } = config


// Get screen dimensions for responsive layout
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// More responsive card sizing based on screen width
const getResponsiveCardWidth = () => {
  // Small screens get narrower cards
  if (SCREEN_WIDTH < 320) {
    return SCREEN_WIDTH * 0.75; // Even smaller for very small screens
  }
  else if (SCREEN_WIDTH < 360) {
    return SCREEN_WIDTH * 0.78;
  }
  // Medium screens
  else if (SCREEN_WIDTH < 400) {
    return SCREEN_WIDTH * 0.80;
  }
  // Larger screens have a max width
  return Math.min(SCREEN_WIDTH * 0.85, 320);
};

const CARD_WIDTH = getResponsiveCardWidth();
const CARD_MARGIN = 8; // Reduced margin for smaller screens

// Define interfaces for API response
interface Timestamp {
  _seconds: number;
  _nanoseconds: number;
}

interface Plan {
  title: string;
  price: number;
  isLocked: boolean;
  opensAt?: Timestamp;
  benefits: string[];
}

interface PlansResponse {
  plans: Plan[];
}

interface PlanCardProps {
  title: string;
  price: string;
  features: string[];
  isPremium: boolean;
  isLocked?: boolean;
  opensAt?: Timestamp;
  form: string
  onGetStarted: (planDetails: any) => void;
}

interface CounsellingCardsProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: (planDetails: any) => void;
  features: string[];
}

const PlanCard = ({ title, price, features, isPremium, isLocked = false, opensAt,form, onGetStarted }: PlanCardProps) => {
  // Determine how many features to show based on screen size
  const getVisibleFeatures = () => {
    if (SCREEN_HEIGHT < 600) return 2; // Very small screens
    if (SCREEN_WIDTH < 360) return 3; // Small screens
    return 4; // Regular screens (reduced from 5)
  };
  
  const visibleFeatures = getVisibleFeatures();
  
  // Format the timestamp to a readable date if available
  const formatOpeningDate = () => {
    if (!opensAt) return '';
    
    const date = new Date(opensAt._seconds * 1000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <View style={[
      styles.card, 
      isPremium && styles.premiumCard,
      isLocked && styles.lockedCard
    ]}>
      <View style={styles.titleContainer}>
        <CustomText style={styles.title} numberOfLines={1} ellipsizeMode="tail">{title}</CustomText>
        {isLocked && (
          <Icon name="lock" size={18} color="#FF9800" style={styles.lockIcon} />
        )}
      </View>
      
      <CustomText style={styles.price}>₹{price}</CustomText>
      
      {isLocked && opensAt && (
        <View style={styles.lockedInfoContainer}>
          <Icon name="clock-outline" size={14} color="#FF9800" />
          <CustomText style={styles.opensAtText}>
            {/* Available from {formatOpeningDate()} */}
            Will be available soon. Stay tuned!
          </CustomText>
        </View>
      )}
      
      <View style={styles.featuresContainer}>
        {features.slice(0, visibleFeatures).map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Icon 
              name="check-circle" 
              size={16} 
              color={isPremium ? "#4CAF50" : "#371981"} 
              style={styles.featureIcon}
            />
            <CustomText 
              style={[styles.featureText, isLocked && styles.lockedText]} 
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {feature}
            </CustomText>
          </View>
        ))}
      </View>
      
      <TouchableOpacity 
        style={[
          styles.button, 
          isPremium ? styles.premiumButton : styles.standardButton,
          isLocked && styles.lockedButton
        ]}
        onPress={() => !isLocked && onGetStarted({ price, features, isPremium, title, form })}
        disabled={isLocked}
        accessible={true}
        accessibilityLabel={isLocked ? 
          `${title} plan will be available from ${formatOpeningDate()}` : 
          `Get Started with ${title} plan for ₹${price}`
        }
        accessibilityRole="button"
      >
        <CustomText style={[styles.buttonText, isLocked && styles.lockedButtonText]}>
          {isLocked ? "Coming Soon" : "Get Started"}
        </CustomText>
      </TouchableOpacity>
    </View>
  );
};

const CounsellingCards = ({ visible, onClose, onUpgrade, features }: CounsellingCardsProps) => {
  const [showAll, setShowAll] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { plans, error, loading} = usePremiumPlan()
  const navigation = useNavigation<any>()

  // Get responsive modal height based on screen size
  const getModalHeight = () => {
    if (showAll) {
      return SCREEN_HEIGHT * 0.7; // More space when showing all features
    }
    if (SCREEN_HEIGHT < 700) {
      return SCREEN_HEIGHT * 0.55; // Smaller screens get smaller modal
    }
    return SCREEN_HEIGHT * 0.6; // Default size
  };

  // Fetch plans from API
  // useEffect(() => {
  //   const fetchPlans = async () => {
  //     try {
  //       setLoading(true);
  //       //use fetch from your api endpoint to get the plans
  //       const response = await fetch(`${USER_API}/get-premium-plans`); // Replace with your API endpoint
  //       if (!response.ok) {
  //         throw new Error('Network response was not ok');
  //       }
  //       const data: PlansResponse = await response.json();
  //       console.log('Fetched plans:', data.plans);
        
  //       setPlans(data.plans);
  //       setError(null);
  //     } catch (err) {
  //       console.error('Error fetching plans:', err);
  //       setError('Failed to load plans. Please try again later.');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (visible) {
  //     fetchPlans();
  //   }
  // }, [visible]);

  // Animation effect
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Get all unique benefits from plans
  const getAllBenefits = () => {
    if (plans.length > 0) {
      return [...new Set(plans.flatMap(plan => plan.benefits))];
    }
    return [];
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              maxHeight: getModalHeight(),
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <CustomText 
              style={styles.modalTitle}
              accessible={true}
              accessibilityRole="header"
            >
              Upgrade Your Plan
            </CustomText>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              accessible={true}
              accessibilityLabel="Close plan selection"
              accessibilityRole="button"
            >
              <AntDesign name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.scrollViewContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#371981" />
                <CustomText style={styles.loadingText}>Loading plans...</CustomText>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={40} color="#d9534f" />
                <CustomText style={styles.errorText}>{error}</CustomText>
              </View>
            ) : (
              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsContainer}
                snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
                decelerationRate="fast"
                pagingEnabled
                accessible={true}
                accessibilityLabel="Plan options"
              >
                {(plans.length > 0) ? (
                  plans.map((plan, index) => (
                    <PlanCard 
                      key={index}
                      title={plan.title} 
                      price={plan.price.toLocaleString('en-IN')} 
                      features={plan.benefits} 
                      isPremium={true}
                      isLocked={plan.isLocked}
                      form={plan.form}
                      opensAt={plan.opensAt}
                      onGetStarted={onUpgrade}
                    />
                  ))
                ) : (
                  <>
                    <View style={[{
                      height:"100%",
                      alignItems:"center",
                      justifyContent:"center",
                      width: CARD_WIDTH*1.2,
                    }]}>
                      <CustomText style={[styles.title,{
                        textAlign:"center",
                        marginBottom: 10,
                        color:"#ddd"
                      }]}>
                        Stay tuned for more plans coming soon!
                      </CustomText>
                      <TouchableOpacity 
                        style={[styles.button, styles.standardButton, {borderRadius:5}]}
                        onPress={() => {
                          navigation.navigate({
                            name: 'Home',
                          })
                        }}
                        accessible={true}
                        accessibilityLabel="More plans coming soon"
                        accessibilityRole="button"
                      >
                        <CustomText style={[styles.buttonText, {fontSize: 14}]}>
                          Explore Other Features
                        </CustomText>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </ScrollView>
            )}
          </View>

          {/* <TouchableOpacity 
            style={styles.showFeaturesButton} 
            onPress={() => setShowAll(!showAll)}
            accessible={true}
            accessibilityLabel={showAll ? "Hide all features" : "Show all features"}
            accessibilityRole="button"
          >
            <CustomText style={styles.showFeaturesText}>
              {showAll ? "Hide Features" : "Show All Features"}
            </CustomText>
            <Icon 
              name={showAll ? "chevron-up" : "chevron-down"} 
              size={18} 
              color="#371981" 
            />
          </TouchableOpacity> */}

          {showAll && (
            <ScrollView 
              style={styles.allFeaturesContainer}
              contentContainerStyle={styles.allFeaturesContent}
              showsVerticalScrollIndicator={true}
              accessible={true}
              accessibilityLabel="All plan features"
            >
              {getAllBenefits().map((feature, index) => (
                <View key={index} style={styles.allFeatureItem}>
                  <Icon 
                    name="check-circle" 
                    size={16} 
                    color="#371981" 
                    style={styles.featureIcon}
                  />
                  <CustomText style={styles.allFeatureText}>{feature}</CustomText>
                </View>
              ))}
            </ScrollView>
          )}
{/*           
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={onClose}
            accessible={true}
            accessibilityLabel="Continue with free plan"
            accessibilityRole="button"
          >
            <CustomText style={styles.skipButtonText}>Continue with Free Plan</CustomText>
          </TouchableOpacity> */}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CounsellingCards;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 40 : 25, // Extra padding for iOS
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: SCREEN_WIDTH < 360 ? 18 : 20,
    fontWeight: 'bold',
    color: '#371981',
  },
  closeButton: {
    padding: 8,
    
  },
  scrollViewContainer: {
    // Using fixed height instead of flex prevents layout issues
    height: SCREEN_HEIGHT < 700 ? 300 : 320,
  },
  cardsContainer: {
    paddingVertical: 5,
    paddingHorizontal: SCREEN_WIDTH < 360 ? 8 : 15,
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: SCREEN_WIDTH < 360 ? 12 : 16,
    marginHorizontal: CARD_MARGIN,
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    // Ensure cards have a reasonable height constraint
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  premiumCard: {
    borderColor: '#4CAF50',
    borderWidth: 1.5,
  },
  title: {
    fontSize: SCREEN_WIDTH < 360 ? 18 : 20,
    fontWeight: 'bold',
    color: '#371981',
    marginBottom: 4,
  },
  price: {
    fontSize: SCREEN_WIDTH < 360 ? 24 : 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: SCREEN_HEIGHT < 700 ? 15 : 15,
    paddingBottom: 8,
  },
  featuresContainer: {
    marginBottom: SCREEN_HEIGHT < 700 ? 12 : 18,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align to top in case text wraps
    marginBottom: 6,
  },
  featureIcon: {
    marginTop: 2, // Align icon with text
  },
  featureText: {
    marginLeft: 8,
    fontSize: SCREEN_WIDTH < 360 ? 12 : 13,
    color: '#555',
    flex: 1, // Allow text to shrink on small screens
  },
  button: {
    paddingVertical: SCREEN_WIDTH < 360 ? 8 : 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Smaller but still accessible touch target
  },
  standardButton: {
    backgroundColor: '#371981',
  },
  premiumButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: SCREEN_WIDTH < 360 ? 14 : 15,
    fontWeight: 'bold',
  },
  showFeaturesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    minHeight: 40,
  },
  showFeaturesText: {
    color: '#371981',
    fontSize: SCREEN_WIDTH < 360 ? 14 : 15,
    fontWeight: '500',
    marginRight: 5,
  },
  allFeaturesContainer: {
    backgroundColor: '#f9f9f9',
    marginHorizontal: 15,
    borderRadius: 12,
    maxHeight: SCREEN_HEIGHT * 0.2,
  },
  allFeaturesContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  allFeatureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  allFeatureText: {
    marginLeft: 8,
    fontSize: SCREEN_WIDTH < 360 ? 12 : 13,
    color: '#333',
    flex: 1, // Allow text to wrap
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 10,
    minHeight: 40,
  },
  skipButtonText: {
    color: '#666',
    fontSize: SCREEN_WIDTH < 360 ? 13 : 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#371981',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginTop: 10,
    color: '#d9534f',
    fontSize: 16,
    textAlign: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  
  lockIcon: {
    marginLeft: 8,
  },
  
  lockedCard: {
    opacity: 0.85,
    borderColor: '#FF9800',
    borderStyle: 'dashed',
  },
  
  lockedText: {
    color: '#777',
  },
  
  lockedButton: {
    backgroundColor: '#B0BEC5',
  },
  
  lockedButtonText: {
    color: '#424242',
  },
  
  lockedInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 6,
    borderRadius: 4,
    marginBottom: 10,
  },
  
  opensAtText: {
    fontSize: 12,
    color: '#FF4500',
    marginLeft: 4,
    fontWeight: '500',
  },
});