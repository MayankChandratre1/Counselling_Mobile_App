import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CounsellingForm from './CounsellingForm';
import MyLists from '../../pages/Lists/MyLists';


const RecommendedColleges = () => <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Recommended Colleges</Text></View>;
const CutoffCalculator = () => <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>Cutoff Calculator</Text></View>;
const CollegePredictor = () => <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><Text>College Predictor</Text></View>;

import { View, Text } from 'react-native';
import PremiumDashboard from './PremiumDashboard';

const Stack = createNativeStackNavigator();

interface PremiumStackProps {
  planType: 'Premium' | 'Counselling';
}

const StackNavigationPremium = ({ planType }: PremiumStackProps) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'none'
      }}
    >
      {/* Base Premium Screens */}
      <Stack.Screen name="PremiumDashboard" component={PremiumDashboard} />
      <Stack.Screen name="RecommendedColleges" component={RecommendedColleges} />
      <Stack.Screen name="CutoffCalculator" component={CutoffCalculator} />

      {/* Conditional Counselling Screens */}
      {planType === 'Counselling' && (
        <>
          <Stack.Screen name="CounsellingForm" component={CounsellingForm} />
          <Stack.Screen name="MyLists" component={MyLists} />
          <Stack.Screen name="CollegePredictor" component={CollegePredictor} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigationPremium;
