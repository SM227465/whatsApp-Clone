import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageContainer from '../components/PageContainer';
import SignInForm from '../components/SignInForm';
import SignUpForm from '../components/SignUpForm';
import colors from '../constants/colors';
import logo from '../assets/images/logo.png';

const LoginScreen = (props) => {
  const [isSugnUp, setIsSignUp] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'height' : null}
          keyboardVerticalOffset={100}
        >
          <View style={styles.imageContainer}>
            <Image source={logo} style={styles.image} />
          </View>
          <PageContainer>{isSugnUp ? <SignUpForm /> : <SignInForm />}</PageContainer>
          <TouchableOpacity onPress={() => setIsSignUp(!isSugnUp)} style={styles.linkContainer}>
            <Text style={styles.link}>{`Switch to ${isSugnUp ? 'Sign in' : 'Sign up'}`}</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  link: {
    color: colors.blue,
    fontFamily: 'medium',
    letterSpacing: 0.3,
  },
  linkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },

  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    width: '50%',
    resizeMode: 'contain',
  },

  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default LoginScreen;
