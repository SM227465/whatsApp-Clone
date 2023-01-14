import React from 'react';
import { Feather, FontAwesome } from '@expo/vector-icons';
import Input from './Input';
import SubmitButton from './SubmitButton';

const SignUpForm = (props) => {
  return (
    <>
      <Input label='First name' icon='user-o' iconPack={FontAwesome} />
      <Input label='Last name' icon='user-o' iconPack={FontAwesome} />
      <Input label='Email' icon='mail' iconPack={Feather} />
      <Input label='Password' icon='lock' iconPack={Feather} />
      <SubmitButton
        title='Sign up'
        style={{ marginTop: 20 }}
        onPress={() => console.log('Clicked')}
      />
    </>
  );
};

export default SignUpForm;
