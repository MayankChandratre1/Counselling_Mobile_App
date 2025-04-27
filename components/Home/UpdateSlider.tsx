import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  Dimensions 
} from 'react-native'
import React from 'react'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import CustomText from '../General/CustomText'

const { width } = Dimensions.get('window');

interface Update {
  id: string;
  title: string;
  subtitle: string;
  type: 'video' | 'news' | 'event';
  date: string;
  link?: string;
}

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
      <Text style={styles.cardSubtitle}>{update.subtitle}</Text>
      
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
  navigation?: any; // Optional navigation prop
}

const UpdateSlider: React.FC<UpdateSliderProps> = ({ navigation }) => {
  // Sample data - replace with your actual data source
  const updates: Update[] = [
    {
      id: '1',
      title: 'New Video Released!',
      subtitle: 'Watch latest counselling tips',
      type: 'video',
      date: 'Apr 26',
      link: 'https://youtube.com/example1'
    },
    {
      id: '2',
      title: 'JEE Advanced Applications',
      subtitle: 'Last date: 30th June',
      type: 'news',
      date: 'Apr 25',
    },
    {
      id: '3',
      title: 'Live Session Tomorrow',
      subtitle: 'Topic: Engineering Pathways',
      type: 'event',
      date: 'Apr 27',
      link: 'https://meet.google.com/example'
    },
    {
      id: '4',
      title: 'BITSAT Registration',
      subtitle: 'Last date extended to May 15',
      type: 'news',
      date: 'Apr 24',
      link: 'https://bitsadmission.com'
    },
  ];

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
  }
});