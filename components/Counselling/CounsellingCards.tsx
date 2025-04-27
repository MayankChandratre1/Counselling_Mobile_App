import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, Dimensions, Animated, Platform } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import CustomText from '../General/CustomText'

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

interface PlanCardProps {
  title: string;
  price: string;
  features: string[];
  isPremium: boolean;
  onGetStarted: (planDetails: any) => void;
}

interface CounsellingCardsProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: (planDetails: any) => void;
  features: string[];
}

const PlanCard = ({ title, price, features, isPremium, onGetStarted }: PlanCardProps) => {
  // Determine how many features to show based on screen size
  const getVisibleFeatures = () => {
    if (SCREEN_HEIGHT < 600) return 2; // Very small screens
    if (SCREEN_WIDTH < 360) return 3; // Small screens
    return 4; // Regular screens (reduced from 5)
  };
  
  const visibleFeatures = getVisibleFeatures();
  
  return (
    <View style={[styles.card, isPremium && styles.premiumCard]}>
      <CustomText style={styles.title} numberOfLines={1} ellipsizeMode="tail">{title}</CustomText>
      <CustomText style={styles.price}>₹{price}</CustomText>
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
              style={styles.featureText} 
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {feature}
            </CustomText>
          </View>
        ))}
      </View>
      <TouchableOpacity 
        style={[styles.button, isPremium ? styles.premiumButton : styles.standardButton]}
        onPress={() => onGetStarted({ price, features, isPremium, title })}
        accessible={true}
        accessibilityLabel={`Get Started with ${title} plan for ₹${price}`}
        accessibilityRole="button"
      >
        <CustomText style={styles.buttonText}>Get Started</CustomText>
      </TouchableOpacity>
    </View>
  );
};

const CounsellingCards = ({ visible, onClose, onUpgrade, features }: CounsellingCardsProps) => {
  const [showAll, setShowAll] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
              <PlanCard 
                title="Premium" 
                price="499" 
                features={features} 
                isPremium={false}
                onGetStarted={onUpgrade}
              />
              <PlanCard 
                title="Counselling" 
                price="6,999" 
                features={features} 
                isPremium={true}
                onGetStarted={onUpgrade}
              />
            </ScrollView>
          </View>

          <TouchableOpacity 
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
          </TouchableOpacity>

          {showAll && (
            <ScrollView 
              style={styles.allFeaturesContainer}
              contentContainerStyle={styles.allFeaturesContent}
              showsVerticalScrollIndicator={true}
              accessible={true}
              accessibilityLabel="All plan features"
            >
              {features.map((feature, index) => (
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
          
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={onClose}
            accessible={true}
            accessibilityLabel="Continue with free plan"
            accessibilityRole="button"
          >
            <CustomText style={styles.skipButtonText}>Continue with Free Plan</CustomText>
          </TouchableOpacity>
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    marginBottom: SCREEN_HEIGHT < 700 ? 10 : 15,
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
});