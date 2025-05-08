import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Platform, 
  Pressable, 
  Alert, 
  ActivityIndicator,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  SafeAreaView,
  Modal
} from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Picker } from '@react-native-picker/picker'
import Icon from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import config from '../configs/API'
import { getUserData } from '../utils/storage'
import { RequestMethod, secureRequest } from '../utils/tokenedRequest'
import { FONTS } from '../styles/typography'
import { globalStyles } from '../styles/globalStyles'
import CustomText from '../components/General/CustomText'
import CustomTextInput from '../components/General/CustomTextInput'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import TopBar from '../components/General/TopBar'

const { width, height } = Dimensions.get('window');

// Customized Input Component
const InputWithLabel = ({ label, error, ...props }:any) => {
  const colors = {
    primary: '#613EEA',
    background: '#FFFFFF',
    text: '#333333',
    border: '#E0E0E0',
    error: '#FF5252',
    placeholder: '#9E9E9E'
  };

  return (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <CustomText style={styles.label}>{label}</CustomText>
        {props.required && <Text style={styles.required}>*</Text>}
      </View>
        <CustomText style={{width: '100%', fontSize: 12, color: colors.text}}>
              {props.additionalRemarks}</CustomText>
      <CustomTextInput
        style={[
          styles.input, 
          globalStyles.input,
          props.editable === false && styles.disabledInput,
          error && styles.inputError
        ]}
        placeholderTextColor={colors.placeholder}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

// Date Input Component
const DateInput = ({ label, value, onChangeText, required = false, error = null }:any) => {
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(() => {
    // Initialize with current value or current date
    if (value) {
      const parts = value.split('/');
      if (parts.length === 3) {
        // Format MM/DD/YYYY
        return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
      }
    }
    return new Date();
  });
  
  const colors = {
    primary: '#613EEA',
    background: '#FFFFFF',
    text: '#333333',
    border: '#E0E0E0',
    error: '#FF5252',
    placeholder: '#9E9E9E'
  };
  
  // Format date to MM/DD/YYYY
  const formatDate = (dateObj:Date) => {
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleChange = (event:DateTimePickerEvent, selectedDate?:Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      onChangeText(formatDate(selectedDate));
    }
  };

  return (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <CustomText style={styles.label}>{label}</CustomText>
        {required && <Text style={styles.required}>*</Text>}
      </View>
      
      <TouchableOpacity 
        style={[
          styles.dateInput, 
          error && styles.inputError
        ]}
        onPress={() => setShowPicker(true)}
      >
        <CustomText 
          style={[
            styles.dateText,
            !value && styles.placeholderText
          ]}
        >
          {value || `Select ${label.toLowerCase()}`}
        </CustomText>
        <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {showPicker && (
        Platform.OS === 'ios' ? (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showPicker}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setShowPicker(false)}
              activeOpacity={1}
            >
              <View style={styles.datePickerContainer}>
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <CustomText style={styles.cancelText}>Cancel</CustomText>
                  </TouchableOpacity>
                  <CustomText style={styles.datePickerTitle}>Select Date</CustomText>
                  <TouchableOpacity onPress={() => {
                    setShowPicker(false);
                    onChangeText(formatDate(date));
                  }}>
                    <CustomText style={styles.doneText}>Done</CustomText>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={handleChange}
                  style={styles.iOSPicker}
                  maximumDate={new Date()}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleChange}
            maximumDate={new Date()}
          />
        )
      )}
    </View>
  );
};

interface RegistrationFormProps {
  route: {
    params: {
      planDetails?: any;
      isUpdatePlanDetails?: boolean;
    };
  };
  navigation: any;
}

interface FormField {
  id: string;
  type: 'text' | 'date' | 'email' | 'number' | 'select' | 'password' | 'checkbox';
  label: string;
  key: string;
  required: boolean;
  options?: string[];
  editable?: boolean;
  additionalRemarks?: string;
}

interface FormStep {
  title: string;
  fields: FormField[];
}

interface FormData {
  steps: FormStep[];
  updatedAt: string;
}

const RegistrationForm = ({ route, navigation }: RegistrationFormProps) => {
  const [step, setStep] = useState(1);
  const [planDetails, setPlanDetails] = useState<any>(null);
  const [formStructure, setFormStructure] = useState<FormStep[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const colors = {
    primary: '#613EEA',
    secondary: '#371981',
    background: '#FFFFFF',
    surface: '#F5F6FA',
    text: '#333333',
    textSecondary: '#666666',
    border: '#E0E0E0',
    error: '#FF5252',
    success: '#4CAF50',
    accent: '#FF9800',
    placeholder: '#9E9E9E',
  };

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        const response = await secureRequest<any>(`${config.USER_API}/registrationForm`, RequestMethod.GET);
        if (response.data) {
          setFormStructure(response.data.formData.steps);
          
          if (response.data.userData) {
            setFormData(response.data.userData);
          }
        }
      } catch (err) {
        console.error('Error fetching form data:', err);
        Alert.alert('Error', 'Failed to load form. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (route.params?.isUpdatePlanDetails) {
      setPlanDetails(route.params.planDetails);
    }
    fetchFormData();
  }, []);

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const validateStep = () => {
    if (!formStructure[step - 1]) return true;
    
    const currentErrors: any = {};
    let isValid = true;
    
    formStructure[step - 1].fields.forEach(field => {
      // Skip validation for fields we're ignoring
      if (field.key === 'phone' || 
         (!route.params?.isUpdatePlanDetails && 
          (field.key === 'password' || field.key === 'confirmPassword'))) {
        return;
      }
      
      if (field.required && (!formData[field.key] || formData[field.key] === '')) {
        currentErrors[field.key] = `${field.label} is required`;
        isValid = false;
      }
      
      // Email validation
      if (field.type === 'email' && formData[field.key]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.key])) {
          currentErrors[field.key] = 'Please enter a valid email address';
          isValid = false;
        }
      }
      
      // Password matching validation
      if (field.key === 'confirmPassword' && 
          formData['password'] !== formData['confirmPassword']) {
        currentErrors[field.key] = 'Passwords do not match';
        isValid = false;
      }
    });
    
    setErrors(currentErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep() && step < 3) {
      setStep(step + 1);
      // Scroll to top when moving to next step
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
      }
    }
  };

  const handleFinish = async () => {
    if (!validateStep()) return;
    
    try {
      setSubmitting(true);
      const user = await getUserData();
      const endpoint = `${config.USER_API}/${user.id}/updateCounsellingData`;
      
      const method ='PUT';
      const body ={
        registrationData: formData
      };

      const { data, error } = await secureRequest(endpoint, method as RequestMethod, {
        body
      });

      if (error) throw new Error(error);
      
      
        navigation.navigate({
          name: 'Home',
          params: { screen: 'Counselling' },
        });
      
    } catch (err) {
      Alert.alert('Error', 'Failed to update data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setFormData((prev:any) => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev:any) => ({
        ...prev,
        [field]: null
      }));
    }
  }, [errors]);

  const scrollViewRef = React.createRef<ScrollView>();

  const renderField = (field: FormField) => {
    // Skip phone field
    if(field.key === 'phone') {
      return null;
    }
    
    // Skip password fields if not updating plan
    if (!route.params?.isUpdatePlanDetails && 
        (field.key === 'password' || field.key === 'confirmPassword' || field.key === 'phone')) {
      return null;
    }

    

    switch (field.type) {
      case 'date':
        return (
          <>
          <DateInput
            label={field.label}
            value={formData[field.key]}
            onChangeText={(text: string) => handleInputChange(field.key, text)}
            required={field.required}
            error={errors[field.key]}
            />
            <CustomText style={styles.termsText}>
              {field.additionalRemarks}</CustomText>
          </>
        );
    
      case 'select':
        return (
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <CustomText style={styles.label}>{field.label}</CustomText>
              {field.required && <Text style={styles.required}>*</Text>}
            </View>
            <View style={[
              styles.pickerContainer, 
              globalStyles.pickerContainer,
              errors[field.key] && styles.pickerError
            ]}>
              <Picker
                selectedValue={formData[field.key]}
                onValueChange={(value) => handleInputChange(field.key, value)}
                style={styles.picker}
                dropdownIconColor={colors.text}
                mode="dropdown"
              >
                <Picker.Item label="Select an option" value="" color={colors.placeholder} />
                {field.options?.map((option) => (
                  <Picker.Item 
                    key={option} 
                    label={option} 
                    value={option} 
                  />
                ))}
              </Picker>
            </View>
            <CustomText style={styles.termsText}>
            {field.additionalRemarks}</CustomText>
            {errors[field.key] && <Text style={styles.errorText}>{errors[field.key]}</Text>}
          </View>
        );

      case 'checkbox':
        return (
          <View style={styles.termsContainer}>
            <TouchableOpacity 
              style={[
                styles.checkbox,
                formData[field.key] && styles.checkboxSelected
              ]}
              onPress={() => handleInputChange(field.key, !formData[field.key])}
            >
              {formData[field.key] && (
                <Icon name="checkmark" size={16} color="#fff" />
              )}
            </TouchableOpacity>
            <CustomText style={styles.termsText}>{field.label}</CustomText>
            <CustomText style={styles.termsText}>
              {field.additionalRemarks}</CustomText>
          </View>
        );

      default:
        return (
          <>
          <InputWithLabel
            label={field.label}
            value={formData[field.key]?.toString()}
            onChangeText={(text: string) => handleInputChange(field.key, text)}
            placeholder={`Enter your ${field.label.toLowerCase()}`}
            keyboardType={field.type === 'number' ? 'numeric' : 'default'}
            secureTextEntry={field.type === 'password'}
            editable={field.editable !== false}
            required={field.required}
            error={errors[field.key]}
            additionalRemarks={field.additionalRemarks}
          />
          
          </>
        );
    }
  };

  const renderStepContent = () => {
    if (!formStructure[step - 1]) return null;
    
    return (
      <View style={styles.stepContainer}>
        <CustomText style={styles.stepTitle}>{formStructure[step - 1].title}</CustomText>
        <CustomText style={styles.stepDescription}>
          Step {step} of 3: {formStructure[step - 1].title.toLowerCase()}
        </CustomText>
        {formStructure[step - 1].fields.map((field) => renderField(field))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
        <ActivityIndicator size="large" color={colors.primary} />
        <CustomText style={styles.loadingText}>Loading form...</CustomText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      
      {/* <View style={styles.header}>
        <Pressable 
          onPress={handleBack} 
          style={styles.backButton}
          disabled={submitting}
        >
          <Icon name="arrow-back" size={24} color={submitting ? colors.placeholder : colors.text} />
        </Pressable>
        <CustomText style={styles.headerTitle}>
          {route.params?.isUpdatePlanDetails ? 'Plan Registration' : 'Update Profile'}
        </CustomText>
      </View> */}
      <TopBar
      heading={route.params?.isUpdatePlanDetails ? 'Plan Registration' : 'Update Profile'}
      />

      <View style={styles.progressContainer}>
        <View style={styles.stepIndicators}>
          {[1, 2, 3].map(stepNumber => (
            <View key={stepNumber} style={styles.stepIndicatorWrapper}>
              <View style={[
                styles.stepIndicator,
                stepNumber <= step ? styles.activeStepIndicator : {}
              ]}>
                {stepNumber < step ? (
                  <Icon name="checkmark" size={16} color="#fff" />
                ) : (
                  <Text style={[
                    styles.stepNumber,
                    stepNumber === step ? styles.activeStepNumber : {}
                  ]}>
                    {stepNumber}
                  </Text>
                )}
              </View>
              {stepNumber < 3 && (
                <View style={[
                  styles.stepConnector,
                  stepNumber < step ? styles.activeStepConnector : {}
                ]} />
              )}
            </View>
          ))}
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>

        <View style={styles.buttonContainer}>
          {step > 1 && (
            <TouchableOpacity 
              style={styles.backBtn}
              onPress={handleBack}
              disabled={submitting}
            >
              <Icon name="arrow-back" size={20} color={colors.primary} />
              <CustomText style={styles.backBtnText}>Back</CustomText>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.button, 
              submitting && styles.buttonDisabled,
              step < 3 ? styles.nextButton : styles.finishButton
            ]}
            onPress={step === 3 ? handleFinish : handleNext}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {step === 3 ? (route.params?.isUpdatePlanDetails ? 'Get Started' : 'Update Details') : 'Next'}
                </Text>
                {step < 3 && <Icon name="arrow-forward" size={20} color="#fff" />}
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.MEDIUM,
    marginLeft: 16,
    color: '#333',
  },
  backButton: {
    padding: 8,
  },
  progressContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  stepIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicatorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  activeStepIndicator: {
    backgroundColor: '#613EEA',
  },
  stepNumber: {
    color: '#666',
    fontSize: 14,
    fontFamily: FONTS.MEDIUM,
  },
  activeStepNumber: {
    color: '#fff',
  },
  stepConnector: {
    height: 2,
    width: width * 0.1,
    backgroundColor: '#f0f0f0',
  },
  activeStepConnector: {
    backgroundColor: '#613EEA',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 24,
    paddingBottom: 100,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: FONTS.BOLD,
    color: '#333',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    fontFamily: FONTS.REGULAR,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontFamily: FONTS.MEDIUM,
  },
  required: {
    color: '#FF5252',
    marginLeft: 4,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    height: 56,
    backgroundColor: '#fff',
    color: '#333',
    fontFamily: FONTS.REGULAR,
  },
  disabledInput: {
    backgroundColor: '#f9f9f9',
    color: '#999',
  },
  inputError: {
    borderColor: '#FF5252',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#fff',
    height: 56,
    justifyContent: 'center',
  },
  pickerError: {
    borderColor: '#FF5252',
  },
  picker: {
    fontFamily: FONTS.REGULAR,
    color: '#333'
  },
  errorText: {
    color: '#FF5252',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: FONTS.REGULAR,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 24,
  },
  termsText: {
    color: '#000',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FONTS.REGULAR,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#613EEA',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  checkboxSelected: {
    backgroundColor: '#613EEA',
    borderColor: '#613EEA',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backBtnText: {
    color: '#613EEA',
    marginLeft: 4,
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#613EEA',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    flex: 1,
    marginLeft: 24,
  },
  finishButton: {
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.BOLD,
    marginRight: 8,
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    color: '#613EEA',
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    height: 56,
    backgroundColor: '#fff',
  },
  
  dateText: {
    fontSize: 16,
    color: '#333',
    fontFamily: FONTS.REGULAR,
  },
  
  placeholderText: {
    color: '#9E9E9E',
  },
  
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  datePickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24, // Extra padding for iOS notch
  },
  
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  
  datePickerTitle: {
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: '#333',
  },
  
  cancelText: {
    fontSize: 16,
    color: '#666',
    fontFamily: FONTS.REGULAR,
  },
  
  doneText: {
    fontSize: 16,
    color: '#613EEA',
    fontFamily: FONTS.MEDIUM,
  },
  
  iOSPicker: {
    height: 216,
    backgroundColor: '#fff',
  },
});

export default RegistrationForm;