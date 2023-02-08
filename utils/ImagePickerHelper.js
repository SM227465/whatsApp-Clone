import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { getFirebaseApp } from './firebaseHelper';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import uuid from 'react-native-uuid';

export const LaunchImagePicker = async () => {
  await checkMediaPermissions();

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
};

export const openCamera = async () => {
  // await checkMediaPermissions();
  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

  if (permissionResult.granted === false) {
    console.log('No permission to acccess the camera');
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
};

export const uploadImageAsync = async (uri, isChatImage = false) => {
  const app = getFirebaseApp();

  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };

    xhr.onerror = function (error) {
      console.log(error);
      reject(new TypeError('Network request failed'));
    };

    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send();
  });

  const pathFolder = isChatImage ? 'chatImages' : 'profilePics';
  const storageRef = ref(getStorage(app), `${pathFolder}/${uuid.v4()}`);

  await uploadBytesResumable(storageRef, blob);

  blob.close();

  return await getDownloadURL(storageRef);
};

const checkMediaPermissions = async () => {
  if (Platform.OS !== 'web') {
    const permission = ImagePicker.requestMediaLibraryPermissionsAsync();

    if ((await permission).granted === false) {
      return Promise.reject('Need permission to access your photos!');
    }
  }

  return Promise.resolve();
};
