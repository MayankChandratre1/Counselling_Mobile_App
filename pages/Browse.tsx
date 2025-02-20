import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CollegeList from '../components/Colleges/CollegeList'
import TopBar from '../components/General/TopBar'

const Browse = ({navigation}:any) => {
  return (
    <View style={styles.container}>
      <TopBar heading='Search Colleges' />
      <CollegeList navigation={navigation} />
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
