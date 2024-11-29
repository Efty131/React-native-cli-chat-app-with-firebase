import React from 'react';
import { Button, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '1061462327779-3sn2qp7te1tceqsjhu78qp2qqg83igdr.apps.googleusercontent.com',
});

async function onGoogleButtonPress() {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const signInResult = await GoogleSignin.signIn();
    console.log('Google Sign-In Result:', signInResult); // Log the full result for debugging

    const { idToken } = signInResult?.data || {};  // Accessing idToken from signInResult.data

    if (!idToken) {
      throw new Error('ID token not found. Please check your Google Sign-In setup.');
    }

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const user = await auth().signInWithCredential(googleCredential);

    Alert.alert('Sign-In Success', `Welcome, ${user.user.displayName}`);
  } catch (error) {
    console.error(error);
    Alert.alert('Sign-In Error', error.message);
  }
}

const Signin = () => {
  return (
    <Button
      title="Google Sign-In"
      onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}
    />
  );
};

export default Signin;