import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons'; // For search icon
import { useSelector } from 'react-redux'; // Import useSelector to access Redux state

const ChatNavigator = ({ navigation }) => {
  const [users, setUsers] = useState([]); // All users
  const [filteredUsers, setFilteredUsers] = useState([]); // Filtered users
  const [searchQuery, setSearchQuery] = useState(''); // Search query

  const currentUserUid = auth().currentUser?.uid; // Get the logged-in user's UID

  // Redux state for night mode
  const isNightMode = useSelector((state) => state.theme.isNightMode);

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
      className={`flex-row items-center p-4 mb-3 rounded-lg shadow ${isNightMode ? 'bg-gray-800' : 'bg-gray-100'}`}
      onPress={() => handleUserPress(item)}
    >
      <Image
        source={{ uri: item.photoURL }}
        className="w-12 h-12 rounded-full mr-4"
      />
      <Text className={`text-lg font-semibold ${isNightMode ? 'text-white' : 'text-gray-800'}`}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className={`flex-1 p-5 ${isNightMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Search Bar */}
      <View className={`flex-row items-center ${isNightMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full px-3 py-2 mb-5`}>
        <Icon name="search" size={20} color={isNightMode ? 'gray' : 'gray'} />
        <TextInput
          className={`flex-1 ml-3 text-base border-green-600 rounded-md ${isNightMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}
          placeholder="Search users by name..."
          placeholderTextColor={isNightMode ? 'gray' : 'darkgray'}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Title */}
      <Text className={`text-2xl mb-5 font-bold ${isNightMode ? 'text-green-400' : 'text-green-700'}`}>
        Chats
      </Text>

      {/* User List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className={`text-center ${isNightMode ? 'text-gray-500' : 'text-gray-500'}`}>No users found.</Text>
        }
      />
    </View>
  );
};

export default ChatNavigator;