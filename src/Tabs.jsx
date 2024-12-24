import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux'; // Import useSelector to access Redux state
import Profile from './Profile';
import Posts from './Posts';
import Chats from './Chats';

const Tab = createBottomTabNavigator();

const Tabs = () => {
  // Redux state for night mode
  const isNightMode = useSelector((state) => state.theme.isNightMode);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Chats') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Discover') {
            iconName = focused ? 'globe' : 'globe-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: isNightMode ? '#fff' : '#008744', // Active color for night mode
        tabBarInactiveTintColor: isNightMode ? 'darkgray' : 'gray', // Inactive color for night mode
        tabBarStyle: {
          backgroundColor: isNightMode ? '#1f1f1f' : '#ffffff', // Tab bar background color for night mode
        },
      })}
    >
      <Tab.Screen name="Chats" component={Chats} />
      <Tab.Screen name="Discover" component={Posts} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default Tabs;