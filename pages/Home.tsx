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
    RefreshControl 
  } from 'react-native'
  import React, { useEffect, useState, useCallback } from 'react'
  import { clearUserData, getUserData, logout } from '../utils/storage'
  import UpdateSlider from "../components/Home/UpdateSlider"
  import FontAwesome from "react-native-vector-icons/FontAwesome"
  import Feather from "react-native-vector-icons/Feather"
  import MaterialIcons from "react-native-vector-icons/MaterialIcons"
  import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
  import CollegeCard from '../components/Colleges/CollegeCard'
  import CustomText from '../components/General/CustomText'
  import EventCard from '../components/Events/EventCard'
  
  const { width } = Dimensions.get('window');
  
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
  
  const Home: React.FC<NavigationProps> = ({ navigation }) => {
      const [userData, setUserData] = useState<UserData | null>(null);
      const [refreshing, setRefreshing] = useState<boolean>(false);
      const [latestEvents, setLatestEvents] = useState<Event[]>([
          {
              id: '1',
              title: 'JEE Main Results Announced',
              date: 'April 25, 2025',
              description: 'Check your results and eligibility for JEE Advanced',
              type: 'notification'
          },
          {
              id: '2',
              title: 'Webinar: How to Choose the Right College',
              date: 'April 30, 2025',
              description: 'Join our experts for tips on college selection',
              type: 'event'
          },
          {
              id: '3',
              title: 'BITSAT Registration Deadline Extended',
              date: 'May 5, 2025',
              description: 'Last date to apply is now May 15, 2025',
              type: 'update'
          }
      ]);
  
      const [recommendedColleges, setRecommendedColleges] = useState([
        {
            id: '1',
            instituteName: 'IIT Bombay',
            city: 'Mumbai',
          
            additionalMetadata: {
                status: 'Government',
                totalIntake: 1200
            }
        },
        {
            id: '2',
            instituteName: 'NIT Surathkal',
            city: 'Karnataka',
         
            additionalMetadata: {
                status: 'Government',
                totalIntake: 800
            }
        },
        {
            id: '3',
            instituteName: 'VJTI Mumbai',
            city: 'Mumbai',
           
            additionalMetadata: {
                status: 'Government-Aided',
                totalIntake: 650
            }
        }
    ]);

      useEffect(() => {
          loadUserData();
      }, []);
  
      const loadUserData = async () => {
          const data = await getUserData();
          setUserData(data);
      };
  
      const onRefresh = useCallback(async () => {
          setRefreshing(true);
          await loadUserData();
          // Here you would also refresh other data like events, updates, etc.
          setTimeout(() => setRefreshing(false), 1000);
      }, []);
  
      const handleLogout = async () => {
          if (userData?.id) {
              const success = await logout(userData.id);
              if (success) {
                  navigation.replace('Login');
              }
          }
      };
  
      return (
          <SafeAreaView style={styles.safeArea}>
              <StatusBar backgroundColor="#fff" barStyle="dark-content" />
              <ScrollView 
                  style={styles.container}
                  contentContainerStyle={styles.contentContainer}
                  refreshControl={
                      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  }
              >
                  {/* Header */}
                  <View style={styles.header}>
                      <View style={styles.userInfo}>
                          <View style={styles.avatarContainer}>
                              <FontAwesome name="user-circle" size={40} color="#371981" />
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
                          onPress={() => navigation.navigate('Notification')}
                      >
                          <Feather name="bell" size={24} color="#371981" />
                      </TouchableOpacity>
                  </View>
  
                  {/* Featured Update Banner */}
                  <TouchableOpacity 
                      style={styles.updateBanner}
                      onPress={() => navigation.navigate('Notification')}
                  >
                      <View style={styles.updateIconContainer}>
                          <MaterialIcons name="campaign" size={22} color="#fff" />
                      </View>
                      <CustomText style={styles.updateText}>
                          New Video on Engineering Admissions Process
                      </CustomText>
                      <MaterialIcons name="chevron-right" size={22} color="#fff" />
                  </TouchableOpacity>
  
                  {/* Update Slider - Horizontal Scroll */}
                  <View style={styles.sliderSection}>
                      <UpdateSlider navigation={navigation} />
                  </View>
  
                  {/* Main Navigation */}
                  <View style={styles.mainNavContainer}>
                      <CustomText style={styles.sectionTitle}>Quick Access</CustomText>
                      <View style={styles.mainNavGrid}>
                          <TouchableOpacity 
                              style={styles.mainNavItem}
                              onPress={() => navigation.navigate('Browse')}
                          >
                              <View style={[styles.iconCircle, { backgroundColor: '#e6f0ff' }]}>
                                  <MaterialIcons name="school" size={26} color="#0066cc" />
                              </View>
                              <CustomText style={styles.mainNavText}>Browse Colleges</CustomText>
                              <CustomText style={styles.mainNavSubText}>Cutoffs & Info</CustomText>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                              style={styles.mainNavItem}
                              onPress={() => navigation.navigate('AboutSarathi')}
                          >
                              <View style={[styles.iconCircle, { backgroundColor: '#f0e6ff' }]}>
                                  <MaterialIcons name="info-outline" size={26} color="#6600cc" />
                              </View>
                              <CustomText style={styles.mainNavText}>About Sarathi</CustomText>
                              <CustomText style={styles.mainNavSubText}>Our Mission</CustomText>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                              style={styles.mainNavItem}
                              onPress={() => navigation.navigate('Counselling')}
                          >
                              <View style={[styles.iconCircle, { backgroundColor: '#e6ffed' }]}>
                                  <MaterialCommunityIcons name="account-group" size={26} color="#00cc66" />
                              </View>
                              <CustomText style={styles.mainNavText}>Counselling</CustomText>
                              <CustomText style={styles.mainNavSubText}>Dashboard</CustomText>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                              style={styles.mainNavItem}
                              onPress={() => navigation.navigate('Favorites')}
                          >
                              <View style={[styles.iconCircle, { backgroundColor: '#fff0e6' }]}>
                                  <MaterialIcons name="favorite-outline" size={26} color="#cc6600" />
                              </View>
                              <CustomText style={styles.mainNavText}>Favorites</CustomText>
                              <CustomText style={styles.mainNavSubText}>Saved Colleges</CustomText>
                          </TouchableOpacity>
                      </View>
                  </View>
  
                  {/* Events Section */}
                  <View style={styles.eventsContainer}>
                      <View style={styles.sectionHeader}>
                          <CustomText style={styles.sectionTitle}>Upcoming Events</CustomText>
                          <TouchableOpacity 
                              style={styles.viewAllButton}
                              onPress={() => navigation.navigate('AllEvents')}
                          >
                              <CustomText style={styles.viewAllText}>View All</CustomText>
                              <MaterialIcons name="arrow-forward" size={16} color="#371981" />
                          </TouchableOpacity>
                      </View>
                      
                      {latestEvents.map(event => (
                          <EventCard 
                              key={event.id} 
                              event={event} 
                              onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
                          />
                      ))}
                  </View>
  
                  {/* Recommended Colleges - Updated Section */}
                  <View style={styles.collegesContainer}>
                      <View style={styles.sectionHeader}>
                          <CustomText style={styles.sectionTitle}>Browse Colleges</CustomText>
                          <TouchableOpacity 
                              style={styles.viewAllButton}
                              onPress={() => navigation.navigate('Browse')}
                          >
                              <CustomText style={styles.viewAllText}>View All</CustomText>
                              <MaterialIcons name="arrow-forward" size={16} color="#371981" />
                          </TouchableOpacity>
                      </View>
                      
                      <ScrollView 
                          horizontal 
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.collegesScrollContainer}
                      >
                          {recommendedColleges.map(college => (
                              <View key={college.id} style={styles.collegeCardWrapper}>
                                  <CollegeCard 
                                      college={college}
                                      onPress={() => navigation.navigate('CollegeDetails', { collegeId: college.id })}
                                  />
                              </View>
                          ))}
                      </ScrollView>
                  </View>
  
                  {/* Account Section */}
                  <View style={styles.accountSection}>
                      <TouchableOpacity 
                          style={styles.accountOption}
                          onPress={() => navigation.navigate('Profile')}
                      >
                          <View style={styles.accountOptionIcon}>
                              <MaterialIcons name="person-outline" size={22} color="#371981" />
                          </View>
                          <CustomText style={styles.accountOptionText}>My Profile</CustomText>
                          <MaterialIcons name="chevron-right" size={22} color="#aaa" />
                      </TouchableOpacity>
                      
                  
                      
                      <TouchableOpacity 
                          style={[styles.accountOption, styles.lastOption]}
                          onPress={handleLogout}
                      >
                          <View style={[styles.accountOptionIcon, { backgroundColor: '#ffebeb' }]}>
                              <MaterialIcons name="logout" size={22} color="#ff3333" />
                          </View>
                          <CustomText style={[styles.accountOptionText, { color: '#ff3333' }]}>Logout</CustomText>
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
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
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
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
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
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
      },
      collegesContainer: {
          padding: 15,
          backgroundColor: '#fff',
          marginHorizontal: 15,
          borderRadius: 12,
          marginBottom: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
      },
      collegesScrollContainer: {
          paddingBottom: 10,
          paddingRight: 10,
         
      },
      collegeCardWrapper: {
          width:width * 0.9,
          marginRight: 10,
      },
      accountSection: {
          padding: 15,
          backgroundColor: '#fff',
          marginHorizontal: 15,
          borderRadius: 12,
          marginBottom: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
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
      }
  });