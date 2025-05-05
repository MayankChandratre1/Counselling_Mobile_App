import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { getUserData } from '../../utils/storage'
import CustomText from '../General/CustomText'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import TopBar from '../General/TopBar'
import { useNavigation } from '@react-navigation/native'
import { usePremiumPlan } from '../../contexts/PremiumPlanContext'
  
const { width } = Dimensions.get('window');

const MyPlan = () => {
  const [userData, setUserData] = useState<any>(null);
  const navigation = useNavigation<any>();
  
  // Use premium plan context instead of local state
  const { 
    premiumPlan,
    isLoading,
    daysLeft,
    refreshPlanData 
  } = usePremiumPlan();
  
  useEffect(() => {
    // Fetch user data and refresh plan data
    const fetchData = async () => {
      const data = await getUserData();
      setUserData(data);
      refreshPlanData(data?.id);
    };

    fetchData();
  }, []);

  const formatDate = (dateObj: { _seconds: number; _nanoseconds: number }) => {
    if (!dateObj || !dateObj._seconds) return 'N/A';
    const date = new Date(dateObj._seconds * 1000);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#371981" />
        <CustomText style={styles.loadingText}>Loading your plan details...</CustomText>
      </View>
    );
  }

  if (!premiumPlan?.isPremium || !premiumPlan?.plan) {
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome5 name="crown" size={64} color="#DDDDDD" />
        <CustomText style={styles.emptyTitle}>No Premium Plan</CustomText>
        <CustomText style={styles.emptyText}>
          You don't have an active premium plan. Contact your counsellor to explore premium options.
        </CustomText>
        <TouchableOpacity style={[styles.supportButton,{marginTop: 20}]} onPress={() => {
          navigation.navigate({
            name: 'Counselling',
            params: { screen: 'FreeDashboard' },
          })
        }}>
          <CustomText style={[styles.supportButtonText,{marginHorizontal:5}]}>Explore Plans</CustomText>
          <MaterialIcons name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
    <TopBar heading="My Plan" />
    <ScrollView style={styles.container}>
      {/* Premium Plan Card */}
      <View style={styles.planCard}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="crown" size={28} color="#FFD700" />
          <CustomText style={styles.cardHeaderTitle}>{premiumPlan.plan.planTitle} Plan</CustomText>
          <View style={styles.activeBadge}>
            <CustomText style={styles.activeBadgeText}>ACTIVE</CustomText>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.daysLeftContainer}>
            <View style={[styles.daysLeftCircle, { 
              borderColor: daysLeft > 15 ? '#4CAF50' : daysLeft > 5 ? '#FF9800' : '#FF5252' 
            }]}>
              <CustomText style={[styles.daysLeftNumber, {
                color: daysLeft > 15 ? '#4CAF50' : daysLeft > 5 ? '#FF9800' : '#FF5252'
              }]}>{daysLeft}</CustomText>
              <CustomText style={styles.daysLeftText}>days left</CustomText>
            </View>
          </View>
          
          <View style={styles.timelineContainer}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot}>
                <MaterialIcons name="check" size={16} color="#fff" />
              </View>
              <View style={styles.timelineContent}>
                <CustomText style={styles.timelineLabel}>Purchased On</CustomText>
                <CustomText style={styles.timelineValue}>
                  {formatDate(premiumPlan.plan.purchasedDate)}
                </CustomText>
              </View>
            </View>
            
            <View style={[styles.timelineConnector, { 
              backgroundColor: daysLeft > 15 ? '#4CAF50' : '#FF9800' 
            }]} />
            
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { 
                backgroundColor: daysLeft > 15 ? '#4CAF50' : '#FF9800' 
              }]}>
                <MaterialIcons name="event" size={16} color="#fff" />
              </View>
              <View style={styles.timelineContent}>
                <CustomText style={styles.timelineLabel}>Expires On</CustomText>
                <CustomText style={styles.timelineValue}>
                  {formatDate(premiumPlan.plan.expiryDate)}
                </CustomText>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.supportCard}>
        <CustomText style={styles.supportTitle}>Need Help?</CustomText>
        <CustomText style={styles.supportText}>
          Contact your counsellor for any questions about your premium plan or to renew your subscription.
        </CustomText>
        
        <TouchableOpacity style={styles.supportButton}>
          <MaterialIcons name="contact-support" size={20} color="#fff" />
          <CustomText style={styles.supportButtonText}>Contact Support</CustomText>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </>
  )
}

export default MyPlan

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 16,
  },
  cardHeader: {
    backgroundColor: '#371981',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 20,
    alignItems: 'center',
  },
  planImage: {
    width: width*0.9,
    height: 200,
    marginBottom: 20,
  },
  timelineContainer: {
    width: '100%',
    marginVertical: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#371981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineConnector: {
    width: 2,
    height: 20,
    backgroundColor: '#371981',
    marginLeft: 13,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 14,
    color: '#666',
  },
  timelineValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  daysLeftContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  daysLeftCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  daysLeftNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  daysLeftText: {
    fontSize: 14,
    color: '#666',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 16,
  },
  benefitsSection: {
    marginTop: 8,
  },
  benefitsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  supportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  supportButton: {
    backgroundColor: '#371981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
})