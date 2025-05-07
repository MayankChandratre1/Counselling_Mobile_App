import { StyleSheet, View, TouchableOpacity, Dimensions, Modal, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import CutoffTable from './CutoffTable'
import { Picker } from '@react-native-picker/picker'
import CustomText from '../General/CustomText'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { useFocusEffect } from '@react-navigation/native'
import GetAdviceButton from './GetAdviceButton'
import { expandCategory } from '../../utils/categoryCleaner'
import { categories as _categories } from '../../data/categories'
import ChancePredictorModal from './ChancePredictorModal';

interface Cutoff {
    id: string;
    instituteName: string;
    instituteCode: string;
    branchCode: string;
    branchName: string;
    Category: string;
    rank: number;
    percentile: number;
    city: string;
    capRound: string;
    year?: number;
}

interface CutoffTabProps {
  cutoffs: Cutoff[];
  collegeData: any; // Replace with actual type if available  
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Memoized Pill component to avoid re-renders
const Pill = React.memo(({ item, selected, onSelect, label }: { 
  item: string, 
  selected: boolean, 
  onSelect: () => void,
  label: string
}) => (
  <TouchableOpacity
    style={[styles.pill, selected && styles.activePill]}
    onPress={onSelect}
    accessibilityLabel={label}
    accessibilityState={{ selected }}
  >
    <CustomText 
      style={[styles.pillText, selected && styles.activePillText]}
      numberOfLines={1}
    >
      {item}
    </CustomText>
  </TouchableOpacity>
));

// Memoized Chip component
const Chip = React.memo(({ item, selected, onSelect, label }: {
  item: string | number,
  selected: boolean,
  onSelect: () => void,
  label: string
}) => (
  <TouchableOpacity
    style={[styles.chip, selected && styles.activeChip]}
    onPress={onSelect}
    accessibilityLabel={label}
    accessibilityState={{ selected }}
  >
    <CustomText 
      style={[styles.chipText, selected && styles.activeChipText]}
    >
      {item}
    </CustomText>
  </TouchableOpacity>
));

const CutoffTab: React.FC<CutoffTabProps> = ({ cutoffs, collegeData }) => {
  // Initial state setup with sensible defaults
  const [filteredCutoffs, setFilteredCutoffs] = useState<Cutoff[]>([]);
  const [gender, setGender] = useState<string>('All');
  const [selectedBranch, setSelectedBranch] = useState<{
    name: string;
    code: string;
  }>({ name: '', code: '' });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedCapRound, setSelectedCapRound] = useState<string>('');
  const [booleanFilters, setBooleanFilters] = useState<{ [key: string]: boolean }>({});
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState<number>(0);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [showChancePredictorModal, setShowChancePredictorModal] = useState<boolean>(false);

  // Memoized derived data to prevent recalculation on every render
  const {
    branches,
    categories,
    years,
    capRounds,
    defaultBranch,
    defaultCapRound,
    defaultYear
  } = useMemo(() => {
    // Extract unique values and sort them for consistency
    //make this unique and sort
    const branchList = collegeData.branches.map((c:any) => ({name: c.branchName, code: c.branchCode}));
    const categoryList = _categories
    const yearList = Array.from(new Set(cutoffs.map(c => c.year))).filter(Boolean) as number[];
    yearList.sort((a, b) => b - a); // Sort years in descending order
    const roundList = Array.from(new Set(cutoffs.map(c => c.capRound))).sort();
    
    return {
      branches: branchList,
      categories: categoryList,
      years: yearList,
      capRounds: roundList,
      defaultBranch: branchList.length > 0 ? {
        name: branchList[0].name,
        code: branchList[0].code
      } : {
        name: '',
        code: ''
      },
      defaultCapRound: roundList.length > 0 ? roundList[0] : '',
      defaultYear: yearList.length > 0 ? Math.max(...yearList) : undefined
    };
  }, [cutoffs]);

  // Format round number for display - memoized to avoid recalculation
  const formatRoundDisplay = useCallback((capRound: string): string => {
    const matches = capRound.match(/\d+/);
    return matches ? `Round ${matches[0]}` : capRound;
  }, []);

  // Initialize defaults only once
  useEffect(() => {
    if (!initialized && cutoffs.length > 0) {
      setSelectedBranch({
        name: defaultBranch.name,
        code: defaultBranch.code
      });
       // Assuming branch code is same as branch name for now
      setSelectedCapRound(defaultCapRound);
      setSelectedYear(defaultYear);
      setInitialized(true);
    }
  }, [initialized, defaultBranch, defaultCapRound, defaultYear, cutoffs.length]);

  // Filter cutoffs efficiently
  useEffect(() => {
    if (!selectedBranch || !initialized) return; // Don't filter until initialized
    
    setTableLoading(true);
    
    // Perform filtering immediately instead of using setTimeout
    const filtered = cutoffs.filter(c => {
      // Branch filter is always applied
      if (c.branchName !== selectedBranch.name) return false;
      
      // Only check other filters if they're set
      if (gender !== 'All') {
        const isLadies = c.Category && c.Category.includes('L') ;
        if ((gender === 'Female' && !isLadies) || (gender === 'Male' && isLadies)) {
          return false;
        }
      }
      
      if (selectedCategory && !c.Category.includes(selectedCategory)) return false;
      if (selectedYear && c.year !== selectedYear) return false;
      if (selectedCapRound && c.capRound !== selectedCapRound) return false;

      if(booleanFilters['Physical Disability'] && !c.Category.includes('PWD')) return false;
      if(booleanFilters['Defense'] && !c.Category.includes('DEF')) return false;
      
      return true;
    });

    // Update state in a batch
    setFilteredCutoffs(filtered);
    setActiveFiltersCount(
      (gender !== 'All' ? 1 : 0) + 
      (selectedCategory ? 1 : 0) + (booleanFilters['Physical Disability'] ? 1 : 0) + (booleanFilters['Defense'] ? 1 : 0)
    );
    setTableLoading(false);
    
  }, [gender, selectedBranch, selectedCategory, selectedYear, selectedCapRound, cutoffs, initialized, booleanFilters]);

  // Reset the component when it comes into focus
  useFocusEffect(
    useCallback(() => {
      // No need to do anything special on focus for now
      return () => {
        // Cleanup can be implemented here if needed
      };
    }, [])
  );

  const clearFilters = useCallback(() => {
    setGender('All');
    setSelectedCategory('');
    setBooleanFilters({})
  }, []);

  // Get formatted display of applied filters - memoized
  const appliedFiltersText = useMemo(() => {
    const filters = [];
    if (gender !== 'All') filters.push(gender);
    if (selectedCategory) filters.push(selectedCategory);
    if(booleanFilters['Physical Disability']) filters.push('Physical Disability');
    if(booleanFilters['Defense']) filters.push('Defense');
    
    if (filters.length === 0) return 'No filters applied';
    return filters.join(' • ');
  }, [gender, selectedCategory, booleanFilters]);

  return (
    <SafeAreaView style={styles.safeArea}>
      
      <View style={styles.container}>
        
        {/* Header with Branch Selection and Filter Button */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContentWrapper}>
            <View style={styles.branchTitleContainer}>
              <View style={styles.branchNameContainer}>
                <CustomText 
                  style={styles.headerText}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {selectedBranch.name || 'Select a branch'}
                </CustomText>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
              accessibilityLabel="Filter options"
            >
              <Icon name="filter-variant" size={22} color="#371981" />
              {activeFiltersCount > 0 && (
                <View style={styles.filterBadge}>
                  <CustomText style={styles.filterBadgeText}>{activeFiltersCount}</CustomText>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Branch Selection Horizontal Scrollable List - Use virtualization for large lists */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContainer}
          >
            {branches.map((branch:any, index:number) => (
              <Pill 
                key={index}
                item={branch.name}
                selected={selectedBranch === branch}
                onSelect={() => setSelectedBranch(branch)}
                label={`Select ${branch} branch`}
              />
            ))}
          </ScrollView>
        </View>

        {/* Selection Chips Section */}
        <View style={styles.selectionChipsSection}>
          {/* Year Selection */}
          {years.length > 0 && (
            <View style={[styles.chipSectionContainer,{borderBottomWidth: 0.5, paddingBottom: 5, marginBottom: 5}]}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScrollContainer}
              >
                {years.map((year) => (
                  <Chip
                    key={`year-${year}`}
                    item={year}
                    selected={selectedYear === year}
                    onSelect={() => setSelectedYear(year)}
                    label={`Select year ${year}`}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Round Selection */}
          <View style={styles.chipSectionContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScrollContainer}
            >
              {capRounds.map((round) => (
                <Chip
                  key={`round-${round}`}
                  item={formatRoundDisplay(round)}
                  selected={selectedCapRound === round}
                  onSelect={() => setSelectedCapRound(round)}
                  label={`Select ${formatRoundDisplay(round)}`}
                />
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Applied Filters Indicator */}
        {activeFiltersCount > 0 && (
          <View style={styles.appliedFiltersContainer}>
            <View style={styles.filterTagsContainer}>
              <Icon name="filter-outline" size={16} color="#371981" style={styles.filterIcon} />
              <CustomText style={styles.appliedFiltersText} numberOfLines={1}>
                {appliedFiltersText}
              </CustomText>
            </View>
            <TouchableOpacity 
              onPress={clearFilters}
              accessibilityLabel="Clear all filters"
            >
              <CustomText style={styles.clearText}>Clear</CustomText>
            </TouchableOpacity>
          </View>
        )}

<View style={styles.predictButtonContainer}>
          <TouchableOpacity 
            style={styles.predictButton}
            onPress={() => setShowChancePredictorModal(true)}
          >
            <Icon name="trophy" size={22} color="#fff" style={styles.predictButtonIcon} />
            <CustomText style={styles.predictButtonText}>
              Predict My Chances for {(()=>(selectedBranch.name?.length > 20 ? `${selectedBranch.name.substring(0,15)}...`:selectedBranch.name))() || 'this branch'}
            </CustomText>
          </TouchableOpacity>
        </View>
        
        {/* Cutoff Table */}
        <View style={styles.tableContainer}>
          {tableLoading ? (
            <View style={styles.loadingContainer}>
              <CustomText style={styles.loadingText}>Loading cutoffs...</CustomText>
            </View>
          ) : filteredCutoffs.length === 0 ? (
            <View style={styles.noDataContainer}>
              <Icon name="alert-circle-outline" size={40} color="#888" />
              <CustomText style={styles.noDataText}>No cutoff data available for selected filters</CustomText>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={clearFilters}
              >
                <CustomText style={styles.resetButtonText}>Reset Filters</CustomText>
              </TouchableOpacity>
            </View>
          ) : (
            <CutoffTable cutoffs={filteredCutoffs} />
          )}
        </View>

        {/* Filter Modal */}
        {showFilterModal && (
          <Modal
            visible={true}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowFilterModal(false)}
            statusBarTranslucent
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeader}>
                  <CustomText style={styles.modalTitle}>Filter Cutoffs</CustomText>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowFilterModal(false)}
                    accessibilityLabel="Close filter modal"
                  >
                    <AntDesign name="close" size={24} color="#371981" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                  {/* Gender Filter Section */}
                  <View style={styles.filterSection}>
                    <CustomText style={styles.filterSectionTitle}>Gender</CustomText>
                    <View style={styles.optionsContainer}>
                      {['All', 'Male', 'Female'].map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.optionButton,
                            gender === option && styles.selectedOptionButton
                          ]}
                          onPress={() => setGender(option)}
                          accessibilityLabel={`Select ${option} gender`}
                          accessibilityState={{ selected: gender === option }}
                        >
                          <CustomText 
                            style={[
                              styles.optionText,
                              gender === option && styles.selectedOptionText
                            ]}
                          >
                            {option}
                          </CustomText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Category Filter Section */}
                  <View style={styles.filterSection}>
                    <CustomText style={styles.filterSectionTitle}>Category</CustomText>
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={selectedCategory}
                        onValueChange={(value) => setSelectedCategory(value)}
                        style={styles.modalPicker}
                        dropdownIconColor="#371981"
                        accessibilityLabel="Select category"
                      >
                        <Picker.Item label="All Categories" value="" />
                        {categories.map((category) => (
                          <Picker.Item key={category} label={expandCategory(category)} value={category} />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.filterSection}>
                    <CustomText style={styles.filterSectionTitle}>Special Filters</CustomText>
                    <View style={styles.optionsContainer}>
                      {['Physical Disability', 'Defense'].map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.optionButton,
                           booleanFilters[option] && styles.selectedOptionButton
                          ]}
                          onPress={() => setBooleanFilters(prev => ({
                            ...prev,
                            [option]: !prev[option]
                          }))}
                          accessibilityLabel={`Select ${option}`}
                          accessibilityState={{ selected: booleanFilters[option] }}
                        >
                          <CustomText 
                            style={[
                              styles.optionText,
                              booleanFilters[option] && styles.selectedOptionText
                            ]}
                          >
                            {option}
                          </CustomText>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.modalResetButton}
                    onPress={clearFilters}
                    accessibilityLabel="Reset all filters"
                  >
                    <CustomText style={styles.resetButtonText}>Reset All</CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => setShowFilterModal(false)}
                    accessibilityLabel="Apply filters"
                  >
                    <CustomText style={styles.applyButtonText}>Apply</CustomText>
                    <AntDesign name="check" size={16} color="#FFF" style={{ marginLeft: 5 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
       
        
        <ChancePredictorModal
          visible={showChancePredictorModal}
          onClose={() => setShowChancePredictorModal(false)}
          collegeData={collegeData} // Pass your college data here
          selectedBranch={selectedBranch.code} // Pass the selected branch code here
        />
      </View>
    </SafeAreaView>
  );
};

export default React.memo(CutoffTab);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 15,
    paddingTop: 10,
  },
  headerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#00000030',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
    marginBottom: 12,
  },
  headerContentWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  branchTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  branchLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  branchNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#371981',
    flex: 1,
    marginRight: 6,
  },
  filterButton: {
    backgroundColor: '#F0F0FF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0FF',
    position: 'relative',
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4D6D',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pillsContainer: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F8F8FC',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ECECF6',
    maxWidth: 140,
  },
  activePill: {
    backgroundColor: '#613EEA',
    borderColor: '#613EEA',
  },
  pillText: {
    fontSize: 14,
    color: '#555',
  },
  activePillText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectionChipsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#00000030',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
    marginBottom: 12,
  },
  chipSectionContainer: {
    marginBottom: 5,
  },
  chipSectionTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  chipsScrollContainer: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F8F8FC',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ECECF6',
  },
  activeChip: {
    backgroundColor: '#613EEA',
    borderColor: '#613EEA',
  },
  chipText: {
    fontSize: 13,
    color: '#555',
  },
  activeChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  appliedFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F0FF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0FF',
  },
  filterTagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterIcon: {
    marginRight: 6,
  },
  appliedFiltersText: {
    color: '#371981',
    fontSize: 14,
    flex: 1,
  },
  clearText: {
    color: '#613EEA',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#00000030',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
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
    padding: 20,
    maxHeight: '60%',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#F8F8FC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECECF6',
  },
  selectedOptionButton: {
    backgroundColor: '#613EEA',
    borderColor: '#613EEA',
  },
  optionText: {
    color: '#613EEA',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#fff',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ECECF6',
    borderRadius: 10,
    backgroundColor: '#F8F8FC',
    overflow: 'hidden',
  },
  modalPicker: {
    height: 50,
    color: '#371981',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    justifyContent: 'space-between',
  },
  modalResetButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginTop: 16,
  },
  resetButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 14,
  },
  applyButton: {
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
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  predictButtonContainer: {
    marginBottom: 10,
  },
  predictButton: {
    backgroundColor: '#371981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#613EEA50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  predictButtonIcon: {
    marginRight: 8,
  },
  predictButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});