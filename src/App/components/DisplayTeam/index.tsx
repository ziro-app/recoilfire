import React from 'react';
import { useRecoilValue } from 'recoil';
import { filterStringValue } from '../../atoms';
import teamQuery from './teamQuery';

const DisplayTeam: React.FC = () => {
  /* subscribe to the filter atom */
  const filter = useRecoilValue(filterStringValue);
  /* subscribe to the team collection */
  const firestoreData = teamQuery(filter);
  console.log(firestoreData);
  const { data: team, status } = firestoreData;
  /* reactfire provides the promise status prop
    while it is loading we can use skeletons */
  if (status === 'loading') return <div>Carregando...</div>;
  return (
    <>
      {team.map(teamMember => (
        <div key={teamMember.uid}>{teamMember.nome || 'Não informado'}</div>
      ))}
    </>
  );
};

export default DisplayTeam;
