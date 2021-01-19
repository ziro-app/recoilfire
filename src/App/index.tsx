import React from 'react';
import { RecoilRoot } from 'recoil';
import { FirebaseAppProvider } from 'reactfire';
import 'firebase/firestore';
import whyDidYouRender from '@welldone-software/why-did-you-render';
import { firebaseConfig } from '../Firebase/firebaseConfig';
import Router from './Router';

//pagination
//error handling (error boundary)
//loading handling (skeleton) (without Suspense)
//Ziro theme
//dynamic imports
const App: React.FC = () => (
  <RecoilRoot>
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <Router />
    </FirebaseAppProvider>
  </RecoilRoot>
);

export default App;
