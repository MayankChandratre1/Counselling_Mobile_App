import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CollegeList from '../components/Colleges/CollegeList'
import TopBar from '../components/General/TopBar'

const Browse = () => {
  return (
    <View style={styles.container}>
      <TopBar heading='Search Colleges' />
      <CollegeList />
    </View>
  )
}

export default Browse

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  }
})
