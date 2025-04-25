import { StyleSheet, View, ScrollView, TouchableOpacity, Modal, Dimensions, Animated } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import CustomText from '../General/CustomText'

// Get screen dimensions for responsive layout
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 320);
const CARD_MARGIN = 10;

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

const PlanCard = ({ title, price, features, isPremium, onGetStarted }: PlanCardProps) => (
  <View style={styles.card}>
    <CustomText style={styles.title}>{title}</CustomText>
    <CustomText style={styles.price}>₹{price}</CustomText>
    <View style={styles.featuresContainer}>
      {features.slice(0, 5).map((feature, index) => (
        <View key={index} style={styles.featureRow}>
          <Icon 
            name="check-circle" 
            size={20} 
            color={isPremium ? "#4CAF50" : "#371981"} 
          />
          <CustomText style={styles.featureText}>{feature}</CustomText>
        </View>
      ))}
    </View>
    <TouchableOpacity 
      style={[styles.button, isPremium ? styles.premiumButton : styles.standardButton]}
      onPress={() => onGetStarted({ price, features, isPremium, title })}
    >
      <CustomText style={styles.buttonText}>Get Started</CustomText>
    </TouchableOpacity>
  </View>
);

const CounsellingCards = ({ visible, onClose, onUpgrade, features }: CounsellingCardsProps) => {
  const [showAll, setShowAll] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
            <CustomText style={styles.modalTitle}>Upgrade Your Plan</CustomText>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <AntDesign name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
            snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
            decelerationRate="fast"
            pagingEnabled
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

          <TouchableOpacity 
            style={styles.showFeaturesButton} 
            onPress={() => setShowAll(!showAll)}
          >
            <CustomText style={styles.showFeaturesText}>
              {showAll ? "Hide Features" : "Show All Features"}
            </CustomText>
            <Icon 
              name={showAll ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#371981" 
            />
          </TouchableOpacity>

          {showAll && (
            <View style={styles.allFeaturesContainer}>
              {features.map((feature, index) => (
                <View key={index} style={styles.allFeatureItem}>
                  <Icon name="check-circle" size={16} color="#371981" />
                  <CustomText style={styles.allFeatureText}>{feature}</CustomText>
                </View>
              ))}
            </View>
          )}
          
          <TouchableOpacity style={styles.skipButton} onPress={onClose}>
            <CustomText style={styles.skipButtonText}>Continue with Free Plan</CustomText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  )
}

export default CounsellingCards

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
    paddingVertical: 20,
    paddingBottom: 30,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#371981',
  },
  closeButton: {
    padding: 8,
  },
  cardsContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: CARD_MARGIN,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#371981',
    marginBottom: 5,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  standardButton: {
    backgroundColor: '#371981',
  },
  premiumButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  showFeaturesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 5,
  },
  showFeaturesText: {
    color: '#371981',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 5,
  },
  allFeaturesContainer: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 15,
    borderRadius: 12,
    maxHeight: 200,
  },
  allFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  allFeatureText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 15,
  },
});