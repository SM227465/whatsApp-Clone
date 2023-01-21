import { getFirebaseApp } from '../firebaseHelper';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, set, child, ref, update } from 'firebase/database';
import { authenticate, logout } from '../../store/authSlice';
import { getUserData } from './userActions';
import AsyncStorage from '@react-native-async-storage/async-storage';

let timer;

export const signup = (firstName, lastName, email, password) => {
  return async (dispatch) => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const { uid, stsTokenManager } = result.user;
      const { accessToken, expirationTime } = stsTokenManager;
      const expiryDate = new Date(expirationTime);
      const timeNow = new Date();
      const miliSecondUntilExpiry = expiryDate - timeNow;
      const userData = await createUser(firstName, lastName, email, uid);
      dispatch(authenticate({ token: accessToken, userData }));
      saveDataToStorage(accessToken, uid, expiryDate);
      timer = setTimeout(() => {
        dispatch(userLogout());
      }, miliSecondUntilExpiry);
    } catch (error) {
      console.log(error);
      const errorCode = error.code;
      let message = 'Something went wrong';

      if (errorCode === 'auth/email-already-in-use') {
        message = 'This email is already in use';
      }

      throw new Error(message);
    }
  };
};

export const signin = (email, password) => {
  return async (dispatch) => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const { uid, stsTokenManager } = result.user;
      const { accessToken, expirationTime } = stsTokenManager;
      const expiryDate = new Date(expirationTime);
      const timeNow = new Date();
      const miliSecondUntilExpiry = expiryDate - timeNow;
      const userData = await getUserData(uid);
      dispatch(authenticate({ token: accessToken, userData }));
      saveDataToStorage(accessToken, uid, expiryDate);
      timer = setTimeout(() => {
        dispatch(userLogout());
      }, miliSecondUntilExpiry);
    } catch (error) {
      const errorCode = error.code;
      let message = 'Something went wrong';

      if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
        message = 'The email or password was incorrect';
      }

      if (errorCode === 'auth/too-many-requests') {
        message = 'Too many attempts, Please try again later';
      }

      throw new Error(message);
    }
  };
};

const createUser = async (firstName, lastName, email, userId) => {
  const fullName = (firstName + ' ' + lastName).toLowerCase();
  const userData = {
    firstName,
    lastName,
    fullName,
    email,
    userId,
    createdAt: new Date().toISOString(),
  };

  const dbRef = ref(getDatabase());
  const childRef = child(dbRef, `users/${userId}`);
  await set(childRef, userData);
  return userData;
};

const saveDataToStorage = (token, userId, expiryDate) => {
  AsyncStorage.setItem(
    'userData',
    JSON.stringify({ token, userId, expiryDate: expiryDate.toISOString() })
  );
};

export const userLogout = () => {
  return async (dispatch) => {
    AsyncStorage.clear();
    clearTimeout(timer);
    dispatch(logout());
  };
};

export const updateSigninUserData = async (userId, newData) => {
  if (newData.firstName && newData.lastName) {
    const fullName = (newData.firstName + ' ' + newData.lastName).toLowerCase();
    newData.fullName = fullName;
  }

  const dbRef = ref(getDatabase());
  const childRef = child(dbRef, `users/${userId}`);

  await update(childRef, newData);
};
