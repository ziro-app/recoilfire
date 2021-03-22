import React from "react";
import { containerWithPadding } from '@ziro/theme';
import { useAccountManagement } from '../../hooks/AccountManager';

const email = 'alessandromarquesgentil@hotmail.com';
const pass = '123456';

const Login = () => {
  const { logIn } = useAccountManagement();
  const signIn = () => {
    try {
      logIn({ email, password: pass });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={containerWithPadding}>
      {/* TODO -> Form Design */}
      <p>Você será logado automáticamente em uma conta de teste ao clicar...</p>
      <button type='button' onClick={signIn}>Logar</button>

    </div >
  );
};

export default Login;
