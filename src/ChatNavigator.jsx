import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons'; // For search icon

const ChatNavigator = ({ navigation }) => {
  const [users, setUsers] = useState([]); // All users
  const [filteredUsers, setFilteredUsers] = useState([]); // Filtered users
  const [searchQuery, setSearchQuery] = useState(''); // Search query

  const currentUserUid = auth().currentUser?.uid; // Get the logged-in user's UID

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await firestore().collection('users').get();
        const userList = usersSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.id !== currentUserUid); // Exclude the logged-in user

        setUsers(userList);
        setFilteredUsers(userList); // Initialize with all users excluding the logged-in user
      } catch (error) {
        console.error('Error fetching users:', error);
        Alert.alert('Error', 'Failed to fetch users.');
      }
    };

    fetchUsers();
  }, [currentUserUid]);

  // Handle search query change
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredUsers(users); // Reset to all users when query is empty
    } else {
      const filtered = users.filter((user) =>
        user.name?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  // Handle user tap
  const handleUserPress = (user) => {
    navigation.navigate('ChatDetails', { user });
  };

  // Render a single user card
  const renderUser = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 mb-3 bg-gray-100 rounded-lg shadow"
      onPress={() => handleUserPress(item)}
    >
      <Image
        source={{ uri: item.photoURL }}
        className="w-12 h-12 rounded-full mr-4"
      />
      <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white p-5">
      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-200 rounded-full px-3 py-2 mb-5">
        <Icon name="search" size={20} color="gray" />
        <TextInput
          className="flex-1 ml-3 text-base border-green-600 rounded-md text-orange-500"
          placeholder="Search users by name..."
          placeholderTextColor="black"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Title */}
      <Text className="text-2xl mb-5 font-bold text-green-700">Chats</Text>

      {/* User List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="text-center text-gray-500">No users found.</Text>
        }
      />
    </View>
  );
};

export default ChatNavigator;