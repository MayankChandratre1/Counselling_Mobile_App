import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from 'react-native-vector-icons/FontAwesome6'
import CounsellingStep from './CounsellingStep'

const CounsellingForm = () => {
  const cancePlan = async () => {
    // Here add your API call and navigation logic
    await AsyncStorage.removeItem('plan');
  }

  return (
    <View>
      <Pressable onPress={() => {
        cancePlan()
        console.log('Plan Cancelled');
        
      }}>
        
      </Pressable>
      <View style={styles.eliteMember}>
        <View style={styles.iconContainer}>
          <Icon name="crown" size={32} color="#613EEA" />
        </View>
        <Text style={styles.eliteText}>Elite Member</Text>
      </View>

     

      <View style={{
        minHeight: "100%"
      }}>
        <View style={{ width: "10%",height:"100%", borderRadius: 8, paddingInline: 10, alignItems: 'center', justifyContent: 'center', position: 'absolute', marginInline: 15 }}>
          <View
              style={{
                width: 4,
                height: "100%",
                backgroundColor: '#613EEA80',
                margin: 'auto',
              }}
            ></View>
        </View>
            
      
        {
          [1,2,3,4,5].map((step) => (
            <CounsellingStep 
              title="Choose your course" 
              status="Yes" 
              stepNumber={step}
              onEdit={() => console.log('Edit')}
            />
          ))
        }
        



        
      </View>
    
    </View>
  )
}

const styles = StyleSheet.create({
  eliteMember: {
    backgroundColor: '#613EEA',
    paddingVertical: 15,
    paddingInline: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconContainer: {
    backgroundColor: '#D9D9D9',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eliteText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
})

export default CounsellingForm