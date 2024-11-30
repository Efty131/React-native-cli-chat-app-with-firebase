import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
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
// ay id token niya birat jhamela hoysilo at last fix korsi 
      console.log('Google sign in result is:', signInResult);
      const { idToken } = signInResult?.data || {};
      console.log(idToken);

      if (!idToken) {
        throw new Error('No ID token found');
      }
// ay id token niya birat jhamela hoysilo at last fix korsi 
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
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      {/* Email input field */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        color={'orange'}
        placeholderTextColor="gray"
        onChangeText={(text) => setEmail(text)}
      />

      {/* Password input field */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        color={'orange'}
        placeholderTextColor="gray"
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      {/* Email login button */}
      <Button title="Login with Email" onPress={handleEmailLogin} />

      <Text style={styles.orText}>OR</Text>

      {/* Google login button */}
      <Button title="Login with Google" onPress={handleGoogleLogin} />

      {/* Navigation to Register screen */}
      <Text style={styles.registerText} onPress={() => navigation.navigate('Register')}>
        Don't have an account? Register here
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: 'green',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'green',
  },
  orText: {
    marginVertical: 10,
    fontSize: 16,
    color: 'Gray'
  },
  registerText: {
    marginTop: 20,
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;