import { StyleSheet, View, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import CustomText from '../General/CustomText'
import { Picker } from '@react-native-picker/picker';
import CustomTextInput from '../General/CustomTextInput';

interface CounsellingStepProps {
  title: string;
  leftCTA?: {
    label: string;
    onPress: () => void;
  };
  onEdit: () => void;
  stepNumber: number;
  onSave: (stepNumber: number, data: { status: 'Yes' | 'No', remark: string }) => void;
  isEditing?: boolean;
  stepData?: {
    status: 'Yes' | 'No' | undefined;
    remark: string;
  };
  isCompleted?: boolean;
  isLocked?: boolean;
  description?: string;
}

interface RadioOption {
  label: string;
  value: 'Yes' | 'No';
}

const CounsellingStep = ({ 
  title, 
  leftCTA, 
  stepNumber,
  onEdit,
  onSave,
  isEditing,
  stepData = { status: undefined, remark: '' },
  isCompleted = false,
  isLocked = false,
  description,
}: CounsellingStepProps) => {
  const [inputData, setInputData] = React.useState({
    status: stepData.status || 'No',
    remark: stepData.remark || ''
  });

  const statusOptions: RadioOption[] = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' }
  ];

  const getStepStyle = () => {
    if (isLocked) return [styles.container, styles.containerLocked];
    if (stepData?.status === 'No') return [styles.container, styles.containerRejected];
    if (stepData?.status === 'Yes') return [styles.container, styles.containerCompleted];
    return [styles.container];
  };

  return (
    <View style={styles.stepWrapper}>
      <View style={styles.stepNumberContainer}>
        <View style={[
          styles.stepNumber,
          stepData?.status === 'Yes' && styles.stepNumberCompleted,
          stepData?.status === 'No' && styles.stepNumberRejected,
          isLocked && styles.stepNumberLocked,
        ]}>
          {isLocked ? (
            <Icon name="lock" size={20} color="#fff" />
          ) : (
            <CustomText style={styles.stepNumberText}>{stepNumber}</CustomText>
          )}
        </View>
      </View>

      <View style={styles.contentWrapper}>
        <View style={getStepStyle()}>
          <View style={styles.header}>
            <CustomText style={styles.title}>{title}</CustomText>
            {isLocked && (
              <CustomText style={styles.comingSoon}>Coming Soon</CustomText>
            )}
          </View>

          {description && (
            <CustomText style={styles.description}>{description}</CustomText>
          )}
          
          {!isLocked && (
            <>
              <View style={styles.statusContainer}>
                <CustomText style={styles.statusLabel}>STATUS:</CustomText>
                <CustomText style={[
                  styles.statusValue,
                  stepData?.status === 'No' && styles.statusValueRejected,
                  stepData?.status === 'Yes' && styles.statusValueCompleted,
                  !stepData?.status && styles.statusValuePending
                ]}>
                  {stepData?.status || ' Edit your status'}
                </CustomText>
              </View>
              {stepData?.remark && (
                <CustomText style={[
                  styles.remarkText,
                  stepData?.status === 'No' && styles.remarkTextRejected
                ]}>
                  {stepData.remark}
                </CustomText>
              )}

              {isEditing && (
                <View style={styles.inputContainer}>
                  <View style={styles.radioContainer}>
                    <CustomText style={styles.inputLabel}>Status</CustomText>
                    <View style={styles.radioGroup}>
                      {statusOptions.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={styles.radioOption}
                          onPress={() => setInputData(prev => ({...prev, status: option.value}))}
                        >
                          <View style={styles.radio}>
                            {inputData.status === option.value && (
                              <View style={styles.radioSelected} />
                            )}
                          </View>
                          <CustomText style={styles.radioLabel}>{option.label}</CustomText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.textInputContainer}>
                    <CustomText style={styles.inputLabel}>Remarks</CustomText>
                    <CustomTextInput
                      style={styles.input}
                      value={inputData.remark}
                      onChangeText={(text) => setInputData(prev => ({...prev, remark: text}))}
                      placeholder="Add your remarks here..."
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              )}

              <View style={styles.footer}>
                {leftCTA && !isEditing && (
                  <TouchableOpacity 
                    style={{ flexDirection: 'row', alignItems: 'center' }} 
                    onPress={leftCTA.onPress}
                  >
                    <Icon name="clipboard-text-multiple-outline" size={16} style={{marginRight: 10}} color="#613EEA" />
                    <CustomText style={styles.leftCTA}>{leftCTA.label}</CustomText>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={[styles.editButton, { marginLeft: 'auto' }]}
                  onPress={isEditing ? 
                    () => onSave(stepNumber, inputData) : 
                    onEdit}
                >
                  <Icon 
                    name={isEditing ? "check-circle-outline" : "application-edit-outline"} 
                    size={24} 
                    color="#613EEA" 
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#613EEA',
    borderRadius: 12,
    padding: 20, // Increased from 15
    marginBottom: 20, // Increased from 15
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  containerCompleted: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    // backgroundColor: '#F9FBE7',
  },
  containerRejected: {
    borderColor: '#F44336',
    borderWidth: 2,
    // backgroundColor: '#FFF5F5',
  },
  containerLocked: {
    borderColor: '#9E9E9E',
    backgroundColor: '#F5F5F5',
    opacity: 0.8,
  },
  title: {
    fontSize: 22, // Increased from 18
    fontWeight: 'bold',
    color: '#000',
    // marginBottom: 12, // Added margin
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  
    borderRadius: 8,
  },
  statusLabel: {
    color: '#613EEA',
    fontWeight: '500',
  },
  statusValue: {
    color: '#333',
    fontWeight: '500',
  },
  statusValueCompleted: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statusValueRejected: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  statusValuePending: {
    color: '#666',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  leftCTA: {
    color: '#613EEA',
    fontWeight: '500',
  },
  editButton: {
    padding: 5,
  },
  inputContainer: {
    marginTop: 16,
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 12,
  },
  radioContainer: {
    marginBottom: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#613EEA',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#613EEA',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  textInputContainer: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  picker: {
    height: 48,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#fff',
    color: '#333',
    textAlignVertical: 'top',
    marginTop: 8,
  },
  stepNumber: {
    paddingInline: 10,
    backgroundColor: '#613EEA',
    borderRadius: 25,
    width: 56, // Increased size
    height: 56, // Increased size
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepNumberRejected: {
    backgroundColor: '#F44336',
  },
  stepNumberLocked: {
    backgroundColor: '#9E9E9E',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 28, // Increased from 24
    fontWeight: 'bold'
  },
  remarkText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  remarkTextRejected: {
    color: '#F44336',
  },
  stepWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 20, // Increased spacing between steps
  },
  stepNumberContainer: {
    width: "10%",
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    paddingLeft: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  comingSoon: {
    fontSize: 12,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  description: {
    fontSize: 15, // Increased from 14
    color: '#666',
    marginBottom: 15, // Increased from 12
    lineHeight: 22, // Increased from 20
  },
})

export default CounsellingStep



