import { Pressable, StyleSheet, View, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from 'react-native-vector-icons/FontAwesome6'
import CounsellingStep from './CounsellingStep'
import { RequestMethod, secureRequest } from '../../utils/tokenedRequest'
import config from '../../configs/API'
import { getUserData } from '../../utils/storage'
import { useNavigation } from '@react-navigation/native';
import TopBar from '../General/TopBar'
import CustomText from '../General/CustomText'

const CounsellingForm = () => {
  const navigation = useNavigation<any>();
  const cancePlan = async () => {
    // Here add your API call and navigation logic
    await AsyncStorage.removeItem('plan');
  }

  const [steps, setSteps] = React.useState<any[] | null>(null);
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [stepsData, setStepsData] = useState<{[key: number]: {status: 'Yes' | 'No', remark: string, verdict?: string}}>({});

  const handleEdit = (stepNumber: number) => {
    setEditingStep(stepNumber);
  };

  const handleAcceptVerdict = async (stepNumber: number) => {
    // Get the current step data
    const currentStepData = stepsData[stepNumber] || {};
    
    // Create updated data with accept flag
    const updatedData = {
      ...currentStepData,
      accept: true
    };
    
    // Save the updated data using the existing handleSave function
    await handleSave(stepNumber, updatedData);
  };

  const handleSave = async (stepNumber: number, data: any) => {
    // Create a copy of data that includes any existing fields like verdict
    const updatedData = {
      ...(stepsData[stepNumber] || {}), // Preserve any existing data
      ...data // Apply new updates
    };
    
    const edited_data = {
      ...stepsData,
      [stepNumber]: updatedData
    };
    
    setStepsData(prev => ({
      ...prev,
      [stepNumber]: updatedData
    }));
    setEditingStep(null);
  
    // Log all steps data
    const allStepsData = steps?.map(step => ({
      ...step,
      ...(edited_data[step.number] || { status: 'No', remark: '' })
    }));
    
    const userData = await getUserData()
    
    const updateResponse = await secureRequest(`${config.USER_API}/formdata/${userData.phone}/elite-1234567`, RequestMethod.POST, {
      body: {
        steps: allStepsData
      }
    });
    console.log(updateResponse, allStepsData);
    
  };

  const fetchSteps = async () => {
    const user = await getUserData()
    const response:any = await secureRequest(`${config.USER_API}/formdata/${user.phone}/elite-1234567`, RequestMethod.GET);

    setStepsData(response.data?.steps.reduce((acc: any, step: any) => {
      acc[step.number] = step;
      return acc;
    }, {}));    
    console.log("Steps: ", response.data);
    setSteps(response.data?.steps as any[]);
  }

  useEffect(() => {
    fetchSteps();
  },[])

  const calculateProgress = () => {
    if (!steps || steps.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const total = steps.length;
    const completed = Object.values(stepsData).filter(step => step?.status === 'Yes').length;
    const percentage = Math.round((completed / total) * 100);
    
    return { completed, total, percentage };
  };

  return (
    <View style={styles.mainContainer}>
      <TopBar heading="Track Progress" />
      <View style={styles.eliteMember}>
        <View style={styles.eliteHeader}>
          <View style={styles.iconContainer}>
            <Icon name="crown" size={32} color="#613EEA" />
          </View>
          <CustomText style={styles.eliteText}>Elite Member</CustomText>
        </View>
        
        <View style={styles.progressMetrics}>
          <CustomText style={styles.progressText}>
            {`${calculateProgress().completed}/${calculateProgress().total} Steps`}
            
          </CustomText>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${calculateProgress().percentage}%` }
              ]} 
            />
          </View>
          
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.stepsContainer}>
          <View style={styles.timelineBar}>
            <View style={styles.timelineLine} />
          </View>
          {
            steps && steps.length > 0 &&steps?.map((step, index) => (
              <CounsellingStep 
                key={step.number}
                step={step}
                onEdit={() => handleEdit(step.number)}
                onSave={handleSave}
                isEditing={editingStep === step.number}
                stepData={stepsData[step.number]}
                isCompleted={!!stepsData[step.number]} // Mark as completed if step has data
                leftCTA={step.showListButton ? {
                  label:"View Lists",
                  onPress: () => navigation.navigate('MyLists')
                } : step.isVerdict ? {
                  label: "Accept",
                  onPress: () => handleAcceptVerdict(step.number)
                } : undefined}
              />
            ))
          }  
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  eliteMember: {
    backgroundColor: '#613EEA',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  eliteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 15,
  },
  progressMetrics: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    padding: 12,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  percentageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 100,
  },
  stepsContainer: {
    position: 'relative',
    paddingTop:20,
    flexGrow: 1,
  },
  timelineBar: {
    width: "10%",
    height: "100%",
    position: 'absolute',
    paddingInline: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginInline: 15,
  },
  timelineLine: {
    width: 4,
    height: "100%",
    backgroundColor: '#613EEA80',
    margin: 'auto',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    
  },
  scrollContent: {
    paddingBottom: 40,
  },
})

export default CounsellingForm