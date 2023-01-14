import React from 'react';
import { Feather, FontAwesome } from '@expo/vector-icons';
import Input from './Input';
import SubmitButton from './SubmitButton';

const SignInForm = (props) => {
  return (
    <>
      <Input label='Email' icon='mail' iconPack={Feather} />
      <Input label='Password' icon='lock' iconPack={Feather} />
      <SubmitButton
        title='Sign in'
        style={{ marginTop: 20 }}
        onPress={() => console.log('Clicked')}
      />
    </>
  );
};

export default SignInForm;
