import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '1061462327779-3sn2qp7te1tceqsjhu78qp2qqg83igdr.apps.googleusercontent.com',
});

const Register = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Save user to Firestore
  const saveUserToFirestore = async (uid, email) => {
    try {
      const userDoc = await firestore().collection('users').doc(uid).get();

      if (!userDoc.exists) {
        await firestore().collection('users').doc(uid).set({
          uid,
          email,
          name: '', // Placeholder for name
          photoURL: '', // Placeholder for profile photo
        });
        console.log('User added to Firestore:', { uid, email });
      } else {
        console.log('User already exists in Firestore:', userDoc.data());
      }
    } catch (error) {
      console.error('Error saving user to Firestore:', error);
    }
  };

  // Register with Email & Password
  const handleEmailPasswordRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter a valid email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const { uid, email: userEmail } = userCredential.user;

      // Save user to Firestore
      await saveUserToFirestore(uid, userEmail);

      // Send email verification
      await auth().currentUser.sendEmailVerification();
      Alert.alert('Success', 'Registration successful. Please verify your email.');

      // Navigate to the app after registration (optional)
      navigation.reset({
        index: 0,
        routes: [{ name: 'AppTabsScreen' }],
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Registration Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Register with Google
  const handleGoogleRegister = async () => {
    try {
      // Check if the device supports Google Play services
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();

      const { idToken } = signInResult?.data || {};
      console.log(idToken);
      if (!idToken) {
        throw new Error('No ID token found');
      }

      // Create Firebase credential with the Google token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Authenticate with Firebase
      const userCredential = await auth().signInWithCredential(googleCredential);
      const { uid, email: userEmail } = userCredential.user;

      // Save user to Firestore
      await saveUserToFirestore(uid, userEmail);

      Alert.alert('Success', `Welcome, ${userCredential.user.displayName || 'User'}!`);

      // Navigate to the app
      navigation.reset({
        index: 0,
        routes: [{ name: 'AppTabsScreen' }],
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Google Sign-In Error', error.message);
    }
  };

  return (
    <View className="flex-1 p-5 justify-center bg-white">
      <Text className="text-3xl font-bold text-center mb-6 text-green-600">Register</Text>

      {/* Email Input */}
      <TextInput
        className="w-full p-3 mb-4 border-2 border-green-600 rounded-lg text-orange-500 placeholder-gray-400"
        placeholder="Email"
        placeholderTextColor="gray"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <TextInput
        className="w-full p-3 mb-4 border-2 border-green-600 rounded-lg text-orange-500 placeholder-gray-400"
        placeholder="Password"
        placeholderTextColor="gray"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      {/* Register Button */}
      <Button
        title={isLoading ? 'Registering...' : 'Register'}
        onPress={handleEmailPasswordRegister}
        disabled={isLoading}
      />

      {/* Google Sign-In Button */}
      <Button
        title="Sign Up with Google"
        onPress={handleGoogleRegister}
        color="#DB4437"
      />

      {/* Navigate to Login */}
      <Text className="mt-5 text-center text-gray-500">
        Already have an account?{' '}
        <Text
          className="text-blue-500 underline"
          onPress={() => navigation.navigate('Login')}
        >
          Log In
        </Text>
      </Text>
    </View>
  );
};

export default Register;