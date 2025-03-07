import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

interface CounsellingStepProps {
  title: string;
  status?: 'Yes' | 'No';
  leftCTA?: {
    label: string;
    onPress: () => void;
  };
  onEdit: () => void;
    stepNumber: number;
}

const CounsellingStep = ({ 
  title, 
  status, 
  leftCTA, 
  stepNumber,
  onEdit 
}: CounsellingStepProps) => {
  return (
    <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingInline: 15,
      }}>
        <View style={{ width: "10%", borderRadius: 8, paddingInline: 10, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ 
              paddingInline: 10,
              backgroundColor: '#613Ed0', 
              borderRadius: "50%",
              width: 50,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{
                color: '#FFFFFF',
                fontSize: 24,
                fontWeight: 'bold'
            }}>{stepNumber}</Text>
            </View>
            
        </View>

        <View style={{ padding: 15, width: '90%' }}>
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {status && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>STATUS:</Text>
          <Text style={styles.statusValue}> {status}</Text>
        </View>
      )}

      <View style={styles.footer}>
        {leftCTA && (
          <TouchableOpacity style={{
            flexDirection: 'row',
            alignItems: 'center',
          }} onPress={leftCTA.onPress}>
            <Icon name="clipboard-text-multiple-outline" size={16} style={{marginRight: 10}} color="#613EEA" />
            <Text style={styles.leftCTA}>{leftCTA.label}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[
            styles.editButton,
            { marginLeft: leftCTA ? 'auto' : 'auto' }
          ]}
          onPress={onEdit}
        >
          <Icon name="application-edit-outline" size={24} color="#613EEA" />
        </TouchableOpacity>
      </View>
    </View>
    </View>

</View>
  )
}




const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#613EEA',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusLabel: {
    color: '#613EEA',
    fontWeight: '500',
  },
  statusValue: {
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  leftCTA: {
    color: '#613EEA',
    fontWeight: '500',
  },
  editButton: {
    padding: 5,
  },
})

export default CounsellingStep



    