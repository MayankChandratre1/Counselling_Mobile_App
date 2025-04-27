import { StyleSheet, View, TouchableOpacity, Dimensions, Modal, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import CutoffTable from './CutoffTable'
import { Picker } from '@react-native-picker/picker'
import CustomText from '../General/CustomText'
import { FONTS } from '../../styles/typography'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'

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

const CutoffTab = ({cutoffs}: { cutoffs: Cutoff[] }) => {
  const [filteredCutoffs, setFilteredCutoffs] = useState(cutoffs);
  const [gender, setGender] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [selectedCapRound, setSelectedCapRound] = useState<string>('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Get unique values for filters
  const branches = Array.from(new Set(cutoffs.map(c => c.branchName)));
  const categories = Array.from(new Set(cutoffs.map(c => c.Category)));
  const years = Array.from(new Set(cutoffs.map(c => c.year))).filter(Boolean) as number[];
  const capRounds = Array.from(new Set(cutoffs.map(c => c.capRound))).sort();

  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0]);
    }
  }, []);

  useEffect(() => {
    let filtered = [...cutoffs];

    if (gender !== 'All') {
      filtered = filtered.filter(c => {
        if (gender === 'Female') return c.Category && c.Category.startsWith('L');
        return c.Category && c.Category.startsWith('G');
      });
    }

    if (selectedBranch) {
      filtered = filtered.filter(c => c.branchName === selectedBranch);
    }

    if (selectedCategory) {
      filtered = filtered.filter(c => c.Category === selectedCategory);
    }
    
    if (selectedYear) {
      filtered = filtered.filter(c => c.year === selectedYear);
    }

    if (selectedCapRound) {
      filtered = filtered.filter(c => c.capRound === selectedCapRound);
    }

    setFilteredCutoffs(filtered);
    
    // Count active filters
    let count = 0;
    if (gender !== 'All') count++;
    if (selectedCategory) count++;
    if (selectedYear) count++;
    if (selectedCapRound) count++;
    setActiveFiltersCount(count);
  }, [gender, selectedBranch, selectedCategory, selectedYear, selectedCapRound]);

  const clearFilters = () => {
    setGender('All');
    setSelectedCategory('');
    setSelectedYear('');
    setSelectedCapRound('');
  };

  // Function to format the applied filters for display
  const getAppliedFiltersText = () => {
    const filters = [];
    if (gender !== 'All') filters.push(gender);
    if (selectedCategory) filters.push(selectedCategory);
    if (selectedYear) filters.push(`${selectedYear}`);
    if (selectedCapRound) filters.push(`Cap Round ${selectedCapRound}`);
    
    if (filters.length === 0) return 'No filters applied';
    return filters.join(' • ');
  };

  // Extract number from capRound string for display
  const getCapRoundNumber = (capRound: string): string => {
    const matches = capRound.match(/\d+/);
    return matches ? matches[0] : capRound;
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        <View style={styles.branchSelector}>
          <CustomText style={styles.label}>Branch:</CustomText>
          <View style={styles.branchPickerContainer}>
            <Picker
              selectedValue={selectedBranch}
              onValueChange={(value) => setSelectedBranch(value)}
              style={styles.branchPicker}
              dropdownIconColor="#371981"
            >
              {branches.map((branch) => (
                <Picker.Item key={branch} label={branch} value={branch} />
              ))}
            </Picker>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Icon name="filter-variant" size={22} color="#371981" />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <CustomText style={styles.filterBadgeText}>{activeFiltersCount}</CustomText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {activeFiltersCount > 0 && (
        <View style={styles.appliedFiltersContainer}>
          <CustomText style={styles.appliedFiltersText} numberOfLines={1}>
            {getAppliedFiltersText()}
          </CustomText>
          <TouchableOpacity onPress={clearFilters}>
            <CustomText style={styles.clearText}>Clear</CustomText>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.tableContainer}>
        <CustomText style={styles.selectedBranch}> {selectedBranch}</CustomText>
        <CutoffTable cutoffs={filteredCutoffs} />
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <CustomText style={styles.modalTitle}>Filter Cutoffs</CustomText>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowFilterModal(false)}
              >
                <AntDesign name="close" size={24} color="#371981" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
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

              <View style={styles.filterSection}>
                <CustomText style={styles.filterSectionTitle}>Cap Round</CustomText>
                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      selectedCapRound === '' && styles.selectedOptionButton
                    ]}
                    onPress={() => setSelectedCapRound('')}
                  >
                    <CustomText 
                      style={[
                        styles.optionText,
                        selectedCapRound === '' && styles.selectedOptionText
                      ]}
                    >
                      All
                    </CustomText>
                  </TouchableOpacity>
                  {capRounds.map((round) => (
                    <TouchableOpacity
                      key={round}
                      style={[
                        styles.optionButton,
                        selectedCapRound === round && styles.selectedOptionButton
                      ]}
                      onPress={() => setSelectedCapRound(round)}
                    >
                      <CustomText 
                        style={[
                          styles.optionText,
                          selectedCapRound === round && styles.selectedOptionText
                        ]}
                      >
                        Round {getCapRoundNumber(round)}
                      </CustomText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <CustomText style={styles.filterSectionTitle}>Category</CustomText>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={selectedCategory}
                    onValueChange={(value) => setSelectedCategory(value)}
                    style={styles.modalPicker}
                    dropdownIconColor="#371981"
                  >
                    <Picker.Item label="All Categories" value="" />
                    {categories.map((category) => (
                      <Picker.Item key={category} label={category} value={category} />
                    ))}
                  </Picker>
                </View>
              </View>

              {years.length > 0 && (
                <View style={styles.filterSection}>
                  <CustomText style={styles.filterSectionTitle}>Year</CustomText>
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        selectedYear === '' && styles.selectedOptionButton
                      ]}
                      onPress={() => setSelectedYear('')}
                    >
                      <CustomText 
                        style={[
                          styles.optionText,
                          selectedYear === '' && styles.selectedOptionText
                        ]}
                      >
                        All
                      </CustomText>
                    </TouchableOpacity>
                    {years.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.optionButton,
                          selectedYear === year && styles.selectedOptionButton
                        ]}
                        onPress={() => setSelectedYear(year)}
                      >
                        <CustomText 
                          style={[
                            styles.optionText,
                            selectedYear === year && styles.selectedOptionText
                          ]}
                        >
                          {year}
                        </CustomText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={clearFilters}
              >
                <CustomText style={styles.resetButtonText}>Reset</CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilterModal(false)}
              >
                <CustomText style={styles.applyButtonText}>Apply</CustomText>
                <AntDesign name="check" size={16} color="#FFF" style={{ marginLeft: 5 }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default CutoffTab

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 15,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  branchSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#371981',
    marginRight: 10,
  },
  branchPickerContainer: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginTop:10
  },
  branchPicker: {
    height: 60,
    marginVertical:15,
    color: '#371981',
  },
  filterButton: {
    backgroundColor: '#f0f0ff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#e0e0ff',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  appliedFiltersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  appliedFiltersText: {
    color: '#371981',
    fontSize: 14,
    flex: 1,
  },
  clearText: {
    color: '#613EEA',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  tableContainer: {
    flex: 1,
  },
  selectedBranch: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#371981',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 16,
    maxHeight: '60%',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0ff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0ff',
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
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  modalPicker: {
    height: 50,
    color: '#371981',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'flex-end',
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  resetButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  applyButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#613EEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})