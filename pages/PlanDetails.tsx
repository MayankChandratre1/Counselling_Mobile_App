import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import TopBar from '../components/General/TopBar'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { CommonActions } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

type RootStackParamList = {
  PlanDetails: {
    title: string;
    price: string;
    features: string[];
    isPremium: boolean;
  };
  Counselling: {
    selectedPlan?: string;
  };
};

type PlanDetailsProps = NativeStackScreenProps<RootStackParamList, 'PlanDetails'>;

const PlanDetails = ({ route, navigation }: PlanDetailsProps) => {
  const { title , price, features, isPremium } = {
    title: route.params?.title ?? "Free",
    price: route.params?.price ?? "0",
    features: route.params?.features ?? [],
    isPremium: !!route.params?.isPremium,
  }


  const handleConfirm = async () => {
    const data = {
        isPremium: true,
        plan: title,
        price: price,
        expiry: title == 'Premium' ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null,
    }
    await AsyncStorage.setItem('plan', JSON.stringify(data));
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Home',
            params: {
              screen: 'Counselling',
              params: { selectedPlan: title }
            },
          },
        ],
      })
    );
  }

  return (
    <>
      <TopBar heading={`${title} Plan Details`} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.price}>₹{price}/-</Text>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>What you'll get:</Text>
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

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm Purchase</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
  
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1400FF',
  },
  price: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1400FF',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#1400FF',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 40,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})

export default PlanDetails
