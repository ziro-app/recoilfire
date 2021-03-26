import React, { useCallback, useState } from 'react';
import { useEffectOnce, useIsomorphicLayoutEffect } from "react-use";
import { useAuth, useFirestore, auth as fbAuth } from "reactfire";
import axios, { AxiosRequestConfig } from "axios";
import {
  Collections, IFirebaseData, ISheetsData,
  IUserData, IZoopData, RollbackObject, StoreFormat
} from './types';

const store: StoreFormat = {
  state: [],
  setters: [],
  setState: (rollback: RollbackObject) => {
    store.state.push(rollback);
    store.setters.forEach((setter) => setter(store.state));
  }
};

export const useRollback = (): {
  addRollback: (data: RollbackObject) => void;
  dataRollback: Array<RollbackObject>;
  execute: () => Promise<void>;
} => {
  const [dataRollback, setDataRollback] = useState(store.state);
  const auth = useAuth();
  const emailAuth = fbAuth.EmailAuthProvider;
  const usersRef = useFirestore().collection("users");
  const affiliatesRef = useFirestore().collection("affiliates");
  const collaboratorsRef = useFirestore().collection("collaborators");
  const storeownersRef = useFirestore().collection("storeowners");
  const teamRef = useFirestore().collection("team");
  const suppliersRef = useFirestore().collection("suppliers");

  useEffectOnce(() => () => {
    store.setters = store.setters.filter((setter) => setter !== setDataRollback);
  });

  useIsomorphicLayoutEffect(() => {
    if (!store.setters.includes(setDataRollback)) {
      store.setters.push(setDataRollback);
    }
  });

  const matchRef = (collection: Collections) => {
    if (collection === "affiliates") return affiliatesRef;
    if (collection === "collaborators") return collaboratorsRef;
    if (collection === "storeowners") return storeownersRef;
    if (collection === "team") return teamRef;
    if (collection === "suppliers") return suppliersRef;
    if (collection === "users") return usersRef;
    return null;
  };

  const addRollback = useCallback((newData: RollbackObject) => {
    setDataRollback(oldState => [...oldState, newData]);
  }, []);

  const findSheetsRow = useCallback(async (id, rangeToSearch, spreadsheetId) => {
    try {
      const url = process.env.SHEET_URL;
      const body = {
        apiResource: 'values',
        apiMethod: 'get',
        range: rangeToSearch,
        spreadsheetId: spreadsheetId
      };
      const config: AxiosRequestConfig = {
        headers: {
          "Content-type": "application/json",
          Authorization: process.env.SHEET_TOKEN
        }
      };
      let pos = 0;
      const { data: { values } } = await axios.post(url, body, config);
      values.map((user, index) => {
        if (user[0] === id) {
          pos = index + 1;
        }
      });
      return pos;
    } catch (error) {
      console.log('Erro no findSheetsRow', error);
    }
  }, []);

  const authRollback = useCallback(async (userData: IUserData) => {
    try {
      if (!auth.currentUser || !userData.password) return;
      const { password } = userData;
      const credential = emailAuth.credential(auth.currentUser.email, password);
      await auth.currentUser.reauthenticateWithCredential(credential);
      await auth.currentUser.delete();
      await auth.signOut();
    } catch (error) {
      console.log('Erro no authRollback', error);
    }
  }, []);

  const firebaseRollback = useCallback(async (firebaseData: IFirebaseData) => {
    try {
      if (!firebaseData.collection || !firebaseData.field || !firebaseData.identifier) return;
      const { collection, field, identifier } = firebaseData;
      const collectionRef = matchRef(collection);
      if (collectionRef) {
        if (field === 'uid') return await collectionRef.doc(identifier).delete();
        else {
          const doc = await collectionRef.where(field, '==', identifier).limit(1).get();
          const docRef = (await doc).docs[0]?.ref || null;
          if (docRef) return await docRef.delete();
        }
      } else return;
    } catch (error) {
      console.log('Erro no firebaseRollback', error);
    }
  }, []);

  const sheetsRollback = useCallback(async (sheetsData: ISheetsData) => {
    try {
      if (!sheetsData.idToSearch || !sheetsData.origin || !sheetsData.rangeToSearch ||
        !sheetsData.rangeToUpdate || !sheetsData.rangeToUpdate ||
        !sheetsData.spreadsheetId || sheetsData.values.length === 0) return;
      const { idToSearch, rangeToSearch, rangeToUpdate, spreadsheetId, values } = sheetsData;
      const sheetsRow = await findSheetsRow(idToSearch, rangeToSearch, spreadsheetId);
      if (sheetsRow > 0) {
        const rangeWithRow = `${rangeToUpdate}${sheetsRow}`
        const url = process.env.SHEET_URL;
        const config = {
          headers: {
            'Content-type': 'application/json',
            Authorization: process.env.SHEET_TOKEN,
          },
        };
        const body = {
          apiResource: 'values',
          apiMethod: 'update',
          range: rangeWithRow,
          spreadsheetId,
          resource: {
            values: [values],
          },
          valueInputOption: 'raw',
        };
        return await axios.post(url, body, config);
      } else return;
    } catch (error) {
      console.log('Erro no sheetsRollback', error);
    }
  }, []);

  const zoopRollback = useCallback(async (zoopData: IZoopData) => {
    try {
      if (!zoopData.resource) return;
      const { resource, resourceId, splitTransactionId } = zoopData;
      let url = '';
      if (resource === 'sellers') url = `${process.env.PAY_URL}sellers-delete?seller_id=${resourceId}`;
      else if (resource === 'payments') url = `${process.env.PAY_URL}transactions/${resourceId}/void`;
      else if (resource === 'split_rules' && splitTransactionId) url = `${process.env.PAY_URL}transactions/${splitTransactionId}/split_rules/${resourceId}`;
      else url = `${process.env.PAY_URL}${resource}-delete?${resource}_id=${resourceId}`;
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: process.env.PAY_TOKEN
        },
      };
      return await axios.post(url, {}, config);
    } catch (error) {
      console.log('Erro no zoopRollback', error);
    }
  }, []);

  const cleanRollback = () => setDataRollback([]);

  const execute = useCallback(async () => {
    if (dataRollback.length > 0) {
      await Promise.all(dataRollback.map(async data => {
        const { origin } = data;
        if (origin === 'Auth') return await authRollback(data as unknown as IUserData);
        else if (origin === 'Firebase') return await firebaseRollback(data as unknown as IFirebaseData);
        else if (origin === 'Sheets') return await sheetsRollback(data as unknown as ISheetsData);
        else if (origin === 'Zoop') return await zoopRollback(data as unknown as IZoopData);
        else return;
      }));
    }
    cleanRollback();
    console.log('Rollback executado!')
  }, [dataRollback]);

  return {
    addRollback,
    dataRollback,
    execute
  };
};
