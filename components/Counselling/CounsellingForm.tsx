import { Pressable, StyleSheet, View, ScrollView, Dimensions, SafeAreaView } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from 'react-native-vector-icons/FontAwesome6'
import CounsellingStep from './CounsellingStep'
import { RequestMethod, secureRequest } from '../../utils/tokenedRequest'
import config from '../../configs/API'
import { getUserData } from '../../utils/storage'
import { useNavigation } from '@react-navigation/native'
import TopBar from '../General/TopBar'
import CustomText from '../General/CustomText'
import { useFocusEffect } from '@react-navigation/native'

// Get screen dimensions for responsive sizing
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Design system values for consistent spacing and sizing
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
}

const CounsellingForm = ({route}:any) => {
  const navigation = useNavigation<any>()
  const [steps, setSteps] = useState<any[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [editingStep, setEditingStep] = useState<number | null>(null)
  const [stepsData, setStepsData] = useState<{[key: number]: {status: 'Yes' | 'No', remark: string, verdict?: string}}>({})
  const [refreshing, setRefreshing] = useState<boolean>(false)

  useEffect(() => {
    console.log("Navigation in Track: ",navigation.route, route);
    
  },[navigation, route])


  const handleEdit = (stepNumber: number) => {
    setEditingStep(stepNumber)
  }

  const handleAcceptVerdict = async (stepNumber: number) => {
    try {
      // Get the current step data
      const currentStepData = stepsData[stepNumber] || {}
      
      // Create updated data with accept flag
      const updatedData = {
        ...currentStepData,
        accept: true
      }
      
      // Save the updated data using the existing handleSave function
      await handleSave(stepNumber, updatedData)
    } catch (error) {
      console.error('Error accepting verdict:', error)
    }
  }

  const handleSave = async (stepNumber: number, data: any) => {
    try {
      setLoading(true)
      // Create a copy of data that includes any existing fields like verdict
      const updatedData = {
        ...(stepsData[stepNumber] || {}), // Preserve any existing data
        ...data // Apply new updates
      }
      
      const edited_data = {
        ...stepsData,
        [stepNumber]: updatedData
      }
      
      setStepsData(prev => ({
        ...prev,
        [stepNumber]: updatedData
      }))
      setEditingStep(null)
    
      // Log all steps data
      const allStepsData = steps?.map(step => ({
        ...step,
        ...(edited_data[step.number] || { status: 'No', remark: '' })
      }))
      
      const userData = await getUserData()
      
      const updateResponse = await secureRequest(`${config.USER_API}/formdata/${userData.phone}/elite-1234567`, RequestMethod.POST, {
        body: {
          steps: allStepsData
        }
      })
      
      // Show success feedback
    } catch (error) {
      console.error('Error saving step data:', error)
      setError('Failed to save changes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchSteps = async () => {
    try {
      setLoading(true)
      setError(null)
      const user = await getUserData()
      const response: any = await secureRequest(`${config.USER_API}/formdata/${user.phone}/elite-1234567`, RequestMethod.GET)
      
      if (response.data?.steps) {
        setStepsData(response.data.steps.reduce((acc: any, step: any) => {
          acc[step.number] = step
          return acc
        }, {}))    
        setSteps(response.data.steps as any[])
      } else {
        setError('No steps data found')
      }
    } catch (error) {
      console.error("Error fetching steps:", error)
      setError('Failed to load data. Pull down to refresh.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchSteps()
  }

  // Reload data when screen focuses
  useFocusEffect(
    useCallback(() => {
      fetchSteps()
      return () => {}
    }, [])
  )

  const calculateProgress = () => {
    if (!steps || steps.length === 0) return { completed: 0, total: 0, percentage: 0 }
    
    const total = steps.length
    const completed = Object.values(stepsData).filter(step => step?.status === 'Yes').length
    const percentage = Math.round((completed / total) * 100)
    
    return { completed, total, percentage }
  }

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="clipboard-list" size={64} color="#ccc" />
      <CustomText style={styles.emptyStateText}>
        {error || 'No steps available'}
      </CustomText>
      <Pressable style={styles.retryButton} onPress={fetchSteps}>
        <CustomText style={styles.retryButtonText}>Retry</CustomText>
      </Pressable>
    </View>
  )

  const progress = calculateProgress()

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <TopBar heading="Track Progress" />
        
        <View style={styles.eliteContainer}>
          <View style={styles.eliteCardContent}>
            <View style={styles.eliteHeaderRow}>
              <View style={styles.badgeContainer}>
                <Icon name="crown" size={14} color="#FFF" />
                <CustomText style={styles.badgeText}>ELITE</CustomText>
              </View>
              
              <View style={styles.statsContainer}>
                <CustomText style={styles.statsText}>
                  {progress.completed}/{progress.total}
                </CustomText>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressLabelContainer}>
                <CustomText style={styles.progressLabel}>Progress</CustomText>
                <CustomText style={styles.progressPercentage}>{progress.percentage}%</CustomText>
              </View>
              
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progress.percentage}%` }]} />
              </View>
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            (!steps || steps.length === 0) && styles.scrollContentEmpty
          ]}
          showsVerticalScrollIndicator={false}
        >
          {(!steps || steps.length === 0) ? renderEmptyState() : (
            <View style={styles.stepsContainer}>
              <View style={styles.timelineBar}>
                <View style={styles.timelineLine} />
              </View>
              {steps.map((step, index) => (
                <CounsellingStep 
                  key={step.number}
                  step={{
                    ...step
                  }}
                  onEdit={() => handleEdit(step.number)}
                  onSave={handleSave}
                  stepData={stepsData[step.number]}
                  isCompleted={!!stepsData[step.number]} 
                  leftCTA={step.showListButton ? {
                    label: "View Lists",
                    onPress: () => navigation.navigate('MyLists')
                  } : step.isVerdict ? {
                    label: "Accept",
                    onPress: () => handleAcceptVerdict(step.number)
                  } : undefined}
                />
              ))}  
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  eliteContainer: {
    paddingHorizontal: 0,
    paddingTop:0,
    paddingBottom: 0,
  },
  eliteCardContent: {
    backgroundColor: '#613EEA',
    borderRadius: 0,
    padding: SPACING.md,
    
  },
  eliteHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  badgeText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  statsContainer: {
    alignItems: 'center',
  },
  statsText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 18,
  },
  statsLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  progressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: SPACING.sm,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercentage: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl * 2,
  },
  scrollContentEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepsContainer: {
    position: 'relative',
    paddingTop: SPACING.lg,
    flexGrow: 1,
  },
  timelineBar: {
    width: "10%",
    height: "100%",
    position: 'absolute',
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
  },
  timelineLine: {
    width: 4,
    height: "100%",
    backgroundColor: '#613EEA80',
    margin: 'auto',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: '#613EEA',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 20,
    marginTop: SPACING.md,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CounsellingForm