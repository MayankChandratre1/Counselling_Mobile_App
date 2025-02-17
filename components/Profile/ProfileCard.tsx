import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { getUserData } from '../../utils/storage'
import FontAwesome from "react-native-vector-icons/FontAwesome"

interface UserData {
  name: string;
  phone: string;
}

const ProfileCard = () => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const data = await getUserData();
    setUserData(data);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <FontAwesome name="user-circle" size={80} color="#B4DBFF" />
      </View>
      <Text style={styles.userName}>{userData?.name || 'Loading...'}</Text>
    </View>
  )
}

export default ProfileCard

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    marginBottom: 12,
    borderRadius: 40,
    overflow: 'hidden',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
})