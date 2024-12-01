import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '1061462327779-3sn2qp7te1tceqsjhu78qp2qqg83igdr.apps.googleusercontent.com',
  offlineAccess: true,
});

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle email/password login
  const handleEmailLogin = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Login Successful', 'You have logged in with your email');
      navigation.navigate('Home'); // Navigate to the home screen after login
    } catch (error) {
      console.error(error);
      Alert.alert('Login Failed', error.message);
    }
  };

  // Handle Google Sign-In
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      console.log('Google sign in result is:', signInResult);
      const { idToken } = signInResult?.data || {};
      console.log(idToken);

      if (!idToken) {
        throw new Error('No ID token found');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
      Alert.alert('Google Login Successful', 'You have logged in with Google');
      navigation.navigate('Home'); // Navigate to the home screen after login
    } catch (error) {
      console.error(error);
      Alert.alert('Google Login Failed', error.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-4 bg-white">
      <Text className="text-3xl font-bold mb-6 text-green-600">Login</Text>
      
      {/* Email input field */}
      <TextInput
        className="w-full p-3 mb-3 border-2 border-green-600 rounded-md text-orange-500 placeholder-gray-400"
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />

      {/* Password input field */}
      <TextInput
        className="w-full p-3 mb-3 border-2 border-green-600 rounded-md text-orange-500 placeholder-gray-400"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      {/* Email login button */}
      <Button title="Login with Email" onPress={handleEmailLogin} />

      <Text className="my-4 text-lg text-gray-500">OR</Text>

      {/* Google login button */}
      <Button title="Login with Google" onPress={handleGoogleLogin} />

      {/* Navigation to Register screen */}
      <Text
        className="mt-4 text-blue-500 underline"
        onPress={() => navigation.navigate('Register')}
      >
        Don't have an account? Register here
      </Text>
    </View>
  );
};

export default LoginScreen;