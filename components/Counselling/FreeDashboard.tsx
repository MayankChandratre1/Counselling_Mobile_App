import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import TopBar from '../General/TopBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData, getUserPlanData } from '../../utils/storage';
import CustomText from '../General/CustomText';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CounsellingCards from './CounsellingCards';

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

  return (
    <View style={styles.container}>
      <TopBar heading="Counselling Dashboard" />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.currentPlanWrapper}>
          <View style={styles.currentPlanCard}>
            <CustomText style={styles.currentPlan}>Current Plan: {currentPlan}</CustomText>
            <TouchableOpacity onPress={() => setShowPlansModal(true)}>
              <CustomText style={styles.upgradeText}>Upgrade</CustomText>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.dashboardContainer}>
          {dashboardCards.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dashboardCard, { backgroundColor: card.color }, card.locked && styles.lockedCard]}
              onPress={() => card.route && !card.locked && navigation.navigate(card.route)}
              disabled={card.locked}
            >
              <View style={styles.cardContent}>
                <MaterialCommunityIcons name={card.icon} size={32} color="#fff" />
                <CustomText style={styles.cardTitle}>{card.title}</CustomText>
                <CustomText style={styles.cardDescription}>{card.description}</CustomText>
              </View>
              
              {card.locked && (
                <View style={styles.lockedOverlay}>
                  <MaterialCommunityIcons name="lock" size={40} color="#fff" />
                  <CustomText style={styles.lockedText}>Premium Only</CustomText>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.upgradeCTA}
          onPress={() => setShowPlansModal(true)}
        >
          <CustomText style={styles.upgradeCTAText}>
            Upgrade to Premium to unlock all features
          </CustomText>
          <Icon name="arrow-right" size={20} color="#371981" />
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
    padding: 15,
    paddingBottom: 40,
  },
  currentPlanWrapper: {
    marginBottom: 20,
  },
  currentPlanCard: {
    backgroundColor: '#371981',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  currentPlan: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  upgradeText: {
    color: '#FFEB3B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dashboardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dashboardCard: {
    width: '48%',
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
    minHeight: 160,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  cardDescription: {
    color: '#fff',
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  upgradeCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0FF',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E0E0FF',
    borderStyle: 'dashed',
  },
  upgradeCTAText: {
    color: '#371981',
    fontSize: 16,
    marginRight: 8,
    fontWeight: '500',
  },
})