import { StyleSheet, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getUserData, storeUserData } from '../../utils/storage'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Icon from 'react-native-vector-icons/MaterialIcons'
import CustomText from '../General/CustomText'
import { useNavigation } from '@react-navigation/native'

interface FormField {
  label: string;
  key: string;
  value: string;
  isEditing: boolean;
  isPremiumField: boolean;
  icon: string;
  nonEditable?: boolean;
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
    { label: 'Name', key: 'name', value: '', isEditing: false, isPremiumField: false, icon: 'account-outline', nonEditable: isPremium },
    { label: 'Phone', key: 'phone', value: '', isEditing: false, isPremiumField: false, icon: 'phone-outline', nonEditable: true },
    { label: 'Email', key: 'email', value: '', isEditing: false, isPremiumField: false, icon: 'email-outline', nonEditable: true },
    { label: 'Marks in JEE', key: 'jeeMarks', value: '', isEditing: false, isPremiumField: true, icon: 'school-outline' },
    { label: 'Percentile in JEE', key: 'jeePercentile', value: '', isEditing: false, isPremiumField: true, icon: 'school-outline' },
    { label: 'Marks in CET', key: 'cetMarks', value: '', isEditing: false, isPremiumField: true, icon: 'school-outline' },
    { label: 'Percentile in CET', key: 'cetPercentile', value: '', isEditing: false, isPremiumField: true, icon: 'school-outline' },
    { label: 'Preferred Location', key: 'prefferedlocation', value: '', isEditing: false, isPremiumField: true, icon: 'map-outline' },
  ]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  useEffect(() => {
    loadFieldData();
  }, [userData, counsellingData, isPremium]);

  const loadFieldData = () => {
    if (!userData) return;

    const newFields = [...fields];
    
    newFields.forEach((field, index) => {
      if ( field.isPremiumField && counsellingData) {
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
    if (isPremium || fields[index].nonEditable) return; // Prevent editing if premium or nonEditable
    
    const newFields = [...fields];
    newFields[index].isEditing = !newFields[index].isEditing;
    
    // If closing edit mode, save the change
    if (!newFields[index].isEditing && hasChanges) {
      saveField(newFields[index].key, newFields[index].value);
    }
    
    setFields(newFields);
  };

  const updateField = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index].value = value;
    setFields(newFields);
    setHasChanges(true);
  };

  const saveField = async (key: string, value: string) => {
    try {
      setIsSaving(true);
      await storeUserData({ 
        ...userData,
        counsellingData:{
          ...counsellingData,
          [key]: value
        }
       });
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
      const updatedData = fields.reduce((acc, field) => {
        if (!field.nonEditable && !isPremium) {
          acc[field.key] = field.value;
        }
        return acc;
      }, {} as Record<string, string>);
      
      await storeUserData(updatedData);
      
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
            
            {!field.nonEditable && !isPremium && (
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
            <TextInput
              style={[
                styles.input, 
                !field.isEditing && styles.inputDisabled,
                field.nonEditable && styles.inputDisabled,
                isPremium && field.isPremiumField && styles.inputPremium
              ]}
              value={field.value}
              onChangeText={(value) => updateField(index, value)}
              editable={field.isEditing && !field.nonEditable && !isPremium}
              placeholder={`Enter your ${field.label.toLowerCase()}...`}
              placeholderTextColor="#AAA"
            />
            
            {(field.nonEditable || isPremium) && (
              <Icon name="lock" size={16} color="#AAA" style={styles.lockIcon} />
            )}
          </View>
        </View>
      ))}
      
      {!isPremium && hasChanges && (
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
              As a premium user, your profile is managed in Registration Form.
            </CustomText>
          </View>
          
          <TouchableOpacity 
            style={styles.registrationButton} 
            onPress={handleEditInRegistrationForm}
          >
            <Icon name="edit" size={18} color="#FFFFFF" />
            <CustomText style={styles.registrationButtonText}>Edit in Registration Form</CustomText>
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
  }
});