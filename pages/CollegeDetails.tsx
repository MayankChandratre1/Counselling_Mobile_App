import { StyleSheet, Text, View, ActivityIndicator, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { RouteProp, useRoute } from '@react-navigation/native'
import config from '../configs/API'
import TopBar from '../components/General/TopBar'
import CutoffTable from '../components/CollegeDetails/CutoffTable'
import TabBar from '../components/CollegeDetails/TabBar'
import CutoffTab from '../components/CollegeDetails/CutoffTab'
import AboutTab from '../components/Colleges/AboutTab'
import { useCollegeContext } from '../contexts/CollegeContext'
import { College } from '../utils/college-data-store'
import GetAdviceButton from '../components/CollegeDetails/GetAdviceButton'

type CollegeDetailsType = College

const { COLLEGE_API } = config;

const CollegeDetails = () => {
  const route = useRoute<RouteProp<Record<string, { collegeId: string }>, string>>();
  const [college, setCollege] = useState<CollegeDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [cutoffs, setCutoffs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("About");
  
  // Use the college context to get college data
  const { getCollegeById, isLoading: contextLoading } = useCollegeContext();

  useEffect(() => {
    const fetchCollegeDetails = async () => {
      try {
        setLoading(true);
        console.log(`Fetching college details for ID: ${route.params.collegeId}`);
        
        // Get college from context instead of direct API call
        const collegeData = getCollegeById(route.params.collegeId);
        
        if (collegeData) {
          setCollege(collegeData);
          setError(null);
        } else {
          // Fallback to direct API call if not found in context
          const response = await fetch(`${COLLEGE_API}/colleges/${route.params.collegeId}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch college details');
          }
          
          const data = await response.json();
          console.log(data);
          
          setCollege(data);
          setError(null);
        }
      } catch (err) {
        setError('Failed to fetch college details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeDetails();
  }, [route.params.collegeId, getCollegeById]);

  useEffect(() => {
    if (!college) {
      return;
    }
    const fetchCutoffs = async () => {
      try {
        setLoading(true);
        let cutoffsData:any = []

        if(college.branches){
          cutoffsData = college.branches.map((br:any, i:number) => {
            const cutoffsArray = br.cutoffs.map((cutoff:any, id:number)=>(
              {
                id:college.id+"_"+i+"_"+id,
                instituteName: college.instituteName,
                instituteCode: college.instituteCode,
                branchCode: br.branchCode,
                branchName: br.branchName,
                Category: cutoff.category,
                rank: cutoff.rank,
                percentile: cutoff.percentile,
                capRound: cutoff.capRound,
                city: college.city,
                year: cutoff.year ?? 2024,
              }
            ))
            return cutoffsArray;
          })
          cutoffsData = cutoffsData.flat();
          console.log("Cutoffs Data: ", cutoffsData);
          setCutoffs(cutoffsData);
        }
        
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
          <AboutTab college={college} styles={styles} />
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

  const normaliseInstituteCode = (code:string)=>{
    if(code.length < 5){
      return code.padStart(5, '0');
    }
    return code;
  }

  // Show loading state if either context or component is loading
  if (loading || contextLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#613EEA" />
      </View>
    );
  }

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
              {normaliseInstituteCode(college?.instituteCode.toString() || "")}
            </Text>
            <Text style={styles.description}>
              Institute code
            </Text>
          </View>

          <View style={{alignItems: "flex-end"}}>
            <Text style={styles.intake}>
              {college?.additionalMetadata?.totalIntake || "N/A"}
            </Text>
            <Text style={styles.description}>
              Total Intake
            </Text>
          </View>

          
        </View>
        <Text style={styles.title}>{college.instituteName}</Text>
        <Text style={styles.subtitle}>{college.city ? college.city.toUpperCase(): "N/A"}</Text>
        <GetAdviceButton />
        
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
    height: 150,
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