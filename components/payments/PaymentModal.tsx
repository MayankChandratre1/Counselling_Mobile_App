import React from 'react';
import { 
  View, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Platform
} from 'react-native';
import CustomText from '../General/CustomText';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RazorpayCheckout from 'react-native-razorpay';
import { getUserData } from '../../utils/storage';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderData: any | null;
  planTitle: string;
}

const PaymentModal = ({ 
  visible, 
  onClose, 
  onSuccess, 
  orderData, 
  planTitle 
}: PaymentModalProps) => {
  const [loading, setLoading] = React.useState(false);

  const handlePayment = async () => {
    if (!orderData) return;

    try {
      setLoading(true);
      
      // Get user data for prefill
      const userData = await getUserData();
      
      const options = {
        description: `Payment for ${planTitle} Plan`,
        image: 'https://i.imgur.com/3g7nmJC.jpg',
        currency: orderData.currency || 'INR',
        key: orderData.key_id || 'rzp_test_R1L6paHcXFNdkR',
        amount: orderData.amount,
        name: 'SARATHI',
        order_id: orderData.id,
        prefill: {
          email: userData?.email || '',
          contact: `+91${userData?.phone}` || '',
          name: userData?.name || '',
        },
        theme: { color: '#371981' }
      };
      
      RazorpayCheckout.open(options)
        .then((data) => {
          // Handle success
          console.log("Payment successful:", data);
          Alert.alert('Success', 'Payment completed successfully!');
          onSuccess();
        })
        .catch((error) => {
          // Handle failure
          console.error("Payment error:", error);
          Alert.alert(
            'Payment Failed', 
            `Error: ${error.code || ''} | ${error.description || 'Something went wrong'}`
          );
          onClose();
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.error("Error initiating payment:", error);
      Alert.alert('Error', 'Failed to initiate payment');
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <CustomText style={styles.headerText}>Confirm Payment</CustomText>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              disabled={loading}
            >
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <Icon name="shield-check" size={60} color="#371981" />
            <CustomText style={styles.planTitle}>{planTitle} Plan</CustomText>
            <CustomText style={styles.amount}>
              ₹{((orderData?.amount || 0) / 100).toFixed(2)}
            </CustomText>
            <CustomText style={styles.description}>
              You'll be redirected to Razorpay to complete the payment securely.
            </CustomText>
          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={loading}
            >
              <CustomText style={styles.cancelText}>Cancel</CustomText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.payButton, loading && styles.disabledButton]} 
              onPress={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <CustomText style={styles.payText}>Pay Now</CustomText>
                  <Icon name="arrow-right" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    paddingVertical: 20,
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#371981',
    marginTop: 15,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 15,
    paddingVertical: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelText: {
    color: '#666',
    fontWeight: 'bold',
  },
  payButton: {
    backgroundColor: '#371981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#9E9E9E',
  },
  payText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PaymentModal;
