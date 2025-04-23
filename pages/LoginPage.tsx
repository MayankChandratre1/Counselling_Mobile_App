import { Dimensions, StyleSheet, TouchableOpacity, View, Image, Alert, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { storeUserData } from '../utils/storage';
import React, { useState } from 'react'
import config from '../configs/API';
import CustomText from '../components/General/CustomText';
import { FONTS } from '../styles/typography';
import CustomTextInput from '../components/General/CustomTextInput';

export const LoginScreen = ({navigation}:any) => {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [isLogin, setIsLogin] = React.useState(false);
  const [isPassword, setIsPassword] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Get screen dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenHeight < 700;
  
  // Validation and submission functions
  const validatePhone = (phoneNumber: string) => {
    return phoneNumber.length === 10 && /^\d{10}$/.test(phoneNumber);
  };

  const handleLogin = async () => {
    console.log(phone);
    if (!phone) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    try {
      const res = await fetch(`${config.USER_API}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, password })
      });

      console.log(res);
      
      
      const data = await res.json();
      if (res.ok) {
        const stored = await storeUserData(data);
          if (stored) {
            navigation.navigate('Home');
        }
      } else {
        Alert.alert('Error', data.error || 'User not found');
      }
    } catch (error) {
      console.log(error);
      
      Alert.alert('Error', 'Failed to login');
    }
  }

  const handleSubmit = async () => {
    
    if (isLogin) {
      if (!phone) {
        Alert.alert('Error', 'Please enter your phone number');
        return;
      }
      
      if (!validatePhone(phone)) {
        Alert.alert('Error', 'Please enter a valid 10-digit phone number');
        return;
      }
      
      try {
        console.log(`${config.USER_API}/ispremium`);
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
          if(data.isPremium){
            setIsPassword(true);
          }else{
            await handleLogin();
          }
        } else {
          Alert.alert('Error', data.error || 'User not found');
        }
      } catch (error) {
        console.log(error);
        
        Alert.alert('Error', 'Failed to login');
      }
    } else {
      // Existing signup logic
      if (!name) {
        Alert.alert('Error', 'Please enter your name');
        return;
      }
      
      if (!validatePhone(phone)) {
        Alert.alert('Error', 'Please enter a valid 10-digit phone number');
        return;
      }

      const userData = { name, phone };
      try {
        const res = await fetch(config.USER_API, {
          method:'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        const savedData = await res.json();
        const stored = await storeUserData(savedData);
        if (stored) {
          navigation.navigate('Home');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to save user data');
      }
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
          
          <View style={styles.welcomeContainer}>
            <CustomText style={styles.welcomeText}>
              {isPassword ? `Enter Your Password` : `Welcome,`}
            </CustomText>
            
            {!isPassword && 
              <CustomText style={styles.subtitle}>
                To Maharashtra's Most Trusted Counselling Platform
              </CustomText>
            }
          </View>

          <View style={styles.formContainer}>
            {!isLogin && (
              <View style={styles.inputGroup}>
                
                <CustomTextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#999"
                />
              </View>
            )}

            {!isPassword && (
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
            )}

            {isPassword && (
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
            )}

            {isPassword ? 
              <TouchableOpacity onPress={handleLogin} style={styles.button}>
                <CustomText style={styles.buttonText}>Submit</CustomText>
              </TouchableOpacity>
              :
              <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                <CustomText style={styles.buttonText}>
                  {isLogin ? 'Login' : 'Get Started'}
                </CustomText>
              </TouchableOpacity>
            }

            <Pressable onPress={() => setIsLogin(!isLogin)} style={styles.toggleContainer}>
              <CustomText style={styles.toggleText}>
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
              </CustomText>
            </Pressable>
            
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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
  toggleContainer: {
    marginTop: 5,
    alignItems: 'center',
  },
  toggleText: {
    color: '#613EEA',
    fontSize: 14,
    fontWeight: '500',
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