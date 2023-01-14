import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './MainNavigator';
import LoginScreen from '../screens/LoginScreen';

const AppNavigator = (props) => {
  const isLogin = false;
  return <NavigationContainer>{isLogin ? <MainNavigator /> : <LoginScreen />}</NavigationContainer>;
};

export default AppNavigator;
