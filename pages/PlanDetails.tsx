import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import TopBar from '../components/General/TopBar'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import AsyncStorage from '@react-native-async-storage/async-storage'
import config from '../configs/API'
import { RequestMethod, secureRequest } from '../utils/tokenedRequest'
import PaymentModal from '../components/payments/PaymentModal'

type RootStackParamList = {
  PlanDetails: {
    title: string;
    price: string;
    features: string[];
    isPremium: boolean;
  };
  RegistrationForm: {
    planDetails: {
      isPremium: boolean;
      plan: string;
      price: string;
      expiry: number | null;
  },
    isUpdatePlanDetails: boolean;
  };
  Counselling: {
    selectedPlan?: string;
  };
};

type PlanDetailsProps = NativeStackScreenProps<RootStackParamList, 'PlanDetails'>;

const PlanDetails = ({ route, navigation }: PlanDetailsProps) => {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const { title , price, features, isPremium } = {
    title: route.params?.title ?? "Free",
    price: route.params?.price ?? "0",
    features: route.params?.features ?? [],
    isPremium: !!route.params?.isPremium,
  }

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Generate a random receipt string
      const receipt = `receipt_${Math.random().toString(36).substring(2, 15)}`;
      
      // Create plan details object
      const planDetails = {
        isPremium: true,
        plan: title,
        price: price,
        expiry: title == 'Premium' ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null,
      };
      
      // Create payload for the create-order API
      const payload = {
        amount: parseInt(price.replace(/,/g, '')), // Remove commas from price string
        receipt: receipt,
        notes: {
          planDetails: JSON.stringify(planDetails),
          planTitle: title,
          customerPlan: title
        }
      };
      
      // Send POST request to create-order API
      const response = await secureRequest(`${config.PAYMENT_API}/create-order`, RequestMethod.POST, {
        body: payload
      });
      
      if (response.data) {
        console.log('Order creation response:', response.data);
        
        // Store order data and show payment modal
        setOrderData(response.data);
        setShowPaymentModal(true);
        
        // Store plan data in AsyncStorage for later use if needed
        await AsyncStorage.setItem('tempPlanDetails', JSON.stringify(planDetails));
      } else {
        throw new Error(response.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'Failed to create payment order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Get stored plan details
      const planDetailsStr = await AsyncStorage.getItem('tempPlanDetails');
      if (!planDetailsStr) throw new Error('Plan details not found');
      
      const planDetails = JSON.parse(planDetailsStr);
      
      // Close payment modal
      setShowPaymentModal(false);
      
      // Store plan data in AsyncStorage
      await AsyncStorage.setItem('plan', planDetailsStr);
      
      // Clean up temp storage
      await AsyncStorage.removeItem('tempPlanDetails');
      
      // Navigate to registration form
      navigation.navigate('RegistrationForm', {
        planDetails: planDetails,
        isUpdatePlanDetails: true,
      });
    } catch (error) {
      console.error('Error handling payment success:', error);
      Alert.alert('Error', 'There was an error processing your successful payment');
    }
  };

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

        <TouchableOpacity 
          style={[styles.confirmButton, loading && styles.confirmButtonDisabled]} 
          onPress={handleConfirm}
          disabled={loading}
        >
          <Text style={styles.confirmButtonText}>
            {loading ? 'Processing...' : 'Confirm Purchase'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        orderData={orderData}
        planTitle={title}
      />
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
  confirmButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
})

export default PlanDetails
