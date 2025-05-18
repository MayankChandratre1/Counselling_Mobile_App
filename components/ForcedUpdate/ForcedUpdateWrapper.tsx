import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Linking,
  Image,
  NativeModules,
  SafeAreaView,
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { checkVersion, CheckVersionResponse } from 'react-native-check-version';
import CustomText from '../General/CustomText';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { FONTS } from '../../styles/typography';
import VersionCheck from 'react-native-version-check';

const { width, height } = Dimensions.get('window');

interface ForcedUpdateWrapperProps {
  children: React.ReactNode;
  bundleId: string;
  forceUpdateThreshold?: 'major' | 'minor' | 'patch';
}

/**
 * Wrapper component that checks for app updates and forces users to update when needed
 */
const ForcedUpdateWrapper: React.FC<ForcedUpdateWrapperProps> = ({
  children,
  bundleId,
  forceUpdateThreshold = 'major'
}) => {
  const [checking, setChecking] = useState<boolean>(false);
  const [updateInfo, setUpdateInfo] = useState<CheckVersionResponse | null>(null);
  const [updateNeeded, setUpdateNeeded] = useState<boolean>(false);
  const [forceUpdate, setForceUpdate] = useState<boolean>(false);

  useEffect(() => {
    checkAppVersion();
  }, []);

  const checkAppVersion = async () => {
    try {
      setChecking(true);
      const currentVersion = NativeModules.RNDeviceInfo.appVersion;
      
      console.log("Current version info:", currentVersion);
      //check for 50 sec timeout then set it to false
      const versionInfo = await checkVersion({
        bundleId: "com.yashclasses.counselling"
      });
     
      console.log("ODne version info:", versionInfo);
      
      const timeout = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Version check timed out'));
        }, 50000);
      })

      console.log("Version check:", currentVersion, versionInfo);
      setUpdateInfo(versionInfo);

      if (versionInfo.needsUpdate) {
        setUpdateNeeded(true);
        
        // Determine if this update should be forced
        if (forceUpdateThreshold === 'patch') {
          setForceUpdate(true);
        } else {
          setForceUpdate(versionInfo.updateType === 'major');
        }
      }
    } catch (error) {
      console.error("Version check error:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleUpdate = () => {
    if (updateInfo?.url) {
      Linking.openURL(updateInfo.url);
    } else {
      // Fallback URLs if the API doesn't provide one
      if (Platform.OS === 'ios') {
        Linking.openURL(`https://apps.apple.com/app/id${bundleId}`);
      } else {
        Linking.openURL(`https://play.google.com/store/apps/details?id=${bundleId}`);
      }
    }
  };

  const formatReleaseNotes = (notes: string) => {
    if (!notes) return '';
    // Replace HTML tags with appropriate text
    return notes
      .replace(/<br>/gi, '\n')
      .replace(/&quot;/gi, '"')
      .replace(/&amp;/gi, '&')
      .replace(/<(?:.|\n)*?>/gm, '');
  };

  if (checking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#371981" />
        <CustomText style={styles.loadingText}>Checking for updates...</CustomText>
      </View>
    );
  }

  if (updateNeeded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Modal
          visible={true}
          transparent={!forceUpdate}
          animationType="fade"
          statusBarTranslucent
        >
          <View style={[
            styles.modalContainer, 
            forceUpdate ? styles.fullScreenModal : styles.optionalModal
          ]}>
            <View style={styles.updateCard}>
              <View style={styles.imageContainer}>
                <MaterialIcons name="notification-important" size={80} color="#371981" />
               
              </View>
              
              <View style={styles.contentContainer}>
                <CustomText style={styles.title}>
                  {forceUpdate ? 'Update Required' : 'Update Available'}
                </CustomText>
                
                <CustomText style={styles.version}>
                  Version {updateInfo?.version} is now available
                </CustomText>
                
                <View style={styles.noteCard}>
                  <View style={styles.noteHeader}>
                    <MaterialIcons name="new-releases" size={20} color="#371981" />
                    <CustomText style={styles.noteTitle}>What's New</CustomText>
                  </View>
                  
                  <CustomText style={styles.releaseNotes}>
                    {formatReleaseNotes(updateInfo?.notes || '')}
                  </CustomText>
                </View>
                
                <TouchableOpacity 
                  style={styles.updateButton}
                  onPress={handleUpdate}
                >
                  <MaterialIcons name="system-update" size={20} color="#fff" />
                  <CustomText style={styles.updateButtonText}>
                    Update Now
                  </CustomText>
                </TouchableOpacity>
                
                {!forceUpdate && (
                  <TouchableOpacity 
                    style={styles.laterButton}
                    onPress={() => setUpdateNeeded(false)}
                  >
                    <CustomText style={styles.laterButtonText}>
                      Remind Me Later
                    </CustomText>
                  </TouchableOpacity>
                )}
                
                {forceUpdate && (
                  <CustomText style={styles.forceUpdateText}>
                    This update is required to continue using the app
                  </CustomText>
                )}
              </View>
            </View>
          </View>
        </Modal>
        
        {!forceUpdate && children}
      </SafeAreaView>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#371981',
    fontFamily: FONTS.REGULAR,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenModal: {
    backgroundColor: '#f5f6fa',
  },
  optionalModal: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  updateCard: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    backgroundColor: 'rgba(55, 25, 129, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  updateImage: {
    width: '70%',
    height: '70%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  badgeMajor: {
    backgroundColor: '#FF5252',
  },
  badgeMinor: {
    backgroundColor: '#FF9800',
  },
  badgePatch: {
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: FONTS.MEDIUM,
  },
  contentContainer: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#371981',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: FONTS.BOLD,
  },
  version: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: FONTS.REGULAR,
  },
  noteCard: {
    backgroundColor: 'rgba(55, 25, 129, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#371981',
    marginLeft: 8,
    fontFamily: FONTS.MEDIUM,
  },
  releaseNotes: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontFamily: FONTS.REGULAR,
  },
  updateButton: {
    backgroundColor: '#371981',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#371981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: FONTS.BOLD,
  },
  laterButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  laterButtonText: {
    color: '#666',
    fontSize: 14,
    fontFamily: FONTS.REGULAR,
  },
  forceUpdateText: {
    fontSize: 14,
    color: '#FF5252',
    textAlign: 'center',
    marginTop: 12,
    fontFamily: FONTS.REGULAR,
  },
});

export default ForcedUpdateWrapper;