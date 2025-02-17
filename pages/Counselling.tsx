import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import TopBar from '../components/General/TopBar';

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
    <TouchableOpacity style={styles.button}>
      <Text style={styles.buttonText}>Get Started</Text>
    </TouchableOpacity>
  </View>
);

const Counselling = () => {
  return (
    <>
    <TopBar heading="Plans" />
    <ScrollView style={styles.container}>
      <View style={styles.currentPlanCard}>
        <Text style={styles.currentPlan}>Current Plan: Free</Text>
      </View>
      <PlanCard title={"Premium"} price="499" features={features} isPremium={false} />
      <PlanCard title={"Counselling"} price="6,999" features={features} isPremium={true} />
    </ScrollView>
    </>
  );
};

export default Counselling;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
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
