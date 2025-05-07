import React, { useState, useRef, useEffect } from 'react'
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Image, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import CustomText from '../components/General/CustomText'
import CustomTextInput from '../components/General/CustomTextInput'
import { FONTS } from '../styles/typography'
import config from '../configs/API'

const ForgotPassword = ({ navigation }: any) => {
  // Stage management
  const [stage, setStage] = useState<'phone' | 'otp' | 'newPassword'>('phone')
  
  // Form data
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // OTP timer states
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Get screen dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
  const isSmallScreen = screenHeight < 700

  // Start timer when OTP screen is shown
  useEffect(() => {
    if (stage === 'otp') {
      startResendTimer()
    } else {
      // Clear timer if we're not on OTP screen
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [stage])

  const startResendTimer = () => {
    setResendTimer(30) // Reset to 30 seconds
    setCanResend(false)
    
    // Clear existing timer if any
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    // Start new timer
    timerRef.current = setInterval(() => {
      setResendTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(timerRef.current!)
          setCanResend(true)
          return 0
        }
        return prevTimer - 1
      })
    }, 1000)
  }

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  // Validation functions
  const validatePhone = (phoneNumber: string) => {
    return phoneNumber.length === 10 && /^\d{10}$/.test(phoneNumber)
  }

  const validateOtp = (otpCode: string) => {
    return otpCode.length === 6 && /^\d{6}$/.test(otpCode)
  }

  const validatePassword = () => {
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return false
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return false
    }
    
    return true
  }

  // API handlers
  const handleSendOtp = async () => {
    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number')
      return
    }
    
    try {
      setLoading(true)
      const res = await fetch(`${config.USER_API}/forgot-pass-otp/${phone}`)
      
      const data = await res.json()
      
      if (res.ok) {
        setStage('otp')
        Alert.alert('Success', 'OTP sent to your phone number')
      } else {
        Alert.alert('Error', data.error || 'Failed to send OTP')
      }
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!canResend) return
    
    try {
      setLoading(true)
      const res = await fetch(`${config.USER_API}/forgot-pass-otp/${phone}`)
      
      const data = await res.json()
      
      if (res.ok) {
        Alert.alert('Success', 'OTP has been resent to your phone')
        startResendTimer()
      } else {
        Alert.alert('Error', data.error || 'Failed to resend OTP')
      }
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!validateOtp(otp)) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP')
      return
    }
    
    try {
      setLoading(true)
      const res = await fetch(`${config.USER_API}/verify-pass-otp/${phone}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp })
      })
      
      const data = await res.json()
      
      if (res.ok && data.verified) {
        setStage('newPassword')
      } else {
        Alert.alert('Error', data.error || 'Invalid OTP')
      }
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleSetNewPassword = async () => {
    if (!validatePassword()) {
      return
    }
    
    try {
      setLoading(true)
      const res = await fetch(`${config.USER_API}/new-password/${phone}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        Alert.alert('Success', 'Password has been reset successfully', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ])
      } else {
        Alert.alert('Error', data.error || 'Failed to reset password')
      }
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  // Render different stages
  const renderPhoneStage = () => {
    return (
      <>
        <View style={styles.welcomeContainer}>
          <CustomText style={styles.welcomeText}>
            Forgot Password
          </CustomText>
          <CustomText style={styles.subtitle}>
            Enter your phone number to receive a verification code
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
                Send OTP
              </CustomText>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <CustomText style={styles.backButtonText}>
              Back to Login
            </CustomText>
          </TouchableOpacity>
        </View>
      </>
    )
  }

  const renderOtpStage = () => {
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
                {canResend ? 'OTP expired' : `OTP expires in ${formatTime(resendTimer)}`}
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
            disabled={!canResend || loading}
            style={[
              styles.resendButton, 
              (!canResend || loading) && styles.resendButtonDisabled
            ]}
          >
            <CustomText style={[
              styles.resendText,
              (!canResend || loading) && styles.resendTextDisabled
            ]}>
              Resend OTP
            </CustomText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setStage('phone')} 
            style={styles.backButton}
          >
            <CustomText style={styles.backButtonText}>
              Change Phone Number
            </CustomText>
          </TouchableOpacity>
        </View>
      </>
    )
  }

  const renderNewPasswordStage = () => {
    return (
      <>
        <View style={styles.welcomeContainer}>
          <CustomText style={styles.welcomeText}>
            Set New Password
          </CustomText>
          <CustomText style={styles.subtitle}>
            Create a new password for your account
          </CustomText>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <CustomText style={styles.inputLabel}>New Password</CustomText>
            <View style={styles.passwordContainer}>
              <CustomTextInput
                style={styles.passwordInput}
                contextMenuHidden
                secureTextEntry={!showPassword}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
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
            <CustomText style={styles.helperText}>
              Password must be at least 6 characters
            </CustomText>
          </View>
          
          <View style={styles.inputGroup}>
            <CustomText style={styles.inputLabel}>Confirm Password</CustomText>
            <View style={styles.passwordContainer}>
              <CustomTextInput
                style={styles.passwordInput}
                contextMenuHidden
                secureTextEntry={!showConfirmPassword}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={24} 
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleSetNewPassword} 
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <CustomText style={styles.buttonText}>
                Save New Password
              </CustomText>
            )}
          </TouchableOpacity>
        </View>
      </>
    )
  }

  // Render the appropriate stage
  const renderContent = () => {
    switch (stage) {
      case 'phone':
        return renderPhoneStage()
      case 'otp':
        return renderOtpStage()
      case 'newPassword':
        return renderNewPasswordStage()
      default:
        return renderPhoneStage()
    }
  }

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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default ForgotPassword

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
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
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
  backButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
  },
})