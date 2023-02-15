import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Button,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import backgroundImage from '../assets/images/droplet.jpeg';
import colors from '../constants/colors';
import { useSelector } from 'react-redux';
import PageContainer from '../components/PageContainer';
import Bubble from '../components/Bubble';
import { createChat, sendImage, sendTextMessage } from '../utils/actions/chatAction';
import ReplyTo from '../components/ReplyTo';
import { LaunchImagePicker, openCamera, uploadImageAsync } from '../utils/ImagePickerHelper';
import AwesomeAlert from 'react-native-awesome-alerts';

const ChatScreen = (props) => {
  const [chatUsers, setChatUsers] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [chatId, setChatId] = useState(props.route?.params?.chatId);
  const [errorBannerText, setErrorBannerText] = useState('');
  const [replyingTo, setReplyingTo] = useState();
  const [tempImageUri, setTempImageUri] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const flatList = useRef();

  const storedUsers = useSelector((state) => state.users.storedUsers);
  const userData = useSelector((state) => state.auth.userData);
  const storedChats = useSelector((state) => state.chats.chatsData);
  const chatMessages = useSelector((state) => {
    if (!chatId) {
      return [];
    }

    const chatMessagesData = state.messages.messagesData[chatId];

    if (!chatMessagesData) {
      return [];
    }

    const messageList = [];

    for (const key in chatMessagesData) {
      const message = chatMessagesData[key];

      messageList.push({ key, ...message });
    }

    return messageList;
  });

  const chatData = (chatId && storedChats[chatId]) || props.route?.params?.newChatData;

  const getChatTitleFromName = () => {
    const otherUserId = chatUsers.find((uid) => uid !== userData.userId);
    const otherUserData = storedUsers[otherUserId];

    return otherUserData && `${otherUserData.firstName} ${otherUserData.lastName}`;
  };

  const title = chatData.chatName ?? getChatTitleFromName();

  useEffect(() => {
    props.navigation.setOptions({
      headerTitle: title,
    });

    setChatUsers(chatData.users);
  }, [chatUsers]);

  const sendMessage = useCallback(async () => {
    try {
      let id = chatId;

      if (!id) {
        id = await createChat(userData.userId, props.route.params.newChatData);

        setChatId(id);
      }

      await sendTextMessage(id, userData.userId, messageText, replyingTo && replyingTo.key);

      setMessageText('');
      setReplyingTo(null);
    } catch (error) {
      console.log(error);
      setErrorBannerText('Message failed to send');

      setTimeout(() => setErrorBannerText(''), 5000);
    }
  }, [messageText, chatId]);

  const pickImage = useCallback(async () => {
    try {
      const tempUri = await LaunchImagePicker();

      if (!tempUri) {
        return;
      }

      setTempImageUri(tempUri);
    } catch (error) {
      console.log(error);
    }
  }, [tempImageUri]);

  const takePhoto = useCallback(async () => {
    try {
      const tempUri = await openCamera();

      if (!tempUri) {
        return;
      }

      setTempImageUri(tempUri);
    } catch (error) {
      console.log(error);
    }
  }, [tempImageUri]);

  const uploadImage = useCallback(async () => {
    setIsLoading(true);

    try {
      let id = chatId;

      if (!id) {
        id = await createChat(userData.userId, props.route.params.newChatData);

        setChatId(id);
      }

      const uploadUrl = await uploadImageAsync(tempImageUri, true);
      setIsLoading(false);

      await sendImage(id, userData.userId, uploadUrl, replyingTo && replyingTo.key);

      setReplyingTo(null);

      setTimeout(() => setTempImageUri(''), 500);
    } catch (error) {
      console.log(error);
      isLoading(false);
    }
  }, [isLoading, tempImageUri, chatId]);

  return (
    <SafeAreaView edges={['right', 'left', 'bottom']} style={styles.container}>
      <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
        <PageContainer style={{ backgroundColor: 'transparent' }}>
          {!chatId && <Bubble text='This is a new chat, Say hi!' type='system' />}
          {errorBannerText ? <Bubble text={errorBannerText} type={'error'} /> : null}
          {chatId ? (
            <FlatList
              ref={(ref) => (flatList.current = ref)}
              onContentSizeChange={() => flatList.current.scrollToEnd({ animated: false })}
              onLayout={() => flatList.current.scrollToEnd({ animated: false })}
              data={chatMessages}
              renderItem={(itemData) => {
                const message = itemData.item;
                const isOwnMessage = message.sentBy === userData.userId;
                const messageType = isOwnMessage ? 'myMessage' : 'theirMessage';
                const sender = message.sentBy && storedUsers[message.sentBy];
                const name = sender && `${sender.firstName} ${sender.lastName}`;

                return (
                  <Bubble
                    type={messageType}
                    text={message.text}
                    messageId={message.key}
                    userId={userData.userId}
                    chatId={chatId}
                    date={message.sentAt}
                    name={!chatData.isGroupChat || isOwnMessage ? undefined : name}
                    setReply={() => setReplyingTo(message)}
                    imageUrl={message.imageUrl}
                    replyingTo={
                      message.replyTo && chatMessages.find((i) => i.key === message.replyTo)
                    }
                  />
                );
              }}
            />
          ) : null}
        </PageContainer>

        {replyingTo && (
          <ReplyTo
            text={replyingTo.text}
            user={storedUsers[replyingTo.sentBy]}
            onCancel={() => setReplyingTo(null)}
          />
        )}
      </ImageBackground>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.mediaBtn} onPress={pickImage}>
          <Feather name='plus' size={24} color={colors.blue} />
        </TouchableOpacity>

        <TextInput
          style={styles.textBox}
          value={messageText}
          onChangeText={(text) => setMessageText(text)}
          onSubmitEditing={sendMessage}
        />

        {messageText ? (
          <TouchableOpacity style={{ ...styles.mediaBtn, ...styles.sendBtn }} onPress={sendMessage}>
            <Feather name='send' size={20} color={'white'} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.mediaBtn} onPress={takePhoto}>
            <Feather name='camera' size={24} color={colors.blue} />
          </TouchableOpacity>
        )}

        <AwesomeAlert
          show={tempImageUri !== ''}
          title='Send image?'
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={true}
          showConfirmButton={true}
          cancelText='Cancel'
          confirmText='Send image'
          confirmButtonColor={colors.primary}
          cancelButtonColor={colors.red}
          titleStyle={styles.popupTitleStyle}
          onCancelPressed={() => setTempImageUri('')}
          onConfirmPressed={uploadImage}
          onDismiss={() => setTempImageUri('')}
          customView={
            <View>
              {isLoading && <ActivityIndicator size='small' color={colors.primary} />}
              {!isLoading && tempImageUri !== '' && (
                <Image source={{ uri: tempImageUri }} style={{ width: 200, height: 200 }} />
              )}
            </View>
          }
        />
      </View>
      {/* </KeyboardAvoidingView> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },

  backgroundImage: {
    flex: 1,
  },

  inputContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    height: 50,
  },

  textBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: colors.lightGray,
    marginHorizontal: 10,
    paddingHorizontal: 12,
  },

  mediaBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 35,
  },

  sendBtn: {
    backgroundColor: colors.blue,
    borderRadius: 50,
    padding: 4,
    width: 35,
  },

  popupTitleStyle: {
    fontFamily: 'medium',
    letterSpacing: 0.3,
    color: colors.textColor,
  },
});

export default ChatScreen;
