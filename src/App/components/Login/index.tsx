import React from "react";
import { containerWithPadding } from '@ziro/theme';
import { useAuth } from 'reactfire';

const email = 'alessandromarquesgentil@hotmail.com';
const pass = '123456';

const Login = () => {
  const auth = useAuth();
  const signIn = () => auth.signInWithEmailAndPassword(email, pass);

  return (
    <div style={containerWithPadding}>
      {/* TODO -> Form Design */}
      <p>Você será logado automáticamente em uma conta de teste ao clicar...</p>
      <button type='button' onClick={signIn}>Logar</button>

    </div >
  );
};

export default Login;
