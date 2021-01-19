import firebase from 'firebase';
import 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

const init = firebase.initializeApp(firebaseConfig);

export const db = init.firestore(),
  auth = init.auth(),
  fs = firebase.firestore,
  fbAuth = firebase.auth,
  storage = firebase.storage().ref();
