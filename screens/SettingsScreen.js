import { Feather, FontAwesome } from '@expo/vector-icons';
import React, { useCallback, useMemo, useReducer, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../components/Input';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import SubmitButton from '../components/SubmitButton';
import colors from '../constants/colors';
import { updateLoginUserData } from '../store/authSlice';
import { updateSigninUserData, userLogout } from '../utils/actions/authActions';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reduceres/formReducer';
import successIcon from '../assets/images/thick.jpg';
import ProfileImage from '../components/ProfileImage';
import DataItem from '../components/DataItem';

const SettingsScreen = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.auth.userData);
  const starredMessages = useSelector((state) => state.messages.starredMessages ?? {});

  const sortedStarredMessages = useMemo(() => {
    let result = [];

    const chats = Object.values(starredMessages);

    chats.forEach((chat) => {
      const chatMessages = Object.values(chat);

      result = result.concat(chatMessages);
    });
    return result;
  }, [starredMessages]);

  const firstName = userData.firstName || '';
  const lastName = userData.lastName || '';
  const email = userData.email || '';
  const about = userData.about || '';

  const initialState = {
    inputValues: {
      firstName: firstName,
      lastName: lastName,
      email: email,
      about: about,
    },

    inputValidities: {
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      about: undefined,
    },

    formIsValid: false,
  };

  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const inputChangeHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, validationResult: result, inputValue });
    },
    [dispatchFormState]
  );

  const saveHandler = useCallback(async () => {
    const updatedValues = formState.inputValues;

    try {
      setIsLoading(true);

      await updateSigninUserData(userData.userId, updatedValues);

      dispatch(updateLoginUserData({ newData: updatedValues }));
      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [formState, dispatch]);

  const hasChanges = () => {
    const currentValues = formState.inputValues;

    return (
      currentValues.firstName !== firstName ||
      currentValues.lastName !== lastName ||
      currentValues.email !== email ||
      currentValues.about !== about
    );
  };

  return (
    <PageContainer style={styles.container}>
      <PageTitle text='Settings' />
      <ScrollView contentContainerStyle={styles.formContainer}>
        <ProfileImage
          size={80}
          userId={userData.userId}
          uri={userData.profilePicture}
          showEditButton={true}
        />
        <Input
          id='firstName'
          label='First name'
          icon='user-o'
          iconPack={FontAwesome}
          initialValue={userData.firstName}
          errorMessage={formState.inputValidities['firstName']}
          onInputChange={inputChangeHandler}
        />
        <Input
          id='lastName'
          label='Last name'
          icon='user-o'
          iconPack={FontAwesome}
          initialValue={userData.lastName}
          errorMessage={formState.inputValidities['lastName']}
          onInputChange={inputChangeHandler}
        />
        <Input
          id='email'
          label='Email'
          icon='mail'
          iconPack={Feather}
          autoCapitalize='none'
          keyboardType='email-address'
          initialValue={userData.email}
          errorMessage={formState.inputValidities['email']}
          onInputChange={inputChangeHandler}
        />
        <Input
          id='about'
          label='About'
          icon='user-o'
          iconPack={FontAwesome}
          initialValue={userData.about}
          errorMessage={formState.inputValidities['about']}
          onInputChange={inputChangeHandler}
        />
        <View style={{ marginTop: 20 }}>
          {showSuccessMessage ? <Text style={{ color: 'green' }}>Update success</Text> : null}
          {isLoading ? (
            <ActivityIndicator size={'small'} color={colors.primary} style={{ marginTop: 15 }} />
          ) : (
            hasChanges() && (
              <SubmitButton
                title='Update'
                style={{ marginTop: 20 }}
                disabled={!formState.formIsValid}
                onPress={saveHandler}
              />
            )
          )}
        </View>

        <DataItem
          type={'link'}
          title='Starred messages'
          hideImage={true}
          onPress={() =>
            props.navigation.navigate('DataList', {
              title: 'Starred messages',
              data: sortedStarredMessages,
              type: 'messages',
            })
          }
        />

        <SubmitButton
          title='Logout'
          style={{ marginTop: 20 }}
          onPress={() => dispatch(userLogout())}
          color={colors.red}
        />
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  formContainer: {
    alignItems: 'center',
  },
});

export default SettingsScreen;
