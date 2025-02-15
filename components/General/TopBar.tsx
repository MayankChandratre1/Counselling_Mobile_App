import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

type TopBarProps = {
  heading: string
  showBack?: boolean
}

const TopBar = ({ heading, showBack = true }: TopBarProps) => {
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-u-left-top" size={32} color="#000" />
        </TouchableOpacity>
      )}
      <Text style={styles.heading}>{heading}</Text>
    </View>
  )
}

export default TopBar

const styles = StyleSheet.create({
  container: {
    height: 68,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
  }
})