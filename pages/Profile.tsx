import { StyleSheet, View, ScrollView, TouchableOpacity, NativeModules, Alert, SafeAreaView, StatusBar, Image, Linking, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import ProfileCard from '../components/Profile/ProfileCard'
import ProfileForm from '../components/Profile/ProfileForm'
import TopBar from '../components/General/TopBar'
import CustomText from '../components/General/CustomText'
import { getUserData, logout, getPremiumStatus } from '../utils/storage'
import { useNavigation } from '@react-navigation/native'
import { checkVersion } from "react-native-check-version"
import Icon from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const Profile = () => {
  const navigation = useNavigation<any>();
  const [userData, setUserData] = useState<any>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [counsellingData, setCounsellingData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [updateChecking, setUpdateChecking] = useState<boolean>(false);

  useEffect(() => {
    loadAllUserData();
  }, []);

  const loadAllUserData = async () => {
    try {
      setRefreshing(true);
      const data = await getUserData();
      setUserData(data);
      
      // Check premium status and get counselling data
      const premiumStatus = await getPremiumStatus();
      setIsPremium(premiumStatus.isPremium || false);
      
      if (premiumStatus.counsellingData) {
        setCounsellingData(premiumStatus.counsellingData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const checkAppVersion = async () => {
    const curr = NativeModules.RNDeviceInfo.appVersion
    setUpdateChecking(true); 
    const version = await checkVersion();
    console.log("Got version info:", curr, version);

    if (version.needsUpdate) {
      Alert.alert(
        "Update Available", 
        `A new version (${version.version}) is available. Would you like to update now?`,
        [
          { text: "Later", style: "cancel" },
          { text: "Update", onPress: () => Linking.openURL(version.url) }
        ]
      );
    } else {
      Alert.alert("App Up to Date", "You're using the latest version of the app.");
    }
    setUpdateChecking(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            const success = await logout(userData?.id);
            if (success) {
              navigation.replace('Login');
            }
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <TopBar heading="My Profile" />
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
       
        
        {/* Profile Card */}
        <ProfileCard />
        
        {/* Profile Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CustomText style={styles.sectionTitle}>Profile Information</CustomText>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={loadAllUserData}
            >
              <MaterialCommunityIcons name="refresh" size={20} color="#371981" />
            </TouchableOpacity>
          </View>
          
          <ProfileForm 
            userData={userData} 
            isPremium={isPremium} 
            counsellingData={counsellingData}
            onUpdate={loadAllUserData}
          />
        </View>
        
        {/* Account Settings */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Account Settings</CustomText>
          
          <View style={styles.settingsContainer}>
            <TouchableOpacity style={styles.settingItem} onPress={checkAppVersion}>
              <View style={styles.settingIconContainer}>
               {
                updateChecking ? (
                  <ActivityIndicator size={22} color="#371981" />
                ) : (
                  <MaterialCommunityIcons name="check-circle-outline" size={22} color="#371981" />
                )
               }
              </View>
              <View style={styles.settingContent}>
                <CustomText style={styles.settingTitle}>Check for Updates</CustomText>
                <CustomText style={styles.settingDescription}>Check if a new app version is available</CustomText>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Contact')}>
              <View style={styles.settingIconContainer}>
                <MaterialCommunityIcons name="lifebuoy" size={22} color="#371981" />
              </View>
              <View style={styles.settingContent}>
                <CustomText style={styles.settingTitle}>Support</CustomText>
                <CustomText style={styles.settingDescription}>Get help or contact us</CustomText>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
                    {isPremium && (
            <TouchableOpacity 
                style={styles.settingItem} 
                onPress={() => navigation.navigate('MyPayments')}
              >
                <View style={[styles.settingIconContainer, { backgroundColor: '#F0FFE6' }]}>
                  <MaterialCommunityIcons name="cash" size={22} color="#8Cff00" />
                </View>
                <View style={styles.settingContent}>
                  <CustomText style={styles.settingTitle}>My Payments</CustomText>
                  <CustomText style={styles.settingDescription}>Check your payments</CustomText>
                </View>
                <Icon name="chevron-right" size={24} color="#999" />
              </TouchableOpacity>)}
            
            {!isPremium && (
              <TouchableOpacity 
                style={styles.settingItem} 
                onPress={() => navigation.navigate('Counselling')}
              >
                <View style={[styles.settingIconContainer, { backgroundColor: '#FFF0E6' }]}>
                  <MaterialCommunityIcons name="crown" size={22} color="#FF8C00" />
                </View>
                <View style={styles.settingContent}>
                  <CustomText style={styles.settingTitle}>Upgrade to Premium</CustomText>
                  <CustomText style={styles.settingDescription}>Get personalized counselling and more</CustomText>
                </View>
                <Icon name="chevron-right" size={24} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Logout button */}
        <TouchableOpacity 
          onPress={handleLogout} 
          style={styles.logoutButton}
        >
          <Icon name="logout" size={20} color="#fff" />
          <CustomText style={styles.logoutText}>Logout</CustomText>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <CustomText style={styles.versionText}>Version 1.0.0</CustomText>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7FA',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  refreshButton: {
    padding: 4,
  },
  settingsContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F9F9FF',
    marginVertical: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F8',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#371981',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
  premiumBadgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumBadge: {
    flexDirection: 'row',
    backgroundColor: '#371981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  premiumText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
});
