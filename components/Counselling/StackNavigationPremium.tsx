import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View, Text } from 'react-native';
import CounsellingForm from './CounsellingForm';
import MyLists from '../../pages/Lists/MyLists';
import PremiumDashboard from './PremiumDashboard';
import FreeDashboard from './FreeDashboard';

const RecommendedColleges = () => <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Recommended Colleges</Text></View>;
const CutoffCalculator = () => <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Cutoff Calculator</Text></View>;
const CollegePredictor = () => <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>College Predictor</Text></View>;

const Stack = createNativeStackNavigator();

interface PremiumStackProps {
  planType: 'Premium' | 'Counselling' | 'Free';
}

const StackNavigationPremium = ({ planType }: PremiumStackProps) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'none'
      }}
    >
      {/* Base screens based on plan type */}
      {planType == 'Free' ? (
        <Stack.Screen name="FreeDashboard" component={FreeDashboard} />
      ) : (
        <Stack.Screen name="PremiumDashboard" component={PremiumDashboard} />
      )}

      {/* Common screens for all plan types */}
      <Stack.Screen name="RecommendedColleges" component={RecommendedColleges} />
      <Stack.Screen name="CutoffCalculator" component={CutoffCalculator} />
      <Stack.Screen name="CounsellingForm" component={CounsellingForm}
      
      />

      {/* Conditional Counselling Screens */}
      {planType === 'Counselling' && (
        <>
          <Stack.Screen name="MyLists" component={MyLists} />
          <Stack.Screen name="CollegePredictor" component={CollegePredictor} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigationPremium;
