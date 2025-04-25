import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { clearUserData, getUserData, logout } from '../utils/storage'
import UpdateSlider  from "../components/Home/UpdateSlider"
import FontAwesome from "react-native-vector-icons/FontAwesome"
import Feather from "react-native-vector-icons/Feather"
import CollegeCard from '../components/Colleges/CollegeCard'
import { CommonActions } from '@react-navigation/native';
import config from '../configs/API'
import CustomText from '../components/General/CustomText'
import RazorpayCheckout from 'react-native-razorpay';

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
        onPress={async () => {
            const userData = await getUserData();
            if (userData) {
                console.log(userData);
                
            } else {
                Alert.alert('Error', 'User data not found');
            }
        }}
      >
        <CustomText style={styles.buttonLabel}>DEBUG</CustomText>
      </TouchableOpacity>
      {/* <TouchableOpacity 
        style={styles.sectionButton}
        onPress={() => {
            var options = {
            description: 'Credits towards consultation',
            image: 'https://i.imgur.com/3g7nmJC.jpg',
            currency: 'INR',
            key: 'rzp_test_R1L6paHcXFNdkR',
            amount: 5000,
            name: 'Sarathi',
            order_id: "order_QNIf8MbwoMskaQ",//Replace this with an order_id created using Orders API.
            prefill: {
              email: 'mayankmchandratre@gmail.com',
              contact: '7843065180',
              name: 'Mayank Chandratre'
            },
            theme: {color: '#53a20e'}
          }
          RazorpayCheckout.open(options).then((data) => {
            // handle success
            Alert.alert(`Success: ${data.razorpay_payment_id}`);
          }).catch((error) => {
            // handle failure
            Alert.alert(`Error: ${error.code} | ${error.description}`);
          });
        }}
      >
        <CustomText style={styles.buttonLabel}>Pay Test</CustomText>
      </TouchableOpacity> */}
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