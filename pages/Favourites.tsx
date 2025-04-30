import { 
  StyleSheet, 
  View, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar 
} from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { getUserFavorites } from '../utils/storage'
import { useCollegeContext } from '../contexts/CollegeContext'
import CollegeCard from '../components/Colleges/CollegeCard'
import CustomText from '../components/General/CustomText'
import TopBar from '../components/General/TopBar'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

const { width, height } = Dimensions.get('window');

const Favourites = ({ navigation }: any) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { getCollegeById } = useCollegeContext();

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const ids = await getUserFavorites();
      setFavoriteIds(ids || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  // Get college objects from IDs
  const favoriteColleges = favoriteIds
    .map(id => getCollegeById(id))
    .filter(Boolean); // Filter out any null values

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, []);

  const navigateToCollegeDetails = (college: any) => {
    navigation.navigate('CollegeDetails', { collegeId: college.id });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome name="heart-o" size={80} color="#ddd" />
      <CustomText style={styles.emptyText}>
        You haven't added any colleges to your favorites yet
      </CustomText>
      <TouchableOpacity 
        style={styles.browseButton}
        onPress={() => navigation.navigate({
          name: 'Home',
          params: { screen: 'Browse' },
        })}
      >
        <CustomText style={styles.browseButtonText}>Browse Colleges</CustomText>
        <MaterialIcons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <TopBar heading="Favorite Colleges" />

      <View style={styles.content}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#371981" />
            <CustomText style={styles.loadingText}>Loading favorites...</CustomText>
          </View>
        ) : favoriteColleges.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={favoriteColleges}
            keyExtractor={(item) => item?.id! }
            renderItem={({ item }) => (
              <CollegeCard 
                college={item!} 
                onPress={() => navigateToCollegeDetails(item)} 
              />
            )}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh} 
                colors={["#371981"]}
              />
            }
          />
        )}
      </View>
      
      {favoriteColleges.length > 0 && (
        <View style={styles.footer}>
          <CustomText style={styles.footerText}>
            {favoriteColleges.length} {favoriteColleges.length === 1 ? 'college' : 'colleges'} in your favorites
          </CustomText>
        </View>
      )}
    </View>
  );
};

export default Favourites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    lineHeight: 26,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#371981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  browseButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
});