import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator,
  Platform 
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getUserFavorites, addUserFavoirites, removeUserFavoirites } from "../../utils/storage";

interface CollegeProps {
  college: {
    id: string;
    instituteName: string;
    city: string;
    image?: string;
    additionalMetadata?: {
      status?: string;
      rating?: number;
      programs?: number;
    };
  };
  onPress: (college: any) => void;
  hideFav?: boolean;
}

const CollegeCard = ({ college, onPress, hideFav }: CollegeProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  // Responsive sizing
  const { width: windowWidth } = Dimensions.get('window');
  const isTablet = windowWidth > 768;
  const isLargePhone = windowWidth > 414 && windowWidth <= 768;
  
  // Dynamic card width calculation
  const getCardWidth = () => {
    if (isTablet) {
      return (windowWidth - 64) / 3; // 3 columns on tablets
    } else if (isLargePhone) {
      return (windowWidth - 48) / 2; // 2 columns on large phones
    }
    return windowWidth - 32; // 1 column on small phones
  };
  
  const cardWidth = getCardWidth();
  
  // Load favorites
  useEffect(() => {
    loadFavoriteStatus();
  }, [college.id]);
  
  const loadFavoriteStatus = async () => {
    try {
      const favorites = await getUserFavorites();
      if (favorites) {
        setIsFavorite(favorites.includes(college.id));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };
  
  const toggleFavorite = useCallback(async () => {
    try {
      if (isFavorite) {
        await removeUserFavoirites(college.id);
      } else {
        await addUserFavoirites(college.id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorites:', error);
      // Revert UI state if save failed
      setIsFavorite(isFavorite);
    }
  }, [isFavorite, college.id]);

  // Render stars for ratings if available
  const renderRatingStars = () => {
    if (!college.additionalMetadata?.rating) return null;
    
    const rating = college.additionalMetadata.rating;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const iconName = i <= rating ? "star" : "star-o";
      stars.push(
        <FontAwesome 
          key={i} 
          name={iconName} 
          size={12} 
          color={i <= rating ? "#FFD700" : "#CCCCCC"} 
          style={{ marginRight: i < 5 ? 2 : 0 }}
        />
      );
    }
    
    return (
      <View style={styles.ratingContainer}>
        {stars}
      </View>
    );
  };

  return (
    <View style={[styles.cardContainer, { width: cardWidth }]}>
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => onPress(college)}
        activeOpacity={0.9}
        accessible={true}
        accessibilityLabel={`College card for ${college.instituteName}`}
        accessibilityRole="button"
        accessibilityHint="Opens detailed information about this college"
      >
        <View style={styles.imageContainer}>
          {imageLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#613EEA" />
            </View>
          )}
          
          <Image
            source={
              college.image && !imageError
                ? { uri: college.image }
                : require('../../assets/CollegePlaceholder.png')
            }
            style={styles.image}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageError(true)}
          />
          
          {/* Darkened overlay for better text visibility */}
          <View style={styles.gradientOverlay} />
          
          <View style={styles.overlay}>
            {college.city && (
              <View style={styles.locationPill}>
                <FontAwesome name="map-marker" size={12} color="#fff" style={styles.locationIcon} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {college.city.charAt(0).toUpperCase() + college.city.slice(1)}
                </Text>
              </View>
            )}
            
            {college.additionalMetadata?.programs && (
              <View style={styles.programsPill}>
                <FontAwesome name="graduation-cap" size={12} color="#fff" style={styles.programsIcon} />
                <Text style={styles.programsText}>
                  {college.additionalMetadata.programs} Programs
                </Text>
              </View>
            )}
          </View>
          
          {!hideFav && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite();
              }}
              hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
              accessible={true}
              accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
              accessibilityRole="button"
            >
              <FontAwesome
                name={isFavorite ? "heart" : "heart-o"}
                size={22}
                color={isFavorite ? "#FF3B30" : "rgba(255, 59, 48, 0.7)"}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.instituteName} numberOfLines={2}>
            {college.instituteName}
          </Text>
          
          <View style={styles.metadataContainer}>
            {college.additionalMetadata?.status && (
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>
                  {college.additionalMetadata.status}
                </Text>
              </View>
            )}
            
            {renderRatingStars()}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(CollegeCard);

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 12,
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6E1FF',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,  // Slightly taller for better visual appeal
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
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    backgroundColor: 'rgba(0,0,0,0.0)', // Creates a darkened effect from bottom to top
  },
  overlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
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
    backgroundColor: 'rgba(97, 62, 234, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: '70%',
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  programsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  programsIcon: {
    marginRight: 4,
  },
  programsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  statusPill: {
    backgroundColor: 'rgba(97, 62, 234, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
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
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
});