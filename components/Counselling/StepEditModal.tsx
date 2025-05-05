import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Platform,
  Animated,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  TextInput,
  Text
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import CustomText from '../General/CustomText';
import CustomTextInput from '../General/CustomTextInput';
import { usePremiumPlan } from '../../contexts/PremiumPlanContext';
import { useNavigation } from '@react-navigation/native';

interface StepEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  stepData: {
    status: 'Yes' | 'No' | undefined;
    remark: string;
    collegeName?: string;
    branchCode?: string;
    verdict?: string;
    accept?: boolean;
  };
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

const StepEditModal = ({ visible, onClose, onSave, stepData, step }: StepEditModalProps) => {
  const [inputData, setInputData] = useState({
    status: stepData.status || 'No',
    remark: stepData.remark || '',
    collegeName: stepData.collegeName || '',
    branchCode: stepData.branchCode || '',
    verdict: stepData.verdict || '',
    accept: stepData.accept
  });
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const { height: screenHeight } = Dimensions.get('window');
  
  // Get premium plan context information
  const { currentPlan } = usePremiumPlan();
  const navigation = useNavigation<any>();
  
  const isPlanFree = currentPlan === 'Free';
  
  // Update local state when stepData changes
  useEffect(() => {
    setInputData({
      status: stepData.status || 'No',
      remark: stepData.remark || '',
      collegeName: stepData.collegeName || '',
      branchCode: stepData.branchCode || '',
      verdict: stepData.verdict || '',
      accept: stepData.accept
    });
  }, [stepData, visible]);
  
  // Animation effects when modal opens/closes
  useEffect(() => {
    if (visible) {
      // Reset animations to starting values
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
      
      // Start animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  // Handle keyboard appearance
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  
  const statusOptions: RadioOption[] = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' }
  ];

  const handleSave = () => {
    // Include the verdict from original data if it exists
    const dataToSave = {
      ...inputData,
      verdict: stepData.verdict || inputData.verdict
    };
    
    // Run exit animation and then save
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onSave(dataToSave);
    });
  };

  const handleClose = () => {
    // Run exit animation and then close
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
    });
  };

  // Determine modal height based on screen size and content
  const getModalMaxHeight = () => {
    if (isKeyboardVisible) {
      return Platform.OS === 'ios' ? '85%' : '95%';
    }
    // Increase max height to improve scrollability
    return '90%';
  };

  const handleExplorePlans = () => {
    // Close the modal first
    handleClose();
    // Navigate to counselling tab with FreeDashboard screen
    setTimeout(() => {
      navigation.navigate({
        name: 'Counselling',
        params: { screen: 'FreeDashboard' },
      });
    }, 300);
  };

  // Render locked content for free plan users
  const renderLockedContent = () => (
    <ScrollView style={styles.lockedModalContent}>
      <View style={styles.stepHeaderSection}>
        <View style={styles.stepNumberBadge}>
          <CustomText style={styles.stepNumberText}>{step.number}</CustomText>
        </View>
        
        <View style={styles.stepTitleContainer}>
          <CustomText style={styles.stepTitle}>{step.title}</CustomText>
          
          {step.description && (
            <CustomText style={styles.stepDescription}>{step.description}</CustomText>
          )}
        </View>
      </View>
      
      <View style={styles.lockedContentContainer}>
        <View style={styles.lockedIconContainer}>
          <FontAwesome5 name="lock" size={64} color="#DDDDDD" />
        </View>
        
        <CustomText style={styles.lockedTitle}>Premium Feature</CustomText>
        
       
        
        <TouchableOpacity 
          style={styles.explorePlansButton}
          onPress={handleExplorePlans}
          accessibilityRole="button"
          accessibilityLabel="Explore premium plans"
        >
          <CustomText style={styles.explorePlansText}>Explore Plans</CustomText>
          <Icon name="arrow-right" size={20} color="#fff" style={styles.explorePlansIcon} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none" // Using custom animation
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <SafeAreaView style={styles.safeAreaContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View 
            style={[
              styles.modalOverlay,
              { opacity: fadeAnim }
            ]}
          >
            <TouchableWithoutFeedback onPress={handleClose}>
              <View style={styles.dismissArea} />
            </TouchableWithoutFeedback>
            
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.keyboardAvoidingView}
              keyboardVerticalOffset={10}
            >
              <Animated.View 
                style={[
                  styles.modalContainer,
                  {
                    transform: [{ translateY: slideAnim }],
                    maxHeight: getModalMaxHeight()
                  }
                ]}
              >
                {/* Handle at the top for better UX */}
                <View style={styles.modalHandle} />

                <View style={styles.modalHeader}>
                  <CustomText 
                    style={styles.modalTitle}
                    accessibilityRole="header"
                  >
                    {isPlanFree ? "Premium Feature" : `Edit Step ${step.number}`}
                  </CustomText>
                  <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={handleClose}
                    accessibilityLabel="Close modal"
                    accessibilityHint="Closes the edit step modal"
                    accessibilityRole="button"
                  >
                    <AntDesign name="close" size={22} color="#371981" />
                  </TouchableOpacity>
                </View>
                
                {isPlanFree ? (
                  // Render locked content for free plan users
                    <ScrollView 
                      style={styles.modalContent}
                      showsVerticalScrollIndicator={true} // Show scrollbar for better UX
                      bounces={true}
                      contentContainerStyle={styles.scrollContentContainer}
                      keyboardShouldPersistTaps="handled" // Better keyboard handling
                      nestedScrollEnabled={true} // Enable nested scrolling
                    >
                    {renderLockedContent()}
                    </ScrollView>
                ) : (
                  // Render normal edit modal content for premium users
                  <>
                    <ScrollView 
                      style={styles.modalContent}
                      showsVerticalScrollIndicator={true} // Show scrollbar for better UX
                      bounces={true}
                      contentContainerStyle={styles.scrollContentContainer}
                      keyboardShouldPersistTaps="handled" // Better keyboard handling
                      nestedScrollEnabled={true} // Enable nested scrolling
                    >
                      {/* ...existing content goes here... */}
                      <View style={styles.stepHeaderSection}>
                        <View style={[
                          styles.stepNumberBadge,
                          inputData.status === 'Yes' ? styles.stepNumberBadgeCompleted : 
                          inputData.status === 'No' ? styles.stepNumberBadgeRejected : null
                        ]}>
                          <CustomText style={styles.stepNumberText}>{step.number}</CustomText>
                        </View>
                        
                        <View style={styles.stepTitleContainer}>
                          <CustomText style={styles.stepTitle}>{step.title}</CustomText>
                          
                          {step.description && (
                            <CustomText style={styles.stepDescription}>{step.description}</CustomText>
                          )}
                        </View>
                      </View>
                      
                      {/* Show verdict if available for verdict steps */}
                      {step.isVerdict && stepData.verdict && (
                        <View style={styles.verdictContainer}>
                          <View style={styles.verdictHeader}>
                            <Icon name="lightbulb-outline" size={22} color="#371981" style={styles.verdictIcon} />
                            <CustomText style={styles.verdictLabel}>Recommended Verdict</CustomText>
                          </View>
                          <CustomText style={styles.verdictText}>{stepData.verdict}</CustomText>
                          
                          <View style={styles.acceptanceStatus}>
                            <CustomText style={styles.acceptanceLabel}>
                              Status: 
                            </CustomText>
                            <CustomText style={[
                              styles.acceptanceValue,
                              stepData.accept ? styles.acceptedText : styles.pendingText
                            ]}>
                              {stepData.accept ? 'Accepted' : 'Pending Acceptance'}
                            </CustomText>
                          </View>
                        </View>
                      )}
                      
                      <View style={[styles.inputSection, styles.statusSection]}>
                        <CustomText 
                          style={styles.sectionLabel}
                          accessibilityRole="text"
                        >
                          Status
                        </CustomText>
                        <View style={styles.radioGroup}>
                          {statusOptions.map((option) => (
                            <TouchableOpacity
                              key={option.value}
                              style={[
                                styles.radioOption,
                                inputData.status === option.value && (
                                  option.value === 'Yes' ? styles.radioOptionSelectedYes : styles.radioOptionSelectedNo
                                )
                              ]}
                              onPress={() => setInputData(prev => ({...prev, status: option.value}))}
                              accessibilityRole="radio"
                              accessibilityState={{ checked: inputData.status === option.value }}
                              accessibilityLabel={option.label}
                            >
                              <View style={[
                                styles.radio,
                                inputData.status === option.value && (
                                  option.value === 'Yes' ? styles.radioSelectedYes : styles.radioSelectedNo
                                )
                              ]}>
                                {inputData.status === option.value && (
                                  <View style={[
                                    styles.radioInner,
                                    option.value === 'Yes' ? styles.radioInnerYes : styles.radioInnerNo
                                  ]} />
                                )}
                              </View>
                              <CustomText style={[
                                styles.radioLabel,
                                inputData.status === option.value && (
                                  option.value === 'Yes' ? styles.radioLabelYes : styles.radioLabelNo
                                )
                              ]}>
                                {option.label}
                              </CustomText>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                      
                      {/* Improved college and branch inputs for cap result steps */}
                      {step.isCapQuery && (
                        <View style={styles.capQueryContainer}>
                          <CustomText 
                            style={styles.sectionLabel}
                            accessibilityRole="text"
                          >
                            CAP Result Details
                          </CustomText>
                          
                          <View style={styles.inputBlock}>
                            <CustomText 
                              style={styles.inputLabel}
                              accessibilityRole="text"
                            >
                              Allotted College
                            </CustomText>
                            <View style={styles.inputWrapper}>
                              <Icon name="school" size={15} color="#613EEA" style={styles.inputIcon} />
                              <TextInput
                                style={styles.textInput}
                                value={inputData.collegeName}
                                onChangeText={(text) => setInputData(prev => ({...prev, collegeName: text}))}
                                placeholder="Enter college name"
                                placeholderTextColor="#999"
                                accessibilityLabel="Enter allotted college name"
                              />
                            </View>
                          </View>
                          
                          <View style={styles.inputBlock}>
                            <CustomText 
                              style={styles.inputLabel}
                              accessibilityRole="text"
                            >
                              Branch Code
                            </CustomText>
                            <View style={styles.inputWrapper}>
                              <Icon name="code-braces" size={15} color="#613EEA" style={styles.inputIcon} />
                              <TextInput
                                style={styles.textInput}
                                value={inputData.branchCode}
                                onChangeText={(text) => setInputData(prev => ({...prev, branchCode: text}))}
                                placeholder="Enter branch code"
                                placeholderTextColor="#999"
                                accessibilityLabel="Enter branch code"
                              />
                            </View>
                          </View>
                        </View>
                      )}
                      
                      <View style={styles.inputSection}>
                        <CustomText 
                          style={styles.sectionLabel}
                          accessibilityRole="text"
                        >
                          Remarks
                        </CustomText>
                        <View style={styles.textAreaWrapper}>
                          <CustomTextInput
                            style={styles.textArea}
                            value={inputData.remark}
                            onChangeText={(text) => setInputData(prev => ({...prev, remark: text}))}
                            placeholder="Add your remarks here..."
                            placeholderTextColor="#999"
                            multiline
                            textAlignVertical="top"
                            numberOfLines={6} // Increased for better visibility
                            accessibilityLabel="Add remarks"
                            accessibilityHint="Enter any additional information about this step"
                          />
                        </View>
                      </View>
                      
                      {/* Add spacer to ensure content is scrollable past the footer */}
                      <View style={styles.bottomSpacer} />
                    </ScrollView>
                    
                    <View style={styles.modalFooter}>
                      <TouchableOpacity 
                        style={styles.cancelButton} 
                        onPress={handleClose}
                        accessibilityRole="button"
                        accessibilityLabel="Cancel"
                        accessibilityHint="Discard changes and close modal"
                      >
                        <CustomText style={styles.cancelButtonText}>Cancel</CustomText>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.saveButton}
                        onPress={handleSave}
                        accessibilityRole="button"
                        accessibilityLabel="Save changes"
                        accessibilityHint="Save your changes and close modal"
                      >
                        <CustomText style={styles.saveButtonText}>Save Changes</CustomText>
                        <Icon name="check-circle" size={18} color="#fff" style={styles.saveButtonIcon} />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </Animated.View>
            </KeyboardAvoidingView>
          </Animated.View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  modalHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#DDD',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff', // Ensure header is solid
    zIndex: 5, // Keep header on top
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#371981',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContentContainer: {
    paddingBottom: 40,
  },
  modalContent: {
    padding: 20,
    flexGrow: 1,
  },
  stepHeaderSection: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  stepNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#613EEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberBadgeCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepNumberBadgeRejected: {
    backgroundColor: '#F44336',
  },
  stepNumberText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepTitleContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  // Verdict section styles
  verdictContainer: {
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#371981',
  },
  verdictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verdictIcon: {
    marginRight: 8,
  },
  verdictLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#371981',
  },
  verdictText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    fontWeight: '500',
  },
  acceptanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 6,
    padding: 8,
  },
  acceptanceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginRight: 6,
  },
  acceptanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  acceptedText: {
    color: '#4CAF50',
  },
  pendingText: {
    color: '#FF9800',
  },
  inputSection: {
    marginBottom: 20,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
  },
  statusSection: {
    backgroundColor: '#F5F5FF',
    borderLeftWidth: 4,
    borderLeftColor: '#613EEA',
  },
  // CAP Query container with improved styling
  capQueryContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFAF0', // Warm background for contrast
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 120,
    justifyContent: 'center',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  radioOptionSelectedYes: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
  },
  radioOptionSelectedNo: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#613EEA',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelectedYes: {
    borderColor: '#4CAF50',
  },
  radioSelectedNo: {
    borderColor: '#F44336',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#613EEA',
  },
  radioInnerYes: {
    backgroundColor: '#4CAF50',
  },
  radioInnerNo: {
    backgroundColor: '#F44336',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  radioLabelYes: {
    color: '#4CAF50',
  },
  radioLabelNo: {
    color: '#F44336',
  },
  // Improved input styling
  inputBlock: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    height: 50,
    padding: 12,
    fontSize: 16,
    color: '#333', // Adjust for Android
  },
  textAreaWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  textArea: {
    padding: 12,
    fontSize: 16,
    minHeight: 150, // Increased for better editing experience
    color: '#333',
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#613EEA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#613EEA",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  saveButtonIcon: {
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 40, // Extra space to ensure content is visible
  },
  lockedModalContent: {
    padding: 20,
    flex: 1,
  },
  lockedContentContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(55, 25, 129, 0.03)',
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  lockedIconContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(55, 25, 129, 0.05)',
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  lockedDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  explorePlansButton: {
    backgroundColor: '#371981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    shadowColor: '#371981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  explorePlansText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  explorePlansIcon: {
    marginLeft: 4,
  },
});

export default StepEditModal;