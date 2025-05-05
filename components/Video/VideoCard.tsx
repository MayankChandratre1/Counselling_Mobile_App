import { StyleSheet, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../General/CustomText';

interface VideoCardProps {
  thumbnail?: string | any;
  title: string;
  subtitle?: string;
  link?: string;
  onPress: () => void;
  duration?: string;
}

const { width } = Dimensions.get('window');
const cardWidth = width - 32; // Full width minus padding

const VideoCard = ({ thumbnail, title, subtitle, link, onPress, duration }: VideoCardProps) => {
  const [vidId, setVidId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (link) {
      // Extract video ID from the link
      const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = link.match(regex);
      if (match && match[1]) {
        setVidId(match[1]);
      } else {
        setVidId(null);
      }
    }
  }, [link]);

  // Calculate video duration display
  const formattedDuration = duration || '3:45';

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.thumbnailContainer}>
        {isLoading && (
          <View style={styles.placeholderContainer}>
            <MaterialIcons name="ondemand-video" size={32} color="#ddd" />
          </View>
        )}
        <Image
          source={
            vidId 
              ? { uri: `https://img.youtube.com/vi/${vidId}/hqdefault.jpg` }
              : typeof thumbnail === 'string' 
                ? { uri: thumbnail }
                : thumbnail || require('../../assets/CollegePlaceholder2.png')
          }
          style={styles.thumbnail}
          resizeMode="cover"
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => setHasError(true)}
        />
        
        <View style={styles.playButtonContainer}>
          <View style={styles.playButton}>
            <Icon name="play" size={24} color="#fff" />
          </View>
        </View>
        
        {formattedDuration && (
          <View style={styles.durationContainer}>
            <CustomText style={styles.durationText}>{formattedDuration}</CustomText>
          </View>
        )}
      </View>
      
      <View style={styles.textContainer}>
        <CustomText 
          style={styles.title}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {title}
        </CustomText>
        
        {subtitle && (
          <CustomText 
            style={styles.subtitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </CustomText>
        )}
        
        <View style={styles.sourceContainer}>
          <Icon name="logo-youtube" size={16} color="#FF0000" />
          <CustomText style={styles.sourceText}>YouTube</CustomText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default VideoCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  placeholderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(55, 25, 129, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4, // Slight adjustment for the play icon
  },
  durationContainer: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  textContainer: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sourceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});
