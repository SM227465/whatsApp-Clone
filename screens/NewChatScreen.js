import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import CustomHeaderButton from '../components/CustomHeaderButton';
import PageContainer from '../components/PageContainer';
import { FontAwesome } from '@expo/vector-icons';
import colors from '../constants/colors';
import commonStyle from '../constants/commonStyle';
import { serchUsers } from '../utils/actions/userActions';
import DataItem from '../components/DataItem';

const NewChatScreen = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState();
  const [noResultFound, setNoResultFound] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => {
        return (
          <HeaderButtons HeaderButtonComponent={CustomHeaderButton}>
            <Item title='Close' onPress={() => props.navigation.goBack()} />
          </HeaderButtons>
        );
      },

      headerTitle: 'New chat',
    });
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (!searchTerm) {
        setUsers();
        setNoResultFound(false);
        return;
      }

      setIsLoading(true);

      const userResult = await serchUsers(searchTerm);

      setUsers(userResult);

      if (!userResult) {
        setNoResultFound(true);
      } else {
        setNoResultFound(false);
      }

      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  return (
    <PageContainer>
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
            return (
              <DataItem
                title={`${userdata.firstName} ${userdata.lastName}`}
                subTitle={userdata.about}
                image={userdata.profilePicture}
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
});

export default NewChatScreen;
