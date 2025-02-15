import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native'
import React from 'react'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

interface Update {
  id: string;
  title: string;
  subtitle: string;
  link?: string;
}

const UpdateCard = ({ update }: { update: Update }) => (
  <View style={styles.card}>
    <View>
    <Text style={styles.cardTitle}>{update.title}</Text>
    <Text style={styles.cardSubtitle}>{update.subtitle}</Text>
    </View>
    {update.link && (
      <TouchableOpacity 
        style={styles.linkButton}
        onPress={() => Linking.openURL(update.link!)}
      >
        <Text style={styles.linkText}>View Now</Text>
        <FontAwesome name="external-link" size={14} color="#613EEA" />
      </TouchableOpacity>
    )}
  </View>
);

const UpdateSlider = () => {
  // Sample data - replace with your actual data source
  const updates: Update[] = [
    {
      id: '1',
      title: 'New Video Released!',
      subtitle: 'Watch latest counselling tips',
      link: 'https://youtube.com/example1'
    },
    {
      id: '2',
      title: 'College Applications Open',
      subtitle: 'Last date: 30th June',
    },
    {
      id: '3',
      title: 'Live Session Tomorrow',
      subtitle: 'Topic: Engineering Pathways',
      link: 'https://meet.google.com/example'
    },
  ];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {updates.map(update => (
        <UpdateCard key={update.id} update={update} />
      ))}
    </ScrollView>
  );
}

export default UpdateSlider

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingRight: 5,
    gap: 15,
  },
  card: {
    backgroundColor: '#371981',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 15,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 12,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  linkText: {
    color: '#613EEA',
    fontSize: 14,
    fontWeight: '600',
  }
});
