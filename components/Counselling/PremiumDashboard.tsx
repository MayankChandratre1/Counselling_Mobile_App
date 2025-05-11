import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUserPlanData } from '../../utils/storage';
import TopBar from '../General/TopBar';
import { useNavigation } from '@react-navigation/native';
import { useDynamicTabs, DynamicTabData } from '../../contexts/DynamicTabContext';
import { usePremiumPlan } from '../../contexts/PremiumPlanContext';

interface DashboardCard {
  title: string;
  icon: string;
  description: string;
  route?: string;
  color: string;
  disabled?: boolean;
  isDynamic?: boolean;
  html?: string | null;
  url?: string | null;
  isPremiumOnly?: boolean;
}

const PremiumDashboard = () => {
  const navigation = useNavigation<any>();
  const [planTitle, setPlanTitle] = useState('');
  const {currentPlan, refreshPlanData,isLoading} = usePremiumPlan()
  
  // Use the dynamic tabs hook with isPremium=true
  const { tabs: dynamicTabs, loading, error, refreshTabs } = useDynamicTabs(true);

  useEffect(() => {
    const initialize = async () => {
      // Get user plan info
      const plan = await getUserPlanData();
      setPlanTitle(currentPlan || 'Premium');
    };
    
    initialize();
  }, []);

   // Helper function to get icon based on title
   const getIconForTitle = (title: string): string => {
    const iconMap: {[key: string]: string} = {
      'Documents': 'file-document-outline',
      'Resources': 'book-open-variant',
      'Guidelines': 'clipboard-text-outline',
      'News': 'newspaper',
      'Events': 'calendar',
      'Videos': 'video',
    };
    
    return iconMap[title] || 'web'; // Default to 'web' icon if title not in map
  };

  // Helper function to get color based on index
  const getColorForIndex = (index: number): string => {
    const colors = ['#613EEA', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#009688', '#E91E63'];
    return colors[index % colors.length];
  };

  // Static cards
  const staticCards: DashboardCard[] = [
    {
      title: 'Current Plan',
      icon: 'crown',
      description: `You are on ${planTitle} Plan`,
      color: '#613EEA',
      route: 'MyPlan',
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
  ];

  // Combine static cards with dynamic tabs
  const allCards = [...staticCards];

  // Add dynamic tabs to cards
  if (!loading) {
    dynamicTabs.forEach((tab, index) => {
      allCards.push({
        title: tab.title,
        icon: getIconForTitle(tab.title),
        description: `Access ${tab.title.toLowerCase()}`,
        color: getColorForIndex(staticCards.length + index),
        isDynamic: true,
        html: tab.html,
        url: tab.url,  
      });
    });

    if(dynamicTabs.length < 2){
      for(let i = dynamicTabs.length; i < 2; i++){
        allCards.push({
          title: 'Coming Soon',
          icon: 'clock-outline',
          description: 'More features coming soon!',
          color: '#9E9E9E',
          disabled: true,
        });
      }
    }
  }

  // Function to handle card press
  const handleCardPress = (card: DashboardCard) => {
    if (card.isDynamic) {
      navigation.navigate('DynamicContentScreen', {
        title: card.title,
        html: card.html,
        url: card.url
      });
    } else if (card.route) {
      navigation.push(card.route);
    }
  };

  return (
    <>
      <TopBar heading="Dashboard" />
      <ScrollView 
      style={styles.container}
      refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={refreshPlanData} />
              }
      >
        <Text style={styles.welcome}>Welcome to Your Dashboard</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#613EEA" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={48} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={refreshTabs}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {allCards.map((card, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.card, 
                  { backgroundColor: card.color }, 
                  card.disabled && styles.disabledCard
                ]}
                onPress={() => handleCardPress(card)}
                disabled={!!card.disabled}
              >
                <Icon name={card.icon} size={32} color="#fff" />
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardDescription}>{card.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
};

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
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
  },
  disabledCard: {
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
  loadingContainer: {
    padding: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#371981',
    borderRadius: 20,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default PremiumDashboard;