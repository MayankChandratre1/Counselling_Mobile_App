import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';

const PremiumButton = () => {
  const navigation = useNavigation<any>();


  return (
    <TouchableOpacity 
      style={styles.container}
    >
      <Icon name="crown" size={32} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

export default PremiumButton;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    zIndex: 1000,
    elevation: 0,
    backgroundColor: '#FDCF62',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
  },
});