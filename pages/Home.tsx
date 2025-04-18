import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { clearUserData, getUserData, logout } from '../utils/storage'
import UpdateSlider  from "../components/Home/UpdateSlider"
import FontAwesome from "react-native-vector-icons/FontAwesome"
import Feather from "react-native-vector-icons/Feather"
import CollegeCard from '../components/Colleges/CollegeCard'
import { CommonActions } from '@react-navigation/native';
import config from '../configs/API'
import CustomText from '../components/General/CustomText'

const { USER_API } = config;
const SectionsNav = ({ navigation }: { navigation: any }) => (
  <View style={styles.sectionsContainer}>
    <CustomText style={styles.sectionTitle}>Sections</CustomText>
    <View style={styles.buttonsContainer}>
      <TouchableOpacity 
        style={styles.sectionButton}
        onPress={() => navigation.navigate('Browse')}
      >
        <CustomText style={styles.buttonLabel}>Favourites</CustomText>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.sectionButton}
        onPress={() => navigation.navigate('Browse')}
      >
        <CustomText style={styles.buttonLabel}>Updates</CustomText>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.sectionButton}
        onPress={() => navigation.navigate('Browse')}
      >
        <CustomText style={styles.buttonLabel}>Youtube</CustomText>
      </TouchableOpacity>
    </View>
  </View>
);

const Home = ({navigation}:any) => {
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const data = await getUserData();
        setUserData(data);
    };

    const handleLogout = async () => {
        const success = await logout(userData?.id);
        console.log(success);
        
        
        if (success) {
          navigation.replace('Login');
        }
      };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatarContainer}>
                        <FontAwesome name="user-circle" size={40} color="#cfcfcf" />
                    </View>
                    <CustomText style={styles.greeting}>
                        Hi {userData?.name} 👋
                    </CustomText>
                </View>
                <TouchableOpacity style={styles.notificationIcon}>
                    <Feather name="bell" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
                style={styles.updateContainer}
                onPress={() => navigation.navigate('Notification')}
            >
                <CustomText style={styles.updateText}>
                    New Video on Yash Aradhye Youtube Channel
                </CustomText>
            </TouchableOpacity>

            <View style={{ height: 250 }}>
                <UpdateSlider />
            </View>

            <SectionsNav navigation={navigation} />

            <View style={styles.collegesContainer}>
                <CollegeCard 
                    college={{
                        id: '1',
                        instituteName: 'IIT Bombay',
                        city: 'Mumbai',
                    }}
                    onPress={() => navigation.navigate('CollegeDetails')}
                />
                <CollegeCard 
                    college={{
                        id: '2',
                        instituteName: 'IIT Bombay',
                        city: 'Mumbai',
                    }}
                    onPress={() => navigation.navigate('CollegeDetails')}
                />
                
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <CustomText>Logout</CustomText>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        backgroundColor: '#fff',
        
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 12,
    },
    greeting: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    notificationIcon: {
        padding: 5,
    },
    logoutButton: {
        padding: 10,
        alignItems: 'center',
    },
    updateContainer: {
        backgroundColor: '#371981',
        padding: 10,
    },
    updateText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    sectionsContainer: {
        padding: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    sectionButton: {
        flex: 1,
        backgroundColor: '#371981',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    collegesContainer: {
        paddingBottom: 20, // Add padding at bottom for better scrolling
    }
});