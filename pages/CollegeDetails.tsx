import { StyleSheet, Text, View, ActivityIndicator, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { RouteProp, useRoute } from '@react-navigation/native'
import config from '../configs/API'
import TopBar from '../components/General/TopBar'
import CutoffTable from '../components/CollegeDetails/CutoffTable'
import TabBar from '../components/CollegeDetails/TabBar'
import CutoffTab from '../components/CollegeDetails/CutoffTab'

type CollegeDetailsType = {
  id: string;
  instituteName: string;
  city: string;
  image?: string;
  description?: string;
  instituteCode: string;
  Status: string;
  // Add more fields as needed
}

const { COLLEGE_API } = config;

const CollegeDetails = () => {
  const route = useRoute<RouteProp<Record<string, { collegeId: string }>, string>>();
  const [college, setCollege] = useState<CollegeDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [cutoffs, setCutoffs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("About");

  useEffect(() => {
    const fetchCollegeDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${COLLEGE_API}/colleges/${route.params.collegeId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch college details');
        }
        
        const data = await response.json();
        console.log(data);
        
        setCollege(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch college details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeDetails();
  }, [route.params.collegeId]);


  useEffect(() => {
    if (!college) {
      return;
    }
    const fetchCutoffs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${COLLEGE_API}/cutoffs/institute/${college?.instituteCode}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch cutoffs');
        }
        
        const data = await response.json();
        console.log("Cutoffs");
        console.log(data);
        
        setCutoffs(data.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch cutoffs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCutoffs();
  },[college])

  const renderTabContent = () => {
    switch (activeTab) {
      case "About":
        return (
          <View style={styles.tabContent}>
            <View style={styles.aboutContainer}>
              <Text style={styles.label}>Institute Name:</Text>
              <Text style={styles.value} numberOfLines={3}>
                {college?.instituteName}
              </Text>
            </View>
            
            <View style={styles.aboutContainer}>
              <Text style={styles.label}>City:</Text>
              <Text style={styles.value} numberOfLines={2}>
                {college?.city}
              </Text>
            </View>
            
            <View style={styles.aboutContainer}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value} numberOfLines={2}>
                {college?.Status || 'N/A'}
              </Text>
            </View>
          </View>
        );
      
      case "Cutoff":
        return college?.instituteCode && cutoffs && cutoffs.length > 0 ? (
          <CutoffTab cutoffs={cutoffs} />
        ) : (
          <Text style={styles.noDataText}>No cutoff data available</Text>
        );
      
      case "Fees":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.noDataText}>Fees information coming soon</Text>
          </View>
        );
      
      case "Gallery":
        return (
          <View style={styles.tabContent}>
            <Image 
              source={college?.image 
                ? { uri: college.image }
                : require('../assets/CollegePlaceholder.png')
              }
              style={styles.galleryImage}
              resizeMode="contain"
            />
          </View>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#613EEA" />
      </View>
    );
  }

  // if (error) {
  //   return (
  //     <View style={styles.centerContainer}>
  //       <Text style={styles.errorText}>{error}</Text>
  //     </View>
  //   );
  // }

  if (!college) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>College not found</Text>
      </View>
    );
  }

  return (
    <>
    <TopBar heading='College Details' />
    <ScrollView style={styles.container}>
      <Image 
        source={college?.image 
          ? { uri: college.image }
          : require('../assets/CollegePlaceholder.png')
        }
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.detailsContainer}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <View style={{alignItems: "flex-start"}}>
            <Text style={styles.instuteCode}>
              {college.instituteCode}
            </Text>
            <Text style={styles.description}>
              Institute code
            </Text>
          </View>

          <View style={{alignItems: "flex-end"}}>
            <Text style={styles.intake}>
              7963
            </Text>
            <Text style={styles.description}>
              Total Intake
            </Text>
          </View>

          
        </View>
        <Text style={styles.title}>{college.instituteName}</Text>
        <Text style={styles.subtitle}>City: {college.city ? college.city.toUpperCase(): "N/A"}</Text>
        
        <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
        {renderTabContent()}
      </View>
    </ScrollView>
    </>
  )
}

export default CollegeDetails

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },
  coursesContainer: {
    marginTop: 20,
  },
  courseItem: {
    fontSize: 14,
    marginLeft: 10,
    marginTop: 5,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  detailsContainer: {
    padding: 15,
  },
  instuteCode: {
    fontSize: 16,
    fontWeight: 'bold',
    padding:5,
    borderRadius:10,
    backgroundColor:"#64A6FA9C"
  },
  intake: {
    fontSize: 16,
    fontWeight: 'bold',
    padding:5,
    borderRadius:10,
    backgroundColor:"#FACD649C",
    
  },
  tabContent: {
    padding: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1',
    marginRight: 8,
    width: '40%', // Fixed width for labels
  },
  value: {
    fontSize: 16,
    color: '#333',
    flex: 1, // Takes remaining space
    flexWrap: 'wrap',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  galleryImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  aboutContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: 15,
    flexWrap: 'wrap',
  }
})