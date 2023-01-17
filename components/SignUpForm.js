import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { Feather, FontAwesome } from '@expo/vector-icons';
import Input from './Input';
import SubmitButton from './SubmitButton';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reduceres/formReducer';
import { signup } from '../utils/actions/authActions';
import { ActivityIndicator, Alert } from 'react-native';
import colors from '../constants/colors';
import { useDispatch, useSelector } from 'react-redux';

const initialState = {
  inputValues: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  },

  inputValidities: {
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  },

  formIsValid: false,
};

const SignUpForm = (props) => {
  const dispatch = useDispatch();
  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, dispatchFormState] = useReducer(reducer, initialState);
  const inputChangeHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, inputValue, validationResult: result });
    },
    [dispatchFormState]
  );

  useEffect(() => {
    if (error) {
      Alert.alert('An error occured', error);
    }
  }, [error]);

  const authHandler = useCallback(async () => {
    try {
      setIsLoading(true);
      const action = signup(
        formState.inputValues.firstName,
        formState.inputValues.lastName,
        formState.inputValues.email,
        formState.inputValues.password
      );

      setError(null);
      await dispatch(action);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }, [dispatch, formState]);

  return (
    <>
      <Input
        id='firstName'
        label='First name'
        icon='user-o'
        iconPack={FontAwesome}
        errorMessage={formState.inputValidities['firstName']}
        onInputChange={inputChangeHandler}
      />
      <Input
        id='lastName'
        label='Last name'
        icon='user-o'
        iconPack={FontAwesome}
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
        errorMessage={formState.inputValidities['email']}
        onInputChange={inputChangeHandler}
      />
      <Input
        id='password'
        label='Password'
        icon='lock'
        iconPack={Feather}
        autoCapitalize='none'
        secureTextEntry
        errorMessage={formState.inputValidities['password']}
        onInputChange={inputChangeHandler}
      />
      {isLoading ? (
        <ActivityIndicator size={'small'} color={colors.primary} style={{ marginTop: 15 }} />
      ) : (
        <SubmitButton
          title='Sign up'
          style={{ marginTop: 20 }}
          disabled={!formState.formIsValid}
          onPress={authHandler}
        />
      )}
    </>
  );
};

export default SignUpForm;
