import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Feather';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import CustomText from '../General/CustomText';

const GetAdviceButton = () => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity 
      style={styles.container}
      activeOpacity={0.8}
      onPress={() => {
        try{
            navigation.navigate('Tab', {
              screen: 'Colleges'
            }); 
        }catch(e:any){
          console.log(e.type);
        }
      }}
    >
      <View style={styles.buttonContent}>
        <Icon name="phone-call" size={22} color="#FFFFFF" style={styles.icon} />
        <CustomText style={styles.buttonText}>Get Advice</CustomText>
      </View>
    </TouchableOpacity>
  );
};

export default GetAdviceButton;

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
    backgroundColor: '#371981',
    borderRadius: 28,
    marginVertical: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  }
});