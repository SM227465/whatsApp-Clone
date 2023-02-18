import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import userImage from '../assets/images/defaultProfileImage.jpeg';
import colors from '../constants/colors';
import { FontAwesome } from '@expo/vector-icons';
import { LaunchImagePicker, uploadImageAsync } from '../utils/ImagePickerHelper';
import { updateSigninUserData } from '../utils/actions/authActions';
import { useDispatch } from 'react-redux';
import { updateLoginUserData } from '../store/authSlice';
import { updateChatData } from '../utils/actions/chatAction';

const ProfileImage = (props) => {
  const dispatch = useDispatch();

  const source = props.uri ? { uri: props.uri } : userImage;

  const [image, setImage] = useState(source);
  const [isLoading, setIsLoading] = useState(false);

  const showEditButton = props.showEditButton && props.showEditButton === true;
  const showRemoveButton = props.showRemoveButton && props.showRemoveButton === true;

  const userId = props.userId;
  const chatId = props.chatId;

  const pickImage = async () => {
    try {
      const tempUri = await LaunchImagePicker();

      if (!tempUri) {
        return;
      }

      setIsLoading(true);
      const uploadUrl = await uploadImageAsync(tempUri, chatId !== undefined);
      setIsLoading(false);

      if (!uploadUrl) {
        throw new Error('Could not upload image');
      }

      if (chatId) {
        await updateChatData(chatId, userId, { chatImage: uploadUrl });
      } else {
        const newData = { profilePicture: uploadUrl };

        await updateSigninUserData(userId, newData);
        dispatch(updateLoginUserData({ newData: newData }));
      }

      setImage({ uri: uploadUrl });
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const Container = props.onPress || showEditButton ? TouchableOpacity : View;

  return (
    <Container onPress={props.onPress || pickImage} style={props.style}>
      {isLoading ? (
        <View height={props.size} width={props.size} style={styles.loadingContainer}>
          <ActivityIndicator size={'small'} color={colors.primary} />
        </View>
      ) : (
        <Image
          source={image}
          style={{ ...styles.image, ...{ width: props.size, height: props.size } }}
        />
      )}

      {showEditButton && !isLoading && (
        <View style={styles.editIconContainer}>
          <FontAwesome name='edit' size={15} color='black' />
        </View>
      )}

      {showRemoveButton && !isLoading && (
        <View style={styles.removeIconContainer}>
          <FontAwesome name='close' size={15} color='black' />
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  image: {
    borderRadius: 50,
    borderColor: colors.gray,
    borderWidth: 1,
  },

  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    padding: 8,
  },

  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  removeIconContainer: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: colors.lightGray,
    borderRadius: 20,
    padding: 3,
  },
});

export default ProfileImage;
