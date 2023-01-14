import { StyleSheet, Text, TextInput, View } from 'react-native';
import colors from '../constants/colors';
import { FontAwesome } from '@expo/vector-icons';

const Input = (props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{props.label}</Text>
      <View style={styles.inputContainer}>
        {props.icon ? (
          <props.iconPack name={props.icon} size={props.iconSize || 15} style={styles.icon} />
        ) : null}
        <TextInput style={styles.input} />
      </View>
      {props.errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{props.errorMessage}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  label: {
    marginVertical: 8,
    fontFamily: 'bold',
    letterSpacing: 0.3,
    color: colors.textColor,
  },

  inputContainer: {
    width: '100%',
    backgroundColor: colors.nearlyWhite,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    marginRight: 10,
    color: colors.gray,
  },

  input: {
    color: colors.textColor,
    flex: 1,
    fontFamily: 'regular',
    letterSpacing: 0.3,
    paddingTop: 0,
  },

  errorContainer: {
    marginVertical: 5,
  },

  errorText: {
    color: 'red',
    fontSize: 13,
    fontFamily: 'regular',
    letterSpacing: 0.3,
  },
});

export default Input;
