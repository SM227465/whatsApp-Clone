import React, { useRef } from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Image } from 'react-native';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';
import colors from '../constants/colors';
import uuid from 'react-native-uuid';
import * as Clipboard from 'expo-clipboard';
import { Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { starMessage } from '../utils/actions/chatAction';
import { useSelector } from 'react-redux';

function formatAmPm(dateString) {
  const date = new Date(dateString);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + minutes + ' ' + ampm;
}

const MenuItem = (props) => {
  const Icon = props.iconPack ?? Feather;
  return (
    <MenuOption onSelect={props.onSelect}>
      <View style={styles.menuItemContainer}>
        <Text style={styles.menuText}>{props.text}</Text>
        <Icon name={props.icon} size={18} />
      </View>
    </MenuOption>
  );
};

const Bubble = (props) => {
  const { text, type, messageId, userId, chatId, date, setReply, replyingTo, name, imageUrl } =
    props;
  const starredMessages = useSelector((state) => state.messages.starredMessages[chatId] ?? {});
  const storedUsers = useSelector((state) => state.users.storedUsers);

  const bubbleStyle = { ...styles.container };
  const textStyle = { ...styles.text };
  const wrapperStyle = { ...styles.wrapperStyle };

  const menuRef = useRef(null);
  const id = useRef(uuid.v4());

  let Container = View;
  let isUserMessage = false;
  const dateString = date && formatAmPm(date);

  switch (type) {
    case 'system':
      textStyle.color = '#65644A';
      bubbleStyle.backgroundColor = colors.beige;
      bubbleStyle.alignItems = 'center';
      bubbleStyle.marginTop = 10;
      break;

    case 'error':
      bubbleStyle.backgroundColor = colors.red;
      textStyle.color = 'white';
      bubbleStyle.marginTop = 10;
      break;

    case 'myMessage':
      wrapperStyle.justifyContent = 'flex-end';
      bubbleStyle.backgroundColor = '#e7fed6';
      bubbleStyle.maxWidth = '90%';
      Container = TouchableWithoutFeedback;
      isUserMessage = true;
      break;

    case 'theirMessage':
      wrapperStyle.justifyContent = 'flex-start';
      bubbleStyle.maxWidth = '90%';
      Container = TouchableWithoutFeedback;
      isUserMessage = true;
      break;

    case 'reply':
      bubbleStyle.backgroundColor = '#f2f2f2';
      break;

    case 'info':
      bubbleStyle.backgroundColor = 'white';
      bubbleStyle.alignItems = 'center';
      textStyle.color = colors.textColor;
      break;

    default:
      break;
  }

  const copyToClipboard = async (text) => {
    try {
      await Clipboard.setStringAsync(text);
    } catch (error) {
      console.log(error);
    }
  };

  const isStarred = isUserMessage && starredMessages[messageId] !== undefined;
  const replyingToUser = replyingTo && storedUsers[replyingTo.sentBy];

  return (
    <View style={wrapperStyle}>
      <Container
        onLongPress={() => menuRef.current.props.ctx.menuActions.openMenu(id.current)}
        style={{ width: '100%' }}
      >
        <View style={bubbleStyle}>
          {name && type !== 'info' && <Text style={styles.name}>{name}</Text>}
          {replyingToUser && (
            <Bubble
              type='reply'
              text={replyingTo.text}
              name={`${replyingToUser.firstName} ${replyingToUser.lastName}`}
            />
          )}
          {!imageUrl && <Text style={textStyle}> {text}</Text>}

          {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}

          {dateString && type !== 'info' && (
            <View style={styles.timeContainer}>
              {isStarred && (
                <FontAwesome
                  name='star'
                  size={14}
                  color={colors.textColor}
                  style={{ marginRight: 5 }}
                />
              )}
              <Text style={styles.time}>{dateString}</Text>
            </View>
          )}

          <Menu name={id.current} ref={menuRef}>
            <MenuTrigger />
            <MenuOptions customStyles={styles.optionsStyles}>
              <MenuItem text='Copy' icon={'copy'} onSelect={() => copyToClipboard(text)} />
              <MenuItem
                text={`${isStarred ? 'Unstar' : 'Star'} Message`}
                icon={`${isStarred ? 'star-o' : 'star'}`}
                iconPack={FontAwesome}
                onSelect={() => starMessage(messageId, chatId, userId)}
              />
              <MenuItem
                text='Reply'
                icon='reply-outline'
                iconPack={MaterialCommunityIcons}
                onSelect={setReply}
              />
            </MenuOptions>
          </Menu>
        </View>
      </Container>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapperStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  container: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 5,
    marginBottom: 10,
    paddingRight: 9,
    borderColor: '#e2d8cc',
    borderWidth: 1,
  },

  text: {
    fontFamily: 'regular',
    letterSpacing: 0.3,
  },

  menuItemContainer: {
    flexDirection: 'row',
  },

  menuText: {
    flex: 1,
    fontFamily: 'regular',
    letterSpacing: 0.3,
    fontSize: 16,
  },

  optionsStyles: {
    optionsContainer: {
      width: 160,
    },
  },

  time: {
    fontFamily: 'regular',
    letterSpacing: 0.3,
    color: colors.gray,
    fontSize: 12,
  },

  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  name: {
    fontFamily: 'medium',
    letterSpacing: 0.3,
  },

  image: {
    width: 300,
    height: 300,
    marginBottom: 5,
  },
});

export default Bubble;
