import { useFirestoreCollectionData, useFirestore } from 'reactfire';
import { SuppliersInfo } from './types';

const suppliersQuery = () => {
  const query = useFirestore().collection('suppliers').orderBy('nome');
  return useFirestoreCollectionData<SuppliersInfo>(query);
};

export default suppliersQuery;
