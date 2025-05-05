import { 
  StyleSheet, 
  View, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
  ScrollView
} from 'react-native'
import React, { useState, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useEventsContext } from '../contexts/EventsContext'
import TopBar from '../components/General/TopBar'
import CustomText from '../components/General/CustomText'
import Icon from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const { width } = Dimensions.get('window');

const typesMap = {
  video: { 
    icon: 'youtube', 
    color: '#FF0000',
    label: 'Video'
  },
  news: { 
    icon: 'newspaper', 
    color: '#2196F3',
    label: 'News'
  },
  event: { 
    icon: 'calendar-star', 
    color: '#4CAF50',
    label: 'Event'
  }
};

const AllUpdates = () => {
  const navigation = useNavigation<any>();
  const { updates, loading, error, refreshData } = useEventsContext();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Filter updates based on search query and selected type
  const filteredUpdates = updates.filter(update => {
    const matchesSearch = searchQuery === '' || 
      update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (update.subtitle && update.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesType = selectedType === null || update.type === selectedType;
    
    return matchesSearch && matchesType;
  });
  
  // Get all available update types
  const updateTypes = Array.from(new Set(updates.map(update => update.type)));
  
  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);
  
  // Handle update press - navigate or open URL
  const handleUpdatePress = (update: any) => {
    if (update.type === 'video' && update.link) {
      Linking.openURL(update.link).catch(err => {
        console.error("Couldn't open link: ", err);
      });
    } else if (update.type === 'event' && update.eventId) {
      navigation.navigate('EventDetails', { eventId: update.eventId });
    }
  };

  // Render a single update card
  const renderUpdateCard = ({ item }: { item: any }) => {
    const typeInfo = typesMap[item.type as keyof typeof typesMap] || { 
      icon: 'information-outline', 
      color: '#9C27B0',
      label: 'Update'
    };
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => handleUpdatePress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: "#ddd" }]}>
            <MaterialCommunityIcons name={typeInfo.icon} size={16} color="#fff" />
            <CustomText style={styles.typeBadgeText}>{typeInfo.label}</CustomText>
          </View>
          <CustomText style={styles.dateText}>{item.date}</CustomText>
        </View>
        
        <View style={styles.cardBody}>
          {item.thumbnail && item.thumbnail.length > 0 ? (
            <Image 
              source={{ uri: item.thumbnail }} 
              style={styles.thumbnail}
              
            />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialCommunityIcons name={typeInfo.icon} size={32} color="#ddd" />
            </View>
          )}
          
          <View style={styles.textContainer}>
            <CustomText 
              style={styles.title} 
              numberOfLines={2}
            >
              {item.title}
            </CustomText>
            
            {item.subtitle && (
              <CustomText 
                style={styles.subtitle}
                numberOfLines={1} 
              >
                {item.subtitle}
              </CustomText>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <TopBar heading="All Updates" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#371981" />
          <CustomText style={styles.loadingText}>Loading updates...</CustomText>
        </View>
      </View>
    );
  }
  
  // Render error state
  if (error && !refreshing) {
    return (
      <View style={styles.container}>
        <TopBar heading="All Updates" />
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color="#FF6B6B" />
          <CustomText style={styles.errorText}>{error}</CustomText>
          <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
            <CustomText style={styles.retryText}>Retry</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar heading="All Updates" />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={24} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search updates..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {/* Type filter chips */}
      {updateTypes.length > 0 && (
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
            contentContainerStyle={styles.filters}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedType === null && styles.selectedFilterChip
              ]}
              onPress={() => setSelectedType(null)}
            >
              <CustomText 
                style={[
                  styles.filterChipText,
                  selectedType === null && styles.selectedFilterChipText
                ]}
              >
                All
              </CustomText>
            </TouchableOpacity>
            
            {updateTypes.map(type => {
              const typeInfo = typesMap[type as keyof typeof typesMap] || { 
                icon: 'information-outline', 
                color: '#9C27B0',
                label: 'Update'
              };
              
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    selectedType === type && styles.selectedFilterChip,
                    selectedType === type && { backgroundColor: typeInfo.color + '20' }
                  ]}
                  onPress={() => setSelectedType(selectedType === type ? null : type)}
                >
                  <MaterialCommunityIcons 
                    name={typeInfo.icon}
                    size={16} 
                    color={selectedType === type ? typeInfo.color : '#666'} 
                    style={styles.filterIcon}
                  />
                  <CustomText 
                    style={[
                      styles.filterChipText,
                      selectedType === type && { color: typeInfo.color }
                    ]}
                  >
                    {typeInfo.label}
                  </CustomText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
      
      <FlatList
        data={filteredUpdates}
        keyExtractor={item => item.id}
        renderItem={renderUpdateCard}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="newspaper-variant-outline" size={64} color="#ccc" />
            <CustomText style={styles.emptyText}>
              {searchQuery 
                ? "No updates match your search" 
                : "No updates available"}
            </CustomText>
          </View>
        )}
      />
    </View>
  )
}

export default AllUpdates

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
  },
  filtersScroll: {
    paddingVertical: 4,
  },
  filters: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  selectedFilterChip: {
    backgroundColor: '#371981',
  },
  filterIcon: {
    marginRight: 4,
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  selectedFilterChipText: {
    color: '#fff',
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  cardBody: {
    flexDirection: 'row',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#371981',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  }
})