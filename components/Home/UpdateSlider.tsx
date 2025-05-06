import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  Dimensions,
  ActivityIndicator
} from 'react-native'
import React from 'react'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import CustomText from '../General/CustomText'
import { Update } from '../../contexts/EventsContext'

const { width } = Dimensions.get('window');

interface UpdateCardProps {
  update: Update;
  onPress?: () => void;
}

const getCardColor = (type: Update['type']) => {
  switch (type) {
    case 'video':
      return '#371981'; // Primary Sarathi color
    case 'news':
      return '#0066cc'; // Blue
    case 'event':
      return '#00884b'; // Green
    default:
      return '#371981';
  }
};

const getCardIcon = (type: Update['type']) => {
  switch (type) {
    case 'video':
      return "play-circle-o";
    case 'news':
      return "newspaper-o";
    case 'event':
      return "calendar";
    default:
      return "bell";
  }
};

const UpdateCard: React.FC<UpdateCardProps> = ({ update, onPress }) => {
  const cardColor = getCardColor(update.type);
  const cardIcon = getCardIcon(update.type);
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (update.link) {
      Linking.openURL(update.link);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: cardColor }]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.cardDateRow}>
        <FontAwesome name={cardIcon} size={14} color="#fff" style={{ opacity: 0.9 }} />
        <Text style={styles.cardDate}>{update.date}</Text>
      </View>
      
      <Text style={styles.cardTitle}>{update.title}</Text>
      <Text style={styles.cardSubtitle}>{update.subtitle.length > 19 ? `${update.subtitle.substring(0,19)}...`:update.subtitle}</Text>
      
      {update.link && (
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => Linking.openURL(update.link!)}
        >
          <Text style={styles.linkText}>View Now</Text>
          <FontAwesome name="external-link" size={14} color="#613EEA" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

interface UpdateSliderProps {
  updates: Update[];
  navigation?: any;
  loading?: boolean;
}

const UpdateSlider: React.FC<UpdateSliderProps> = ({ updates = [], navigation, loading = false }) => {
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#371981" />
      </View>
    );
  }

  if (updates.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <CustomText style={styles.emptyText}>No updates available</CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <CustomText style={styles.sectionTitle}>Important Updates</CustomText>
        <TouchableOpacity 
          onPress={() => navigation?.navigate('AllUpdates')}
          style={styles.viewAllButton}
        >
          <CustomText style={styles.viewAllText}>View All</CustomText>
          <MaterialIcons name="arrow-forward" size={16} color="#371981" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        decelerationRate="fast"
        snapToInterval={width * 0.75 + 15}
        snapToAlignment="center"
      >
        {updates.map(update => (
          <UpdateCard 
            key={update.id} 
            update={update} 
            onPress={() => navigation?.navigate('UpdateDetails', { updateId: update.id })}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default UpdateSlider;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#371981',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 4,
  },
  scrollContainer: {
    paddingLeft: 15,
    paddingRight: 5,
    gap: 15,
    paddingBottom: 5,
  },
  card: {
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 15,
    width: width * 0.75,
    minHeight: 170,
    maxHeight: 200,
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardDate: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginLeft: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 12,
    flex: 1,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  linkText: {
    color: '#613EEA',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  emptyContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});