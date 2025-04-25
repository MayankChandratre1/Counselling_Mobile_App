import { Dimensions, StyleSheet, TouchableOpacity, View, Image, Alert, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { clearUserData, storeUserData } from '../utils/storage';
import React, { useState } from 'react'
import config from '../configs/API';
import CustomText from '../components/General/CustomText';
import { FONTS } from '../styles/typography';
import CustomTextInput from '../components/General/CustomTextInput';

export const LoginScreen = ({navigation}:any) => {
  const [phone, setPhone] = useState('');
  const [isPassword, setIsPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get screen dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenHeight < 700;
  
  // Validation and submission functions
  const validatePhone = (phoneNumber: string) => {
    return phoneNumber.length === 10 && /^\d{10}$/.test(phoneNumber);
  };

  const handleLogin = async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    
    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    
    try {
      setLoading(true);
      const res = await fetch(`${config.USER_API}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.firstLogin) {
          // Handle first login case - show name input screen
          setIsFirstLogin(true);
          setName(""); // Default name to phone number
        } else {
          // Regular login success
          await clearUserData();
          const stored = await storeUserData(data);
          if (stored) {
            navigation.navigate('Home');
          }
        }
      } else {
        Alert.alert('Error', data.error || 'User not found');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to login');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmitName = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    
    try {
      setLoading(true);
      // Update user with name
      const res = await fetch(`${config.USER_API}/updateName`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, name })
      });
      
      const data = await res.json();
      console.log(data);
      
      
      if (res.ok) {
        await clearUserData();
        const stored = await storeUserData(data);
        if (stored) {
          navigation.navigate('Home');
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to update name');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to update name');
    } finally {
      setLoading(false);
    }
  }

  const handleCheckPremium = async () => {
    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    
    try {
      setLoading(true);
      const res = await fetch(`${config.USER_API}/ispremium`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
      });
      
      const data = await res.json();
      console.log(data);
      
      if (res.ok) {
        if (data.isPremium) {
          setIsPassword(true);
        } else {
          await handleLogin();
        }
      } else {
        Alert.alert('Error', data.error || 'User not found');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to check premium status');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (isFirstLogin) {
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
    } else if (isPassword) {
      return (
        <>
          <View style={styles.welcomeContainer}>
            <CustomText style={styles.welcomeText}>
              Enter Your Password
            </CustomText>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <CustomText style={styles.inputLabel}>Password</CustomText>
              <View style={styles.passwordContainer}>
                <CustomTextInput
                  style={styles.passwordInput}
                  contextMenuHidden
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={24} 
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleLogin} 
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
              onPress={handleCheckPremium} 
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
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
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
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    width: '100%',
    height: 50,
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingRight: 50,
    color: '#333333',
    fontFamily: FONTS.REGULAR,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 12,
    padding: 5,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 4,
  },
});