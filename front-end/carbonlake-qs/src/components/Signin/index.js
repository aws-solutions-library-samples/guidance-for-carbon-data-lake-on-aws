
import { Button, TextField } from '@material-ui/core';
import { Auth } from 'aws-amplify';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const [username, setUsername] = useState([])
  const [password, setPassword] = useState([])
  const navigate = useNavigate();

  const signIn = async ( onSignIn ) => {
    try{
      const user = await Auth.signIn(username, password)
      navigate("/dashboard");
      onSignIn();
    } catch (error) {
      console.log('There was an error logging in', error);
    }
  }
  return <div className ='signin'>
    <TextField
      id='username'
      label='Username'
      value={username}
      onChange={e => setUsername(e.target.value)}
    />
    <TextField
      id='password'
      label='Password'
      type="password"
      value={password}
      onChange={e => setPassword(e.target.value)}
    />
    <Button id ='signInButton' color='primary' onClick={signIn}>
      Sign In
    </Button>
  </div>;
};

export default SignIn;
