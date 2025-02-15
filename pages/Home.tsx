import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { clearUserData, getUserData } from '../utils/storage'
import UpdateSlider  from "../components/Home/UpdateSlider"
import FontAwesome from "react-native-vector-icons/FontAwesome"
import Feather from "react-native-vector-icons/Feather"
import CollegeCard from '../components/Colleges/CollegeCard'

const SectionsNav = ({ navigation }: { navigation: any }) => (
  <View style={styles.sectionsContainer}>
    <Text style={styles.sectionTitle}>Sections</Text>
    <View style={styles.buttonsContainer}>
      <TouchableOpacity 
        style={styles.sectionButton}
        onPress={() => navigation.navigate('Browse')}
      >
        <Text style={styles.buttonLabel}>Favourites</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.sectionButton}
        onPress={() => navigation.navigate('Browse')}
      >
        <Text style={styles.buttonLabel}>Updates</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.sectionButton}
        onPress={() => navigation.navigate('Browse')}
      >
        <Text style={styles.buttonLabel}>Youtube</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const Home = ({navigation}:any) => {
    const [userData, setUserData] = useState<{name: string, phone: string} | null>(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        const data = await getUserData();
        setUserData(data);
    };

    const logout = async () => {
        await clearUserData();
        navigation.navigate('Login');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatarContainer}>
                        <FontAwesome name="user-circle" size={40} color="#cfcfcf" />
                    </View>
                    <Text style={styles.greeting}>
                        Hi {userData?.name} 👋
                    </Text>
                </View>
                <TouchableOpacity style={styles.notificationIcon}>
                    <Feather name="bell" size={24} color="#000" />
                </TouchableOpacity>+
            </View>

            <View style={styles.updateContainer}>
                <Text style={styles.updateText}>
                     New Video on Yash Aradhye Youtube Channel
                </Text>
            </View>

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
                
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Text>Logout</Text>
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