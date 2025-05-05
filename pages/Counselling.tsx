import { StyleSheet, View } from 'react-native'
import React, { useEffect } from 'react'
import StackNavigationPremium from '../components/Counselling/StackNavigationPremium';
import { usePremiumPlan } from '../contexts/PremiumPlanContext';

const Counselling = ({ route, navigation }: any) => {
  const { currentPlan, refreshPlanData } = usePremiumPlan();

  useEffect(() => {
    // Refresh plan data when component mounts
    refreshPlanData();
  }, []);

  useEffect(() => {
    // Check if we received params through tab navigation
    if (route?.params?.selectedPlan) {
      // No need to setCurrentPlan as it's managed by context
      // But we might want to refresh plan data
      refreshPlanData();
    }
  }, [route?.params]);

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
