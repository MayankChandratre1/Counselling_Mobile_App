import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import React, { useState, useEffect } from 'react'
import TopBar from '../../components/General/TopBar'
import CustomText from '../../components/General/CustomText'
import ListDetails from '../../components/Lists/ListDetails'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useRoute, useNavigation } from '@react-navigation/native'
import { getUserData } from '../../utils/storage'
import { FONTS } from '../../styles/typography'

const ListDetailsScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { list } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Load user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData();
        
        setUserData(data);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    fetchUserData();
  }, []);

  // If no list data is passed, show error state
  if (!list) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar heading="List Details" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#FF6B6B" />
          <CustomText style={styles.errorText}>List information not found</CustomText>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <CustomText style={styles.backButtonText}>Go Back</CustomText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Format date for display
  const formattedDate = new Date(list.updatedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TopBar heading="List Details" />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#371981" />
          <CustomText style={styles.loadingText}>Loading list details...</CustomText>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.titleRow}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="format-list-bulleted" size={24} color="#fff" />
              </View>
              <View style={styles.titleContainer}>
                <CustomText style={styles.listTitle}>{list.title}</CustomText>
                <CustomText style={styles.listSubtitle}>
                  Updated on {formattedDate}
                </CustomText>
              </View>
            </View>
            
            {userData && (
              <View style={styles.userInfoContainer}>
                <View style={styles.userInfoRow}>
                  <CustomText style={styles.userInfoValue}>
                    {userData.fullName || userData.name || "N/A"}
                  </CustomText>
                </View>
                
                {userData.counsellingData.category && (
                  <View style={styles.userInfoRow}>
                    <View style={styles.categoryPill}>
                      <CustomText style={styles.categoryText}>{userData.counsellingData.category}</CustomText>
                    </View>
                  </View>
                )}
              </View>
            )}
            
            <View style={styles.statsContainer}>
            {userData?.counsellingData.cetMarks && (
                <View style={styles.statItem}>
                  <CustomText style={styles.statLabel}>CET</CustomText>
                  <CustomText style={[styles.statValue, { color: '#4CAF50' }]}>
                    {userData.counsellingData.cetMarks}%
                  </CustomText>
                  <CustomText style={styles.statLabel}>JEE</CustomText>

                  <CustomText style={[styles.statValue, { color: '#4CAF50' }]}>
                    {userData.counsellingData.jeeMarks}%
                  </CustomText>
                </View>
              )}
              <View style={styles.statItem}>
                <MaterialIcons name="school" size={20} color="#371981" />
                <CustomText style={styles.statValue}>
                  {list.colleges.length}
                </CustomText>
                <CustomText style={styles.statLabel}>
                  {list.colleges.length === 1 ? 'College' : 'Colleges'}
                </CustomText>
              </View>
              
              
            </View>
          </View>
          
          <View style={styles.detailsContainer}>
            <ListDetails 
              title={list.title} 
              colleges={list.colleges.map((college:any) => ({
                id: college.instituteCode.toString(),
                selectedBranchCode: college.selectedBranchCode,
              }))}
              fullScreen={true}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ListDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  headerContainer: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#371981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#371981',
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  backButton: {
    backgroundColor: '#371981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfoContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfoRow: {
    alignItems: 'center',
    marginBottom: 6,
  },
  userInfoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    width: 100,
  },
  userInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  categoryPill: {
    backgroundColor: 'rgba(55, 25, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    color: '#371981',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
