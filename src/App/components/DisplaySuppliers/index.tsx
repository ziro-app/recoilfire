import React from 'react';
import { useUser, useAuth } from 'reactfire';
import useGlobalHistory from '@bit/ziro.utils.history';
import suppliersQuery from './suppliersQuery';

const DisplaySuppliers: React.FC = () => {
  const auth = useAuth();
  const { data: { displayName, email } } = useUser();
  // Accessing history and browsing methods
  const { history, back, pushState } = useGlobalHistory();
  const singOut = () => auth.signOut();
  console.log({ ...history, displayName, email })
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
        <button type="button" onClick={singOut}>Deslogar</button>
      </div>
    </>
  );
};

export default DisplaySuppliers;
