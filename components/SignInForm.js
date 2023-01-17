import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import Input from './Input';
import SubmitButton from './SubmitButton';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reduceres/formReducer';
import { signin } from '../utils/actions/authActions';
import { useDispatch } from 'react-redux';
import { ActivityIndicator, Alert } from 'react-native';
import colors from '../constants/colors';

const initialState = {
  inputValues: {
    email: '',
    password: '',
  },

  inputValidities: {
    email: false,
    password: false,
  },

  formIsValid: false,
};

const SignInForm = (props) => {
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
      console.log(error);
      Alert.alert('An error occured', error);
    }
  }, [error]);

  const authHandler = useCallback(async () => {
    try {
      setIsLoading(true);
      const action = signin(formState.inputValues.email, formState.inputValues.password);
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
        onInputChange={inputChangeHandler}
      />
      {isLoading ? (
        <ActivityIndicator size={'small'} color={colors.primary} style={{ marginTop: 15 }} />
      ) : (
        <SubmitButton
          title='Sign in'
          style={{ marginTop: 20 }}
          disabled={!formState.formIsValid}
          onPress={authHandler}
        />
      )}
    </>
  );
};

export default SignInForm;
