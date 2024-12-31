import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import {useApiURLs} from '../../Config/url';
import NavigationString from '../../Navigations/NavigationString';
import THEME_COLOR from '../../Utils/Constant';
import colors from '../../Utils/colors';
import {
  CommonToastMessage,
  getColorForParticipant,
  goBack,
  navigate,
} from '../../Utils/helperFunctions';
import {useDeleteContactMutation} from '../../api/store/slice/contactSlice';
import {useLazySearchConatctQuery} from '../../api/store/slice/searchSlice';
import * as SvgIcon from '../../assets';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import AnimatedModal from '../Common/AnimatedModal';
import CommonPopupModal from '../Common/CommonPopupModal';
import RegularText from '../Common/RegularText';
import {useTheme} from '../hooks';

const SearchContact = () => {
  const {theme} = useTheme();
  const {SEARCH_CONTACT, DELETE_CONTACT} = useApiURLs();
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const [searchContact] = useLazySearchConatctQuery();
  const [deleteContact] = useDeleteContactMutation();

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const searchContacts = async query => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setContacts([]);
      return;
    }
    setLoading(true);
    try {
      const response = await searchContact({search_query: trimmedQuery});
      const fetchedContacts = response?.data?.data || [];
      setContacts(fetchedContacts);
    } catch (e) {
      console.error('Error fetching contacts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchContacts(searchQuery);
      } else {
        setContacts([]);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const renderAvatar = contact => {
    const {backgroundColor, textColor} = getColorForParticipant(
      contact.mobile_no.toString(),
    );
    const firstLetter = contact.full_name ? contact.full_name.charAt(0) : '?';
    return (
      <View style={[styles.avatarPlaceholder, {backgroundColor}]}>
        <RegularText style={[styles.avatarText, {color: textColor}]}>
          {firstLetter}
        </RegularText>
      </View>
    );
  };

  const renderItem = ({item}) => {
    const isSelected = selectedContacts.some(
      selectedItem => selectedItem.mobile_no === item.mobile_no,
    );
    const isSelectionMode = selectedContacts.length > 0;

    const handleSelectContact = () => {
      setSelectedContacts(prevSelectedContacts => {
        // If the item is already selected, deselect it
        if (
          prevSelectedContacts.length > 0 &&
          prevSelectedContacts[0].mobile_no === item.mobile_no
        ) {
          return [];
        }
        setIsModalVisible(true);
        return [
          {
            name: item.full_name,
            mobile_no: item.mobile_no,
          },
        ];
      });
    };

    const handlePress = () => {
      if (isSelectionMode) {
        handleSelectContact();
      } else {
        navigate(NavigationString.ContactListDetailsRowScreen, {
          contactName: item?.full_name,
          mobileNo: item?.mobile_no,
        });
      }
    };

    const handleLongPress = () => {
      if (!isSelected) {
        Vibration.vibrate([50, 100]);
        handleSelectContact();
      }
    };

    return (
      <TouchableOpacity
        style={[styles.contactItem]}
        onPress={handlePress}
        onLongPress={handleLongPress}>
        {renderAvatar(item)}
        <View style={styles.contactInfo}>
          <RegularText
            style={[
              styles.contactName,
              {color: theme === THEME_COLOR ? colors.black : colors.white},
            ]}>
            {item?.full_name}
          </RegularText>
        </View>
      </TouchableOpacity>
    );
  };

  const handleDeletePress = () => {
    setIsDeleteMode(true);
    setIsModalVisible(false);
  };

  const handleConfirmDeletePress = async () => {
    try {
      const names = selectedContacts.reduce((acc, {name}) => {
        acc.push(name);
        return acc;
      }, []);
      const res = await deleteContact({contact_names: names});
      setSelectedContacts([]);
      setIsDeleteMode(false);
      if (res.data?.status_code === 200) {
        CommonToastMessage('success', res.data?.message);
        setSearchQuery('');
      }
    } catch (error) {
      console.log(error);
      setIsDeleteMode(false);
    }
  };

  const handleCancelDeletePress = () => {
    setSelectedContacts([]);
    setIsDeleteMode(false);
  };

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
        {loading ? (
          <ActivityIndicator size="large" color={colors.green} />
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={item => item.mobile_no.toString()}
            renderItem={renderItem}
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

      <CommonPopupModal
        isVisible={isDeleteMode}
        buttons={[
          {
            text: 'Cancel',
            color: colors.red600,
            onPress: handleCancelDeletePress,
          },
          {
            text: 'Delete',
            color: colors.green600,
            onPress: handleConfirmDeletePress,
          },
        ]}
        message="Are you sure you want to Delete"
      />
      <AnimatedModal
        isVisible={isModalVisible}
        close={() => {
          setIsModalVisible(false), setSelectedContacts([]);
        }}
        animationType="none"
        top={spacing.HEIGHT_216}
        left={spacing.HEIGHT_128}
        backDropColor="rgba(255,255,255, 0.3)"
        modalStyle={{elevation: 0}}>
        <TouchableOpacity
          style={{}}
          activeOpacity={0.8}
          onPress={handleDeletePress}>
          <RegularText
            style={{
              fontSize: textScale(16),
              fontFamily: fontNames.POPPINS_FONT_FAMILY_BOLD,
              color: colors.black,
              paddingHorizontal: spacing.PADDING_16,
              paddingVertical: spacing.PADDING_10,
            }}>
            Delete Contact
          </RegularText>
        </TouchableOpacity>
      </AnimatedModal>
    </>
  );
};

export default SearchContact;

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
  avatar: {
    width: spacing.HEIGHT_40,
    height: spacing.HEIGHT_40,
    borderRadius: spacing.HEIGHT_40 / 2,
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
  selectedContactBackground: {
    backgroundColor: colors.green400,
  },
});
