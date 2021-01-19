import { useFirestoreCollectionData, useFirestore } from 'reactfire';
import { TeamUser } from './types';

const teamQuery = (queryType: string) => {
  const possibleQueries = {
    includeInactives: useFirestore().collection('team').orderBy('nome'),
    excludeInactives: useFirestore()
      .collection('team')
      .where('dataFim', '==', '-')
      .orderBy('nome')
  };
  const teamQuery = possibleQueries[queryType];
  return useFirestoreCollectionData<TeamUser>(teamQuery);
};

export default teamQuery;
