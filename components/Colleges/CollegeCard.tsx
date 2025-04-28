import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator 
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CollegeProps {
  college: {
    id: string;
    instituteName: string;
    city: string;
    image?: string;
    additionalMetadata?: any;
  };
  onPress: (college: any) => void;
}

const FAVORITES_STORAGE_KEY = 'favorite_colleges';

const CollegeCard = ({ college, onPress }: CollegeProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const windowWidth = Dimensions.get('window').width;
  
  // Adjust card width based on screen size
  const cardWidth = windowWidth > 600 ? 
    (windowWidth - 48) / 2 : // Tablet - 2 columns with margin
    windowWidth - 32; // Phone - 1 column with margin
  
  // Load favorite status from storage on component mount
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      try {
        const favoritesJson = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (favoritesJson) {
          const favorites = JSON.parse(favoritesJson);
          setIsFavorite(favorites.includes(college.id));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    
    loadFavoriteStatus();
  }, [college.id]);
  
  const toggleFavorite = async () => {
    try {
      const newFavoriteStatus = !isFavorite;
      setIsFavorite(newFavoriteStatus);
      
      // Get current favorites
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      let favorites = favoritesJson ? JSON.parse(favoritesJson) : [];
      
      // Update favorites list
      if (newFavoriteStatus) {
        favorites = [...favorites, college.id];
      } else {
        favorites = favorites.filter((id: string) => id !== college.id);
      }
      
      // Save updated favorites
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error updating favorites:', error);
      // Revert UI state if save failed
      setIsFavorite(!isFavorite);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { width: cardWidth }]} 
      onPress={() => onPress(college)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#613EEA" />
          </View>
        )}
        <Image
          source={
            college.image
              ? { uri: college.image }
              : require('../../assets/CollegePlaceholder.png')
          }
          style={styles.image}
          resizeMode="cover"
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
        <View style={styles.overlay}>
          {college.city && (
            <View style={styles.locationPill}>
              <FontAwesome name="map-marker" size={12} color="#fff" style={styles.locationIcon} />
              <Text style={styles.locationText}>
                {college.city.charAt(0).toUpperCase() + college.city.slice(1)}
              </Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite();
          }}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <FontAwesome
            name={isFavorite ? "heart" : "heart-o"}
            size={22}
            color={isFavorite ? "#FF3B30" : "#ff3b3066"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {college.additionalMetadata?.status && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {college.additionalMetadata.status}
            </Text>
          </View>
        )}
        
        <Text style={styles.instituteName} numberOfLines={2}>
          {college.instituteName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CollegeCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
    overflow: 'hidden',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.4)',
    padding: 8,
    borderRadius: 20,
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(97, 62, 234, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusContainer: {
    marginBottom: 8,
  },
  statusText: {
    color: '#613EEA',
    fontSize: 13,
    fontWeight: '500',
  },
  instituteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 22,
  },
});