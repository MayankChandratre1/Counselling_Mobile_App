import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { View, StyleSheet, Dimensions } from 'react-native';
import Home from '../pages/Home';
import Colleges from '../components/Colleges';
import Profile from '../pages/Profile';
import Counselling from '../pages/Counselling';
import Browse from '../pages/Browse';
import React from 'react';
import CustomText from '../components/General/CustomText';
import Landing from '../pages/Landing';

const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');

// Scale UI elements based on screen size
const scale = Math.min(width, height) / 375; // 375 is baseline width

const CustomTabBarIcon = ({ focused, icon, label }: { focused: boolean; icon: string; label: string }) => (
  <View style={focused ? styles.activeIconWrapper : undefined}>
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      {icon === 'crown' ? (
        <FontAwesome6 name={icon} size={24 * scale} color={focused ? '#fff' : '#cdcfcf'} />
      ) : (
        <FontAwesome name={icon} size={24 * scale} color={focused ? '#fff' : '#cdcfcf'} />
      )}
    </View>
  </View>
);

const TabNavigator = () => {
  // Define screens configuration to reduce repetitive code
  const screens = [
    { name: 'Home', component: Home, icon: 'home' },
    { name: 'Browse', component: Browse, icon: 'search' },
    { name: 'Colleges', component: Landing, icon: 'graduation-cap' },
    { name: 'Counselling', component: Counselling, icon: 'crown' },
    { name: 'Profile', component: Profile, icon: 'user' }
  ];

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
          headerShown: false,
        }}
      >
        {screens.map(screen => (
          <Tab.Screen 
            key={screen.name}
            name={screen.name} 
            component={screen.component}
            options={{
              tabBarIcon: ({ focused }) => (
                <CustomTabBarIcon focused={focused} icon={screen.icon} label={screen.name} />
              ),
            }}
            
          />
        ))}
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    height: 60 * scale,
    paddingVertical: 8 * scale,
    backgroundColor: '#fff',
  },
  activeIconWrapper: {
    borderWidth: 8 * scale,
    borderColor: '#fff',
    borderRadius: 50,
    height: 80 * scale,
    width: 80 * scale,
    marginBottom: 25 * scale,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    height: 64 * scale,
    width: 64 * scale,
  },
  tabItemActive: {
    backgroundColor: '#371981',
    shadowColor: '#00000099',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
  },
});

export default TabNavigator;
