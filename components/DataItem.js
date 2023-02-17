import React from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import colors from '../constants/colors';
import ProfileImage from './ProfileImage';
import { Ionicons } from '@expo/vector-icons';

const DataItem = (props) => {
  const { title, subTitle, image, type, isChecked } = props;
  return (
    <TouchableWithoutFeedback onPress={props.onPress}>
      <View style={styles.container}>
        <ProfileImage uri={image} size={40} />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subTitle} numberOfLines={1}>
            {subTitle}
          </Text>
        </View>
        {type === 'checkBox' && (
          <View style={{ ...styles.iconContainer, ...(isChecked && styles.checkedStyle) }}>
            <Ionicons name='checkmark' size={18} color='white' />
          </View>
        )}

        {type === 'link' && (
          <View>
            <Ionicons name='chevron-forward-outline' size={18} color={colors.gray} />
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 7,
    borderBottomColor: colors.extraLightGray,
    borderBottomWidth: 1,
    alignItems: 'center',
    maxHeight: 50,
  },

  textContainer: {
    flex: 1,
    marginLeft: 14,
  },

  title: {
    fontFamily: 'medium',
    fontSize: 16,
    letterSpacing: 0.3,
  },

  subTitle: {
    fontFamily: 'regular',
    color: colors.gray,
    letterSpacing: 0.3,
  },

  iconContainer: {
    borderWidth: 1,
    borderRadius: 50,
    borderColor: colors.lightGray,
    backgroundColor: 'white',
  },

  checkedStyle: {
    backgroundColor: colors.primary,
    borderColor: 'transparent',
  },
});

export default DataItem;
