import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert('Success', 'Password reset email sent');
      navigation.navigate('Login'); // Navigate back to the login screen after sending the email
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      {/* Email input field */}
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />

      {/* Reset password button */}
      <Button title="Send Reset Email" onPress={handlePasswordReset} />

      {/* Navigation back to Login screen */}
      <Text style={styles.backToLogin} onPress={() => navigation.navigate('Login')}>
        Back to Login
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
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  backToLogin: {
    marginTop: 20,
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default ForgotPasswordScreen;