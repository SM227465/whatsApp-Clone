import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import PageContainer from '../components/PageContainer';
import { FontAwesome } from '@expo/vector-icons';
import colors from '../constants/colors';
import commonStyle from '../constants/commonStyle';
import { serchUsers } from '../utils/actions/userActions';
import DataItem from '../components/DataItem';
import { useDispatch, useSelector } from 'react-redux';
import { setStoredUsers } from '../store/userSlice';
import ProfileImage from '../components/ProfileImage';

const NewChatScreen = (props) => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState();
  const [noResultFound, setNoResultFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatName, setChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);

  const selectedUsersFlatList = useRef();

  const chatId = props.route.params && props.route.params.chatId;
  const existingUsers = props.route.params && props.route.params.existingUsers;
  const isGroupChat = props.route.params && props.route.params.isGroupChat;
  const isGroupChatDisabled = selectedUsers.length === 0 || (isNewChat && chatName === '');

  const isNewChat = !chatId;

  useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item title='Close' onPress={() => props.navigation.goBack()} />
          </HeaderButtons>
        );
      },

      headerRight: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            {isGroupChat && (
              <Item
                title={isNewChat ? 'Create' : 'Add'}
                disabled={isGroupChatDisabled}
                color={isGroupChatDisabled ? colors.lightGray : null}
                onPress={() => {
                  const screenName = isNewChat ? 'ChatList' : 'ChatSettings';
                  props.navigation.navigate(screenName, { selectedUsers, chatName, chatId });
                }}
              />
            )}
          </HeaderButtons>
        );
      },

      headerTitle: isGroupChat ? 'Add participants' : 'New chat',
    });
  }, [chatName, selectedUsers]);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (!searchTerm) {
        setUsers();
        setNoResultFound(false);
        return;
      }

      setIsLoading(true);

      const userResult = await serchUsers(searchTerm);
      delete userResult[userData.userId];

      setUsers(userResult);

      if (!userResult) {
        setNoResultFound(true);
      } else {
        setNoResultFound(false);

        dispatch(setStoredUsers({ newUsers: userResult }));
      }

      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const userPressed = (userId) => {
    if (isGroupChat) {
      const newSelectedUsers = selectedUsers.includes(userId)
        ? selectedUsers.filter((id) => id !== userId)
        : selectedUsers.concat(userId);

      setSelectedUsers(newSelectedUsers);
    } else {
      // TODO: bug
      props.navigation.navigate('ChatList', { selectedUserId: userId });
    }
  };

  return (
    <PageContainer>
      {isNewChat && isGroupChat && (
        <View style={styles.chatNameContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textBox}
              placeholder='Enter a name'
              autoCorrect={false}
              autoComplete='off'
              value={chatName}
              onChangeText={(text) => setChatName(text)}
            />
          </View>
        </View>
      )}

      {isGroupChat && (
        <View style={styles.selectedUsersContainer}>
          <FlatList
            contentContainerStyle={{ alignItems: 'center' }}
            style={styles.selectedUsersList}
            data={selectedUsers}
            horizontal={true}
            keyExtractor={(item) => item}
            ref={(ref) => (selectedUsersFlatList.current = ref)}
            onContentSizeChange={() => selectedUsersFlatList.current.scrollToEnd()}
            renderItem={(itemData) => {
              const userId = itemData.item;
              const userData = storedUsers[userId];

              return (
                <ProfileImage
                  style={styles.selectedUserStyle}
                  size={40}
                  uri={userData.profilePicture}
                  onPress={() => userPressed(userId)}
                  showRemoveButton={true}
                />
              );
            }}
          />
        </View>
      )}

      <View style={styles.searchContainer}>
        <FontAwesome name='search' size={15} color={colors.lightGray} />
        <TextInput
          placeholder='Search'
          style={styles.searchBox}
          onChangeText={(text) => setSearchTerm(text)}
        />
      </View>

      {isLoading && (
        <View style={commonStyle.center}>
          <ActivityIndicator size={'large'} color={colors.primary} />
        </View>
      )}

      {!isLoading && !noResultFound && users && (
        <FlatList
          data={Object.keys(users)}
          renderItem={(itemData) => {
            const userId = itemData.item;
            const userdata = users[userId];

            if (existingUsers && existingUsers.includes(userId)) {
              return;
            }

            return (
              <DataItem
                title={`${userdata.firstName} ${userdata.lastName}`}
                subTitle={userdata.about}
                image={userdata.profilePicture}
                onPress={() => userPressed(userId)}
                type={isGroupChat ? 'checkBox' : ''}
                isChecked={selectedUsers.includes(userId)}
              />
            );
          }}
        />
      )}

      {!isLoading && !users && (
        <View style={commonStyle.center}>
          <FontAwesome
            name='users'
            size={60}
            color={colors.lightGray}
            style={styles.noResultIcon}
          />
          <Text style={styles.noResultText}>Enter a name to search for a user!</Text>
        </View>
      )}

      {!isLoading && noResultFound && (
        <View style={commonStyle.center}>
          <FontAwesome
            name='question'
            size={60}
            color={colors.lightGray}
            style={styles.noResultIcon}
          />
          <Text style={styles.noResultText}>No users found!</Text>
        </View>
      )}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.extraLightGray,
    height: 40,
    marginVertical: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },

  searchBox: {
    marginLeft: 8,
    fontSize: 15,
    width: '100%',
  },

  noResultIcon: {
    marginBottom: 20,
  },

  noResultText: {
    color: colors.textColor,
    fontFamily: 'regular',
    letterSpacing: 0.3,
  },

  chatNameContainer: {
    paddingVertical: 10,
  },

  inputContainer: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: colors.nearlyWhite,
    flexDirection: 'row',
    borderRadius: 2,
  },

  textBox: {
    color: colors.textColor,
    width: '100%',
    fontFamily: 'regular',
    letterSpacing: 0.3,
  },

  selectedUsersContainer: {
    height: 50,
    justifyContent: 'center',
  },

  selectedUsersList: {
    height: '100%',
    paddingTop: 10,
  },

  selectedUserStyle: {
    marginRight: 10,
  },
});

export default NewChatScreen;
