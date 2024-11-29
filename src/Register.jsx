import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
    webClientId: '1061462327779-3sn2qp7te1tceqsjhu78qp2qqg83igdr.apps.googleusercontent.com',
});

const Register = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Register with Email & Password
  const handleEmailPasswordRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter a valid email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await auth().createUserWithEmailAndPassword(email, password);

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
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Google Sign-In process
      const { idToken } = await GoogleSignin.signIn();

      // Create Firebase credential with the Google token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Authenticate with Firebase
      const userCredential = await auth().signInWithCredential(googleCredential);

      Alert.alert('Success', `Welcome, ${userCredential.user.displayName}!`);

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
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
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
      <Text style={styles.loginText}>
        Already have an account?{' '}
        <Text
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          Log In
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  loginText: {
    marginTop: 20,
    textAlign: 'center',
  },
  loginLink: {
    color: '#007BFF',
  },
});

export default Register;