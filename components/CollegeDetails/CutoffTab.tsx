import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import CutoffTable from './CutoffTable'
import { Picker } from '@react-native-picker/picker'

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

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
      <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </TouchableOpacity>
        <View style={styles.filterBox}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={gender}
            onValueChange={(value) => setGender(value)}
            style={styles.picker}
          >
            <Picker.Item label="All Genders" value="All" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedBranch}
            onValueChange={(value) => setSelectedBranch(value)}
            style={styles.picker}
          >
            {branches.map((branch) => (
              <Picker.Item key={branch} label={branch} value={branch} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
            style={styles.picker}
          >
            <Picker.Item label="All Categories" value="" />
            {categories.map((category) => (
              <Picker.Item key={category} label={category} value={category} />
            ))}
          </Picker>
        </View>
        </View>

       
      </View>

      <Text style={styles.selectedBranch}>Cutoff for {selectedBranch}</Text>
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
  },
  pickerContainer: {
    flex:1,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#ddd',
    
    paddingHorizontal: 1,
    marginHorizontal:2 // Added padding
  },
  picker: {
    height: 50, // Increased height
  },
  clearButton: {
    padding: 5,
    alignItems: 'flex-end',
    marginTop: 10,
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
  filterBox:{
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
})