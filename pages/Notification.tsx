import { StyleSheet, View, ScrollView, Linking } from 'react-native'
import React from 'react'
import TopBar from '../components/General/TopBar'
import VideoCard from '../components/Video/VideoCard'
import { videos } from '../data/videos'

import  Icon from 'react-native-vector-icons/FontAwesome6'

const Notification = () => {
  const handleVideoPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <TopBar heading="Latest Videos" />
      <ScrollView style={styles.content}>
        {videos.map(video => (
          <VideoCard
            key={video.id}
            thumbnail={video.thumbnail}
            title={video.title}
            onPress={() => handleVideoPress(video.url)}
          />
        ))}
      <Icon name="crown" size={32} color="#0000" />
      </ScrollView>
    </View>
  )
}

export default Notification

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});