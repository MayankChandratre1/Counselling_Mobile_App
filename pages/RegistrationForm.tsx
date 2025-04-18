import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Platform, Pressable, Alert, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import TopBar from '../components/General/TopBar'
import { Picker } from '@react-native-picker/picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from 'react-native-vector-icons/Ionicons'
import config from '../configs/API'
import { getUserData } from '../utils/storage'
import { RequestMethod, secureRequest } from '../utils/tokenedRequest'
import { FONTS } from '../styles/typography'
import { globalStyles } from '../styles/globalStyles'
import CustomText from '../components/General/CustomText'
import CustomTextInput from '../components/General/CustomTextInput'

// Move InputWithLabel outside the main component
const InputWithLabel = ({ label, ...props }: any) => (
  <View style={styles.inputGroup}>
    <CustomText style={styles.label}>{label}</CustomText>
    <CustomTextInput
      style={[styles.input, globalStyles.input]}
      placeholderTextColor="#999"
      {...props}
    />
  </View>
)

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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        const response = await secureRequest<any>(`${config.USER_API}/registrationForm`, RequestMethod.GET);
        if (response.data) {
          setFormStructure(response.data.formData.steps);
          // Pre-fill form if userData exists
          console.log('Form Data:', response.data);
          console.log('Form Structure:', response.data.formData.steps);
          
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
      setStep(step - 1)
    } else {
      navigation.goBack()
    }
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleFinish = async () => {
    try {
      setSubmitting(true);
      const user = await getUserData();
      const endpoint = route.params?.isUpdatePlanDetails ? 
        `${config.USER_API}/${user.id}/premium` :
        `${config.USER_API}/${user.id}/updateCounsellingData`;
      
      const method = route.params?.isUpdatePlanDetails ? 'PATCH' : 'PUT';
      const body = route.params?.isUpdatePlanDetails ? {
        planTitle: planDetails.plan,
        expiryDate: new Date(Date.now() + 30*24*60*60*1000),
        registrationData: formData
      } : {
        registrationData: formData
      };

      const { data, error } = await secureRequest(endpoint, method as RequestMethod, {
        body
      });

      if (error) throw new Error(error);

      navigation.navigate(route.params?.isUpdatePlanDetails ? 'Home' : 'Counselling');
    } catch (err) {
      Alert.alert('Error', 'Failed to update data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = React.useCallback((field: string, value: string | boolean) => {
    setFormData((prev:any) => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const renderField = (field: FormField) => {
    // Skip password fields if not updating plan
    if (!route.params?.isUpdatePlanDetails && 
        (field.key === 'password' || field.key === 'confirmPassword')) {
      return null;
    }

    switch (field.type) {
      case 'select':
        return (
          <View style={styles.inputGroup}>
            <CustomText style={styles.label}>{field.label}</CustomText>
            <View style={[styles.pickerContainer, globalStyles.pickerContainer]}>
              <Picker
                selectedValue={formData[field.key]}
                onValueChange={(value) => handleInputChange(field.key, value)}
                style={{ color: '#333333', fontFamily: FONTS.REGULAR }}
                dropdownIconColor="#333333"
              >
                {field.options?.map((option) => (
                  <Picker.Item 
                    key={option} 
                    label={option} 
                    value={option} 
                    color="#333333" 
                    style={{ fontFamily: FONTS.REGULAR }}
                  />
                ))}
              </Picker>
            </View>
          </View>
        );

      case 'checkbox':
        return (
          <View style={styles.termsContainer}>
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => handleInputChange(field.key, !formData[field.key])}
            >
              {formData[field.key] && (
                <Icon name="checkmark" size={20} color="#613EEA" />
              )}
            </TouchableOpacity>
            <CustomText style={styles.termsText}>{field.label}</CustomText>
          </View>
        );

      default:
        return (
          <InputWithLabel
            label={field.label}
            value={formData[field.key]?.toString()}
            onChangeText={(text: string) => handleInputChange(field.key, text)}
            placeholder={`Enter your ${field.label.toLowerCase()}`}
            keyboardType={field.type === 'number' ? 'numeric' : 'default'}
            secureTextEntry={field.type === 'password'}
            editable={field.editable !== false}
            style={[
              styles.input,
              field.editable === false && { backgroundColor: '#f5f5f5' }
            ]}
            color="#333333"
          />
        );
    }
  };

  const renderStepContent = () => {
    if (!formStructure[step - 1]) return null;
    
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>{formStructure[step - 1].title}</Text>
        {formStructure[step - 1].fields.map((field) => renderField(field))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#613EEA" />
        <CustomText style={styles.loadingText}>Loading form...</CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable 
          onPress={handleBack} 
          style={styles.backButton}
          disabled={submitting}
        >
          <Icon name="arrow-back" size={24} color={submitting ? "#999" : "#000"} />
        </Pressable>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressWrapper}>
          <View style={[styles.progressBar, { width: `${(step/3) * 100}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {renderStepContent()}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={step === 3 ? handleFinish : handleNext}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {step === 3 ? (route.params?.isUpdatePlanDetails ? 'Get Started' : 'Update Details') : 'Next'}
          </Text>
        )}
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
  scrollViewContent: {
    paddingBottom: 100, 
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
    fontFamily: FONTS.MEDIUM,
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
    color: '#333333',
    fontFamily: FONTS.REGULAR,
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
    fontFamily: FONTS.REGULAR,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#613EEA',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9E9E9E',
  },
})

export default RegistrationForm