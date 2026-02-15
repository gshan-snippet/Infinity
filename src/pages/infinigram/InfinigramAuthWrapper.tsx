import { useState } from 'react';
import InfinigamAuth from './InfinigamAuth';
import InfinigamLogin from './InfinigamLogin';
import InfinigamSignup from './InfinigamSignup';

const InfinigamAuthWrapper = () => {
  const [screen, setScreen] = useState<'choice' | 'login' | 'signup'>('choice');

  return (
    <>
      {screen === 'choice' && (
        <InfinigamAuth
          onLoginClick={() => setScreen('login')}
          onSignupClick={() => setScreen('signup')}
        />
      )}
      {screen === 'login' && (
        <InfinigamLogin
          onBackClick={() => setScreen('choice')}
        />
      )}
      {screen === 'signup' && (
        <InfinigamSignup
          onBackClick={() => setScreen('choice')}
        />
      )}
    </>
  );
};

export default InfinigamAuthWrapper;