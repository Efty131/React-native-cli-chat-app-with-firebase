import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Profile from './Profile';
import Chats from './Chats';
import Discover from './Discover';

const Tab = createBottomTabNavigator();

// Tabs Component
const Tabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // Change icon based on whether the tab is focused or not
          let iconName;

          if (route.name === 'Chats') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Discover') {
            iconName = focused ? 'globe' : 'globe-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          // Return the icon with appropriate style
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: '#008744', // Active tab text/icon color
        tabBarInactiveTintColor: 'gray', // Inactive tab text/icon color
        tabBarActiveBackgroundColor: '', // Active tab background color
        tabBarStyle: {
          paddingBottom: 5, // Adjust padding if needed
        },
      })}
    >
      <Tab.Screen name="Chats" component={Chats} />
      <Tab.Screen name="Discover" component={Discover} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default Tabs;