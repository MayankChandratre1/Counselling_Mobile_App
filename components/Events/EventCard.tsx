import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import CustomText from '../General/CustomText';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const getEventIcon = (type: any) => {
  switch (type) {
    case 'event':
      return { name: 'event', color: '#0066cc', bgColor: '#e6f0ff' };
    case 'notification':
      return { name: 'notifications', color: '#cc6600', bgColor: '#fff0e6' };
    case 'update':
      return { name: 'update', color: '#00cc66', bgColor: '#e6ffed' };
    default:
      return { name: 'info', color: '#6600cc', bgColor: '#f0e6ff' };
  }
};

const EventCard = ({ event, onPress }: any) => {
  const icon = getEventIcon(event.type);
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: icon.bgColor }]}>
        <MaterialIcons name={icon.name} size={24} color={icon.color} />
      </View>
      
      <View style={styles.contentContainer}>
        <CustomText style={styles.title}>{event.title}</CustomText>
        <CustomText style={styles.date}>{event.date}</CustomText>
        <CustomText style={styles.description} numberOfLines={2}>
          {event.description}
        </CustomText>
      </View>
      
      <MaterialIcons name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#888',
  },
});

export default EventCard;