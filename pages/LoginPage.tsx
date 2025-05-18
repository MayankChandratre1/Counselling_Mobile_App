import { Dimensions, StyleSheet, TouchableOpacity, View, Image, Alert, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { clearUserData, storeUserData } from '../utils/storage';
import React, { useState, useEffect, useRef } from 'react'
import config from '../configs/API';
import CustomText from '../components/General/CustomText';
import { FONTS } from '../styles/typography';
import CustomTextInput from '../components/General/CustomTextInput';
import DeviceInfo from 'react-native-device-info';

export const LoginScreen = ({navigation}:any) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isOtpScreen, setIsOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  // OTP Countdown timer states
  const [resendTimer, setResendTimer] = useState(60); // 1 minute timer
  const [canResendOtp, setCanResendOtp] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get screen dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenHeight < 700;
  
  // Start timer when OTP screen is shown
  useEffect(() => {
    if (isOtpScreen) {
      startResendTimer();
    } else {
      // Clear timer if we're not on OTP screen
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOtpScreen]);

  const startResendTimer = () => {
    setResendTimer(60); // Reset to 60 seconds
    setCanResendOtp(false);
    
    // Clear existing timer if any
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Start new timer
    timerRef.current = setInterval(() => {
      setResendTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(timerRef.current!);
          setCanResendOtp(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const getDeviceId = async () => {
    const uniqueId = await DeviceInfo.getUniqueId();
    return uniqueId;
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };
  
  // Validation functions
  const validatePhone = (phoneNumber: string) => {
    return phoneNumber.length === 10 && /^\d{10}$/.test(phoneNumber);
  };

  const validateOtp = (otpCode: string) => {
    return otpCode.length === 6 && /^\d{6}$/.test(otpCode);
  };

  const handleSendOtp = async () => {
    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    
    try {
      setLoading(true);
      const deviceId = await getDeviceId();

      console.log("Url", `${config.USER_API}/login`);
      
      
      const res = await fetch(`${config.USER_API}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, deviceId })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIsOtpScreen(true);
      } else {
        Alert.alert('Error', data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    
    try {
      setLoading(true);
      const res = await fetch(`${config.USER_API}/sendotp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        Alert.alert('Success', 'OTP has been resent to your phone');
        startResendTimer();
      } else {
        Alert.alert('Error', data.error || 'Failed to resend OTP');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp(otp)) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }
    
    try {
      setLoading(true);
      const deviceId = await getDeviceId();
      
      const res = await fetch(`${config.USER_API}/verifyPhone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, otp, deviceId })
      });
      
      const data = await res.json();
      
      if (res.ok && data.verified) {
        if (data.firstLogin) {
          // New user - show name & email input screen
          setIsOtpScreen(false);
          setIsFirstLogin(true);
        } else {
          // Regular user - directly log them in
          await clearUserData();
          const stored = await storeUserData(data);
          if (stored) {
            navigation.replace('Home');
          }
        }
      } else {
        Alert.alert('Error', data.error || 'Invalid OTP');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitName = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    try {
      setLoading(true);
      // Update user with name and email
      const res = await fetch(`${config.USER_API}/updateName`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, name, email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        await clearUserData();
        const stored = await storeUserData(data);
        if (stored) {
          navigation.replace('Home');
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to update user details');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to update user details');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (isOtpScreen) {
      return (
        <>
          <View style={styles.welcomeContainer}>
            <CustomText style={styles.welcomeText}>
              Verify Your Phone
            </CustomText>
            <CustomText style={styles.subtitle}>
              We have sent a 6-digit OTP to {phone}
            </CustomText>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <CustomTextInput
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                placeholderTextColor="#999"
                maxLength={6}
              />
              <View style={styles.timerContainer}>
                <CustomText style={styles.timerText}>
                  {canResendOtp ? 'OTP expired' : `OTP expires in ${formatTime(resendTimer)}`}
                </CustomText>
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleVerifyOtp} 
              style={styles.button}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <CustomText style={styles.buttonText}>
                  Verify OTP
                </CustomText>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleResendOtp}
              disabled={!canResendOtp || loading}
              style={[
                styles.resendButton, 
                (!canResendOtp || loading) && styles.resendButtonDisabled
              ]}
            >
              <CustomText style={[
                styles.resendText,
                (!canResendOtp || loading) && styles.resendTextDisabled
              ]}>
                Resend OTP
              </CustomText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.changeNumberButton}
              onPress={() => {
                setIsOtpScreen(false);
                setOtp('');
              }}
            >
              <CustomText style={styles.changeNumberText}>
                Change Phone Number
              </CustomText>
            </TouchableOpacity>
          </View>
        </>
      );
    } else if (isFirstLogin) {
      return (
        <>
          <View style={styles.welcomeContainer}>
            <CustomText style={styles.welcomeText}>
              Welcome to Sarathi!
            </CustomText>
            <CustomText style={styles.subtitle}>
              Please enter your name to complete your registration
            </CustomText>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <CustomTextInput
                style={styles.input}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputGroup}>
              <CustomTextInput
                style={styles.input}
                placeholder="Enter your email (optional)"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#999"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity 
              onPress={handleSubmitName} 
              style={styles.button}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <CustomText style={styles.buttonText}>
                  Continue
                </CustomText>
              )}
            </TouchableOpacity>
          </View>
        </>
      );
    } else {
      return (
        <>
          <View style={styles.welcomeContainer}>
            <CustomText style={styles.welcomeText}>
              Welcome,
            </CustomText>
            <CustomText style={styles.subtitle}>
              To Maharashtra's Most Trusted Counselling Platform
            </CustomText>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <CustomTextInput
                style={styles.input}
                placeholder="Enter your phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
                maxLength={10}
              />
            </View>

            <TouchableOpacity 
              onPress={handleSendOtp} 
              style={styles.button}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <CustomText style={styles.buttonText}>
                  Login
                </CustomText>
              )}
            </TouchableOpacity>
          </View>
        </>
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <Image 
            source={require('../assets/Yash_aaradhey_logo.png')}
            style={[styles.logo, isSmallScreen && styles.logoSmall]}
            resizeMode="contain"
          />
          
          {renderContent()}
          
          {/* Adding terms and conditions inside the scrollable area */}
          <View style={styles.termsContainer}>
            <CustomText style={styles.termsText}>
              By continuing, you agree to our
            </CustomText>
            <View style={styles.termsLinksContainer}>
              <CustomText style={styles.termsLink}>Terms & Conditions</CustomText>
              <CustomText style={styles.termsLink}>Privacy Policy</CustomText>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // ...existing code...
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 20,
  },
  logoSmall: {
    width: 100,
    height: 100,
  },
  welcomeContainer: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 15,
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333333',
    fontFamily: FONTS.REGULAR,
  },
  button: {
    backgroundColor: '#613EEA',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    marginTop: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  termsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  termsText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  termsLinksContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  termsLink: {
    color: '#613EEA',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    color: '#613EEA',
    fontSize: 16,
    fontWeight: '500',
  },
  resendTextDisabled: {
    color: '#999',
  },
  changeNumberButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  changeNumberText: {
    color: '#666',
    fontSize: 14,
  },
});