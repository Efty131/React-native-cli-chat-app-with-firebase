import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Image } from 'react-native';
import DiscoverNavigator from './DiscoverNavigator';
import ChatDetails from './ChatDetails';

const DiscoverStack = createNativeStackNavigator();

const Discover = () => {
  return (
    <DiscoverStack.Navigator
      screenOptions={{
        headerShown: false, // Hide the header for DiscoverNavigator screens
      }}
    >
      <DiscoverStack.Screen
        name="DiscoverNavigator"
        component={DiscoverNavigator}
      />
      <DiscoverStack.Screen
        name="ChatDetails"
        component={ChatDetails}
        options={({ route }) => ({
          headerShown: true, // Show the header for ChatDetails
          headerTitle: () => (
            <View className="flex-row items-center space-x-3">
              <Image
                source={{ uri: route.params.user.photoURL }}
                className="w-10 h-10 rounded-full"
              />
              <Text className="text-lg font-bold text-gray-100 ml-2">{route.params.user.name}</Text>
            </View>
          ),
          headerStyle: {
            backgroundColor: '#15803d', // Header background color

          },
          headerTitleAlign: 'start', // Center-align the title
        })}
      />
    </DiscoverStack.Navigator>
  );
};

export default Discover;