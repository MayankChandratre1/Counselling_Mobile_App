import { 
  StyleSheet, 
  View, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Dimensions
} from 'react-native'
import React, { useState, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useEventsContext } from '../contexts/EventsContext'
import EventCard from '../components/Events/EventCard'
import TopBar from '../components/General/TopBar'
import CustomText from '../components/General/CustomText'
import Icon from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

const { width } = Dimensions.get('window');

const AllEvents = () => {
  const navigation = useNavigation<any>();
  const { events, loading, error, refreshData } = useEventsContext();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter events based on search query
  const filteredEvents = events.filter(event => 
    searchQuery === '' || 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);
  
  // Navigate to event details
  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  };
  
  // Render loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <TopBar heading="All Events" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#371981" />
          <CustomText style={styles.loadingText}>Loading events...</CustomText>
        </View>
      </View>
    );
  }
  
  // Render error state
  if (error && !refreshing) {
    return (
      <View style={styles.container}>
        <TopBar heading="All Events" />
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
      <TopBar heading="All Events" />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={24} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
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
      
      <FlatList
        data={filteredEvents}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <EventCard 
            event={item} 
            onPress={() => handleEventPress(item.id)} 
          />
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="event-busy" size={64} color="#ccc" />
            <CustomText style={styles.emptyText}>
              {searchQuery 
                ? "No events match your search" 
                : "No upcoming events available"}
            </CustomText>
          </View>
        )}
      />
    </View>
  )
}

export default AllEvents

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
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
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