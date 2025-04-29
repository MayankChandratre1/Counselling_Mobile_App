import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CollegeList from '../components/Colleges/CollegeList'
import TopBar from '../components/General/TopBar'
import { CollegeProvider } from '../contexts/CollegeContext'

const Browse = ({navigation}:any) => {
  return (
    <View style={styles.container}>
      <TopBar heading='Search Colleges' />
      <CollegeProvider>
        <CollegeList navigation={navigation} />
      </CollegeProvider>
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
