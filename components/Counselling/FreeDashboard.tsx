import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import TopBar from '../General/TopBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData, getUserPlanData } from '../../utils/storage';
import CustomText from '../General/CustomText';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CounsellingCards from './CounsellingCards';

// Get screen dimensions for responsive layout
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const features = [
  "Personalized College Recommendations",
  "Unlimited Cutoffs Check",
  "Unlimited Information on Colleges",
  "Daily Updates on Admission Procedures",
  "Filter Colleges According to Your Scores",
  "Interactive Seminars with Q&A Sessions",
  "Fee Structures & Scholarships Information",
  "CAP Round Guidance for College Selection",
  "Career Counseling and Guidance Based on College Choices"
];

const FreeDashboard = ({ navigation }: any) => {
  const [currentPlan, setCurrentPlan] = useState('Free')
  const [showPlansModal, setShowPlansModal] = useState(false)

  useEffect(() => {
    const checkPlan = async () => {
      const plan = await getUserPlanData();
      console.log("Plan found", plan);
      
      if (plan) {
        const userData = await getUserData()
        setCurrentPlan(plan.plan?.planTitle ?? "Free")
        
        // Show plans modal when opening the tab for free users
        if (!plan.isPremium) {
          setShowPlansModal(true);
        }
      }
    }
    checkPlan()
  }, [])

  const handleGetStarted = (planDetails: any) => {
    navigation.navigate('PlanDetails', planDetails)
  }

  const skipPremium = async () => {
    const data = {
      isPremium: false,
      plan: 'Free',
      price: '0',
      expiry: null,
    }
    await AsyncStorage.setItem('plan', JSON.stringify(data));
    setCurrentPlan('Free')
    setShowPlansModal(false);
  }

  // Dashboard cards configuration
  const dashboardCards = [
    {
      title: "Current Plan",
      icon: "crown",
      description: `You are on ${currentPlan} Plan`,
      color: '#613EEA',
      locked: false,
      route:'MyPlan',
    },
    {
      title: "Track Progress",
      icon: "progress-check",
      description: 'Track your counselling progress',
      route: 'CounsellingForm',
      color: '#4CAF50',
      locked: false,
    },
    {
      title: "Registration Data",
      icon: "card-account-details",
      description: 'View and edit your details',
      route: 'RegistrationForm',
      color: '#2196F3',
      locked: true,
    },
    {
      title: "My Lists",
      icon: "format-list-checks",
      description: 'View your college lists',
      route: 'MyLists',
      color: '#FF9800',
      locked: true,
    },
  ];

  // Determine cards per row based on screen width
  const getGridColumns = () => {
    if (SCREEN_WIDTH < 320) return 1; // Single column for very small screens
    return 2; // Default 2 columns
  };

  const gridColumns = getGridColumns();
  const cardWidth = gridColumns === 1 ? '100%' : '48%';

  return (
    <View style={styles.container}>
      <TopBar heading="Counselling Dashboard" />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: SCREEN_WIDTH < 360 ? 10 : 15 }
        ]}
      >
        <View style={styles.currentPlanWrapper}>
          <View style={styles.currentPlanCard}>
            <CustomText 
              style={styles.currentPlan}
              numberOfLines={1}
            >
              Current Plan: {currentPlan}
            </CustomText>
            <TouchableOpacity 
              onPress={() => setShowPlansModal(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible={true}
              accessibilityLabel="Upgrade your plan"
              accessibilityRole="button"
            >
              <CustomText style={styles.upgradeText}>Upgrade</CustomText>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[
          styles.dashboardContainer,
          { flexDirection: gridColumns === 1 ? 'column' : 'row' }
        ]}>
          {dashboardCards.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dashboardCard, 
                { backgroundColor: card.color, width: cardWidth }, 
                card.locked && styles.lockedCard,
                gridColumns === 1 && { minHeight: 130 }
              ]}
              onPress={() => card.route && !card.locked && navigation.navigate(card.route)}
              disabled={card.locked}
              accessible={true}
              accessibilityLabel={`${card.title}: ${card.description}${card.locked ? '. Premium only' : ''}`}
              accessibilityRole="button"
              accessibilityState={{ disabled: card.locked }}
            >
              <View style={styles.cardContent}>
                <MaterialCommunityIcons 
                  name={card.icon} 
                  size={SCREEN_WIDTH < 360 ? 28 : 32} 
                  color="#fff" 
                />
                <CustomText 
                  style={[
                    styles.cardTitle,
                    { fontSize: SCREEN_WIDTH < 360 ? 16 : 18 }
                  ]}
                  numberOfLines={1}
                >
                  {card.title}
                </CustomText>
                <CustomText 
                  style={[
                    styles.cardDescription,
                    { fontSize: SCREEN_WIDTH < 360 ? 13 : 14 }
                  ]}
                  numberOfLines={2}
                >
                  {card.description}
                </CustomText>
              </View>
              
              {card.locked && (
                <View style={styles.lockedOverlay}>
                  <MaterialCommunityIcons 
                    name="lock" 
                    size={SCREEN_WIDTH < 360 ? 36 : 40} 
                    color="#fff" 
                  />
                  <CustomText style={styles.lockedText}>Premium Only</CustomText>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.upgradeCTA}
          onPress={() => setShowPlansModal(true)}
          accessible={true}
          accessibilityLabel="Upgrade to Premium to unlock all features"
          accessibilityRole="button"
        >
          <CustomText 
            style={[
              styles.upgradeCTAText,
              { fontSize: SCREEN_WIDTH < 360 ? 14 : 16 }
            ]}
            numberOfLines={1}
          >
            Upgrade to Premium to unlock all features
          </CustomText>
          <Icon name="arrow-right" size={SCREEN_WIDTH < 360 ? 18 : 20} color="#371981" />
        </TouchableOpacity>
      </ScrollView>
      
      <CounsellingCards 
        visible={showPlansModal}
        onClose={skipPremium}
        onUpgrade={handleGetStarted}
        features={features}
      />
    </View>
  );
}

export default FreeDashboard

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 15,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  currentPlanWrapper: {
    marginBottom: 15,
  },
  currentPlanCard: {
    backgroundColor: '#371981',
    borderRadius: 15,
    padding: SCREEN_WIDTH < 360 ? 12 : 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
  },
  currentPlan: {
    fontSize: SCREEN_WIDTH < 360 ? 16 : 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1, // Allow text to compress if needed
    paddingRight: 10,
  },
  upgradeText: {
    color: '#FFEB3B',
    fontSize: SCREEN_WIDTH < 360 ? 14 : 16,
    fontWeight: 'bold',
  },
  dashboardContainer: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dashboardCard: {
    borderRadius: 15,
    padding: SCREEN_WIDTH < 360 ? 14 : 16,
    marginBottom: 15,
    minHeight: SCREEN_HEIGHT < 700 ? 140 : 160,
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between', // Better spacing of content
  },
  cardTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  cardDescription: {
    color: '#fff',
    opacity: 0.9,
  },
  lockedCard: {
    opacity: 0.85,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  lockedText: {
    color: '#fff',
    fontSize: SCREEN_WIDTH < 360 ? 14 : 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  upgradeCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0FF',
    padding: SCREEN_WIDTH < 360 ? 12 : 15,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E0E0FF',
    borderStyle: 'dashed',
  },
  upgradeCTAText: {
    color: '#371981',
    marginRight: 8,
    fontWeight: '500',
  },
});