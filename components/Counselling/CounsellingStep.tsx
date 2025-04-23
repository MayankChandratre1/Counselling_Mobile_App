import { StyleSheet, View, TouchableOpacity } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import CustomText from '../General/CustomText'
import { Picker } from '@react-native-picker/picker';
import CustomTextInput from '../General/CustomTextInput';

interface CounsellingStepProps {
  leftCTA?: {
    label: string;
    onPress: () => void;
  };
  onEdit: () => void;
  onSave: (stepNumber: number, data: any) => void;
  isEditing?: boolean;
  stepData?: {
    status: 'Yes' | 'No' | undefined;
    remark: string;
    collegeName?: string;
    branchCode?: string;
    verdict?: string;
    accept?: boolean;  // Flag to track if verdict is accepted
  };
  isCompleted?: boolean;
  step: {
    number: number;
    title: string;
    description?: string;
    isLocked?: boolean;
    isCapQuery?: boolean;
    isVerdict?: boolean;
    showListButton?: boolean;
  };
}

interface RadioOption {
  label: string;
  value: 'Yes' | 'No';
}

const CounsellingStep = ({ 
  leftCTA, 
  onEdit,
  onSave,
  isEditing,
  stepData = { status: undefined, remark: '' },
  isCompleted = false,
  step
}: CounsellingStepProps) => {
  const [inputData, setInputData] = React.useState({
    status: stepData.status || 'No',
    remark: stepData.remark || '',
    collegeName: stepData.collegeName || '',
    branchCode: stepData.branchCode || '',
    verdict: stepData.verdict || '' // Preserve verdict in state
  });

  const statusOptions: RadioOption[] = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' }
  ];

  const getStepStyle = () => {
    if (step.isLocked) return [styles.container, styles.containerLocked];
    if (stepData?.status === 'No') return [styles.container, styles.containerRejected];
    if (stepData?.status === 'Yes') return [styles.container, styles.containerCompleted];
    return [styles.container];
  };

  const isVerdictAccepted = step.isVerdict && stepData?.accept === true;

  const handleVerdictAccept = () => {
    if (leftCTA && step.isVerdict && stepData?.verdict) {
      leftCTA.onPress();
    }
  };

  const handleVerdictReject = () => {
    // Create data object with accept set to false
    const rejectedData = {
      ...stepData,
      accept: false
    };
    onSave(step.number, rejectedData);
  };

  const handleSaveData = () => {
    // Create data object preserving the verdict if present
    const dataToSave = {
      ...inputData,
      // Ensure verdict is preserved if it already exists
      verdict: stepData.verdict || inputData.verdict
    };
    onSave(step.number, dataToSave);
  };

  return (
    <View style={styles.stepWrapper}>
      <View style={styles.stepNumberContainer}>
        <View style={[
          styles.stepNumber,
          stepData?.status === 'Yes' && styles.stepNumberCompleted,
          stepData?.status === 'No' && styles.stepNumberRejected,
          step.isLocked && styles.stepNumberLocked,
        ]}>
          {step.isLocked ? (
            <Icon name="lock" size={20} color="#fff" />
          ) : (
            <CustomText style={styles.stepNumberText}>{step.number}</CustomText>
          )}
        </View>
      </View>

      <View style={styles.contentWrapper}>
        <View style={getStepStyle()}>
          <View style={styles.header}>
            <CustomText style={styles.title}>{step.title}</CustomText>
            {step.isLocked && (
              <CustomText style={styles.comingSoon}>Coming Soon</CustomText>
            )}
            {isVerdictAccepted && (
              <View style={styles.acceptedBadge}>
                <CustomText style={styles.acceptedText}>Accepted</CustomText>
              </View>
            )}
          </View>

          {step.description && (
            <CustomText style={styles.description}>{step.description}</CustomText>
          )}
          
          {!step.isLocked && (
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

              {/* Display verdict for verdict steps */}
              {step.isVerdict && stepData?.verdict && (
                <View style={[
                  styles.verdictContainer,
                  isVerdictAccepted && styles.verdictContainerAccepted
                ]}>
                  <CustomText style={styles.verdictLabel}>We suggest:</CustomText>
                  <CustomText style={styles.verdictText}>{stepData.verdict}</CustomText>
                </View>
              )}

              {stepData?.remark && (
                <CustomText style={[
                  styles.remarkText,
                  stepData?.status === 'No' && styles.remarkTextRejected
                ]}>
                  {stepData.remark}
                </CustomText>
              )}

              {/* Display college and branch for cap result steps */}
              {step.isCapQuery && stepData.collegeName && stepData.branchCode && (
                <View style={styles.allotmentContainer}>
                  <CustomText style={styles.allotmentLabel}>Allotted College:</CustomText>
                  <CustomText style={styles.allotmentCollege}>{stepData.collegeName}</CustomText>
                  <CustomText style={styles.allotmentBranch}>Branch: {stepData.branchCode}</CustomText>
                </View>
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

                  {/* Add college and branch inputs for cap result steps */}
                  {step.isCapQuery && (
                    <View style={styles.allottedCollegeContainer}>
                      <CustomText style={styles.inputLabel}>Allotted College</CustomText>
                      <CustomTextInput
                        style={[]}
                        value={inputData.collegeName}
                        onChangeText={(text) => setInputData(prev => ({...prev, collegeName: text}))}
                        placeholder="Enter college name"
                        placeholderTextColor="#999"
                      />
                      
                      <CustomText style={styles.inputLabel}>Branch Code</CustomText>
                      <CustomTextInput
                        style={[]}
                        value={inputData.branchCode}
                        onChangeText={(text) => setInputData(prev => ({...prev, branchCode: text}))}
                        placeholder="Enter branch code"
                        placeholderTextColor="#999"
                      />
                    </View>
                  )}

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
                {step.isVerdict && stepData?.verdict && !isEditing && (
                  isVerdictAccepted ? (
                    // Show Reject button when verdict is accepted
                    <TouchableOpacity 
                      style={styles.rejectVerdictButton} 
                      onPress={handleVerdictReject}
                    >
                      <Icon name="close-circle" size={16} style={{marginRight: 10}} color="#F44336" />
                      <CustomText style={styles.rejectVerdictText}>Reject</CustomText>
                    </TouchableOpacity>
                  ) : (
                    // Show Accept button when verdict is not accepted
                    <TouchableOpacity 
                      style={styles.acceptVerdictButton} 
                      onPress={handleVerdictAccept}
                    >
                      <Icon name="check-circle" size={16} style={{marginRight: 10}} color="#4CAF50" />
                      <CustomText style={styles.acceptVerdictText}>Accept</CustomText>
                    </TouchableOpacity>
                  )
                )}

                {leftCTA && !isEditing && !step.isVerdict && (
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
                    handleSaveData : // Use our new function to preserve verdict 
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
  verdictContainer: {
    marginTop: 12,
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'column',
  },
  verdictLabel: {
    color: '#613EEA',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  verdictText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  allotmentContainer: {
    marginTop: 12,
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
  },
  allotmentLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#613EEA',
    marginBottom: 5,
  },
  allotmentCollege: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  allotmentBranch: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  allottedCollegeContainer: {
    marginBottom: 16,
  },
  acceptVerdictButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  acceptVerdictText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  acceptedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  acceptedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rejectVerdictButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  rejectVerdictText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  verdictContainerAccepted: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
})

export default CounsellingStep



