import React, { useCallback, useReducer } from 'react';
import { Feather } from '@expo/vector-icons';
import Input from './Input';
import SubmitButton from './SubmitButton';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reduceres/formReducer';

const initialState = {
  inputValidities: {
    email: false,
    password: false,
  },

  formIsValid: false,
};

const SignInForm = (props) => {
  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const inputChangeHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId: inputId, validationResult: result });
    },
    [dispatchFormState]
  );

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
      <SubmitButton
        title='Sign in'
        style={{ marginTop: 20 }}
        disabled={!formState.formIsValid}
        onPress={() => console.log('Clicked')}
      />
    </>
  );
};

export default SignInForm;
