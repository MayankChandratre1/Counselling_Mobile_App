import { StyleSheet, View, ScrollView, Linking, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native'
import React, { useState, useCallback } from 'react'
import TopBar from '../components/General/TopBar'
import VideoCard from '../components/Video/VideoCard'
import Icon from 'react-native-vector-icons/FontAwesome6'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useEventsContext } from '../contexts/EventsContext'
import CustomText from '../components/General/CustomText'

const Notification = () => {
  const { updates, loading, error, refreshData } = useEventsContext();
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter updates to only show videos
  const videos = updates.filter(update => update.type === 'video');

  const handleVideoPress = (url: string) => {
    Linking.openURL(url);
  };
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <CustomText style={styles.headerTitle}>Latest Videos</CustomText>
      <CustomText style={styles.headerSubtitle}>
        Watch our newest educational content
      </CustomText>
    </View>
  );

  return (
    <View style={styles.container}>
      <TopBar heading="Video Center" />
      
      {renderHeader()}
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#613EEA" />
            <CustomText style={styles.loadingText}>Loading videos...</CustomText>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="exclamation-circle" size={48} color="#FF6B6B" />
            <CustomText style={styles.errorText}>{error}</CustomText>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <CustomText style={styles.retryText}>Retry</CustomText>
              <MaterialIcons name="refresh" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : videos.length > 0 ? (
          <View style={styles.videosContainer}>
            {videos.map(video => (
              <VideoCard
                key={video.id}
                thumbnail={video.thumbnail || require('../assets/CollegePlaceholder2.png')}
                title={video.title}
                subtitle={video.subtitle || ''}
                link={video.link || ''}
                onPress={() => video.link && handleVideoPress(video.link)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="video-slash" size={48} color="#ccc" />
            <CustomText style={styles.emptyText}>
              No videos available at the moment
            </CustomText>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default Notification

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  headerSection: {
    backgroundColor: '#371981',
    padding: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  videosContainer: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 12,
    marginBottom: 20,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#613EEA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '500',
  },
});