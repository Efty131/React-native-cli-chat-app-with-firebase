import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker'; // To select an image
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing default icon from MaterialIcons

const Profile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState('');
  
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setUser(currentUser);
      setName(currentUser.displayName || ''); // Set the current user's name
      setImageUri(currentUser.photoURL || ''); // Set the current user's photo URL
    }
  }, []);

  // Function to handle the image selection
  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        setImageUri(response.assets[0].uri); // Update image URI with selected image
      }
    });
  };

  // Function to handle name update
  const updateName = () => {
    if (name.trim()) {
      user
        .updateProfile({
          displayName: name,
          photoURL: imageUri,
        })
        .then(() => {
          alert('Profile updated successfully!');
        })
        .catch((error) => {
          console.error(error);
          alert('Failed to update profile.');
        });
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
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.title}>Profile</Text>
          
          {/* Display Profile Picture */}
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Icon name="account-circle" size={100} color="gray" />
          )}

          <Button title="Change Profile Picture" onPress={selectImage} />

          {/* Display User Email */}
          <Text style={styles.text}>Email: {user.email}</Text>

          {/* Display User Name */}
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
          <Button title="Update Profile" onPress={updateName} />
          <Button title="Logout" onPress={logout} />
        </>
      ) : (
        <Text>You are not logged in</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    margin: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
  },
});

export default Profile;