import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import auth from '@react-native-firebase/auth';
import './global.css';

// Import Screens
import Login from './src/Login';
import Register from './src/Register';
import Tabs from './src/Tabs'; // Import the Tabs component

// Redux Slice for Theme
const themeSlice = createSlice({
  name: 'theme',
  initialState: { isNightMode: false },
  reducers: {
    toggleNightMode: (state) => {
      state.isNightMode = !state.isNightMode;
    },
  },
});

// Export Actions and Reducer
const { toggleNightMode } = themeSlice.actions;
const store = configureStore({
  reducer: {
    theme: themeSlice.reducer,
  },
});

// App Component
const Stack = createStackNavigator();

const AppContent = () => {
  const [user, setUser] = React.useState(null);
  const [initializing, setInitializing] = React.useState(true);
  const dispatch = useDispatch();
  const isNightMode = useSelector((state) => state.theme.isNightMode);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });
    return subscriber; // Unsubscribe on unmount
  }, [initializing]);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <StatusBar
        backgroundColor="rgba(0,0,0,0.2)"
        hidden={true}
        translucent={true}
        barStyle={isNightMode ? 'light-content' : 'dark-content'}
      />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Tabs" component={Tabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main App
const App = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
);

export default App;