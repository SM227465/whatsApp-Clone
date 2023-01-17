import firebase, { initializeApp } from 'firebase/app';

export const getFirebaseApp = () => {
  const firebaseConfig = {
    apiKey: 'AIzaSyBgc7UnfUvcSxwrUrW7n8_tz5mj7gRIH1I',
    authDomain: 'whatsapp-c5e6d.firebaseapp.com',
    databaseURL: 'https://whatsapp-c5e6d-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'whatsapp-c5e6d',
    storageBucket: 'whatsapp-c5e6d.appspot.com',
    messagingSenderId: '648621864308',
    appId: '1:648621864308:web:b2461d14d1e9d3a257a821',
    measurementId: 'G-9078VVVJXW',
  };

  return initializeApp(firebaseConfig);
};
