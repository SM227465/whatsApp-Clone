import { getFirebaseApp } from '../firebaseHelper';
import { child, getDatabase, push, ref, update } from 'firebase/database';

export const createChat = async (loggedInUserId, chatData) => {
  const newChatData = {
    ...chatData,
    createdBy: loggedInUserId,
    updatedBy: loggedInUserId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toDateString(),
  };

  const app = getFirebaseApp();
  const dbRef = ref(getDatabase(app));

  const newChat = await push(child(dbRef, 'chats'), newChatData);
  const chatUsers = newChatData.users;

  for (let i = 0; i < chatUsers.length; i++) {
    const userId = chatUsers[i];

    await push(child(dbRef, `userChats/${userId}`), newChat.key);
  }

  return newChat.key;
};

export const sendTextMessage = async (chatId, senderId, messageText) => {
  const app = getFirebaseApp();

  const dbRef = ref(getDatabase());
  const messagesRef = child(dbRef, `messages/${chatId}`);
  const messageData = {
    sentBy: senderId,
    sentAt: new Date().toISOString(),
    text: messageText,
  };

  // console.log('HI', messageData);

  await push(messagesRef, messageData);

  const chatRef = child(dbRef, `chats/${chatId}`);

  const x = await update(chatRef, {
    updatedBy: senderId,
    updatedAt: new Date().toISOString(),
    latestMessageText: messageText,
  });
};
