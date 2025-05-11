import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  TextInput,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../General/CustomText';
import { Picker } from '@react-native-picker/picker';
import { FONTS } from '../../styles/typography';
import { calculateChances } from '../../utils/knowYourChance';
import { categories } from '../../data/categories';
import { getPremiumStatus, getChancesUseCount, decrementChancesUseCount, getUserData } from '../../utils/storage';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEventsContext } from '../../contexts/EventsContext';

interface ChancePredictorModalProps {
  visible: boolean;
  onClose: () => void;
  collegeData: any; // College object with branches and cutoffs
  selectedBranch: string; // Branch code
}

// Map marks to anticipated percentile (sample - replace with actual data)
const marksToPercentileMap  = [
    { marks: 160, percentile: 99.50 },
    { marks: 155, percentile: 99.25 },
    { marks: 150, percentile: 99.00 },
    { marks: 145, percentile: 98.70 },
    { marks: 140, percentile: 98.30 },
    { marks: 135, percentile: 97.80 },
    { marks: 130, percentile: 97.20 },
    { marks: 125, percentile: 96.50 },
    { marks: 120, percentile: 95.70 },
    { marks: 115, percentile: 94.80 },
    { marks: 110, percentile: 93.80 },
    { marks: 105, percentile: 92.70 },
    { marks: 100, percentile: 91.50 },
    { marks: 95, percentile: 90.00 },
    { marks: 90, percentile: 88.00 },
    { marks: 85, percentile: 85.50 },
    { marks: 80, percentile: 82.50 },
    { marks: 75, percentile: 79.00 },
    { marks: 70, percentile: 75.00 },
    { marks: 65, percentile: 70.50 },
    { marks: 60, percentile: 65.50 },
    { marks: 55, percentile: 60.00 },
    { marks: 50, percentile: 54.00 },
    { marks: 45, percentile: 47.50 },
    { marks: 40, percentile: 40.50 }
  ];

const ChancePredictorModal: React.FC<ChancePredictorModalProps> = ({
  visible,
  onClose,
  collegeData,
  selectedBranch
}) => {
  // Get enabled features from context
  const { enabledFeatures } = useEventsContext();
  const isFeatureEnabled = enabledFeatures?.includes('predict-chance');
  
  // Form state
  const [isResultDeclared, setIsResultDeclared] = useState(true);
  const [percentile, setPercentile] = useState('');
  const [rank, setRank] = useState('');
  const [expectedMarks, setExpectedMarks] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('OPEN');
  const [isPWD, setIsPWD] = useState(false);
  const [isDefense, setIsDefense] = useState(false);

  // Result state
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [isPremium, setIsPremium] = useState(false);
  const [remainingUsage, setRemainingUsage] = useState<number | null>(null);
  const navigation = useNavigation<any>();
  

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
    
    
  }, [visible]);

  // Check premium status and usage count when modal opens
  useEffect(() => {
    if (visible) {
      checkPremiumAndUsage();
    }
  }, [visible]);

  useEffect(()=>{
    
      const updateWithUserDetails = async ()=>{
        console.log('Updating with user details...');
        
          const userData = await getUserData();
          console.log(userData);
          
          if(userData.counsellingData.cetMarks || userData.counsellingData.cetPercentile){
              setPercentile(userData.counsellingData.cetPercentile);
              setExpectedMarks(userData.counsellingData.cetMarks);
              setSelectedCategory(userData.counsellingData.category);
              setIsDefense(userData.counsellingData.isDefense == "YES");
              setIsPWD(userData.counsellingData.isPWD == "YES");
          }
      }
    if (visible) {
      updateWithUserDetails()
    }
  },[visible])

  const checkPremiumAndUsage = async () => {
    try {
      const { isPremium } = await getPremiumStatus();
      setIsPremium(isPremium);
      
      const usageCount = await getChancesUseCount();
      setRemainingUsage(usageCount);
    } catch (error) {
      console.error('Error checking premium status or usage count:', error);
    }
  };

  const resetForm = () => {
    setIsResultDeclared(true);
    setPercentile('');
    setRank('');
    setExpectedMarks('');
    setSelectedCategory('OPEN');
    setIsPWD(false);
    setIsDefense(false);
    setShowResults(false);
    setLoading(false);
    setResult(null);
    setError(null);
  };

  // Convert expected marks to percentile
  const estimatePercentileFromMarks = (marks: number): number => {
    // Find closest match in the map
    const sortedMap = [...marksToPercentileMap].sort((a, b) => b.marks - a.marks);
    
    // If marks are higher than our highest mapped value
    if (marks >= sortedMap[0].marks) {
      return sortedMap[0].percentile;
    }
    
    // If marks are lower than our lowest mapped value
    if (marks <= sortedMap[sortedMap.length - 1].marks) {
      return sortedMap[sortedMap.length - 1].percentile;
    }
    
    // Find the two closest values and interpolate
    for (let i = 0; i < sortedMap.length - 1; i++) {
      if (marks <= sortedMap[i].marks && marks >= sortedMap[i + 1].marks) {
        const higherEntry = sortedMap[i];
        const lowerEntry = sortedMap[i + 1];
        
        // Linear interpolation
        const ratio = (marks - lowerEntry.marks) / (higherEntry.marks - lowerEntry.marks);
        return lowerEntry.percentile + ratio * (higherEntry.percentile - lowerEntry.percentile);
      }
    }
    
    return 50; // Default fallback
  };

  const validateForm = (): boolean => {
    if (isResultDeclared) {
      if (!percentile && !rank) {
        setError('Please enter either percentile or rank');
        return false;
      }
      
      if (percentile && (Number(percentile) < 0 || Number(percentile) > 100)) {
        setError('Percentile must be between 0 and 100');
        return false;
      }
      
      if (rank && Number(rank) <= 0) {
        setError('Rank must be greater than 0');
        return false;
      }
    } else {
      if (!expectedMarks) {
        setError('Please enter expected marks');
        return false;
      }
      
      if (Number(expectedMarks) < 0) {
        setError('Marks cannot be negative');
        return false;
      }
    }
    
    setError(null);
    return true;
  };

  const handleCalculate = async () => {
    if (!validateForm()) return;
    
    // Check if non-premium user has used all chances
    if (!isPremium && remainingUsage === 0) {
      return; // No more chances left
    }
    
    setLoading(true);
    
    try {
      // Decrement usage count for free users
      if (!isPremium && remainingUsage !== null && remainingUsage > 0) {
        const newCount = await decrementChancesUseCount();
        setRemainingUsage(newCount);
      }
      
      // Create user input object
      const userInput: any = {
        selectedCategory,
        isPWD,
        isDefense
      };
      
      // Set percentile/rank based on form values
      if (isResultDeclared) {
        if (percentile) userInput.percentile = Number(percentile);
        if (rank) userInput.rank = Number(rank);
      } else {
        userInput.percentile = estimatePercentileFromMarks(Number(expectedMarks));
      }
      
      // Calculate chances using the utility
      const chanceResult = calculateChances(collegeData, selectedBranch, userInput);
      setResult(chanceResult);
      setShowResults(true);
    } catch (error) {
      console.error('Error calculating chances:', error);
      setError('An error occurred while calculating chances');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToPremium = () => {
    onClose();
    navigation.navigate('Tab', { screen: 'Counselling' });
  };

  // Render confidence level icon
  const renderConfidenceIcon = (level: string) => {
    if (level === 'high') {
      return <Ionicons name="shield-checkmark" size={24} color="#4CAF50" style={styles.confidenceIcon} />;
    } else if (level === 'medium') {
      return <Ionicons name="shield-half" size={24} color="#FFC107" style={styles.confidenceIcon} />;
    } else {
      return <Ionicons name="shield-outline" size={24} color="#FF5722" style={styles.confidenceIcon} />;
    }
  };
  
  // Render trend icon
  const renderTrendIcon = (trend: string) => {
    if (trend === 'increasing') {
      return <Ionicons name="trending-up" size={24} color="#FF5722" style={styles.trendIcon} />;
    } else if (trend === 'decreasing') {
      return <Ionicons name="trending-down" size={24} color="#4CAF50" style={styles.trendIcon} />;
    } else if (trend === 'stable') {
      return <Ionicons name="remove" size={24} color="#607D8B" style={styles.trendIcon} />;
    } else {
      return <Ionicons name="help-circle" size={24} color="#9E9E9E" style={styles.trendIcon} />;
    }
  };

  // Render trend explanation
  const getTrendExplanation = (trend: string) => {
    if (trend === 'increasing') {
      return 'Cutoffs have been increasing (becoming more competitive)';
    } else if (trend === 'decreasing') {
      return 'Cutoffs have been decreasing (becoming less competitive)';
    } else if (trend === 'stable') {
      return 'Cutoffs have remained relatively stable';
    } else {
      return 'Not enough data to determine trend';
    }
  };

  // Render the Coming Soon UI when feature is disabled
  const renderFeatureDisabledContent = () => {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalHandle} />
        
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <CustomText style={styles.modalTitle}>Chance Predictor</CustomText>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close predictor modal"
          >
            <AntDesign name="close" size={24} color="#371981" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.comingSoonContainer}>
          <Ionicons name="construct-outline" size={80} color="#613EEA" style={styles.comingSoonIcon} />
          <CustomText style={styles.comingSoonTitle}>
            We're Updating This Feature
          </CustomText>
          <CustomText style={styles.comingSoonText}>
            Our chance prediction algorithm is being upgraded to provide you with more accurate results.
            This feature will be available again soon.
          </CustomText>
          
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={onClose}
          >
            <CustomText style={styles.upgradeButtonText}>
              Got it
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        {isFeatureEnabled ? (
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <CustomText style={styles.modalTitle}>Predict Your Chances</CustomText>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={onClose}
                accessibilityLabel="Close predictor modal"
              >
                <AntDesign name="close" size={24} color="#371981" />
              </TouchableOpacity>
            </View>

            {/* Show premium badge or usage limit for free users */}
            <View style={styles.usageBadgeContainer}>
              {isPremium ? (
                <View style={styles.premiumBadge}>
                  <MaterialIcons name="stars" size={16} color="#FFD700" />
                  <CustomText style={styles.premiumText}>Premium</CustomText>
                </View>
              ) : remainingUsage !== null && remainingUsage > 0 ? (
                <View style={styles.usageBadge}>
                  <CustomText style={styles.usageText}>
                    Predictions left: <CustomText style={styles.usageCount}>{remainingUsage}/10</CustomText>
                  </CustomText>
                </View>
              ) : null}
            </View>

            {/* Modal Content */}
            {!isPremium && remainingUsage === 0 ? (
              // Show limit reached UI for free users
              <ScrollView style={styles.modalContent} contentContainerStyle={styles.scrollContent}>
                <View style={styles.limitReachedContainer}>
                  <Ionicons name="lock-closed" size={60} color="#FF5722" style={styles.lockIcon} />
                  <CustomText style={styles.limitReachedTitle}>
                    Daily Limit Reached
                  </CustomText>
                  <CustomText style={styles.limitReachedText}>
                    You've used all 10 free predictions for today. Upgrade to premium for unlimited predictions and personalized counseling.
                  </CustomText>
                  <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={handleUpgradeToPremium}
                  >
                    <CustomText style={styles.upgradeButtonText}>
                      Upgrade to Premium
                    </CustomText>
                    <Ionicons name="star" size={16} color="#FFF" style={{ marginLeft: 8 }} />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : !showResults ? (
              // Form UI (existing code)
              <ScrollView style={styles.modalContent} contentContainerStyle={styles.scrollContent}>
                {/* Result Declaration Toggle */}
                <View style={styles.formSection}>
                  <View style={styles.switchContainer}>
                    <CustomText style={styles.switchLabel}>Is Result Declared?</CustomText>
                    <Switch
                      value={isResultDeclared}
                      onValueChange={setIsResultDeclared}
                      trackColor={{ false: '#D1D1D1', true: '#613EEA50' }}
                      thumbColor={isResultDeclared ? '#613EEA' : '#f4f3f4'}
                    />
                  </View>
                </View>

                {/* Input fields based on result declaration */}
                {isResultDeclared ? (
                  <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                      <CustomText style={styles.inputLabel}>Percentile</CustomText>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your percentile"
                        keyboardType="decimal-pad"
                        value={percentile}
                        onChangeText={setPercentile}
                      />
                    </View>
                    
                    
                  </View>
                ) : (
                  <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                      <CustomText style={styles.inputLabel}>Expected Marks</CustomText>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your expected marks"
                        keyboardType="number-pad"
                        value={expectedMarks}
                        onChangeText={setExpectedMarks}
                      />
                    </View>
                  </View>
                )}

                {/* Category Selection */}
                <View style={styles.formSection}>
                  <CustomText style={styles.sectionTitle}>Category</CustomText>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={selectedCategory}
                      onValueChange={(value) => setSelectedCategory(value)}
                      style={styles.picker}
                      dropdownIconColor="#371981"
                    >
                      {categories.map((category) => (
                        <Picker.Item key={category} label={category} value={category} />
                      ))}
                    </Picker>
                  </View>
                </View>

                {/* Special Categories */}
                <View style={styles.formSection}>
                  <CustomText style={styles.sectionTitle}>Special Categories</CustomText>
                  <View style={styles.specialCategoriesContainer}>
                    <TouchableOpacity 
                      style={[styles.specialCategoryButton, isPWD && styles.activeSpecialCategory]}
                      onPress={() => setIsPWD(!isPWD)}
                    >
                      <Ionicons
                        name={isPWD ? "checkbox" : "square-outline"}
                        size={24}
                        color={isPWD ? "#613EEA" : "#666"}
                      />
                      <CustomText style={[styles.specialCategoryText, isPWD && styles.activeSpecialCategoryText]}>
                        Physical Disability
                      </CustomText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.specialCategoryButton, isDefense && styles.activeSpecialCategory]}
                      onPress={() => setIsDefense(!isDefense)}
                    >
                      <Ionicons
                        name={isDefense ? "checkbox" : "square-outline"}
                        size={24}
                        color={isDefense ? "#613EEA" : "#666"}
                      />
                      <CustomText style={[styles.specialCategoryText, isDefense && styles.activeSpecialCategoryText]}>
                        Defense Officer's Child
                      </CustomText>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Error Message */}
                {error && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={18} color="#FF5252" />
                    <CustomText style={styles.errorText}>{error}</CustomText>
                  </View>
                )}
              </ScrollView>
            ) : (
              // Results Section
              <ScrollView style={styles.modalContent} contentContainerStyle={styles.scrollContent}>
                {result && (
                  <View style={styles.resultsContainer}>
                    {/* Chance Meter */}
                    <View style={styles.chanceGaugeContainer}>
                      <View style={styles.gaugeBackground}>
                        <View 
                          style={[
                            styles.gaugeProgress, 
                            { width: `${result.chance}%` },
                            result.chance < 30 ? styles.gaugeColorLow :
                            result.chance < 70 ? styles.gaugeColorMedium :
                            styles.gaugeColorHigh
                          ]}
                        />
                      </View>
                      <CustomText style={styles.chancePercentage}>{Math.round(result.chance)}%</CustomText>
                      <CustomText style={styles.chanceLabel}>Chance of Admission</CustomText>
                    </View>

                    {/* Confidence Level */}
                    <View style={styles.resultCard}>
                      <View style={styles.resultCardHeader}>
                        <CustomText style={styles.resultCardTitle}>Data Confidence</CustomText>
                        {renderConfidenceIcon(result.confidenceLevel)}
                      </View>
                      <CustomText style={styles.resultCardContent}>
                        {result.confidenceLevel === 'high' ? 
                          'Based on comprehensive historical data of past 2 years' :
                          result.confidenceLevel === 'medium' ?
                          'Based on limited historical data of past 2 years' :
                          'Based on very limited historical data of past 2 years'}
                      </CustomText>
                    </View>

                    {/* Trend Information */}
                    <View style={styles.resultCard}>
                      <View style={styles.resultCardHeader}>
                        <CustomText style={styles.resultCardTitle}>Cutoff Trend</CustomText>
                        {renderTrendIcon(result.trend)}
                      </View>
                      <CustomText style={styles.resultCardContent}>
                        {getTrendExplanation(result.trend)}
                      </CustomText>
                    </View>
                    
                    {/* Message */}
                    <View style={styles.messageContainer}>
                      <CustomText style={styles.messageText}>{result.message}</CustomText>
                    </View>
                    
                    {/* Suggested Next Round */}
                    {result.suggestedNextRound && (
                      <View style={styles.suggestionContainer}>
                        <Ionicons name="information-circle" size={24} color="#3F51B5" />
                        <CustomText style={styles.suggestionText}>
                          Consider applying in {result.suggestedNextRound.replace('cap', 'Round ')} for better chances
                        </CustomText>
                      </View>
                    )}
                  </View>
                )}
              </ScrollView>
            )}

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              {!isPremium && remainingUsage === 0 ? (
                <TouchableOpacity
                  style={styles.upgradeButtonFooter}
                  onPress={handleUpgradeToPremium}
                >
                  <CustomText style={styles.upgradeButtonText}>
                    Upgrade to Premium
                  </CustomText>
                </TouchableOpacity>
              ) : !showResults ? (
                <>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={resetForm}
                  >
                    <CustomText style={styles.resetButtonText}>Reset</CustomText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.calculateButton}
                    onPress={handleCalculate}
                    disabled={loading || (!isPremium && remainingUsage === 0)}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <CustomText style={styles.calculateButtonText}>Calculate Chances</CustomText>
                        <AntDesign name="right" size={16} color="#FFF" style={{ marginLeft: 5 }} />
                      </>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setShowResults(false)}
                >
                  <AntDesign name="left" size={16} color="#FFF" style={{ marginRight: 5 }} />
                  <CustomText style={styles.backButtonText}>Back to Form</CustomText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          renderFeatureDisabledContent()
        )}
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#371981',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8FC',
  },
  modalContent: {
    maxHeight: '70%',
  },
  scrollContent: {
    padding: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F8F8FC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECECF6',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ECECF6',
    borderRadius: 10,
    backgroundColor: '#F8F8FC',
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
    fontFamily: FONTS.REGULAR,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ECECF6',
    borderRadius: 10,
    backgroundColor: '#F8F8FC',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#371981',
  },
  specialCategoriesContainer: {
    gap: 10,
  },
  specialCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F8F8FC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECECF6',
  },
  activeSpecialCategory: {
    backgroundColor: '#F0F0FF',
    borderColor: '#613EEA',
  },
  specialCategoryText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
  },
  activeSpecialCategoryText: {
    color: '#613EEA',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginLeft: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    justifyContent: 'space-between',
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  resetButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 14,
  },
  calculateButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#613EEA',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 12,
    shadowColor: '#613EEA50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  calculateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultsContainer: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  chanceGaugeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  gaugeBackground: {
    height: 20,
    width: '100%',
    backgroundColor: '#ECECF6',
    borderRadius: 10,
    overflow: 'hidden',
  },
  gaugeProgress: {
    height: '100%',
    borderRadius: 10,
  },
  gaugeColorLow: {
    backgroundColor: '#FF5252',
  },
  gaugeColorMedium: {
    backgroundColor: '#FFC107',
  },
  gaugeColorHigh: {
    backgroundColor: '#4CAF50',
  },
  chancePercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#371981',
    marginTop: 16,
    paddingVertical: 16,
  },
  chanceLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  resultCard: {
    backgroundColor: '#F8F8FC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ECECF6',
  },
  resultCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#371981',
  },
  resultCardContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  confidenceIcon: {
    marginLeft: 10,
  },
  trendIcon: {
    marginLeft: 10,
  },
  messageContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  messageText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20,
  },
  suggestionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: '#1565C0',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  backButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#613EEA',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    shadowColor: '#613EEA50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  usageBadgeContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70020',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  premiumText: {
    color: '#371981',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  usageBadge: {
    backgroundColor: '#F0F0FF',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0FF',
  },
  usageText: {
    color: '#371981',
    fontSize: 14,
  },
  usageCount: {
    fontWeight: '600',
    color: '#613EEA',
  },
  limitReachedContainer: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  lockIcon: {
    marginBottom: 24,
  },
  limitReachedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#371981',
    marginBottom: 16,
  },
  limitReachedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  upgradeButton: {
    flexDirection: 'row',
    backgroundColor: '#613EEA',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#613EEA50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  upgradeButtonFooter: {
    flexDirection: 'row',
    backgroundColor: '#613EEA',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    shadowColor: '#613EEA50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // New styles for Coming Soon UI
  comingSoonContainer: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 40,
    paddingBottom: 40,
  },
  comingSoonIcon: {
    marginBottom: 24,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#371981',
    marginBottom: 16,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  }
});

export default ChancePredictorModal;
