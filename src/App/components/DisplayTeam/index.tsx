import React from 'react';
import { useRecoilValue } from 'recoil';
import { Link } from 'wouter';
import { filterStringValue } from '../../atoms';
import teamQuery from './teamQuery';

const DisplayTeam = () => {
  /* subscribe to the filter atom */
  const filter = useRecoilValue(filterStringValue);
  /* subscribe to the team collection */
  const firestoreData = teamQuery(filter);
  const { data: team, status } = firestoreData;
  /* reactfire provides the promise status prop
    while it is loading we can use skeletons */
  if (status === 'loading') return <div>Carregando...</div>;
  return (
    <>
      {team.map(teamMember => (
        <div key={teamMember.uid}>{teamMember.nome || 'Não informado'}</div>
      ))}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          paddingTop: '20px',
          textDecoration: 'none'
        }}>
        {/* Possible to have the same result using the methods of hook history
              Example: DisplaySyppliers page */}
        <Link href='/suppliers'>Suppliers</Link>
        <Link href='/SKAoskaosk'>Página Erro</Link>
      </div>
    </>
  );
};

export default DisplayTeam;
