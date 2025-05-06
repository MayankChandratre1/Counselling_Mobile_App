import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Linking, 
  SafeAreaView, 
  Dimensions,
  Platform,
  ActivityIndicator
} from 'react-native'
import React, { useState, useEffect } from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'
import TopBar from '../General/TopBar'
import CustomText from '../General/CustomText'
import { FONTS } from '../../styles/typography'
import { useContact } from '../../contexts/ContactContext'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive sizing utilities
const scale = (size: number) => {
  const baseWidth = 375;
  return (SCREEN_WIDTH / baseWidth) * size;
};

const ContactPage = () => {
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const { contactData, loading: dataLoading, error, refreshContactData } = useContact();


  // Generate contact information object from API data or fallback
  const getContactInfo = () => {
    if (!contactData) {
      // Fallback data if API fails
      return {
        company: { name: "Sarathi Counselling" },
        address: { 
          value: "N/A",
          link: "#" 
        },
        phone: "+N/A",
        whatsapp: {
          number: "N/A",
          groupinvite: "#"
        },
        youtube: "#"
      };
    }
    
    return contactData;
  };
  
  const contactInfo = getContactInfo();
  
  // Handle opening external links with loading state
  const openLink = async (url: string, linkType: string) => {
    if (!url || url === "#") return;
    
    try {
      setLoading({...loading, [linkType]: true});
      await Linking.openURL(url);
    } catch (err) {
      console.error('Error opening URL:', err);
    } finally {
      setLoading({...loading, [linkType]: false});
    }
  };

  // Contact actions
  const handleCall = () => openLink(`tel:${contactInfo.phone}`, 'call');
  const handleEmail = () => openLink(`mailto:contact@sarathicounselling.com`, 'email');
  const handleLocation = () => openLink(contactInfo.address.link, 'location');
  const handleWhatsApp = () => openLink(`https://wa.me/${contactInfo.whatsapp.number}`, 'whatsapp');
  const handleWhatsAppGroup = () => openLink(contactInfo.whatsapp.groupinvite, 'whatsappGroup');
  const handleYouTube = () => openLink(contactInfo.youtube, 'youtube');

  // Retry loading contact data if it failed
  const handleRetry = () => {
    refreshContactData();
  };

  // Button component for reusability
  const ContactButton = ({ 
    onPress, 
    icon, 
    text, 
    bgColor, 
    loadingKey 
  }: { 
    onPress: () => void, 
    icon: string, 
    text: string, 
    bgColor: string,
    loadingKey: string
  }) => (
    <TouchableOpacity 
      style={[styles.socialButton, { backgroundColor: bgColor }]} 
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading[loadingKey]}
      accessible={true}
      accessibilityLabel={text}
      accessibilityRole="button"
    >
      {loading[loadingKey] ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <Icon name={icon} size={scale(22)} color="#fff" />
          <CustomText style={styles.socialButtonText}>{text}</CustomText>
        </>
      )}
    </TouchableOpacity>
  );

  // Contact info item component
  const ContactInfoItem = ({ 
    icon, 
    label, 
    children 
  }: { 
    icon: string, 
    label: string, 
    children: React.ReactNode 
  }) => (
    <View>
      <View style={styles.contactItem}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={scale(22)} color="#371981" />
        </View>
        <View style={styles.contactTextContainer}>
          <CustomText style={styles.contactLabel}>{label}</CustomText>
          {children}
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  );

  // If data is still loading, show a loading screen
  if (dataLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TopBar heading="Contact Us" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#371981" />
          <CustomText style={styles.loadingText}>Loading contact information...</CustomText>
        </View>
      </SafeAreaView>
    );
  }

  // If there was an error loading data, show an error message
  if (error && !contactData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TopBar heading="Contact Us" />
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={60} color="#ff6b6b" />
          <CustomText style={styles.errorText}>{error}</CustomText>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <CustomText style={styles.retryButtonText}>Retry</CustomText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar heading="Contact Us" />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/Yash_aaradhey_logo.png')}
            style={styles.logo}
            resizeMode="contain"
            accessible={true}
            accessibilityLabel="Company Logo"
          />
          <CustomText style={styles.companyName}>
            {contactInfo.company.name}
          </CustomText>
        </View>

        {/* Social Media Section */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Connect With Us</CustomText>
          
          <View style={styles.socialButtonsContainer}>
            <View style={styles.socialRow}>
              <View style={styles.socialButtonWrapper}>
                <ContactButton 
                  onPress={handleWhatsAppGroup}
                  icon="group"
                  text="Join WhatsApp"
                  bgColor="#25D366"
                  loadingKey="whatsappGroup"
                />
              </View>
              
              <View style={styles.socialButtonWrapper}>
                <ContactButton 
                  onPress={handleWhatsApp}
                  icon="chat"
                  text="Message"
                  bgColor="#25D366"
                  loadingKey="whatsapp"
                />
              </View>
            </View>
            
            <View style={[styles.socialRow, { justifyContent: 'flex-start' }]}>
              <View style={[styles.socialButtonWrapper,{ width: '100%'}]}>
                <ContactButton 
                  onPress={handleYouTube}
                  icon="play-circle-filled"
                  text="YouTube"
                  bgColor="#FF0000"
                  loadingKey="youtube"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Contact Information Section */}
        <View style={styles.section}>
          <CustomText style={styles.sectionTitle}>Reach Out To Us</CustomText>
          
          <View style={styles.contactCard}>
            <ContactInfoItem icon="location-on" label="Our Office">
              <TouchableOpacity 
                onPress={handleLocation}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel="View office location on map"
                accessibilityRole="button"
                style={styles.actionButton}
              >
                <CustomText style={[styles.contactText, styles.actionText]}>
                  {contactInfo.address.value}
                </CustomText>
                {loading.location && 
                  <ActivityIndicator size="small" color="#371981" style={styles.smallLoader} />
                }
              </TouchableOpacity>
            </ContactInfoItem>
            
          
            
            <ContactInfoItem icon="phone" label="Phone Number">
              <TouchableOpacity 
                onPress={handleCall}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel="Call phone number"
                accessibilityRole="button"
                style={styles.actionButton}
              >
                <CustomText style={[styles.contactText, styles.actionText]}>
                  {contactInfo.phone}
                </CustomText>
                {loading.call && 
                  <ActivityIndicator size="small" color="#371981" style={styles.smallLoader} />
                }
              </TouchableOpacity>
            </ContactInfoItem>
          </View>

          {/* Quick Contact Buttons */}
          <View style={styles.quickContactContainer}>
            <TouchableOpacity 
              style={styles.quickContactButton} 
              onPress={handleCall}
              activeOpacity={0.8}
              accessible={true}
              accessibilityLabel="Call us"
              accessibilityRole="button"
            >
              <View style={[styles.quickIconContainer, { backgroundColor: '#371981' }]}>
                <Icon name="phone" size={scale(20)} color="#fff" />
              </View>
              <CustomText style={styles.quickContactText}>Call</CustomText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickContactButton} 
              onPress={handleWhatsApp}
              activeOpacity={0.8}
              accessible={true}
              accessibilityLabel="Message on WhatsApp"
              accessibilityRole="button"
            >
              <View style={[styles.quickIconContainer, { backgroundColor: '#25D366' }]}>
                <Icon name="chat" size={scale(20)} color="#fff" />
              </View>
              <CustomText style={styles.quickContactText}>Message</CustomText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickContactButton} 
              onPress={handleLocation}
              activeOpacity={0.8}
              accessible={true}
              accessibilityLabel="View location"
              accessibilityRole="button"
            >
              <View style={[styles.quickIconContainer, { backgroundColor: '#4285F4' }]}>
                <Icon name="location-on" size={scale(20)} color="#fff" />
              </View>
              <CustomText style={styles.quickContactText}>Location</CustomText>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  )
}

export default ContactPage

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
    paddingBottom: scale(20),
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: scale(20),
    backgroundColor: '#fff',
    borderBottomLeftRadius: scale(20),
    borderBottomRightRadius: scale(20),
    marginBottom: scale(5),
  },
  logo: {
    width: SCREEN_WIDTH * 0.6,
    height: scale(100),
  },
  companyName: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#371981',
    marginTop: scale(10),
    fontFamily: FONTS?.BOLD || 'System',
  },
  // Add new styles for loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: scale(15),
    fontSize: scale(16),
    color: '#371981',
    fontFamily: FONTS?.MEDIUM || 'System',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: scale(20),
  },
  errorText: {
    fontSize: scale(16),
    color: '#555',
    textAlign: 'center',
    marginVertical: scale(15),
    fontFamily: FONTS?.MEDIUM || 'System',
  },
  retryButton: {
    backgroundColor: '#371981',
    paddingVertical: scale(10),
    paddingHorizontal: scale(25),
    borderRadius: scale(20),
    marginTop: scale(15),
  },
  retryButtonText: {
    color: 'white',
    fontSize: scale(16),
    fontFamily: FONTS?.BOLD || 'System',
  },
  // Rest of the existing styles
  section: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(20),
  },
  sectionTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#371981',
    marginBottom: scale(16),
    fontFamily: FONTS?.BOLD || 'System',
  },
  // Improved responsive grid system for social buttons
  socialButtonsContainer: {
    width: '100%',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(10),
  },
  socialButtonWrapper: {
    width: '48%', // More precise width for proper spacing
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(12),
    borderRadius: scale(10),
    shadowColor: '#00000030',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    minHeight: scale(48), // Ensure consistent height
  },
  socialButtonText: {
    color: 'white',
    fontSize: scale(14),
    marginLeft: scale(8),
    fontWeight: 'bold',
    fontFamily: FONTS?.MEDIUM || 'System',
    flexShrink: 1, // Allow text to shrink on smaller screens
    textAlign: 'center',
  },
  contactCard: {
    borderRadius: scale(12),
    backgroundColor: '#F7F5FF',
    padding: scale(15),
    borderWidth: 1,
    borderColor: '#E6E1FF',
    shadowColor: '#00000030',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row',
    paddingVertical: scale(12),
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: '#E6E1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: scale(15),
    color: '#371981',
    fontWeight: 'bold',
    marginBottom: scale(4),
    fontFamily: FONTS?.MEDIUM || 'System',
  },
  contactText: {
    fontSize: scale(14),
    color: '#333',
    marginBottom: scale(2),
    fontFamily: FONTS?.REGULAR || 'System',
    lineHeight: scale(20),
  },
  actionText: {
    color: '#371981',
    textDecorationLine: 'underline',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E6E1FF',
    marginVertical: scale(5),
  },
  bottomPadding: {
    height: scale(40),
  },
  quickContactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: scale(24),
    paddingVertical: scale(12),
    backgroundColor: '#F7F5FF',
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: '#E6E1FF',
  },
  quickContactButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIconContainer: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(6),
    shadowColor: '#00000030',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  quickContactText: {
    fontSize: scale(12),
    color: '#333',
    fontFamily: FONTS?.MEDIUM || 'System',
  },
  smallLoader: {
    marginLeft: scale(5),
  },
});