import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import CustomText from '../General/CustomText'
import StepEditModal from '../Counselling/StepEditModal'

interface CounsellingStepProps {
  leftCTA?: {
    label: string;
    onPress: () => void;
  };
  onEdit: () => void;
  onSave: (stepNumber: number, data: any) => void;
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

const CounsellingStep = ({ 
  leftCTA, 
  onSave,
  stepData = { status: undefined, remark: '' },
  isCompleted = false,
  step
}: CounsellingStepProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const { width: screenWidth } = Dimensions.get('window');
  const isSmallScreen = screenWidth < 360;
  
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

  const handleSaveData = (data: any) => {
    onSave(step.number, data);
    setShowEditModal(false);
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
            <CustomText style={styles.stepNumberText}>
              {step.number}
            </CustomText>
          )}
        </View>
      </View>

      <View style={styles.contentWrapper}>
        <View style={getStepStyle()}>
          <View style={styles.header}>
            <CustomText style={styles.title} numberOfLines={2}>
              {step.title}
            </CustomText>
            
            {step.isLocked && (
              <CustomText style={styles.comingSoon}>
                Coming Soon
              </CustomText>
            )}
            
            {isVerdictAccepted && (
              <View style={styles.acceptedBadge}>
                <CustomText style={styles.acceptedText}>Accepted</CustomText>
              </View>
            )}
          </View>

          {!step.isLocked && (
            <View style={styles.contentSection}>
              {/* <View style={styles.statusContainer}>
                <CustomText style={styles.statusLabel}>STATUS:</CustomText>
                <CustomText style={[
                  styles.statusValue,
                  stepData?.status === 'No' && styles.statusValueRejected,
                  stepData?.status === 'Yes' && styles.statusValueCompleted,
                  !stepData?.status && styles.statusValuePending
                ]}>
                  {stepData?.status || 'Not Set'}
                </CustomText>
              </View> */}

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

              {/* Display remark if available */}
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

              <View style={styles.footer}>
                {step.isVerdict && stepData?.verdict && (
                  isVerdictAccepted ? (
                    <TouchableOpacity 
                      style={styles.rejectVerdictButton} 
                      onPress={handleVerdictReject}
                    >
                      <Icon name="close-circle" size={16} style={{marginRight: 10}} color="#F44336" />
                      <CustomText style={styles.rejectVerdictText}>Reject</CustomText>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={styles.acceptVerdictButton} 
                      onPress={handleVerdictAccept}
                    >
                      <Icon name="check-circle" size={16} style={{marginRight: 10}} color="#4CAF50" />
                      <CustomText style={styles.acceptVerdictText}>Accept</CustomText>
                    </TouchableOpacity>
                  )
                )}

                {leftCTA && !step.isVerdict && (
                  <TouchableOpacity 
                    style={styles.leftCTAButton} 
                    onPress={leftCTA.onPress}
                  >
                    <Icon name="clipboard-text-multiple-outline" size={16} style={{marginRight: 10}} color="#613EEA" />
                    <CustomText style={styles.leftCTAText}>{leftCTA.label}</CustomText>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => setShowEditModal(true)}
                >
                  <CustomText style={styles.leftCTAText}>View</CustomText>
                  <Icon name="arrow-right" size={20} color="#613EEA" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Edit Step Modal */}
      <StepEditModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveData}
        stepData={stepData}
        step={step}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  stepWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 15,
    width: '100%',
  },
  stepNumberContainer: {
    width: 56,
    alignItems: 'center',
  },
  stepNumber: {
    backgroundColor: '#613EEA',
    borderRadius: 28,
    width: 56,
    height: 56,
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
    fontSize: 24,
    fontWeight: 'bold'
  },
  contentWrapper: {
    flex: 1,
    paddingLeft: 10,
  },
  container: {
    borderWidth: 1,
    borderColor: '#613EEA',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  containerCompleted: {
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  containerRejected: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  containerLocked: {
    borderColor: '#9E9E9E',
    backgroundColor: '#F5F5F5',
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  comingSoon: {
    fontSize: 12,
    color: '#9E9E9E',
    fontStyle: 'italic',
    marginLeft: 8,
  },
  contentSection: {
    marginTop: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    color: '#613EEA',
    fontWeight: '500',
    marginRight: 8,
    fontSize: 13,
  },
  statusValue: {
    color: '#333',
    fontWeight: '500',
    fontSize: 13,
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
  verdictContainer: {
    marginBottom: 10,
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
  },
  verdictLabel: {
    color: '#613EEA',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  verdictText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  remarkText: {
    marginBottom: 10,
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  remarkTextRejected: {
    color: '#F44336',
  },
  allotmentContainer: {
    marginBottom: 10,
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
  },
  allotmentLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#613EEA',
    marginBottom: 2,
  },
  allotmentCollege: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  allotmentBranch: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  acceptVerdictButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  acceptVerdictText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 13,
  },
  acceptedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 5,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  rejectVerdictText: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 13,
  },
  verdictContainerAccepted: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  leftCTAButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftCTAText: {
    color: '#613EEA',
    fontWeight: '500',
    fontSize: 13,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#613EEA',
    fontWeight: '500',
    fontSize: 13,
    marginLeft: 5,
  },
})

export default CounsellingStep