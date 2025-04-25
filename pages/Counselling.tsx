import { StyleSheet, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserData, getUserPlanData } from '../utils/storage';
import StackNavigationPremium from '../components/Counselling/StackNavigationPremium';

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

  return (
    <StackNavigationPremium planType={currentPlan as 'Premium' | 'Counselling' | 'Free'} />
  )
}

export default Counselling;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
});
