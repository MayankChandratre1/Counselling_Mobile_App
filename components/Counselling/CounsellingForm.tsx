import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from 'react-native-vector-icons/FontAwesome6'
import CounsellingStep from './CounsellingStep'
import { RequestMethod, secureRequest } from '../../utils/tokenedRequest'
import config from '../../configs/API'

const CounsellingForm = () => {
  const cancePlan = async () => {
    // Here add your API call and navigation logic
    await AsyncStorage.removeItem('plan');
  }


  const [steps, setSteps] = React.useState<any[] | null>(null);
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [stepsData, setStepsData] = useState<{[key: number]: {status: 'Yes' | 'No', remark: string}}>({});

  const handleEdit = (stepNumber: number) => {
    setEditingStep(stepNumber);
  };

  const handleSave = (stepNumber: number, data: { status: 'Yes' | 'No', remark: string }) => {
    setStepsData(prev => ({
      ...prev,
      [stepNumber]: data
    }));
    setEditingStep(null);

    // Log all steps data
    const allStepsData = steps?.map(step => ({
      number: step.number,
      title: step.title,
      ...stepsData[step.number] || { status: 'No', remark: '' }
    }));
    console.log('All Steps Data:', allStepsData);
  };

  const fetchSteps = async () => {
    const response:any = await secureRequest(`${config.USER_API}/formsteps/63e53`, RequestMethod.GET);
    console.log(response.data?.steps);
    
    setSteps(response.data?.steps as any[]);
  }

  useEffect(() => {
    fetchSteps();
  },[])

  return (
    <View>
      <Pressable onPress={() => {
        cancePlan()
        console.log('Plan Cancelled');
        
      }}>
        
      </Pressable>
      <View style={styles.eliteMember}>
        <View style={styles.iconContainer}>
          <Icon name="crown" size={32} color="#613EEA" />
        </View>
        <Text style={styles.eliteText}>Elite Member</Text>
      </View>

     

      <View style={{
        minHeight: "100%"
      }}>
        <View style={{ width: "10%",height:"100%", borderRadius: 8, paddingInline: 10, alignItems: 'center', justifyContent: 'center', position: 'absolute', marginInline: 15 }}>
          <View
              style={{
                width: 4,
                height: "100%",
                backgroundColor: '#613EEA80',
                margin: 'auto',
              }}
            ></View>
        </View>
        {
          steps && steps.length > 0 &&steps?.map((step, index) => (
            <CounsellingStep 
              key={step.number}
              title={step.title} 
              stepNumber={step.number}
              onEdit={() => handleEdit(step.number)}
              onSave={handleSave}
              isEditing={editingStep === step.number}
              stepData={stepsData[step.number]}
              isCompleted={!!stepsData[step.number]} // Mark as completed if step has data
            />
          ))
        }  
      </View>
    
    </View>
  )
}

const styles = StyleSheet.create({
  eliteMember: {
    backgroundColor: '#613EEA',
    paddingVertical: 15,
    paddingInline: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconContainer: {
    backgroundColor: '#D9D9D9',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eliteText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
})

export default CounsellingForm