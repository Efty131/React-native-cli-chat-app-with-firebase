import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dreymbuhy/image/upload';
const UPLOAD_PRESET = 'ReactNativeChatApp';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setUser(currentUser);
      fetchUserProfile(currentUser.uid); // Fetch user profile data from Firestore
    }
  }, []);

  // Fetch user profile data from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await firestore().collection('users').doc(uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        setName(userData.name || '');
        setImageUri(userData.photoURL || '');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Function to handle image upload to Cloudinary
  const uploadToCloudinary = async (uri) => {
    const formData = new FormData();
    formData.append('file', { uri, type: 'image/jpeg', name: 'profile-picture.jpg' });
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok && result.secure_url) {
        return result.secure_url; // Return the uploaded image URL
      } else {
        throw new Error(result.error?.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  };

  // Function to select and upload an image
  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const selectedImageUri = response.assets[0].uri;
        const formattedUri = selectedImageUri.startsWith('file://') ? selectedImageUri : 'file://' + selectedImageUri;

        try {
          setIsUploading(true);
          const uploadedImageUri = await uploadToCloudinary(formattedUri);
          setImageUri(uploadedImageUri); // Set the uploaded image URL
          Alert.alert('Success', 'Image uploaded successfully!');
        } catch (error) {
          console.error('Upload Error:', error);
          Alert.alert('Error', 'Failed to upload image.');
        } finally {
          setIsUploading(false);
        }
      }
    });
  };

  // Function to update name and profile picture in Firestore
  const updateProfile = async () => {
    if (!name.trim() || !imageUri) {
      alert('Please provide a name and select a profile picture.');
      return;
    }

    try {
      const { uid } = user;

      // Save name and photoURL to Firestore
      await firestore()
        .collection('users')
        .doc(uid)
        .set({ name, photoURL: imageUri }, { merge: true });

      // Optional: Update Firebase Auth profile
      await user.updateProfile({ displayName: name, photoURL: imageUri });

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  // Function to handle logout
  const logout = () => {
    auth()
      .signOut()
      .then(() => {
        alert('You have been logged out');
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <View className="flex-1 justify-center items-center p-5 bg-white">
      {user ? (
        <>
          <Text className="text-3xl font-bold mb-5 text-green-600">Profile</Text>
          {isUploading ? (
            <ActivityIndicator size="large" color="green" />
          ) : imageUri ? (
            <Image source={{ uri: imageUri }} className="w-24 h-24 rounded-full mb-5" />
          ) : (
            <Icon name="account-circle" size={100} color="gray" className="mb-5" />
          )}
          <Button title="Change Profile Picture" onPress={selectImage} />

          <Text className="text-lg mb-2 text-orange-500">Email: {user.email}</Text>
          <TextInput
            className="w-full h-10 border-2 border-green-600 rounded-md p-2 mb-5"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor='gray'
            color='orange'
          />
          <Button title="Update Profile" onPress={updateProfile} />
          <Button title="Logout" onPress={logout} className="mt-5" />
        </>
      ) : (
        <Text className="text-xl text-red-500">You are not logged in</Text>
      )}
    </View>
  );
};

export default Profile;