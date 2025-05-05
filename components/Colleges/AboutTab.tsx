import { StyleSheet, Text, View, Dimensions } from 'react-native'
import React from 'react'
import CustomText from '../General/CustomText'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

// Get screen dimensions for responsive layout
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 360;

const AboutTab = ({college, styles}:any) => {
  // Extract additional metadata if available
  const metadata = college?.additionalMetadata || {};
  
  // Info cards data
  const infoCards = [
    { 
      icon: "school", 
      label: "Status", 
      value: metadata.status || college?.Status || 'N/A',
      color: "#613EEA"
    },
    { 
      icon: "account-group", 
      label: "Total Intake", 
      value: metadata.totalIntake || 'N/A',
      color: "#4CAF50"
    },
    { 
      icon: "shield-check", 
      label: "Autonomy", 
      value: metadata.autonomyStatus || 'N/A',
      color: "#FF9800"
    },
    { 
      icon: "home-city", 
      label: "University Affiliation",
      value: metadata.university || 'N/A', 
      color: "#6698FF"
    },
    { 
      icon: "flag", 
      label: "Minority Status", 
      value: metadata.minorityStatus || 'N/A',
      color: "#F44336"
    }
  ];

  return (
    <View style={localStyles.tabContent}>
      {/* Basic College Info */}
      <View style={localStyles.section}>
        <View style={localStyles.sectionHeader}>
          <Icon name="information" size={20} color="#613EEA" />
          <CustomText style={localStyles.sectionTitle}>Basic Information</CustomText>
        </View>
        
        <View style={localStyles.basicInfo}>
          <View style={localStyles.infoRow}>
            <CustomText style={localStyles.label}>Institute Name:</CustomText>
            <CustomText style={localStyles.value} numberOfLines={3}>
              {college?.instituteName}
            </CustomText>
          </View>
          
   
          
          <View style={localStyles.infoRow}>
            <CustomText style={localStyles.label}>Region:</CustomText>
            <CustomText style={localStyles.value} numberOfLines={2}>
              {metadata.region || 'N/A'}
            </CustomText>
          </View>
          
          <View style={localStyles.infoRow}>
            <CustomText style={localStyles.label}>Address:</CustomText>
            <CustomText style={localStyles.value} numberOfLines={3}>
              {metadata.address || 'N/A'}
            </CustomText>
          </View>
        </View>
      </View>
      
      {/* College Stats */}
      <View style={localStyles.section}>
        <View style={localStyles.sectionHeader}>
          <Icon name="chart-bar" size={20} color="#613EEA" />
          <CustomText style={localStyles.sectionTitle}>College Statistics</CustomText>
        </View>
        
        <View style={localStyles.cardsContainer}>
          {infoCards.map((card, index) => (
            <View 
              key={index} 
              style={[
                localStyles.infoCard, 
                { borderLeftColor: card.color }
              ]}
            >
              <View style={[localStyles.iconContainer, { backgroundColor: `${card.color}20` }]}>
                <Icon name={card.icon} size={24} color={card.color} />
              </View>
              <View style={localStyles.cardContent}>
                <CustomText style={localStyles.cardLabel}>{card.label}</CustomText>
                <CustomText style={localStyles.cardValue}>{card.value}</CustomText>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default AboutTab

const localStyles = StyleSheet.create({
  tabContent: {
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  basicInfo: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#613EEA',
  },
  infoRow: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoCard: {
    width: SCREEN_WIDTH > 600 ? '48%' : '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
})