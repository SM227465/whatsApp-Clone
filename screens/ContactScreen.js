import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import DataItem from '../components/DataItem';
import ProfileImage from '../components/ProfileImage';
import colors from '../constants/colors';
import { getUserChats } from '../utils/actions/userActions';
import SubmitButton from '../components/SubmitButton';
import { removeUserFromChat } from '../utils/actions/chatAction';

const ContactScreen = (props) => {
  const storedUsers = useSelector((state) => state.users.storedUsers);
  const storedChats = useSelector((state) => state.chats.chatsData);
  const userData = useSelector((state) => state.auth.userData);

  const currentUser = storedUsers[props.route.params.uid];
  const chatId = props.route.params.chatId;
  const chatData = chatId && storedChats[chatId];

  const [commonChats, setCommonChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getCommonUserChats = async () => {
      const currentUserChats = await getUserChats(currentUser.userId);
      setCommonChats(
        Object.values(currentUserChats).filter(
          (cid) => storedChats[cid] && storedChats[cid].isGroupChat
        )
      );
    };

    getCommonUserChats();
  }, []);

  const removeFromChat = useCallback(async () => {
    try {
      setIsLoading(true);

      await removeUserFromChat(userData, currentUser, chatData);

      props.navigation.goBack();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [props.navigation, isLoading]);

  return (
    <PageContainer>
      <View style={styles.topContainer}>
        <ProfileImage uri={currentUser.profilePicture} size={80} style={{ marginBottom: 20 }} />
        <PageTitle text={`${currentUser.firstName} ${currentUser.lastName}`} />
        {currentUser.about && (
          <Text numberOfLines={2} style={styles.about}>
            {currentUser.about}
          </Text>
        )}
      </View>

      {commonChats.length > 0 && (
        <>
          <Text style={styles.heading}>
            {commonChats.length} {commonChats.length === 1 ? 'Group' : 'Groups'} in Common
          </Text>
          {commonChats.map((cid) => {
            const chatData = storedChats[cid];
            return (
              <DataItem
                key={cid}
                title={chatData.chatName}
                subTitle={chatData.latestMessageText}
                image={chatData.chatImage}
                type='link'
                onPress={() => props.navigation.push('ChatScreen', { chatId: cid })}
              />
            );
          })}
        </>
      )}

      {chatData &&
        chatData.isGroupChat &&
        (isLoading ? (
          <ActivityIndicator size='small' color={colors.primary} />
        ) : (
          <SubmitButton title='Remove from chat' color={colors.red} onPress={removeFromChat} />
        ))}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },

  about: {
    fontFamily: 'medium',
    fontSize: 16,
    letterSpacing: 0.3,
    color: colors.gray,
  },
  heading: {
    fontFamily: 'bold',
    letterSpacing: 0.3,
    color: colors.textColor,
    marginVertical: 8,
  },
});

export default ContactScreen;
