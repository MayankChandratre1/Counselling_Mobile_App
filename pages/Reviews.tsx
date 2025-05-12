import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  TextInput
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import CustomText from '../components/General/CustomText';
import TopBar from '../components/General/TopBar';
import { FONTS } from '../styles/typography';
import { useEventsContext } from '../contexts/EventsContext';
import { Review } from '../contexts/EventsContext';

const { width } = Dimensions.get('window');

const ReviewCard = ({ review }: { review: Review }) => {
  // Format the date from timestamp
  const formatDate = (timestamp: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewNameContainer}>
          <CustomText style={styles.reviewName}>
            {review.firstName} {review.lastName}
          </CustomText>
        
        </View>
    
      </View>
      
      <View style={styles.collegeInfoContainer}>
        <View style={styles.collegeInfo}>
          <MaterialIcons name="school" size={16} color="#371981" />
          <CustomText style={styles.collegeText} numberOfLines={1}>
            {review.college}
          </CustomText>
        </View>
        <View style={styles.branchBadge}>
          <CustomText style={styles.branchText}>{review.branch}</CustomText>
        </View>
      </View>
      
      <CustomText style={styles.feedbackText}>
        "{review.feedback}"
      </CustomText>
      
     
    </View>
  );
};

const ReviewsPage = ({ navigation }: any) => {
  const { reviews, loading, refreshData } = useEventsContext();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter reviews based on search query
  const filteredReviews = reviews.filter(review => {
    const query = searchQuery.toLowerCase();
    return (
      review.firstName.toLowerCase().includes(query) ||
      review.lastName.toLowerCase().includes(query) ||
      review.college.toLowerCase().includes(query) ||
      review.branch.toLowerCase().includes(query) ||
      review.feedback.toLowerCase().includes(query)
    );
  });
  
  // Sort reviews - featured first, then by date
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    // Featured reviews first
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    
    // Then sort by timestamp (newest first)
    const dateA = new Date(a.timestamp || 0).getTime();
    const dateB = new Date(b.timestamp || 0).getTime();
    return dateB - dateA;
  });
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);
  
  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#371981" />
          <CustomText style={styles.loadingText}>Loading reviews...</CustomText>
        </View>
      );
    }
    
    if (sortedReviews.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="forum" size={60} color="#CCCCCC" />
          <CustomText style={styles.emptyTitle}>
            {searchQuery ? 'No matching reviews found' : 'No reviews yet'}
          </CustomText>
          <CustomText style={styles.emptyText}>
            {searchQuery 
              ? 'Try different search terms or clear the search'
              : 'Student reviews will appear here soon'}
          </CustomText>
        </View>
      );
    }
    
    return (
      <>
        <CustomText style={styles.resultCount}>
          {sortedReviews.length} {sortedReviews.length === 1 ? 'Review' : 'Reviews'}
        </CustomText>
        
        {sortedReviews.map((review, index) => (
          <ReviewCard key={review.id || index} review={review} />
        ))}
      </>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <TopBar heading="Student Reviews" />
      
      {/* <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reviews..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View> */}
      
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReviewsPage;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 30,
    paddingTop: 10,
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 40,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontFamily: FONTS.REGULAR,
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: FONTS.MEDIUM,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: FONTS.BOLD,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: FONTS.REGULAR,
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontFamily: FONTS.MEDIUM,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewNameContainer: {
    flex: 1,
  },
  reviewName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: FONTS.BOLD,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    fontFamily: FONTS.REGULAR,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  featuredText: {
    fontSize: 12,
    color: '#F57F17',
    marginLeft: 4,
    fontFamily: FONTS.MEDIUM,
  },
  collegeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  collegeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  collegeText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 6,
    fontFamily: FONTS.MEDIUM,
    flex: 1,
  },
  branchBadge: {
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  branchText: {
    fontSize: 12,
    color: '#371981',
    fontFamily: FONTS.MEDIUM,
  },
  feedbackText: {
    fontSize: 14,
    color: '#444',
    fontStyle: 'italic',
    lineHeight: 20,
    fontFamily: FONTS.REGULAR,
  },
  photoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  photoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontFamily: FONTS.REGULAR,
  },
});
