import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Linking, SafeAreaView, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import YoutubePlayer from 'react-native-youtube-iframe';
import { RequestMethod, secureRequest } from '../utils/tokenedRequest';
import config from '../configs/API';
import CustomText from '../components/General/CustomText';
import { useNavigation } from '@react-navigation/native';
import { FONTS } from '../styles/typography';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TopBar from '../components/General/TopBar';

// Get screen dimensions for responsive layout
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_HEIGHT < 700;

interface Testimonial {
  name: string;
  designation: string;
  feedback: string;
}

interface LandingData {
  title: string;
  slogan: string;
  videoUrl: string;
  testimonials: Testimonial[];
  features: string[];
  ctaText: string;
  updatedAt: string;
}

const FeatureItem = ({ text }: { text: string }) => (
  <View style={styles.featureItem}>
    <Icon name="check-circle" size={24} color="#371981" />
    <CustomText style={styles.featureText}>{text}</CustomText>
  </View>
);

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <View style={styles.testimonialCard}>
      <CustomText style={styles.testimonialQuote}>"</CustomText>
      <CustomText style={styles.testimonialContent}>{testimonial.feedback}</CustomText>
      <View style={styles.testimonialAuthor}>
        <CustomText style={styles.testimonialName}>{testimonial.name}</CustomText>
        <CustomText style={styles.testimonialDesignation}>{testimonial.designation}</CustomText>
      </View>
    </View>
  );
};

const Landing = () => {
  const [landingData, setLandingData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<any>();
  
  // Function to extract video ID from YouTube URL
  const extractVideoId = (url: string): string => {
    if (!url) return "6HUYAfCB728"; // Default fallback video ID
    
    // Handle different YouTube URL formats
    let videoId = "";
    
    // Regular youtube.com/watch?v= format
    const watchUrlMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^?&]+)/);
    if (watchUrlMatch && watchUrlMatch[1]) {
      videoId = watchUrlMatch[1];
    }
    
    // Handle youtu.be/ID format
    else if (url.includes('youtu.be/')) {
      const shortUrlMatch = url.split('youtu.be/')[1];
      if (shortUrlMatch) {
        videoId = shortUrlMatch.split('?')[0];
      }
    }
    
    // Handle youtube.com/embed/ID format
    else if (url.includes('/embed/')) {
      const embedUrlMatch = url.split('/embed/')[1];
      if (embedUrlMatch) {
        videoId = embedUrlMatch.split('?')[0];
      }
    }
    
    return videoId || "6HUYAfCB728"; // Return extracted ID or fallback
  };
  
  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        setLoading(true);
        const response = await secureRequest<LandingData>(`${config.USER_API}/landing`, RequestMethod.GET);
        
        if (response.data) {
          console.log("Landing Data: ", response.data);
          setLandingData(response.data);
        } else if (response.error) {
          setError(response.error);
        }
      } catch (err) {
        setError('Failed to load landing page data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLandingData();
  }, []);
  
  // Fallback data in case API fails
  const fallbackData: LandingData = {
    title: "SARATHI",
    slogan: "YOUR GUIDE TO SUCCESS",
    videoUrl: "https://youtu.be/dnVO0PwI7A4",
    testimonials: [
      {
        name: "Mayank",
        designation: "Student",
        feedback: "Sarathi made my dream come true"
      },
      {
        name: "Yashvardhan Dhondge",
        designation: "Parent",
        feedback: "Due to SARATHI, I was able to find the best college for my child."
      }
    ],
    features: [
      "Analyse your data",
      "Take sessions and create personalised lists",
      "Make you land in the best college"
    ],
    ctaText: "Enroll Now!",
    updatedAt: new Date().toISOString()
  };
  
  // Use landing data or fallback
  const data = landingData || fallbackData;
  
  // Extract video ID
  const videoId = extractVideoId(data.videoUrl);
  
  const handleCTAPress = () => {
    navigation.navigate('Counselling');
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TopBar heading={data.title} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#371981" />
          <CustomText style={styles.loadingText}>Loading...</CustomText>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar heading={data.title} />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerSection}>
          <CustomText style={styles.slogan}>{data.slogan}</CustomText>
        </View>
        
        {/* Video Section */}
        <View style={styles.section}>
          <View style={[styles.videoContainer, { height: SCREEN_WIDTH * 0.5 }]}>
            {videoId ? (
              <YoutubePlayer
                height={SCREEN_WIDTH * 0.5625}
                play={true}
                videoId={videoId}
                onError={(e) => {
                  console.error('YouTube Player Error:', e);
                }}
              />
            ) : (
              <TouchableOpacity 
                style={styles.openYoutubeButton} 
                onPress={() => Linking.openURL(data.videoUrl)}
              >
                <Icon name="play-circle-filled" size={50} color="#FF0000" />
                <CustomText style={styles.openYoutubeText}>Watch on YouTube</CustomText>
              </TouchableOpacity>
            )}
          </View>
          
         
        </View>
        
        {/* Features Section */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>What We Offer</CustomText>
          <View style={styles.featuresContainer}>
            {data.features.map((feature, index) => (
              <FeatureItem key={index} text={feature} />
            ))}
          </View>
        </View>
        
        {/* Testimonial Section */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>What People Say</CustomText>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialsScrollContainer}
            snapToInterval={SCREEN_WIDTH * 0.85} // Snap to testimonial cards
            decelerationRate="fast"
          >
            {data.testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </ScrollView>
        </View>
        
        {/* Add padding at the bottom to ensure the button doesn't overlap with content */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Fixed position CTA button that stays above tab bar */}
      <View style={styles.ctaButtonContainer}>
        <TouchableOpacity 
          style={styles.ctaButton} 
          onPress={handleCTAPress}
          activeOpacity={0.8}
        >
          <CustomText style={styles.ctaButtonText}>{data.ctaText}</CustomText>
          <Icon name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Landing;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding to account for the fixed button
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#371981',
    fontSize: 16,
  },
  headerSection: {
    backgroundColor: '#371981',
    padding: 16,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  slogan: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: FONTS.BOLD,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  videoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#371981',
    marginBottom: 20,
    fontFamily: FONTS.BOLD,
  },
  featuresContainer: {
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f8ff',
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E1FF',
  
  },
  featureText: {
    marginLeft: 15,
    fontSize: 16,
    fontFamily: FONTS.MEDIUM,
    color: '#333',
  },
  testimonialsScrollContainer: {
    paddingBottom: 15,
    paddingRight: 20,
  },
  testimonialCard: {
    width: SCREEN_WIDTH * 0.85,
    padding: 20,
    borderRadius: 16,
    borderColor: '#E6E1FF',
    backgroundColor: '#F7F5FF',
    marginRight: 15,
  
    position: 'relative',
    borderWidth: 1,
  },
  testimonialQuote: {
    fontSize: 40,
    color: '#371981',
    opacity: 0.2,
    position: 'absolute',
    top: 8,
    left: 10,
    fontFamily: FONTS.BOLD,
  },
  testimonialContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 15,
    fontFamily: FONTS.REGULAR,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#371981',
    fontFamily: FONTS.BOLD,
  },
  testimonialDesignation: {
    fontSize: 14,
    color: '#666',
    fontFamily: FONTS.REGULAR,
  },
  ctaButtonContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 70,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  ctaButton: {
    backgroundColor: '#371981',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
    width: '90%',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    fontFamily: FONTS.BOLD,
  },
  openYoutubeButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  openYoutubeText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  youtubeLink: {
    alignSelf: 'center',
    marginTop: 10,
  },
  youtubeLinkText: {
    color: '#371981',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  bottomPadding: {
    height: 80,
  },
});