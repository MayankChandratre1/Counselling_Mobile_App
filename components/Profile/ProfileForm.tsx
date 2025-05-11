import { StyleSheet, View, TextInput, TouchableOpacity, ActivityIndicator, Modal, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getUserData, storeUserData } from '../../utils/storage'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Icon from 'react-native-vector-icons/MaterialIcons'
import CustomText from '../General/CustomText'
import { useNavigation } from '@react-navigation/native'
import { secureRequest, RequestMethod } from '../../utils/tokenedRequest'
import config from '../../configs/API'
import { categories } from '../../data/categories'
import { Picker } from '@react-native-picker/picker'

interface FormField {
  label: string;
  key: string;
  value: string;
  isEditing: boolean;
  isPremiumField: boolean;
  icon: string;
  nonEditable?: boolean;
  type?: string; // Added type property for select fields
  options?: Array<string>; // Added options property for select fields
  min?: number; // Added min property for number fields
  max?: number; // Added max property for number fields
}

interface ProfileFormProps {
  userData: any;
  isPremium: boolean;
  counsellingData: any;
  onUpdate: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ userData, isPremium, counsellingData, onUpdate }) => {
  const navigation = useNavigation<any>();
  const [fields, setFields] = useState<FormField[]>([
    { label: 'Name', key: 'name', value: '', isEditing: false, isPremiumField: false, icon: 'account-outline' },
    { label: 'Phone', key: 'phone', value: '', isEditing: false, isPremiumField: false, icon: 'phone-outline', nonEditable: true },
    { label: 'Email', key: 'email', value: '', isEditing: false, isPremiumField: false, icon: 'email-outline', nonEditable: true },
    { label: 'Marks in JEE', key: 'jeeMarks', value: '', isEditing: false, isPremiumField: true, icon: 'school-outline', type:'number', min: 0, max: 300 },
    { label: 'Percentile in JEE', key: 'jeePercentile', value: '', isEditing: false, isPremiumField: true, icon: 'school-outline', type:'number', min: 0, max: 100 },
    { label: 'Marks in CET', key: 'cetMarks', value: '', isEditing: false, isPremiumField: true, icon: 'school-outline', type:'number', min: 0, max: 150 },
    { label: 'Percentile in CET', key: 'cetPercentile', value: '', isEditing: false, isPremiumField: true, icon: 'school-outline', type:'number', min: 0, max: 100 },
    { label: 'Preferred Location', key: 'preferredLocations', value: '', isEditing: false, isPremiumField: true, icon: 'map-outline' },
    { label: 'Category', key: 'category', value: '', isEditing: false, isPremiumField: true, icon: 'account-check-outline', type:'select', options: categories},
    { label: 'Physical Disability', key: 'isPwd', value: '', isEditing: false, isPremiumField: true, icon: 'human-wheelchair', type:'select', options: ["YES", "NO"]},
    { label: 'Defense Parent/Guardian', key: 'isDefense', value: '', isEditing: false, isPremiumField: true, icon: 'shield-account', type:'select', options: ["YES", "NO"]},
  ]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [showPicker, setShowPicker] = useState<number | null>(null);

  useEffect(() => {
    loadFieldData();
  }, [userData, counsellingData, isPremium]);

  const loadFieldData = () => {
    if (!userData) return;

    const newFields = [...fields];
    
    newFields.forEach((field, index) => {
      if (field.isPremiumField && counsellingData) {
        // For premium users, get data from counsellingData for premium fields
        newFields[index].value = counsellingData[field.key] || '';
      } else {
        // For regular fields or non-premium users
        newFields[index].value = userData[field.key] || '';
      }
    });
    
    setFields(newFields);
  };

  const toggleEdit = (index: number) => {
    if (fields[index].nonEditable) return; // Only prevent editing for nonEditable fields
    
    const newFields = [...fields];
    newFields[index].isEditing = !newFields[index].isEditing;
    
    // If closing edit mode, save the change
    if (!newFields[index].isEditing && hasChanges) {
      saveField(newFields[index].key, newFields[index].value);
    }
    
    setFields(newFields);
  };

  const updateField = (index: number, value: string) => {
    // Validate number inputs
    if (fields[index].type === 'number') {
      const numValue = Number(value);
      
      // Only allow numeric input
      if (value !== '' && isNaN(numValue)) {
        return;
      }
      
      // Check min/max bounds
      if (value !== '' && fields[index].min !== undefined && numValue < fields[index].min) {
        return;
      }
      
      if (value !== '' && fields[index].max !== undefined && numValue > fields[index].max) {
        return;
      }
    }
    
    const newFields = [...fields];
    newFields[index].value = value;
    setFields(newFields);
    setHasChanges(true);
  };

  const saveField = async (key: string, value: string) => {
    try {
      setIsSaving(true);
      
      // For free users, just update local storage
      if (!isPremium) {
         const updatedCounsellingData = {
          ...counsellingData,
          [key]: value
        };
        await storeUserData({ 
          ...userData,
          counsellingData: updatedCounsellingData
        });
        console.log('Updated Counselling Data:', { 
          ...userData,
          counsellingData: updatedCounsellingData
        });
        
      } 
      // For premium users, update local storage AND send to backend
      else {
        // First update local storage
        const updatedCounsellingData = {
          ...counsellingData,
          [key]: value
        };
        
        await storeUserData({ 
          ...userData,
          counsellingData: updatedCounsellingData
        });
        
        // Then send to backend
        const user = await getUserData();
        if (user?.id) {
          await secureRequest(
            `${config.USER_API}/${user.id}/updateCounsellingData`,
            RequestMethod.PUT,
            {
              body: {
                registrationData: {
                  ...counsellingData,
                  [key]: value
                }
              }
            }
          );
        }
      }
      
      setHasChanges(false);
      onUpdate(); // Refresh parent data
    } catch (error) {
      console.error('Error saving field:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      
      // Collect all editable fields into an object
      const updatedData: Record<string, string> = {};
      const updatedPremiumData: Record<string, string> = {};
      
      fields.forEach(field => {
        if (!field.nonEditable) {
          if (field.isPremiumField) {
            updatedPremiumData[field.key] = field.value;
          } else {
            updatedData[field.key] = field.value;
          }
        }
      });
      
      if (!isPremium) {
        // For free users, just update local storage
         console.log('Updated Counselling Data:', updatedPremiumData);
        await storeUserData({
          ...userData,
          ...updatedData,
          counsellingData: {
            ...counsellingData,
            ...updatedPremiumData
          }
        });
       
      } else {
        // For premium users, update local storage and send to backend
        const updatedCounsellingData = {
          ...counsellingData,
          ...updatedPremiumData
        };

        
        
        await storeUserData({
          ...userData,
          ...updatedData,
          counsellingData: updatedCounsellingData
        });
        
        // Send to backend
        const user = await getUserData();
        if (user?.id) {
          await secureRequest(
            `${config.USER_API}/${user.id}/updateCounsellingData`,
            RequestMethod.PUT,
            {
              body: {
                registrationData: {
                  ...counsellingData,
                  ...updatedPremiumData
                }
              }
            }
          );
        }
      }
      
      // Reset all editing states
      setFields(fields.map(field => ({
        ...field,
        isEditing: false
      })));
      
      setHasChanges(false);
      onUpdate(); // Refresh parent data
    } catch (error) {
      console.error('Error saving all fields:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleEditInRegistrationForm = () => {
    navigation.navigate('RegistrationForm');
  };

  // Render proper input based on field type
  const renderFieldInput = (field: FormField, index: number) => {
    if (field.type === 'select' && field.options) {
      // If on iOS, use modal picker approach
      if (Platform.OS === 'ios') {
        return (
          <>
            
            <TouchableOpacity 
              style={[
                styles.input,
                // @ts-ignore
                !field.isEditing && styles.inputDisabled,
                // @ts-ignore
                field.nonEditable && styles.inputDisabled,
                // @ts-ignore
                isPremium && field.isPremiumField && styles.inputPremium
              ]}
              onPress={() => field.isEditing && setShowPicker(index)}
              disabled={!field.isEditing || field.nonEditable}
            >
              <CustomText style={[
                styles.inputText,
                !field.value && styles.inputPlaceholder,
                !field.isEditing && styles.inputDisabled,
                field.nonEditable && styles.inputDisabled,
                isPremium && field.isPremiumField && styles.inputPremium
              ]}>
                {field.value || `Select ${field.label.toLowerCase()}...`}
              </CustomText>
            </TouchableOpacity>

            {/* Modal picker for iOS */}
            {showPicker === index && (
              <Modal
                visible={true}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.pickerModalOverlay}>
                  <View style={styles.pickerModalContainer}>
                    <View style={styles.pickerModalHeader}>
                      <TouchableOpacity onPress={() => setShowPicker(null)}>
                        <CustomText style={styles.pickerModalCancel}>Cancel</CustomText>
                      </TouchableOpacity>
                      <CustomText style={styles.pickerModalTitle}>{field.label}</CustomText>
                      <TouchableOpacity onPress={() => setShowPicker(null)}>
                        <CustomText style={styles.pickerModalDone}>Done</CustomText>
                      </TouchableOpacity>
                    </View>
                    <Picker
                      selectedValue={field.value}
                      onValueChange={(value) => updateField(index, value)}
                      style={styles.picker}
                    >
                      <Picker.Item label={`Select ${field.label.toLowerCase()}...`} value="" />
                      {field.options.map((option) => (
                        <Picker.Item key={option} label={option} value={option} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </Modal>
            )}
          </>
        );
      } else {
        // For Android, use inline picker
        return (
          // @ts-ignore
          <View style={[
            styles.pickerContainer,
            !field.isEditing && styles.inputDisabled,
            field.nonEditable && styles.inputDisabled,
            isPremium && field.isPremiumField && styles.inputPremium
          ]}>
            <Picker
              selectedValue={field.value}
              onValueChange={(value) => field.isEditing && updateField(index, value)}
              enabled={field.isEditing && !field.nonEditable}
              style={[
                styles.picker,
                !field.isEditing && styles.inputDisabled,
                field.nonEditable && styles.inputDisabled,
                isPremium && field.isPremiumField && styles.inputPremium
              ]}
              dropdownIconColor={field.isEditing ? "#371981" : "#AAA"}
            >
              <Picker.Item label={`Select ${field.label.toLowerCase()}...`} value="" />
              {field.options.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
        );
      }
    } else if (field.type === 'number') {
      return (
        <TextInput
          style={[
            styles.input,
            !field.isEditing && styles.inputDisabled,
            field.nonEditable && styles.inputDisabled,
            isPremium && field.isPremiumField && styles.inputPremium
          ]}
          value={field.value}
          onChangeText={(value) => updateField(index, value)}
          editable={field.isEditing && !field.nonEditable}
          placeholder={`Enter ${field.label.toLowerCase()}...`}
          placeholderTextColor="#AAA"
          keyboardType="numeric"
        />
      );
    } else {
      // Default to regular text input
      return (
        <TextInput
          style={[
            styles.input,
            !field.isEditing && styles.inputDisabled,
            field.nonEditable && styles.inputDisabled,
            isPremium && field.isPremiumField && styles.inputPremium
          ]}
          value={field.value}
          onChangeText={(value) => updateField(index, value)}
          editable={field.isEditing && !field.nonEditable}
          placeholder={`Enter your ${field.label.toLowerCase()}...`}
          placeholderTextColor="#AAA"
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {fields.map((field, index) => (
        <View key={field.key} style={styles.fieldContainer}>
          <View style={styles.fieldHeader}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons 
                name={field.icon} 
                size={18} 
                color="#371981" 
                style={styles.fieldIcon} 
              />
              <CustomText style={styles.label}>{field.label}</CustomText>
            </View>
            
            {!field.nonEditable && (
              <TouchableOpacity 
                onPress={() => toggleEdit(index)}
                disabled={isSaving}
                style={styles.editButton}
              >
                {
                  !field.isEditing 
                  ? <MaterialCommunityIcons name="pencil-outline" size={18} color="#371981" />
                  : <Icon name="check" size={18} color="#4CAF50" />
                }
              </TouchableOpacity>
            )}
          </View>
          
          <View style={[
            styles.inputContainer, 
            field.isEditing && styles.inputContainerActive,
            isPremium && field.isPremiumField && styles.inputContainerPremium,
            field.nonEditable && styles.inputContainerLocked
          ]}>
            {renderFieldInput(field, index)}
            
            {field.nonEditable && (
              <Icon name="lock" size={16} color="#AAA" style={styles.lockIcon} />
            )}
          </View>
        </View>
      ))}
      
      {hasChanges && (
        <TouchableOpacity 
          style={styles.saveAllButton} 
          onPress={handleSaveAll}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="save" size={18} color="#FFFFFF" />
              <CustomText style={styles.saveAllText}>Save All Changes</CustomText>
            </>
          )}
        </TouchableOpacity>
      )}
      
      {isPremium && (
        <View style={styles.premiumNoteContainer}>
          <View style={styles.premiumNote}>
            <Icon name="info-outline" size={16} color="#371981" />
            <CustomText style={styles.premiumNoteText}>
              As a premium user, you can edit your profile directly here or in the Registration Form.
            </CustomText>
          </View>
          
          <TouchableOpacity 
            style={styles.registrationButton} 
            onPress={handleEditInRegistrationForm}
          >
            <Icon name="edit" size={18} color="#FFFFFF" />
            <CustomText style={styles.registrationButtonText}>Advanced Editing in Registration Form</CustomText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ProfileForm;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  fieldContainer: {
    marginBottom: 18,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#FCFCFC',
    position: 'relative',
  },
  inputContainerActive: {
    borderColor: '#371981',
    backgroundColor: '#FFF',
    shadowColor: '#371981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainerPremium: {
    backgroundColor: '#F7F5FF',
    borderColor: '#E6E1FF',
  },
  inputContainerLocked: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  inputPlaceholder: {
    color: '#AAA',
  },
  inputDisabled: {
    color: '#666',
  },
  inputPremium: {
    color: '#371981',
    fontWeight: '500',
  },
  editButton: {
    padding: 5,
  },
  lockIcon: {
    position: 'absolute',
    right: 16,
  },
  saveAllButton: {
    backgroundColor: '#371981',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveAllText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 10,
  },
  premiumNoteContainer: {
    marginTop: 20,
  },
  premiumNote: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#F7F5FF',
    borderRadius: 8,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  premiumNoteText: {
    fontSize: 13,
    color: '#371981',
    marginLeft: 8,
    flex: 1,
  },
  registrationButton: {
    backgroundColor: '#371981',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registrationButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 10,
  },
  // Picker styles
  pickerContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    flex: 1,
    height: 50,
    color: '#000',
  },
  // Modal picker styles for iOS
  pickerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  pickerModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pickerModalCancel: {
    fontSize: 16,
    color: '#999',
  },
  pickerModalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#371981',
  },
});