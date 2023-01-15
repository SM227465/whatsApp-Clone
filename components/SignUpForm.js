import React, { useCallback, useReducer } from 'react';
import { Feather, FontAwesome } from '@expo/vector-icons';
import Input from './Input';
import SubmitButton from './SubmitButton';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reduceres/formReducer';

const initialState = {
  inputValidities: {
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  },

  formIsValid: false,
};

const SignUpForm = (props) => {
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
      <SubmitButton
        title='Sign up'
        style={{ marginTop: 20 }}
        disabled={!formState.formIsValid}
        onPress={() => console.log('Clicked')}
      />
    </>
  );
};

export default SignUpForm;
