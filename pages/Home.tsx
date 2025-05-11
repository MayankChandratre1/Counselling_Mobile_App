import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState, useCallback, useRef} from 'react';
import {clearUserData, getUserData, logout} from '../utils/storage';
import UpdateSlider from '../components/Home/UpdateSlider';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CollegeCard from '../components/Colleges/CollegeCard';
import CustomText from '../components/General/CustomText';
import EventCard from '../components/Events/EventCard';
import {OneSignal} from 'react-native-onesignal';
import {useEventsContext} from '../contexts/EventsContext';
import RecommendedCollegeCard from '../components/Colleges/RecommendedCollegeCard';

const {width} = Dimensions.get('window');

interface NavigationProps {
  navigation: any;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  // Add other properties as needed
}

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  type: string;
}

const Home: React.FC<NavigationProps> = ({navigation}) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Use the events context instead of local state for dynamic data
  const {
    events,
    updates,
    recommendedColleges,
    loading: dataLoading,
    error: dataError,
    refreshData,
  } = useEventsContext();

  useEffect(() => {
    loadUserData();
  }, []);

  const getOneSignalId = async () => {
    try {
      const id = await OneSignal.User.pushSubscription.getIdAsync();
      console.log(id);

      if (id) {
        Alert.alert('OneSignal ID: ' + id);
        console.log('OneSignal ID: ', id);
      }
    } catch (e) {
      console.log('OneSignal ID Error', e);
    }
  };

  const loadUserData = async () => {
    const data = await getUserData();
    setUserData(data);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    await refreshData(); // Refresh data from API
    setTimeout(() => setRefreshing(false), 1000);
  }, [refreshData]);

  const handleLogout = async () => {
    if (userData?.id) {
      const success = await logout(userData.id);
      if (success) {
        navigation.replace('Login');
      }
    }
  };

  const CollegesSection = () => {
    const [scrollPosition, setScrollPosition] = useState<number>(0);
    const [contentWidth, setContentWidth] = useState<number>(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const containerWidth = width * 0.9;

    const handleScroll = (event: any) => {
      const position = event.nativeEvent.contentOffset.x;
      setScrollPosition(position);
    };

    const handleContentSizeChange = (width: number) => {
      setContentWidth(width);
    };

    const scrollForward = () => {
      if (scrollViewRef.current) {
        const newPosition = Math.min(
          scrollPosition + containerWidth,
          contentWidth - containerWidth,
        );
        scrollViewRef.current.scrollTo({x: newPosition, animated: true});
      }
    };

    const scrollBackward = () => {
      if (scrollViewRef.current) {
        const newPosition = Math.max(scrollPosition - containerWidth, 0);
        scrollViewRef.current.scrollTo({x: newPosition, animated: true});
      }
    };

    const hasMoreToRight = scrollPosition < contentWidth - containerWidth - 50;
    const hasMoreToLeft = scrollPosition > 10;

    return (
      <View style={styles.collegesContainer}>
        <View style={styles.sectionHeader}>
          <CustomText style={styles.sectionTitle}>Browse Colleges</CustomText>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('Browse')}>
            <CustomText style={styles.viewAllText}>View All</CustomText>
            <MaterialIcons name="arrow-forward" size={16} color="#371981" />
          </TouchableOpacity>
        </View>

        {dataLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#371981" />
          </View>
        ) : recommendedColleges.length > 0 ? (
          <View style={styles.collegesScrollWrapper}>
            {hasMoreToLeft && (
              <TouchableOpacity
                style={[styles.scrollButton, styles.scrollButtonLeft]}
                onPress={scrollBackward}
                activeOpacity={0.7}>
                <MaterialIcons name="chevron-left" size={24} color="#371981" />
              </TouchableOpacity>
            )}

            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.collegesScrollContainer}
              onScroll={handleScroll}
              onContentSizeChange={width => handleContentSizeChange(width)}
              scrollEventThrottle={16}>
              {recommendedColleges.map(college => (
                <View key={college.id} style={styles.collegeCardWrapper}>
                  <RecommendedCollegeCard
                    college={college}
                    hideFav
                    onPress={() =>
                      navigation.navigate('CollegeDetails', {
                        collegeId: college.id,
                      })
                    }
                  />
                </View>
              ))}
            </ScrollView>

            {hasMoreToRight && (
              <TouchableOpacity
                style={[styles.scrollButton, styles.scrollButtonRight]}
                onPress={scrollForward}
                activeOpacity={0.7}>
                <MaterialIcons name="chevron-right" size={24} color="#371981" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <CustomText style={styles.emptyText}>
              No recommended colleges available
            </CustomText>
          </View>
        )}

        {recommendedColleges.length > 0 && (
          <View style={styles.dotsContainer}>
            {recommendedColleges.length > 1 && (
              <View style={styles.paginationDots}>
                {Array.from(
                  {length: recommendedColleges.length},
                  (_, index) => {
                    const isActive =
                      scrollPosition >=
                        index * containerWidth - containerWidth / 2 &&
                      scrollPosition <
                        (index + 1) * containerWidth - containerWidth / 2;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.paginationDot,
                          isActive && styles.paginationDotActive,
                        ]}
                      />
                    );
                  },
                )}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity
                onPress={() => {
                  // navigation.replace('MyPayments', {
                  //   planDetails: {
                  //     isPremium: true,
                  //     plan: 'Sarathi Premium',
                  //     price: '5999',
                  //     expiry: 120,
                  //   },
                  // });
                  navigation.navigate('Profile');
                }}>
                <FontAwesome name="user-circle" size={40} color="#371981" />
              </TouchableOpacity>
            </View>
            <View>
              <CustomText style={styles.greeting}>
                Hi {userData?.name || 'Student'} 👋
              </CustomText>
              <CustomText style={styles.subGreeting}>
                Welcome to Sarathi
              </CustomText>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notificationIcon}
            onPress={() => navigation.navigate('Notification')}>
            <Feather name="bell" size={24} color="#371981" />
          </TouchableOpacity>
        </View>

        {/* Featured Update Banner */}
        <TouchableOpacity
          style={styles.updateBanner}
          onPress={() => navigation.navigate('Notification')}>
          <View style={styles.updateIconContainer}>
            <MaterialIcons name="campaign" size={22} color="#fff" />
          </View>
          <CustomText style={styles.updateText}>
            See newest videos on Yash Aradhye YouTube Channel
          </CustomText>
          <MaterialIcons name="chevron-right" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Update Slider - Horizontal Scroll */}
        <View style={styles.sliderSection}>
          <UpdateSlider
            updates={updates}
            navigation={navigation}
            loading={dataLoading && !refreshing}
          />
        </View>

        {/* Main Navigation */}
        <View style={styles.mainNavContainer}>
          <CustomText style={styles.sectionTitle}>Quick Access</CustomText>
          <View style={styles.mainNavGrid}>
            <TouchableOpacity
              style={styles.mainNavItem}
              onPress={() => navigation.navigate('Browse')}>
              <View style={[styles.iconCircle, {backgroundColor: '#e6f0ff'}]}>
                <MaterialIcons name="school" size={26} color="#0066cc" />
              </View>
              <CustomText style={styles.mainNavText}>
                Browse Colleges
              </CustomText>
              <CustomText style={styles.mainNavSubText}>
                Cutoffs & Info
              </CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mainNavItem}
              onPress={() => navigation.navigate('Colleges')}>
              <View style={[styles.iconCircle, {backgroundColor: '#f0e6ff'}]}>
                <MaterialIcons name="info-outline" size={26} color="#6600cc" />
              </View>
              <CustomText style={styles.mainNavText}>About Sarathi</CustomText>
              <CustomText style={styles.mainNavSubText}>Our Mission</CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mainNavItem}
              onPress={() => navigation.navigate('Counselling')}>
              <View style={[styles.iconCircle, {backgroundColor: '#e6ffed'}]}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={26}
                  color="#00cc66"
                />
              </View>
              <CustomText style={styles.mainNavText}>Counselling</CustomText>
              <CustomText style={styles.mainNavSubText}>Dashboard</CustomText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mainNavItem}
              onPress={() => navigation.navigate('Favourites')}
              //    onPress={() => Alert.alert('Coming Soon!', 'This feature is under development.')}
              // onPress={()=>{ getOneSignalId() }}
            >
              <View style={[styles.iconCircle, {backgroundColor: '#fff0e6'}]}>
                <MaterialIcons
                  name="favorite-outline"
                  size={26}
                  color="#cc6600"
                />
              </View>
              <CustomText style={styles.mainNavText}>Favorites</CustomText>
              <CustomText style={styles.mainNavSubText}>
                Saved Colleges
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Events Section */}
        <View style={styles.eventsContainer}>
          <View style={styles.sectionHeader}>
            <CustomText style={styles.sectionTitle}>Upcoming Events</CustomText>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('AllEvents')}>
              <CustomText style={styles.viewAllText}>View All</CustomText>
              <MaterialIcons name="arrow-forward" size={16} color="#371981" />
            </TouchableOpacity>
          </View>

          {dataLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#371981" />
            </View>
          ) : events.length > 0 ? (
            events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() =>
                  navigation.navigate('EventDetails', {eventId: event.id})
                }
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <CustomText style={styles.emptyText}>
                No events available
              </CustomText>
            </View>
          )}
        </View>

        {/* Recommended Colleges Section */}
        <CollegesSection />

        {/* Account Section */}
        <View style={styles.accountSection}>
          <TouchableOpacity
            style={styles.accountOption}
            onPress={() => navigation.navigate('Profile')}>
            <View style={styles.accountOptionIcon}>
              <MaterialIcons name="person-outline" size={22} color="#371981" />
            </View>
            <CustomText style={styles.accountOptionText}>My Profile</CustomText>
            <MaterialIcons name="chevron-right" size={22} color="#aaa" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.accountOption, styles.lastOption]}
            onPress={handleLogout}>
            <View
              style={[styles.accountOptionIcon, {backgroundColor: '#ffebeb'}]}>
              <MaterialIcons name="logout" size={22} color="#ff3333" />
            </View>
            <CustomText style={[styles.accountOptionText, {color: '#ff3333'}]}>
              Logout
            </CustomText>
            <MaterialIcons name="chevron-right" size={22} color="#aaa" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

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
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  greeting: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subGreeting: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  notificationIcon: {
    padding: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateBanner: {
    backgroundColor: '#371981',
    padding: 12,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },
  updateIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 5,
  },
  updateText: {
    color: '#fff',
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 10,
  },
  sliderSection: {
    marginTop: 20,
    marginBottom: 15,
  },
  mainNavContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
  mainNavGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mainNavItem: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  mainNavText: {
    fontWeight: '600',
    fontSize: 15,
    color: '#333',
  },
  mainNavSubText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  eventsContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },
  collegesContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
    // width: width * 0.92,
  },
  collegesScrollContainer: {
    paddingBottom: 10,
    paddingRight: 10,
  },
  accountSection: {
    padding: 15,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  accountOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  accountOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  collegesScrollWrapper: {
    position: 'relative',
    width: '100%',
  },
  scrollButton: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    top: '50%',
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },
  scrollButtonLeft: {
    left: -5,
  },
  scrollButtonRight: {
    right: -5,
  },
  dotsContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#371981',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  collegeCardWrapper: {
    width: width * 0.9,
    marginRight: 10,
  },
});
