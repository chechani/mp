import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSearchBroadCastGroupMemberQuery} from '../../api/store/slice/broadCastGroupSlice';
import * as SvgIcon from '../../assets';
import {useTheme} from '../hooks';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import {getColorForParticipant, goBack} from '../../Utils/helperFunctions';
import RegularText from '../Common/RegularText';
import BroadCastGroupDetailColum from '../Colums/BroadCastGroupDetailColum';

const SearchBroadCastContact = ({route}) => {
  const {theme} = useTheme();
  const {name} = route?.params;
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const [contactsData, setContactsData] = useState([]);


  // Fetch search data using the API hook
  const {data: SearchBroadCastGroupMemberData, isLoading} =
    useSearchBroadCastGroupMemberQuery(
      {name, search_query: searchQuery},
      {skip: !searchQuery}, 
    );

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      // If search query is empty, reset contacts data
      setContactsData([]);
    } else if (SearchBroadCastGroupMemberData) {
      // If search query is not empty, set the fetched data
      setContactsData(SearchBroadCastGroupMemberData?.data || []);
    }
  }, [searchQuery, SearchBroadCastGroupMemberData]);



  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme === THEME_COLOR ? colors.white : colors.black,
        }}>
        <TouchableOpacity
          onPress={() => goBack()}
          style={{marginLeft: spacing.MARGIN_6}}>
          <SvgIcon.BackIcon
            width={spacing.WIDTH_24}
            height={spacing.HEIGHT_24}
            color={theme === THEME_COLOR ? colors.black : colors.white}
          />
        </TouchableOpacity>
        <TextInput
          ref={searchInputRef}
          style={[
            styles.searchInput,
            {color: theme === THEME_COLOR ? colors.black : colors.white},
          ]}
          placeholder="Search Contacts"
          placeholderTextColor={colors.grey600}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          },
        ]}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.green} />
        ) : (
          <FlatList
            data={contactsData}
            keyExtractor={item => item.mobile_no.toString()}
            renderItem={({item}) => <BroadCastGroupDetailColum item={item} />}
            ListEmptyComponent={
              <RegularText
                style={{
                  color: theme === THEME_COLOR ? colors.black : colors.white,
                  textAlign: 'center',
                }}>
                No contacts found.
              </RegularText>
            }
          />
        )}
      </View>
    </>
  );
};

export default SearchBroadCastContact;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.PADDING_16,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: spacing.HEIGHT_50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: spacing.RADIUS_8,
    paddingHorizontal: spacing.PADDING_16,
    marginBottom: spacing.MARGIN_16,
    color: colors.black,
    flex: 1,
    margin: spacing.MARGIN_16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.PADDING_10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  contactInfo: {
    marginLeft: spacing.MARGIN_10,
  },
  contactName: {
    fontSize: textScale(18),
    fontWeight: 'bold',
  },
  avatarPlaceholder: {
    width: spacing.HEIGHT_40,
    height: spacing.HEIGHT_40,
    borderRadius: spacing.HEIGHT_40 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: textScale(18),
    color: colors.white,
  },
});
