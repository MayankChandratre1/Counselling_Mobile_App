import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TextInput
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../components/General/CustomText';
import CustomTextInput from '../components/General/CustomTextInput';
import { FONTS } from '../styles/typography';
import config from '../configs/API';
import { getUserData } from '../utils/storage';

interface PasswordScreenProps {
  route: {
    params: {
      planDetails: {
        isPremium: boolean;
        plan: string;
        price: string;
        expiry: number | null;
      };
    };
  };
  navigation: any;
}

const Password: React.FC<PasswordScreenProps> = ({ route, navigation }) => {
  const { planDetails } = route.params;
  
  // State management
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);
  
  // Get screen dimensions
  const { height } = Dimensions.get('window');
  const isSmallScreen = height < 700;
  
  // Fetch user data to get phone number
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserData();
        if (userData?.phone) {
          setPhone(userData.phone);
        } else {
          setError('User phone number not found. Please log in again.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      }
    };
    
    fetchUserData();
  }, []);
  
  // Password validation
  const validatePassword = (): boolean => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    setError(null);
    return true;
  };
  
  // Handle password submission
  const handleSetPassword = async () => {
    if (!validatePassword()) {
      return;
    }
    
    if (!phone) {
      setError('Phone number not found. Please log in again.');
      return;
    }
    
    try {
      setLoading(true);
      const res = await fetch(`${config.USER_API}/new-password/${phone}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        Alert.alert(
          'Success', 
          'Password set successfully!',
          [
            { 
              text: 'Continue', 
              onPress: () => navigation.navigate('RegistrationForm', { planDetails }) 
            }
          ]
        );
      } else {
        setError(data.error || 'Failed to set password');
      }
    } catch (err) {
      console.error('Error setting password:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            </View>
            <CustomText style={styles.congratsText}>
              Thank You for Enrolling!
            </CustomText>
            <CustomText style={styles.planName}>
              {planDetails.plan}
            </CustomText>
            <CustomText style={styles.subtitle}>
              Set up a secure password for your premium account
            </CustomText>
          </View>

          {/* Password Form */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <CustomText style={styles.inputLabel}>Create Password</CustomText>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#371981" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(null);
                  }}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#aaa"
                  contextMenuHidden={true}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <CustomText style={styles.inputLabel}>Confirm Password</CustomText>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={20} color="#371981" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setError(null);
                  }}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#aaa"
                  contextMenuHidden={true}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <CustomText style={styles.passwordRequirement}>
              Password must be at least 6 characters long
            </CustomText>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#FF5252" />
                <CustomText style={styles.errorText}>{error}</CustomText>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <CustomText style={styles.submitButtonText}>
                  Set Password & Continue
                </CustomText>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 30,
  },
  headerSmall: {
    paddingTop: 15,
    marginBottom: 20,
  },
  checkmarkContainer: {
    marginBottom: 15,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: FONTS.BOLD,
  },
  planName: {
    fontSize: 20,
    color: '#371981',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
    fontFamily: FONTS.MEDIUM,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: FONTS.REGULAR,
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
    marginLeft: 4,
    fontFamily: FONTS.MEDIUM,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
    position: 'relative',
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 52,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    fontFamily: FONTS.REGULAR,
  },
  eyeIcon: {
    padding: 12,
    position: 'absolute',
    right: 0,
  },
  passwordRequirement: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    marginTop: -6,
    marginBottom: 16,
    fontFamily: FONTS.REGULAR,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    fontFamily: FONTS.REGULAR,
  },
  submitButton: {
    backgroundColor: '#613EEA',
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#613EEA50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: FONTS.BOLD,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  planSummary: {
    backgroundColor: '#F8F8FC',
    borderRadius: 10,
    padding: 16,
    marginTop: 10,
  },
  planDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECF6',
  },
  planDetailLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: FONTS.REGULAR,
  },
  planDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: FONTS.MEDIUM,
  },
});

export default Password;
