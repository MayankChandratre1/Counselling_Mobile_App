import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import TopBar from '../components/General/TopBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CounsellingForm from '../components/Counselling/CounsellingForm';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { getUserData, getUserPlanData } from '../utils/storage';
import StackNavigationPremium from '../components/Counselling/StackNavigationPremium';

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

const Counselling = ({ route, navigation }: any) => {
  const [currentPlan, setCurrentPlan] = useState('')
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    const checkPlan = async () => {
      const plan = await getUserPlanData();
      console.log("Plan found", plan);
      
      if (plan) {
        const userData = await getUserData()
        setCurrentPlan(plan.plan?.planTitle ?? "Free")
        setIsPremium(plan.isPremium)
      }
    }
    checkPlan()
  },[])

  useEffect(() => {
    // Check if we received params through tab navigation
    if (route?.params?.selectedPlan) {
      setCurrentPlan(route.params.selectedPlan)
    }
  }, [route?.params])

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
    setIsPremium(false)
  }

  const PlanCard = ({ price, features, isPremium, title }: { price: string, features: string[], isPremium: boolean, title:String }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.price}>₹{price}</Text>
      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Icon 
              name={isPremium || index < 5 ? "check-circle" : "close-circle"} 
              size={24} 
              color={isPremium || index < 5 ? "#4CAF50" : "#F44336"} 
            />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => handleGetStarted({ price, features, isPremium, title })}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  )

  if(isPremium) {
    return (
      <>
        <StackNavigationPremium planType={currentPlan as 'Premium' | 'Counselling'} />
      </>
    );
  }

  return (
    <>
      <TopBar heading="Plans" />
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.currentPlanCard}>
            <Text style={styles.currentPlan}>Current Plan: {currentPlan}</Text>
            <Pressable onPress={skipPremium}>
              <AntDesign name="closecircleo" size={24} color="#fff" />
            </Pressable>
          </View>
          <PlanCard title={"Premium"} price="499" features={features} isPremium={false} />
          <PlanCard title={"Counselling"} price="6,999" features={features} isPremium={true} />
        </ScrollView>
        
        {/* Skip button outside ScrollView to stay at bottom */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={skipPremium}>
            <Text style={styles.skipButtonText}>Skip Premium</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

export default Counselling;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  bottomContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  skipButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title:{
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  currentPlanCard:{
    backgroundColor: '#1400FF',
    borderRadius: 40,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    
  },
  currentPlan: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: '#1400FF',
    borderRadius: 40,
    padding: 20,
    paddingVertical: 40,
    marginBottom: 20,
    // elevation: 4,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
  },
  price: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  featuresContainer: {
    marginBottom: 20,
    paddingHorizontal:10
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#371981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});
