import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

const ChatDetails = ({ route, navigation }) => {
  const { user } = route.params; // The user being chatted with
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const currentUserUid = auth().currentUser?.uid; // Logged-in user's UID
  const chatId =
    currentUserUid > user.id
      ? `${currentUserUid}_${user.id}`
      : `${user.id}_${currentUserUid}`; // Unique chat ID

  // Fetch messages in real-time
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const fetchedMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(fetchedMessages);
      });

    return unsubscribe;
  }, [chatId]);

  // Send a message
  const sendMessage = async () => {
    if (input.trim() === '') return;

    const messageData = {
      text: input,
      senderId: currentUserUid,
      receiverId: user.id,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    try {
      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add(messageData);
      setInput(''); // Clear the input field
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message.');
    }
  };

  // Render a single message bubble
  const renderMessage = ({ item }) => {
    const isSender = item.senderId === currentUserUid;

    return (
      <View
        className={`mb-2 px-4 py-2 rounded-lg max-w-3/4 ${
          isSender ? 'self-end bg-green-600' : 'self-start bg-blue-600'
        }`}
      >
        <Text className="text-base text-white">{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      {/* <View className="flex-row items-center bg-green-700 p-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-white ml-4">{user.name}</Text>
      </View> */}

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted // Shows the latest message at the bottom
        className="flex-1 px-4"
      />

      {/* Input Bar */}
      <View className="flex-row items-center bg-gray-100 p-4">
        <TextInput
          className="flex-1 bg-white text-gray-700 px-4 py-2 rounded-full border border-gray-300"
          placeholder="Type a message..."
          value={input}
          placeholderTextColor="gray"
          onChangeText={setInput}
        />
        <TouchableOpacity
          className="ml-3 bg-green-700 p-3 rounded-full"
          onPress={sendMessage}
        >
          <Icon name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatDetails;