import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';

const ContactButton = ({isPremium}: {
  isPremium: boolean
}) => {
  const navigation = useNavigation<any>();


  if(!navigation ) return null; // Ensure navigation is available

  if(isPremium){
    return (
      <TouchableOpacity 
        style={[styles.container,{bottom:90}]}
        onPress={() => {
          try{
            navigation.navigate('Contact');
          }catch(e:any){
            console.log(e.type);
          }
        }}
      >
        <Icon name="phone" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => {
        try{
          navigation.navigate('Contact');
        }catch(e:any){
          console.log(e.type);
        }
      }}
    >
      <Icon name="phone" size={22} color="#FFFFFF" />
    </TouchableOpacity>
  );
};

export default ContactButton;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom:  160,
    right: 16,
    zIndex: 1000,
    elevation: 0,
    backgroundColor: '#55ff55',
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