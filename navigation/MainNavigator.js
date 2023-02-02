import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ChatListScreen from '../screens/ChatListScreen';
import ChatSettingsScreen from '../screens/ChatSettingsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ChatScreen from '../screens/ChatScreen';
import NewChatScreen from '../screens/NewChatScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { getFirebaseApp } from '../utils/firebaseHelper';
import { child, get, getDatabase, off, onValue, ref } from 'firebase/database';
import { setChatsData } from '../store/chatSlice';
import { ActivityIndicator, View } from 'react-native';
import colors from '../constants/colors';
import commonStyle from '../constants/commonStyle';
import { setStoredUsers } from '../store/userSlice';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerTitle: '', headerShadowVisible: false }}>
      <Tab.Screen
        name='ChatList'
        component={ChatListScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name='chatbubble-outline' size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name='Settings'
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name='settings-outline' size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Group>
        <Stack.Screen name='Home' component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen
          name='ChatSettings'
          component={ChatSettingsScreen}
          options={{ gestureEnabled: true, headerTitle: 'Settings', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name='ChatScreen'
          component={ChatScreen}
          options={{ headerBackTitle: 'Back', headerTitle: '' }}
        />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: 'containedModal' }}>
        <Stack.Screen name='NewChat' component={NewChatScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

const MainNavigator = (props) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const userData = useSelector((state) => state.auth.userData);
  const storedUsers = useSelector((state) => state.users.storedUsers);

  useEffect(() => {
    const app = getFirebaseApp();
    const dbRef = ref(getDatabase(app));
    const userChatsRef = child(dbRef, `userChats/${userData.userId}`);
    const refs = [userChatsRef];

    onValue(userChatsRef, (querySnapshot) => {
      const chatIdsData = querySnapshot.val() || {};
      const chatIds = Object.values(chatIdsData);

      const chatsData = {};
      let chatFoundCount = 0;

      for (let i = 0; i < chatIds.length; i++) {
        const chatId = chatIds[i];
        const chatRef = child(dbRef, `chats/${chatId}`);

        refs.push(chatRef);

        onValue(chatRef, (chatSnapshot) => {
          chatFoundCount++;
          const data = chatSnapshot.val();

          if (data) {
            data.key = chatSnapshot.key;

            data.users.forEach((userId) => {
              if (storedUsers[userId]) {
                return;
              }

              const userRef = child(dbRef, `users/${userId}`);

              get(userRef).then((userSnapshot) => {
                const userSnapshotData = userSnapshot.val();

                dispatch(setStoredUsers({ newUsers: { userSnapshotData } }));
              });

              refs.push(userRef);
            });
            chatsData[chatSnapshot.key] = data;
          }

          if (chatFoundCount >= chatIds.length) {
            dispatch(setChatsData({ chatsData }));
            setIsLoading(false);
          }
        });

        if (chatFoundCount === 0) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      refs.forEach((ref) => off(userChatsRef));
    };
  }, []);

  if (isLoading) {
    <View style={commonStyle.center}>
      <ActivityIndicator size={'large'} color={colors.primary} />
    </View>;
  }

  return <StackNavigator />;
};

export default MainNavigator;
