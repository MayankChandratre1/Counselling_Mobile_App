import { StyleSheet, Text, View, FlatList, TextInput, Dimensions, TouchableOpacity } from 'react-native'
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useNavigation } from '@react-navigation/native'
import CustomText from '../General/CustomText'
import { getUserData } from '../../utils/storage'
import { useCollegeContext } from '../../contexts/CollegeContext'

interface College {
  id: string;
  selectedBranchCode: string;
}

interface ListDetailsProps {
  title: string;
  colleges: College[]; // Array of objects with id and selectedBranchCode
  fullScreen?: boolean;
}

const ListDetails = ({ title, colleges, fullScreen = false }: ListDetailsProps) => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const { getCollegeById } = useCollegeContext();
  const [collegeData, setCollegeData] = useState<any[]>([]);
  
  // Fetch college data when component mounts
  useEffect(() => {
    // Map through college IDs and get full college data with branch information
    const fetchedColleges = colleges.map((collegeItem, index) => {
      const college = getCollegeById(collegeItem.id);
      
      if (!college) return null;
      
      // Find the branch data using selectedBranchCode
      const branch = college.branches?.find(
        (b: any) => b.branchCode === collegeItem.selectedBranchCode
      );
      
      return {
        ...college,
        permanentSerialNo: index + 1,
        selectedBranchCode: collegeItem.selectedBranchCode,
        selectedBranchName: branch?.branchName || 'Unknown Branch'
      };
    }).filter(Boolean); // Filter out any null results
    
    setCollegeData(fetchedColleges);
  }, [colleges, getCollegeById]);

  const filteredColleges = useMemo(() => {
    if (!searchQuery) return collegeData;
    return collegeData.filter(college => 
      college.instituteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.selectedBranchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.selectedBranchCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [collegeData, searchQuery]);

  // Adjust styles based on whether in full-screen mode or not
  const containerStyle = fullScreen 
    ? styles.fullScreenContainer
    : styles.modalContainer;

    const getFeesLevel = (fees: number) => {
      if (fees > 5_00_000) return {
        label: "High Fees",
        color: "#D9534F", // Soft red (Bootstrap's muted danger)
      };
      if (fees < 3_00_000) return {
        label: "Low Fees",
        color: "#5CB85C", // Soft green (Bootstrap's muted success)
      };
      return {
        label: "Medium Fees",
        color: "#F0AD4E", // Soft orange (Bootstrap's muted warning)
      };
    };
    

  const getShortenAutonomyStatus = (status: string) => {
    if (status === "Autonomous") return "A";
    if (status === "Non-Autonomous") return "NA";
    return status;
  }

  return (
    <View style={containerStyle}>
      {!fullScreen && (
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <CustomText style={styles.topBarTitle}>{title}</CustomText>
        </View>
      )}

      <View style={styles.searchBox}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={24} color="#666" />
          <TextInput
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

      <View style={[
        styles.tableWrapper,
        fullScreen && styles.fullScreenTableWrapper
      ]}>
        <View style={styles.header}>
          <CustomText style={[styles.headerCell, styles.serialNoCell]}>Sr.</CustomText>
          <CustomText style={[styles.headerCell, styles.collegeCell]}>College Name</CustomText>
          <CustomText style={[styles.headerCell, styles.branchCell]}>Branch Details</CustomText>
        </View>

        <FlatList
          data={filteredColleges}
          keyExtractor={(item) => `${item.id}_${item.selectedBranchCode}`}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.row}
            >
              <CustomText style={[styles.cell, styles.serialNoCell]}>{item.permanentSerialNo}</CustomText>
              <View style={[styles.cell, styles.collegeCell]}>
                <CustomText style={styles.collegeName}>{item.instituteName}</CustomText>
                <View style={styles.collegeStatusContainer}>
                  {
                    item.additionalMetadata.status && (<View style={styles.categoryPill}>
                      <CustomText style={styles.categoryText}>{item.additionalMetadata.status}</CustomText>
                  </View>)
                  }
                  {
                    item.additionalMetadata.autonomyStatus && (<View style={styles.categoryPill}>
                      <CustomText style={styles.categoryText}>{getShortenAutonomyStatus(item.additionalMetadata.autonomyStatus)}</CustomText>
                  </View>)
                  }
                  {
                    item.additionalMetadata.fees && (<View style={[styles.categoryPill,{
                      backgroundColor: getFeesLevel(item.additionalMetadata.fees).color,
                      paddingVertical: 2,
                      paddingHorizontal: 8,
                      borderRadius: 12,
                    }]}>
                      <CustomText style={styles.categoryText}>{getFeesLevel(item.additionalMetadata.fees).label}</CustomText>
                  </View>)
                  }

                  
                
                </View>
              </View>
              <View style={[styles.cell, styles.branchCell]}>
                <CustomText style={styles.branchName}>{item.selectedBranchName}</CustomText>
                <CustomText style={styles.branchCode}>{item.selectedBranchCode}</CustomText>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="alert-circle-outline" size={48} color="#ddd" />
              <CustomText style={styles.emptyText}>
                {searchQuery ? "No matching colleges found" : "No colleges in this list"}
              </CustomText>
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
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  fullScreenTableWrapper: {
    marginVertical: 0,
    marginHorizontal: 0,
    borderRadius: 0,
    elevation: 0,
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
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 1,
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
  collegeStatusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  categoryPill: {
    backgroundColor: 'rgba(55, 25, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    color: '#371981',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ListDetails;
