import { StyleSheet, Text, View, FlatList, TextInput, Dimensions, TouchableOpacity } from 'react-native'
import React, { useState, useCallback, useMemo } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useNavigation } from '@react-navigation/native'
import CustomText from '../General/CustomText'
import CustomTextInput from '../General/CustomTextInput'

interface College {
  instituteName: string;
  selectedBranch: string;
  selectedBranchCode: string;
}

interface ListDetailsProps {
  title: string;
  colleges: College[];
}

const ListDetails = ({ title, colleges }: ListDetailsProps) => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const windowHeight = Dimensions.get('window').height;

  // Assign permanent serial numbers to colleges first
  const collegesWithSerialNo = useMemo(() => 
    colleges.map((college, index) => ({
      ...college,
      permanentSerialNo: index + 1
    }))
  , [colleges]);

  const filteredColleges = useMemo(() => {
    if (!searchQuery) return collegesWithSerialNo;
    return collegesWithSerialNo.filter(college => 
      college.instituteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.selectedBranch.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [collegesWithSerialNo, searchQuery]);

  return (
    <View style={styles.modalContainer}>
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <CustomText style={styles.topBarTitle}>{title}</CustomText>
      </View>

      <View style={styles.searchBox}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={24} color="#666" />
          <CustomTextInput
            style={styles.searchInput}
            placeholder="Search by college or branch..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tableWrapper}>
        <View style={styles.header}>
          <CustomText style={[styles.headerCell, styles.serialNoCell]}>Sr.</CustomText>
          <CustomText style={[styles.headerCell, styles.collegeCell]}>College Name</CustomText>
          <CustomText style={[styles.headerCell, styles.branchCell]}>Branch Details</CustomText>
        </View>

        <FlatList
          data={filteredColleges}
          keyExtractor={(item, index) => `${item.instituteName}-${item.selectedBranchCode}`}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <CustomText style={[styles.cell, styles.serialNoCell]}>{item.permanentSerialNo}</CustomText>
              <View style={[styles.cell, styles.collegeCell]}>
                <CustomText style={styles.collegeName}>{item.instituteName}</CustomText>
              </View>
              <View style={[styles.cell, styles.branchCell]}>
                <CustomText style={styles.branchName}>{item.selectedBranch}</CustomText>
                <CustomText style={styles.branchCode}>{item.selectedBranchCode}</CustomText>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#333',
  },
  searchBox: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  tableWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#613EEA',
    padding: 16,
  },
  headerCell: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  cell: {
    justifyContent: 'center',
  },
  serialNoCell: {
    width: 50,
    textAlign: 'center',
  },
  collegeCell: {
    flex: 2,
    paddingHorizontal: 16,
  },
  branchCell: {
    flex: 1,
    paddingLeft: 16,
  },
  collegeName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  branchName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  branchCode: {
    fontSize: 12,
    color: '#666',
  },
});

export default ListDetails;
