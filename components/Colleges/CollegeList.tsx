import { StyleSheet, View, FlatList, ActivityIndicator, Text, TextInput, TouchableOpacity, Modal, ScrollView, Dimensions, Platform, SafeAreaView, StatusBar } from 'react-native'
import React, { useEffect, useState, useCallback, memo } from 'react'
import CollegeCard from './CollegeCard'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { cities } from '../../data/cities'
import { useCollegeContext } from '../../contexts/CollegeContext'

interface College {
  id: string;
  instituteName: string;
  city: string;
  branch?: string;
  image?: string;
  status?: string;
}

interface FilterOptions {
  city: string;
  branch: string;
  status: string;
}

const { width } = Dimensions.get('window');

const MemoizedCollegeCard = memo(({ college, onPress }: { college: College; onPress: () => void }) => (
  <CollegeCard college={college} onPress={onPress} />
));

// Memoized Filter Chip Component
const FilterChip = memo(({ label, selected, onPress }: { 
  label: string; 
  selected: boolean; 
  onPress: () => void 
}) => (
  <TouchableOpacity 
    style={[
      styles.filterChip,
      selected && styles.filterChipSelected
    ]}
    onPress={onPress}
  >
    <Text style={[
      styles.filterChipText,
      selected && styles.filterChipTextSelected
    ]}>
      {label}
    </Text>
    {selected && (
      <Icon name="check" size={16} color="#fff" style={styles.chipIcon} />
    )}
  </TouchableOpacity>
));

const CollegeList = ({ navigation }: any) => {
  const { 
    colleges, 
    isLoading, 
    error: contextError, 
    searchColleges, 
    filterColleges, 
    refreshColleges 
  } = useCollegeContext();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [displayedColleges, setDisplayedColleges] = useState<College[]>([]);
  
  // Filter related states
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({ city: '', branch: '', status: '' });
  const [availableCities] = useState<string[]>(cities);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // New states for city selection
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>(cities);

  useEffect(() => {
    // Update local loading state based on context
    setLoading(isLoading);
    if (contextError) {
      setError(contextError);
    }
  }, [isLoading, contextError]);
  
  useEffect(() => {
    // Update displayed colleges based on context data
    if (colleges.length > 0) {
      const pageSize = 10;
      const startIndex = 0;
      const endIndex = page * pageSize;
      const paginatedColleges = colleges.slice(startIndex, endIndex);
      
      setDisplayedColleges(paginatedColleges);
      setHasMore(colleges.length > endIndex);
      setLoading(false);
      setRefreshing(false);
    }
  }, [colleges, page]);

  // Filter cities based on search query
  useEffect(() => {
    if (citySearchQuery) {
      const filtered = cities.filter(
        city => city.toLowerCase().includes(citySearchQuery.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  }, [citySearchQuery]);

  const handleSearch = useCallback((pageNumber: number = 1, applyingFilters: boolean = false) => {
    setLoading(true);
    
    if (!applyingFilters && !searchQuery.trim()) {
      setIsSearchMode(false);
      setPage(1);
      setDisplayedColleges(colleges.slice(0, 10));
      setLoading(false);
      return;
    }
    
    try {
      // Use context searchColleges function
      let results = searchColleges(searchQuery);
      
      // Apply filters if present
      if (filters.city || filters.status) {
        const filterOptions: { city?: string; status?: string } = {};
        if (filters.city) filterOptions.city = filters.city;
        if (filters.status) filterOptions.status = filters.status;
        
        results = filterColleges(filterOptions).filter(college => 
          college.instituteName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setDisplayedColleges(results.slice(0, pageNumber * 5));
      setHasMore(results.length > pageNumber * 5);
      setIsSearchMode(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to search colleges');
      setLoading(false);
    }
  }, [searchQuery, filters, colleges, searchColleges, filterColleges]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setLastDocId(null);
    
    try {
      await refreshColleges();
      if (isSearchMode) {
        handleSearch(1);
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh colleges');
    }
  }, [isSearchMode, refreshColleges, handleSearch]);

  useEffect(() => {
    // Initial data fetch handled by context
  }, []);

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.city) count++;
    if (filters.branch) count++;
    if (filters.status) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  const applyFilters = useCallback(() => {
    setFilterModalVisible(false);
    setPage(1);
    setLastDocId(null);
    
    try {
      const filterOptions: { city?: string; status?: string } = {};
      if (filters.city) filterOptions.city = filters.city;
      if (filters.status) filterOptions.status = filters.status;
      
      let results = filterColleges(filterOptions);
      
      // Apply search query if in search mode
      if (isSearchMode && searchQuery) {
        results = results.filter(college => 
          college.instituteName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setDisplayedColleges(results.slice(0, 10));
      setHasMore(results.length > 10);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to apply filters');
      setLoading(false);
    }
  }, [filters, filterColleges, isSearchMode, searchQuery]);

  const clearFilters = useCallback(() => {
    setFilters({ city: '', branch: '', status: '' });
  }, []);

  const selectCity = useCallback((city: string) => {
    setCityModalVisible(false);
    setFilters(prev => ({
      ...prev,
      city: prev.city === city ? '' : city
    }));
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      console.log("Loading more colleges...");
      const nextPage = page + 1;
      setPage(nextPage);
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

  // Render city item for FlatList
  const renderCityItem = useCallback(({ item }: { item: string }) => (
    <TouchableOpacity 
      style={[
        styles.cityItem,
        filters.city === item && styles.cityItemSelected
      ]}
      onPress={() => selectCity(item)}
    >
      <Text style={[
        styles.cityItemText,
        filters.city === item && styles.cityItemTextSelected
      ]}>
        {item}
      </Text>
      {filters.city === item && (
        <Icon name="check" size={18} color="#fff" />
      )}
    </TouchableOpacity>
  ), [filters.city, selectCity]);

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
          onPress={async () => {
            setError(null);
            setLoading(true);
            try {
              await refreshColleges();
              setPage(1);
            } catch (err) {
              setError('Failed to fetch colleges');
            }
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
              placeholderTextColor={'#37198166'}
              placeholder="Search"
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text.length === 0) {
                  setIsSearchMode(false);
                  setPage(1);
                  setDisplayedColleges(colleges.slice(0, 10));
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
          data={displayedColleges}
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
            displayedColleges.length === 0 && styles.emptyList
          ]}
          numColumns={width > 600 ? 2 : 1}
          key={width > 600 ? 'two-column' : 'one-column'}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />

        {/* Main Filters Modal */}
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
                  <View style={styles.cityFilterContainer}>
                    {filters.city ? (
                      <View style={styles.selectedCityContainer}>
                        <Text style={styles.selectedCityText}>{filters.city}</Text>
                        <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, city: '' }))}>
                          <Icon name="close-circle" size={18} color="#666" />
                        </TouchableOpacity>
                      </View>
                    ) : null}
                    <TouchableOpacity 
                      style={styles.citySelector}
                      onPress={() => setCityModalVisible(true)}
                    >
                      <Text style={styles.citySelectorText}>
                        {filters.city ? 'Change City' : 'Select City'}
                      </Text>
                      <Icon name="chevron-right" size={20} color="#371981" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Status Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Status</Text>
                  <View style={styles.statusChipsContainer}>
                    {['All', 'Government', 'Un-Aided', 'Government-Aided', 'University Department'].map((status) => (
                      <FilterChip
                        key={status}
                        label={status}
                        selected={filters.status === status}
                        onPress={() => setFilters(prev => ({
                          ...prev,
                          status: prev.status === status ? '' : status
                        }))}
                      />
                    ))}
                  </View>
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

        {/* City Selection Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={cityModalVisible}
          onRequestClose={() => setCityModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select City</Text>
                <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.citySearchContainer}>
                <Icon name="magnify" size={20} color="#666" style={styles.citySearchIcon} />
                <TextInput
                  style={styles.citySearchInput}
                  placeholder="Search cities..."
                  value={citySearchQuery}
                  onChangeText={setCitySearchQuery}
                  autoFocus={true}
                  clearButtonMode="while-editing"
                />
              </View>
              
              <FlatList
                data={filteredCities}
                renderItem={renderCityItem}
                keyExtractor={item => item}
                style={styles.cityList}
                initialNumToRender={15}
                windowSize={5}
                maxToRenderPerBatch={10}
                removeClippedSubviews={true}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={() => (
                  <View style={styles.emptyCityList}>
                    <Text style={styles.emptyCityText}>No cities found</Text>
                  </View>
                )}
              />
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
    paddingTop:0,
  },
  container: {
    flex: 1,

  },
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    paddingBottom: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    paddingHorizontal: 16,
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
    padding: 0,
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
  cityFilterContainer: {
    marginBottom: 8,
  },
  selectedCityContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectedCityText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  citySelector: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  citySelectorText: {
    fontSize: 15,
    color: '#371981',
    fontWeight: '500',
  },
  statusChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  // City selection modal specific styles
  citySearchContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  citySearchIcon: {
    marginRight: 8,
  },
  citySearchInput: {
    flex: 1,
    fontSize: 16,
    padding: 8,
  },
  cityList: {
    maxHeight: '70%',
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  cityItemSelected: {
    backgroundColor: '#371981',
  },
  cityItemText: {
    fontSize: 16,
    color: '#333',
  },
  cityItemTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyCityList: {
    padding: 20,
    alignItems: 'center',
  },
  emptyCityText: {
    fontSize: 16,
    color: '#888',
  },
});