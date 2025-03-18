import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Picker } from '@react-native-picker/picker';

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
}: CounsellingStepProps) => {
  const [inputData, setInputData] = React.useState({
    status: stepData.status || 'No',
    remark: stepData.remark || ''
  });

  const getStepStyle = () => {
    if (stepData?.status === 'No') {
      return [styles.container, styles.containerRejected];
    }
    if (stepData?.status === 'Yes') {
      return [styles.container, styles.containerCompleted];
    }
    return [styles.container];
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingInline: 15 }}>
      <View style={{ width: "10%", borderRadius: 8, paddingInline: 10, alignItems: 'center', justifyContent: 'center' }}>
        <View style={[
          styles.stepNumber,
          stepData?.status === 'Yes' && styles.stepNumberCompleted,
          stepData?.status === 'No' && styles.stepNumberRejected
        ]}>
          <Text style={styles.stepNumberText}>{stepNumber}</Text>
        </View>
      </View>

      <View style={{ padding: 15, width: '90%' }}>
        <View style={getStepStyle()}>
          <Text style={styles.title}>{title}</Text>
          
          {!isEditing && (
            <>
              <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>STATUS:</Text>
                <Text style={[
                  styles.statusValue,
                  stepData?.status === 'No' && styles.statusValueRejected,
                  stepData?.status === 'Yes' && styles.statusValueCompleted,
                  !stepData?.status && styles.statusValuePending
                ]}>
                  {stepData?.status || ' Edit your status'}
                </Text>
              </View>
              {stepData?.remark && (
                <Text style={[
                  styles.remarkText,
                  stepData?.status === 'No' && styles.remarkTextRejected
                ]}>
                  {stepData.remark}
                </Text>
              )}
            </>
          )}

          {isEditing && (
            <View style={styles.inputContainer}>
              <View style={styles.pickerContainer}>
                <Text style={styles.inputLabel}>Status:</Text>
                <Picker
                  selectedValue={inputData.status}
                  onValueChange={(value) => setInputData(prev => ({...prev, status: value}))}
                  style={styles.picker}
                >
                  <Picker.Item label="Yes" value="Yes" />
                  <Picker.Item label="No" value="No" />
                </Picker>
              </View>

              <View style={styles.textInputContainer}>
                <Text style={styles.inputLabel}>Remarks:</Text>
                <TextInput
                  style={styles.input}
                  value={inputData.remark}
                  onChangeText={(text) => setInputData(prev => ({...prev, remark: text}))}
                  placeholder="Enter remarks..."
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
                <Text style={styles.leftCTA}>{leftCTA.label}</Text>
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
    padding: 15,
    marginBottom: 15,
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
    backgroundColor: '#F9FBE7',
  },
  containerRejected: {
    borderColor: '#F44336',
    backgroundColor: '#FFF5F5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
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
    marginTop: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: '#fff',
  },
  stepNumber: {
    paddingInline: 10,
    backgroundColor: '#613EEA',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepNumberRejected: {
    backgroundColor: '#F44336',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 24,
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
  pickerContainer: {
    marginBottom: 16,
  },
  textInputContainer: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  picker: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginTop: 4,
  },
})

export default CounsellingStep



