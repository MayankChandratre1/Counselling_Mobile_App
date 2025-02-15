import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { View, Text, StyleSheet } from 'react-native';
import Home from '../pages/Home';
import Colleges from '../components/Colleges';
import Profile from '../pages/Profile';
import Counselling from '../pages/Counselling';
import Browse from '../pages/Browse';

const Tab = createBottomTabNavigator();

const CustomTabBarIcon = ({ focused, icon, label }: { focused: boolean; icon: string; label: string }) => (
  <View style={[
    focused && {
      borderWidth: 10,
      borderColor: '#fff',
      borderRadius: "50%",
      height:100,
      width: 100,
      marginBottom: 30
  }
  ]}>
    <View style={[
        styles.tabItem,
        focused && styles.tabItemActive
        
    ]}>
    <FontAwesome 
      name={icon} 
      size={30} 
      color={focused ? '#fff' : '#cdcfcf'} 
    />
    {/* <Text style={[
      styles.tabLabel,
      focused && styles.tabLabelActive
    ]}>
      {label}
    </Text> */}
    </View>
  </View>
);

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: 70,
          padding: 10,
          backgroundColor: '#fff',
        },
        tabBarShowLabel: false,
        headerShown: false, // Add this line to hide headers
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon focused={focused} icon="home" label="Homw" />
          ),
          tabBarIconStyle:{
            width: "100%",
            height: "100%",
          }
        }}
        
      />
      <Tab.Screen 
        name="Browse" 
        component={Browse}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon focused={focused} icon="search" label="Browse" />
          ),
          tabBarIconStyle:{
            width: "100%",
            height: "100%",
          }
        }}
      />
      <Tab.Screen 
        name="Colleges" 
        component={Colleges}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon focused={focused} icon="graduation-cap" label="Colleges" />
          ),
          tabBarIconStyle:{
            width: "100%",
            height: "100%",
          }
        }}
      />
      <Tab.Screen 
        name="Counselling" 
        component={Counselling}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon focused={focused} icon="comments" label="Counselling" />
          ),
          tabBarIconStyle:{
            width: "100%",
            height: "100%",
          }
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon focused={focused} icon="user" label="Profile" />
          ),
          tabBarIconStyle:{
            width: "100%",
            height: "100%",
          }
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: "50%",
    height:80,
    width: 80,
  },
  tabItemActive: {
    backgroundColor: '#371981',
    height:80,
    width: 80,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1, 
    elevation: 5,
  },
  tabLabel: {
    fontSize: 8,
    color: '#371981',
    opacity: 0,
  },
  tabLabelActive: {
    color: '#fff',
    opacity: 0,
  },
});

export default TabNavigator;
