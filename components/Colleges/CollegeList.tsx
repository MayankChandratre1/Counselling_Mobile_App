import { StyleSheet, View, FlatList, ActivityIndicator, Text, TextInput, TouchableOpacity, Modal, ScrollView, Dimensions, Platform, SafeAreaView, StatusBar } from 'react-native'
import React, { useEffect, useState, useCallback, memo } from 'react'
import CollegeCard from './CollegeCard'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import config from '../../configs/API'
import CustomTextInput from '../General/CustomTextInput'
import { cities } from '../../data/cities'

interface College {
  id: string;
  instituteName: string;
  city: string;
  branch?: string;
  image?: string;
}

interface FilterOptions {
  city: string;
  branch: string;
  status: string;
}

const { COLLEGE_API } = config;
const { width } = Dimensions.get('window');

const MemoizedCollegeCard = memo(({ college, onPress }: { college: College; onPress: () => void }) => (
  <CollegeCard college={college} onPress={onPress} />
));

const CollegeList = ({ navigation }: any) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter related states
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({ city: '', branch: '',status:'' });
  const [availableCities, setAvailableCities] = useState<string[]>(cities);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const fetchColleges = async (pageNumber: number, refresh = false) => {
    try {
      // Build query parameters including filters
      let queryParams = `page=${pageNumber}&limit=10`;
      
      if (lastDocId && !refresh) {
        queryParams += `&lastDocId=${lastDocId}`;
      }
      
      if (filters.city) {
        queryParams += `&city=${encodeURIComponent(filters.city)}`;
      }
      
      if (filters.branch) {
        queryParams += `&branch=${encodeURIComponent(filters.branch)}`;
      }
      
      const response = await fetch(`${COLLEGE_API}/colleges?${queryParams}`);
      const data = await response.json();
      
      if (data.colleges.length < 10) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
      if (pageNumber === 1 || refresh) {
        setColleges(data.colleges || []);
      } else {
        if (data.colleges.length > 0) {
          setColleges(prev => [...prev, ...data.colleges]);
        }
      }

      setLastDocId(data.nextPageId);
      
      
      
 
      
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch colleges');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async (pageNumber: number = 1, applyingFilters:boolean = false) => {
    if (!applyingFilters && !searchQuery.trim()) {
      setIsSearchMode(false);
      setPage(1);
      fetchColleges(1, true);
      return;
    }

    setLoading(true);
    try {
      // Include filters in search query
      let queryParams = `instituteName=${encodeURIComponent(searchQuery)}&page=${pageNumber}&limit=5`;
      
      if (filters.city) {
        queryParams += `&city=${encodeURIComponent(filters.city.toLowerCase())}`;
      }
      if(filters.status){
        queryParams += `&status=${encodeURIComponent(filters.status)}`;
      }      
      console.log("Query Params: ",queryParams);
      
      const response = await fetch(`${COLLEGE_API}/colleges/search?${queryParams}`);
      const data = await response.json();
      console.log("Search Results: ",data);
      
      
      if (data.colleges.length < 5) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (pageNumber === 1) {
        setColleges(data.colleges || []);
      } else {
        if (data.colleges.length > 0) {
          setColleges(prev => [...prev, ...data.colleges]);
        }
      }

      setIsSearchMode(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to search colleges');
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setLastDocId(null);
    if (true) {
      handleSearch(1);
    }
  }, [isSearchMode]);

  useEffect(() => {
    fetchColleges(1);
  }, []);

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.city) count++;
    if (filters.branch) count++;
    if (filters.status) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  const applyFilters = () => {
    setFilterModalVisible(false);
    setPage(1);
    setLastDocId(null);
    handleSearch(1, true);
  };

  const clearFilters = () => {
    setFilters({ city: '', branch: '', status: '' });
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      console.log("Loading more colleges...");
      const nextPage = page + 1;
      setPage(nextPage);
      if (isSearchMode) {
        handleSearch(nextPage, true);
      }else{
        fetchColleges(nextPage);
      }
    }
  };

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#371981" />
      </View>
    );
  };

  const renderEmptyList = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Icon name="school-outline" size={60} color="#CCCCCC" />
        <Text style={styles.emptyText}>No colleges found</Text>
        <Text style={styles.emptySubText}>
          {isSearchMode ? "Try a different search term or clear filters" : "Please check back later"}
        </Text>
      </View>
    );
  };

  if (loading && page === 1 && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#371981" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            setError(null);
            setLoading(true);
            fetchColleges(1, true);
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#371981" barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, {color: '#371981'}]}
              placeholderTextColor={'#371981'}
              placeholder="Search colleges..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.length === 0) {
                  setIsSearchMode(false);
                  setPage(1);
                  fetchColleges(1, true);
                }
              }}
            />
            <TouchableOpacity 
              onPress={() => {
                setPage(1);
                handleSearch(1);
              }} 
              style={styles.iconButton}
            >
              <Icon name="magnify" size={22} color="#371981" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setFilterModalVisible(true)} 
              style={[
                styles.iconButton,
                activeFiltersCount > 0 && styles.activeFilterButton
              ]}
            >
              <Icon name="filter-variant" size={22} color={activeFiltersCount > 0 ? "#fff" : "#371981"} />
              {activeFiltersCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <FlatList
          data={colleges}
          renderItem={({ item }) => (
            <MemoizedCollegeCard
              college={item}
              onPress={() => navigation.navigate('CollegeDetails', { 
                collegeId: item.id, 
                instituteName: item.instituteName, 
                city: item.city,
                branch: item.branch
              })}
            />
          )}
          keyExtractor={item => item.id}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={[
            styles.list,
            colleges.length === 0 && styles.emptyList
          ]}
          numColumns={width > 600 ? 2 : 1}
          key={width > 600 ? 'two-column' : 'one-column'}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />

        {/* Filters Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={filterModalVisible}
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filters</Text>
                <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalContent}>
                {/* City Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>City</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterChipsContainer}
                  >
                    {availableCities.map((city) => (
                      <TouchableOpacity 
                        key={city}
                        style={[
                          styles.filterChip,
                          filters.city === city && styles.filterChipSelected
                        ]}
                        onPress={() => setFilters(prev => ({
                          ...prev,
                          city: prev.city === city ? '' : city
                        }))}
                      >
                        <Text style={[
                          styles.filterChipText,
                          filters.city === city && styles.filterChipTextSelected
                        ]}>
                          {city}
                        </Text>
                        {filters.city === city && (
                          <Icon name="check" size={16} color="#fff" style={styles.chipIcon} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                {/* Status Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Status</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterChipsContainer}
                  >
                    {['All', 'Government', 'Un-Aided', 'Government-Aided', 'University Department'].map((status) => (
                      <TouchableOpacity 
                        key={status}
                        style={[
                          styles.filterChip,
                          filters.status === status && styles.filterChipSelected
                        ]}
                        onPress={() => setFilters(prev => ({
                          ...prev,
                          status: prev.status === status ? '' : status
                        }))}
                      >
                        <Text style={[
                          styles.filterChipText,
                          filters.status === status && styles.filterChipTextSelected
                        ]}>
                          {status}
                        </Text>
                        {filters.status === status && (
                          <Icon name="check" size={16} color="#fff" style={styles.chipIcon} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
              </ScrollView>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.clearButton} 
                  onPress={clearFilters}
                >
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={applyFilters}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

export default CollegeList;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    backgroundColor: '#f9f9f9',
    fontSize: 15,
  },
  iconButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginLeft: 6,
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#371981',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  list: {
    padding: 8,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  error: {
    color: '#d32f2f',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  retryButton: {
    backgroundColor: '#371981',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    maxHeight: '60%',
  },
  filterSection: {
    marginVertical: 12,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    paddingVertical: 5,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipSelected: {
    backgroundColor: '#371981',
  },
  filterChipText: {
    fontSize: 14,
    color: '#555',
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  chipIcon: {
    marginLeft: 5,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 14,
  },
  applyButton: {
    backgroundColor: '#371981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});