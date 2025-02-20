import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

interface CollegeProps {
  college: {
    id: string;
    instituteName: string;
    city: string;
    image?: string;
  };
  onPress: (college: any) => void;
}

const CollegeCard = ({ college, onPress }: CollegeProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(college)}>
      <View style={styles.imageContainer}>
        <Image 
          source={college.image 
            ? { uri: college.image }
            : require('../../assets/CollegePlaceholder.png')
          }
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
        >
          <FontAwesome 
            name={isFavorite ? "heart" : "heart-o"} 
            size={24} 
            color={isFavorite ? "#FF0000" : "#000"} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.location}>{college.city}, Maharashtra</Text>
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
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 12, 
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    borderRadius: 8, 
    overflow: 'hidden',
    marginBottom: 8, // Added space between image and content
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8, // Added border radius to image itself
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,1)',
    padding: 8,
    borderRadius: 20,
  },
  contentContainer: {
    padding: 4, // Added light padding for text content
  },
  location: {
    color: '#613EEA',
    fontSize: 14,
    marginBottom: 5,
  },
  instituteName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});