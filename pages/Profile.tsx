import { StyleSheet, View, ScrollView, TouchableOpacity, NativeModules } from 'react-native'
import React, { useState, useEffect } from 'react'
import ProfileCard from '../components/Profile/ProfileCard'
import ProfileForm from '../components/Profile/ProfileForm'
import TopBar from '../components/General/TopBar'
import CustomText from '../components/General/CustomText'
import { getUserData, logout } from '../utils/storage'
import { useNavigation } from '@react-navigation/native'
import { checkVersion } from "react-native-check-version";



const Profile = () => {
  const navigation = useNavigation<any>();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const data = await getUserData();
      setUserData(data);
    };
    loadUserData();
  }, []);

  const checkAppVersion = async () => {
    const curr = NativeModules.RNDeviceInfo.appVersion
    const version = await checkVersion({
      bundleId:'com.chess.chesscoach'
    });
    console.log("Got version info:", curr, version);

    if (version.needsUpdate) {
      console.log(`App has a ${version.updateType} update pending.`);
    }
  }

  const handleLogout = async () => {
    const success = await logout(userData?.id);
    console.log(success);
    
    if (success) {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <TopBar heading="Profile" />
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard />
        <ProfileForm />
        
        <TouchableOpacity 
          onPress={checkAppVersion} 
          style={styles.logoutButton}
        >
          <CustomText style={styles.logoutText}>Logout</CustomText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 25,
  },
  logoutButton: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
})
