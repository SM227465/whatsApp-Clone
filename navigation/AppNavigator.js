import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './MainNavigator';
import LoginScreen from '../screens/LoginScreen';
import { useSelector } from 'react-redux';
import StartUpScreen from '../screens/StartUpScreen';

const AppNavigator = (props) => {
  const isLogin = useSelector((state) => state.auth.token !== null && state.auth.token !== '');
  const didTryAutoLogin = useSelector((state) => state.auth.didTryAutoLogin);
  return (
    <NavigationContainer>
      {/* {isLogin ? <MainNavigator /> : <LoginScreen />} */}
      {isLogin && <MainNavigator />}
      {!isLogin && didTryAutoLogin && <LoginScreen />}
      {!isLogin && !didTryAutoLogin && <StartUpScreen />}
    </NavigationContainer>
  );
};

export default AppNavigator;
