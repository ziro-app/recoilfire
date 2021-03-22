import React from 'react';
import { useAuth } from 'reactfire';
import useGlobalHistory from '@bit/ziro.utils.history';
import { useAccountManagement } from '../../hooks/AccountManager';
import suppliersQuery from './suppliersQuery';

const DisplaySuppliers = () => {
  // Métodos de gerência de conta disponibilizados pelo hook
  // const { changeEmail, changePassword, deleteAccount, resendConfirmEmail } = useAccountManagement();
  // Métodos de navegação disponibilizados pelo hook
  const { back, pushState } = useGlobalHistory();
  const auth = useAuth();
  const singOut = () => auth.signOut();

  const firestoreData = suppliersQuery();
  const { data: suppliers, status } = firestoreData;
  if (status === 'loading') return <div>Carregando Suppliers...</div>;
  return (
    <>
      {suppliers.map(supplier => (
        <div key={supplier.uid}>
          {supplier.nome} {supplier.sobrenome} - {supplier.razao} -{' '}
          {supplier.whatsapp}
        </div>
      ))}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '5px',
          paddingTop: '20px',
          textDecoration: 'none'
        }}>
        <button type="button" onClick={history.length > 1 ? () => back() : () => pushState({ anyState: true }, '', '/')}>Voltar</button>
        <button type="button" onClick={() => pushState({ anyState: true }, '', '/SKAoskaosk?teste=huashua')}>Página Erro</button>
        {/* <button type="button" onClick={() => resendConfirmEmail({ email: 'wermesonrocha@hotmail.com', type: 'Email' })}>Reenviar email</button> */}
        <button type="button" onClick={singOut}>Deslogar</button>
      </div>
    </>
  );
};

export default DisplaySuppliers;
