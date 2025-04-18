import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import CutoffTable from './CutoffTable'
import { Picker } from '@react-native-picker/picker'
import CustomText from '../General/CustomText'
import { FONTS } from '../../styles/typography'
import { globalStyles } from '../../styles/globalStyles'

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
    capRound: string
}

const CutoffTab = ({cutoffs}: { cutoffs: Cutoff[] }) => {
  const [filteredCutoffs, setFilteredCutoffs] = useState(cutoffs)
  const [gender, setGender] = useState('All')
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const branches = Array.from(new Set(cutoffs.map(c => c.branchName)))
  const categories = Array.from(new Set(cutoffs.map(c => c.Category)))

  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0])
    }
  }, [])

  useEffect(() => {
    let filtered = [...cutoffs]

    if (gender !== 'All') {
      filtered = filtered.filter(c => {
        if (gender === 'Female') return c.Category && c.Category.startsWith('L')
        return c.Category && c.Category.startsWith('G')
      })
    }

    if (selectedBranch) {
      filtered = filtered.filter(c => c.branchName === selectedBranch)
    }

    if (selectedCategory) {
      filtered = filtered.filter(c => c.Category === selectedCategory)
    }

    setFilteredCutoffs(filtered)
  }, [gender, selectedBranch, selectedCategory])

  const clearFilters = () => {
    setGender('All')
    setSelectedBranch(branches[0])
    setSelectedCategory('')
  }

  // Get screen dimensions for responsive layout
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 380;

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <CustomText style={styles.clearButtonText}>Clear Filters</CustomText>
        </TouchableOpacity>
        
        {/* Use vertical layout on small screens, horizontal on larger screens */}
        <View style={[
          styles.filterBox, 
          isSmallScreen && styles.filterBoxVertical
        ]}>
          <View style={[styles.pickerContainer, isSmallScreen && styles.pickerFullWidth]}>
            <CustomText style={styles.pickerLabel}>Gender</CustomText>
            <Picker
              selectedValue={gender}
              onValueChange={(value) => setGender(value)}
              style={[styles.picker, { color: '#333333', fontFamily: FONTS.REGULAR }]}
              itemStyle={[styles.pickerItem, { color: '#333333', fontFamily: FONTS.REGULAR }]}
              dropdownIconColor="#333333"
            >
              <Picker.Item label="All Genders" value="All" color="#333333" />
              <Picker.Item label="Male" value="Male" color="#333333" />
              <Picker.Item label="Female" value="Female" color="#333333" />
            </Picker>
          </View>

          <View style={[styles.pickerContainer, isSmallScreen && styles.pickerFullWidth]}>
            <CustomText style={styles.pickerLabel}>Branch</CustomText>
            <Picker
              selectedValue={selectedBranch}
              onValueChange={(value) => setSelectedBranch(value)}
              style={[styles.picker, { color: '#333333', fontFamily: FONTS.REGULAR }]}
              itemStyle={[styles.pickerItem, { color: '#333333', fontFamily: FONTS.REGULAR }]}
              dropdownIconColor="#333333"
            >
              {branches.map((branch) => (
                <Picker.Item key={branch} label={branch} value={branch} color="#333333" />
              ))}
            </Picker>
          </View>

          <View style={[styles.pickerContainer, isSmallScreen && styles.pickerFullWidth]}>
            <CustomText style={styles.pickerLabel}>Category</CustomText>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value)}
              style={[styles.picker, { color: '#333333', fontFamily: FONTS.REGULAR }]}
              itemStyle={[styles.pickerItem, { color: '#333333', fontFamily: FONTS.REGULAR }]}
              dropdownIconColor="#333333"
            >
              <Picker.Item label="All Categories" value="" color="#333333" />
              {categories.map((category) => (
                <Picker.Item key={category} label={category} value={category} color="#333333" />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <CustomText style={styles.selectedBranch}>Cutoff for {selectedBranch}</CustomText>
      <CutoffTable cutoffs={filteredCutoffs} />
    </View>
  )
}

export default CutoffTab

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 15,
    padding: 10,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 5,
    marginHorizontal: 2,
    minHeight: 60,
    justifyContent: 'center',
  },
  pickerFullWidth: {
    flex: 0,
    width: '100%',
    marginVertical: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    fontSize: 14,
    color: '#333333',
    fontFamily: FONTS.REGULAR,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#613EEA',
    marginLeft: 8,
    marginTop: 4,
    fontFamily: FONTS.BOLD,
  },
  clearButton: {
    padding: 8,
    alignItems: 'flex-end',
  },
  clearButtonText: {
    color: '#613EEA',
    fontWeight: 'bold',
  },
  selectedBranch: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  filterBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  filterBoxVertical: {
    flexDirection: 'column',
  },
})