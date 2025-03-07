import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Platform, Pressable } from 'react-native'
import React, { useState, useEffect } from 'react'
import TopBar from '../components/General/TopBar'
import { Picker } from '@react-native-picker/picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from 'react-native-vector-icons/Ionicons'
import config from '../configs/API'
import { getUserData } from '../utils/storage'

// Move InputWithLabel outside the main component
const InputWithLabel = ({ label, ...props }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholderTextColor="#999"
      {...props}
    />
  </View>
)

const RegistrationForm = ({ route, navigation }: any) => {
  const [step, setStep] = useState(1)
  const [planDetails, setPlanDetails] = useState<any>(null)
  const [formData, setFormData] = useState({
    // Step 1
    fullName: '',
    dob: '',
    mobile: '',
    email: '',
    city: '',
    state: '',
    
    // Step 2
    boardMarks: '',
    boardType: 'State Board',
    jeeMarks: '',
    cetMarks: '',
    preferredField: 'Computer Science',
    cetSeatNumber: '',
    jeeSeatNumber: '',
    
    // Step 3
    preferredLocations: '',
    budget: 'under 1L',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  })

  useEffect(() => {
    const getMobile = async () => {
      const userData = await AsyncStorage.getItem('userData')
      if (userData) {
        const { phone } = JSON.parse(userData)
        setFormData(prev => ({ ...prev, mobile: phone }))
      }
    }
    setPlanDetails(route.params.planDetails);
    getMobile()
  }, [])

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      navigation.goBack()
    }
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleFinish = async () => {
    console.log('Form Data:', formData)
    const user = await getUserData()
    // Here add your API call and navigation logic
   try{
    const res = await fetch(`${config.USER_API}/${user.id}/premium`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planTitle: planDetails.plan,
        expiryDate: new Date(Date.now() + 30*24*60*60*1000),//1 month
        registrationData: formData
      }),
    })

    console.log(await res.json());
   }catch(err){
      console.log(err);
   }
    
  }

  // Create a memoized update function
  const handleInputChange = React.useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      
      <InputWithLabel
        label="Full Name"
        value={formData.fullName}
        onChangeText={(text: string) => handleInputChange('fullName', text)}
        placeholder="Enter your full name"
      />

      <InputWithLabel
        label="Date of Birth"
        value={formData.dob}
        onChangeText={(text: string) => handleInputChange('dob', text)}
        placeholder="DD/MM/YYYY"
      />

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mobile Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#f5f5f5' }]}
          value={formData.mobile}
          editable={false}
        />
      </View>

      <InputWithLabel
        label="Email"
        value={formData.email}
        onChangeText={(text: string) => handleInputChange('email', text)}
        placeholder="Enter your email"
        keyboardType="email-address"
      />

      <InputWithLabel
        label="City"
        value={formData.city}
        onChangeText={(text: string) => handleInputChange('city', text)}
        placeholder="Enter your city"
      />

      <InputWithLabel
        label="State"
        value={formData.state}
        onChangeText={(text: string) => handleInputChange('state', text)}
        placeholder="Enter your state"
      />
    </View>
  )

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Academic Information</Text>

      <InputWithLabel
        label="12th Board Marks"
        value={formData.boardMarks}
        onChangeText={(text: string) => handleInputChange('boardMarks', text)}
        placeholder="Enter your board marks"
        keyboardType="numeric"
      />

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Board Type</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.boardType}
            onValueChange={(value) => handleInputChange('boardType', value)}
          >
            <Picker.Item label="State Board" value="State Board" />
            <Picker.Item label="CBSC" value="CBSC" />
            <Picker.Item label="ICSE" value="ICSE" />
          </Picker>
        </View>
      </View>

      <InputWithLabel
        label="JEE Marks"
        value={formData.jeeMarks}
        onChangeText={(text: string) => handleInputChange('jeeMarks', text)}
        placeholder="Enter your JEE marks"
        keyboardType="numeric"
      />

      <InputWithLabel
        label="CET Marks"
        value={formData.cetMarks}
        onChangeText={(text: string) => handleInputChange('cetMarks', text)}
        placeholder="Enter your CET marks"
        keyboardType="numeric"
      />

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Preferred Field</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.preferredField}
            onValueChange={(value) => handleInputChange('preferredField', value)}
          >
            <Picker.Item label="Computer Science" value="Computer Science" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>
      </View>

      <InputWithLabel
        label="CET Seat Number"
        value={formData.cetSeatNumber}
        onChangeText={(text: string) => handleInputChange('cetSeatNumber', text)}
        placeholder="Enter your CET seat number"
      />

      <InputWithLabel
        label="JEE Seat Number"
        value={formData.jeeSeatNumber}
        onChangeText={(text: string) => handleInputChange('jeeSeatNumber', text)}
        placeholder="Enter your JEE seat number"
      />
    </View>
  )

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Preferences and Goals</Text>

      <InputWithLabel
        label="Preferred Locations"
        value={formData.preferredLocations}
        onChangeText={(text: string) => handleInputChange('preferredLocations', text)}
        placeholder="Enter locations (separated by comma)"
      />

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Budget</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.budget}
            onValueChange={(value) => handleInputChange('budget', value)}
          >
            <Picker.Item label="Under 1L" value="under 1L" />
            <Picker.Item label="1L - 2L" value="1L-2L" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>
      </View>

      <InputWithLabel
        label="Password"
        value={formData.password}
        onChangeText={(text: string) => handleInputChange('password', text)}
        placeholder="Enter your password"
        secureTextEntry
      />

      <InputWithLabel
        label="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={(text: string) => handleInputChange('confirmPassword', text)}
        placeholder="Confirm your password"
        secureTextEntry
      />

      <View style={styles.termsContainer}>
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={() => setFormData(prev => ({
            ...prev, 
            termsAccepted: !prev.termsAccepted
          }))}
        >
          {formData.termsAccepted && (
            <Icon name="checkmark" size={20} color="#613EEA" />
          )}
        </TouchableOpacity>
        <Text style={styles.termsText}>I agree to the Terms and Conditions</Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </Pressable>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressWrapper}>
          <View style={[styles.progressBar, { width: `${(step/3) * 100}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <TouchableOpacity 
        style={styles.button}
        onPress={step === 3 ? handleFinish : handleNext}
      >
        <Text style={styles.buttonText}>
          {step === 3 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    padding: 8,
  },
  progressWrapper: {
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#613EEA',
    borderRadius: 6,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    height: 56,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    height: 56,
    paddingHorizontal: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  termsText: {
    color: '#666',
    flex: 1,
  },
  button: {
    backgroundColor: '#613EEA',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#613EEA',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
})

export default RegistrationForm