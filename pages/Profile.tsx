import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ProfileCard from '../components/Profile/ProfileCard'
import ProfileForm from '../components/Profile/ProfileForm'
import TopBar from '../components/General/TopBar'

const Profile = () => {
  return (
    <>
      <TopBar heading="Profile" />
      <View style={styles.container}>
        <ProfileCard />
        <ProfileForm />
      </View>
    </>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
})
