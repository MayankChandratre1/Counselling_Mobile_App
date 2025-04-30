import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  ActivityIndicator, 
  Dimensions, 
  Image,
  Share 
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useEventsContext } from '../contexts/EventsContext'
import CustomText from '../components/General/CustomText'
import TopBar from '../components/General/TopBar'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Feather from 'react-native-vector-icons/Feather'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { format } from 'date-fns'

// Get screen dimensions for responsive layout
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type EventDetailsRouteParams = {
  eventId: string;
}

const EventDetails = ({navigation}:any) => {
  const route = useRoute<RouteProp<Record<string, EventDetailsRouteParams>, string>>();
  const eventId = route.params?.eventId;
  
  const { events, loading } = useEventsContext();
  const [event, setEvent] = useState<any>(null);
  const [loadingContent, setLoadingContent] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoadingContent(true);
        setError(null);
        
        if (!eventId) {
          setError('Event ID is missing');
          return;
        }
        
        // Find the event from the context
        const foundEvent = events.find(e => e.id === eventId);
        
        if (!foundEvent) {
          setError('Event not found');
          return;
        }
        
        setEvent(foundEvent);
      } catch (err) {
        console.error('Error loading event:', err);
        setError('Failed to load event details');
      } finally {
        setLoadingContent(false);
      }
    };
    
    loadEvent();
  }, [eventId, events]);

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  const getEventTypeIcon = () => {
    switch(event?.type?.toLowerCase()) {
      case 'notification':
        return <Icon name="bell" size={24} color="#FF9500" />;
      case 'event':
        return <Icon name="calendar-star" size={24} color="#4CAF50" />;
      case 'update':
        return <Icon name="information" size={24} color="#2196F3" />;
      default:
        return <Icon name="calendar" size={24} color="#371981" />;
    }
  };
  
  const handleShareEvent = async () => {
    try {
      await Share.share({
        message: `Check out this event: ${event.title}\n\n${event.description}`,
        title: event.title,
      });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };
  
  const handleOpenLink = () => {
    if (event?.link) {
      Linking.openURL(event.link).catch(err => {
        console.error('Error opening link:', err);
      });
    }
  };

  if (loading || loadingContent) {
    return (
      <View style={styles.loadingContainer}>
        <TopBar heading="Event Details" />
        <ActivityIndicator size="large" color="#371981" />
        <CustomText style={styles.loadingText}>Loading event details...</CustomText>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.errorContainer}>
        <TopBar heading="Event Details" />
        <Icon name="alert-circle-outline" size={64} color="#FF6B6B" />
        <CustomText style={styles.errorText}>{error || 'Event not found'}</CustomText>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <CustomText style={styles.backButtonText}>Go Back</CustomText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar heading="Event Details" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Header Banner */}
        <View style={styles.headerBanner}>
          <View style={styles.eventTypeContainer}>
            {getEventTypeIcon()}
            <CustomText style={styles.eventType}>{event.type}</CustomText>
          </View>
        </View>
        
        {/* Event Title */}
        <CustomText style={styles.title}>{event.title}</CustomText>
        
        {/* Event Date */}
        <View style={styles.dateContainer}>
          <Icon name="calendar" size={18} color="#666" />
          <CustomText style={styles.date}>{formatEventDate(event.date)}</CustomText>
        </View>
        
        {/* Event Card */}
        <View style={styles.cardContainer}>
          {/* Description */}
          <View style={styles.section}>
            <CustomText style={styles.sectionTitle}>Description</CustomText>
            <CustomText style={styles.description}>{event.description}</CustomText>
          </View>
          
          {/* Event Image or Illustration */}
          <View style={styles.imageContainer}>
            <Image 
              source={require('../assets/placeholder.png')} 
              style={styles.eventImage}
              resizeMode="contain"
            />
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {event.link && (
              <TouchableOpacity 
                style={styles.linkButton} 
                onPress={handleOpenLink}
              >
                <Feather name="external-link" size={18} color="#FFF" />
                <CustomText style={styles.linkButtonText}>Open Link</CustomText>
              </TouchableOpacity>
            )}
            
           
          </View>
        </View>
        
        {/* Related Events (placeholder) */}
        <View style={styles.relatedEventsSection}>
          <CustomText style={styles.relatedEventsTitle}>Related Events</CustomText>
          
          <View style={styles.relatedEventsList}>
            {events.filter(e => e.id !== eventId).slice(0, 2).map((relatedEvent) => (
              <TouchableOpacity 
                key={relatedEvent.id}
                style={styles.relatedEventCard}
                onPress={() => {
                  // Navigate to the related event
                  navigation.navigate('EventDetails', { eventId: relatedEvent.id });
                }}
              >
                <View style={styles.relatedEventTypeIcon}>
                  <Icon 
                    name={relatedEvent.type === 'event' ? 'calendar-star' : 'bell'} 
                    size={16} 
                    color="#371981" 
                  />
                </View>
                <View style={styles.relatedEventContent}>
                  <CustomText 
                    style={styles.relatedEventTitle}
                    numberOfLines={1}
                  >
                    {relatedEvent.title}
                  </CustomText>
                  <CustomText style={styles.relatedEventDate}>
                    {formatEventDate(relatedEvent.date)}
                  </CustomText>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EventDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  headerBanner: {
    backgroundColor: '#371981',
    paddingVertical: 20,
    paddingHorizontal: 20,
    position: 'relative',
  },
  eventTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  eventType: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginHorizontal: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 20,
  },
  date: {
    color: '#666',
    fontSize: 14,
    marginLeft: 6,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  eventImage: {
    width: SCREEN_WIDTH * 0.8,
    height: 180,
    borderRadius: 10,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  linkButton: {
    backgroundColor: '#371981',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
  },
  linkButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  shareButton: {
    backgroundColor: '#f0f0ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#e0e0ff',
  },
  shareButtonText: {
    color: '#371981',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  relatedEventsSection: {
    marginTop: 25,
    marginHorizontal: 15,
  },
  relatedEventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  relatedEventsList: {
    gap: 12,
  },
  relatedEventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  relatedEventTypeIcon: {
    backgroundColor: '#f0f0ff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  relatedEventContent: {
    flex: 1,
  },
  relatedEventTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  relatedEventDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#371981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});