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
          <Icon name="arrow-left" size={28} color="#000" />
        </TouchableOpacity>
      )}
      <Text style={styles.heading}>{heading}</Text>
    </View>
  )
}

export default TopBar

const styles = StyleSheet.create({
  container: {
    height: 58,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
  },
  backButton: {
    marginRight: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  }
})