import { StyleSheet, View, Image, Animated } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { getUserData, getPremiumStatus } from '../../utils/storage'
import FontAwesome from "react-native-vector-icons/FontAwesome"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import CustomText from '../General/CustomText'
import { FONTS } from '../../styles/typography'

interface UserData {
  name: string;
  phone: string;
  email: string;
}

const ProfileCard = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const avatarScale = useRef(new Animated.Value(0.8)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
    
    // Start animation
    Animated.parallel([
      Animated.spring(avatarScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await getUserData();
      setUserData(data);
      
      // Load premium status
      const premiumStatus = await getPremiumStatus();
      setIsPremium(premiumStatus?.isPremium || false);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardContent}>
        <Animated.View style={[
          styles.avatarContainer,
          { transform: [{ scale: avatarScale }] }
        ]}>
          <FontAwesome name="user-circle" size={100} color="#371981" />
          {isPremium && (
            <View style={styles.badgeContainer}>
              <MaterialIcons name="verified" size={22} color="#FFD700" />
            </View>
          )}
        </Animated.View>
        
        <Animated.View style={[
          styles.userInfo,
          { opacity: fadeIn }
        ]}>
          <CustomText style={styles.userName}>{userData?.name || 'User'}</CustomText>
          
          {userData?.phone && (
            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={14} color="#666" />
              <CustomText style={styles.infoText}>{userData.phone}</CustomText>
            </View>
          )}
          
          {userData?.email && (
            <View style={styles.infoRow}>
              <MaterialIcons name="email" size={14} color="#666" />
              <CustomText style={styles.infoText}>{userData.email}</CustomText>
            </View>
          )}
          
          {isPremium && (
            <View style={styles.premiumBadge}>
              <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
              <CustomText style={styles.premiumText}>Premium Member</CustomText>
            </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 16,
  },
  cardContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 3,
    borderWidth: 2,
    borderColor: '#371981',
  },
  userInfo: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#371981',
    marginBottom: 8,
    fontFamily: FONTS?.BOLD || 'System',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontFamily: FONTS?.REGULAR || 'System',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F5FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 10,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#371981',
    marginLeft: 6,
    fontFamily: FONTS?.BOLD || 'System',
  },
});