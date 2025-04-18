import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { getUserPlanData } from '../../utils/storage'
import TopBar from '../General/TopBar'
import { useNavigation } from '@react-navigation/native'

interface DashboardCard {
  title: string;
  icon: string;
  description: string;
  route?: string;
  color: string;
  disabled?: boolean;
}

const PremiumDashboard = () => {
  const navigation = useNavigation<any>();
  const [planTitle, setPlanTitle] = useState('');

  useEffect(() => {
    const getPlanInfo = async () => {
      const plan = await getUserPlanData();
      setPlanTitle(plan?.plan?.planTitle || 'Free');
    };
    getPlanInfo();
  }, []);

  const cards: DashboardCard[] = [
    {
      title: 'Current Plan',
      icon: 'crown',
      description: `You are on ${planTitle} Plan`,
      color: '#613EEA',
    },
    {
      title: 'Track Progress',
      icon: 'progress-check',
      description: 'Track your counselling progress',
      route: 'CounsellingForm',
      color: '#4CAF50',
    },
    {
      title: 'Registration Data',
      icon: 'card-account-details',
      description: 'View and edit your details',
      route: 'RegistrationForm',
      color: '#2196F3',
    },
    {
      title: 'My Lists',
      icon: 'format-list-checks',
      description: 'View your college lists',
      route: 'MyLists',
      color: '#FF9800',
    },
    {
      title: 'Coming soon...',
      icon: 'chart-bar',
      description: 'Predict your college chances',
      route: 'CollegePredictor',
      color: '#9C27B0',
      disabled: true,
    },
    {
      title: 'Coming soon...',
      icon: 'book-open-page-variant',
      description: 'Access study materials',
      color: '#F44336',
      disabled: true,
    },
  ];

  return (
    <>
      <TopBar heading="Dashboard" />
      <ScrollView style={styles.container}>
        <Text style={styles.welcome}>Welcome to Your Dashboard</Text>
        <View style={styles.cardsContainer}>
          {cards.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.card, { backgroundColor: card.color }, card.disabled && styles.disbaleCard]}
              onPress={() => card.route && navigation.navigate(card.route)}
              disabled={!!card.disabled}
            >
              <Icon name={card.icon} size={32} color="#fff" />
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDescription}>{card.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    textAlign: 'center',
  },
  cardsContainer: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disbaleCard: {
    opacity: 0.5,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  cardDescription: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    opacity: 0.9,
  },
})

export default PremiumDashboard