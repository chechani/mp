import React, {useCallback, useRef, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {useLazySearchContactQuery} from '../../api/store/slice/contactSlice';
import * as SvgIcon from '../../assets';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import Colors from '../../theme/colors';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import {getColorForParticipant, goBack} from '../../Utils/helperFunctions';
import ContainerComponent from '../Common/ContainerComponent';
import DynamicSearch from '../Common/DynamicSearch';
import TextComponent from '../Common/TextComponent';
import {useTheme} from '../hooks';
import { useRoute } from '@react-navigation/native';

const SearchAndAddMemberForBroadCastGroup = () => {
  const {theme} = useTheme();
  const isDarkMode = theme === THEME_COLOR;
  const dynamicSearchRef = useRef(null);
  const route = useRoute();
  const { onSelect } = route.params;

  const [hasSelection, setHasSelection] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [triggerSearchContact] = useLazySearchContactQuery();

  /** Fetch Contacts (API call) */
  const handleFetchSearchResults = useCallback(
    async (text, abortSignal) => {
      if (abortSignal?.aborted) return [];

      try {
        const {data} = await triggerSearchContact({
          search_query: text,
          page: 1,
          limit: 30,
        }).unwrap();
        return data || [];
      } catch (err) {
        console.error('Error fetching contacts:', err);
        return [];
      }
    },
    [triggerSearchContact],
  );

  /** Render Contact Avatar */
  const renderAvatar = useCallback(contact => {
    const mobileNo = contact?.name || 'N/A';
    const {backgroundColor, textColor} = getColorForParticipant(
      mobileNo.toString(),
    );
    const firstLetter = contact?.full_name ? contact.full_name.charAt(0) : '?';

    return (
      <View style={[styles.avatarPlaceholder, {backgroundColor}]}>
        <TextComponent
          text={firstLetter}
          color={textColor}
          size={textScale(15)}
        />
      </View>
    );
  }, []);
  const handleSelectConstact = () => {
    if (onSelect) {
      onSelect(selectedContacts);
    }
    
    // Reset state before navigating back
    setHasSelection(false);
    setSelectedContacts([]);
  
    goBack();
  };
  

  /** Handle Contact Selection */
  const handleSelectContact = useCallback(contact => {
    setSelectedContacts(prevSelectedContacts => {
      const isAlreadySelected = prevSelectedContacts.some(
        item => item.mobile === contact.mobile_no
      );
      if (isAlreadySelected) {
        const updatedContacts = prevSelectedContacts.filter(
          item => item.mobile !== contact.mobile_no
        );
        setHasSelection(updatedContacts.length > 0);
        return updatedContacts;
      } else {
        const newSelection = [...prevSelectedContacts, { name: contact.full_name, mobile: contact.mobile_no }];
        setHasSelection(true);
        return newSelection;
      }
    });
  }, []);
  

  /** Render Each Contact Item */
  const renderContactItem = useCallback(
    ({ item }) => {
      const isSelected = selectedContacts.some(contact => contact.mobile === item.mobile_no);
      const backgroundColor = isSelected ? colors.green200 : isDarkMode ? Colors.white : '#151414';
  
      return (
        <TouchableOpacity
          style={[styles.contactItem, { backgroundColor }]}
          activeOpacity={0.7}
          onPress={() => handleSelectContact(item)} // Pass the entire `item` object
        >
          {renderAvatar(item)}
          <View style={styles.contactInfo}>
            <TextComponent
              text={item?.full_name || 'Unknown Contact'}
              color={isDarkMode ? Colors.dark.black : Colors.light.white}
              font={fontNames.ROBOTO_FONT_FAMILY_MEDIUM}
              size={textScale(15)}
            />
            <TextComponent
              text={item?.mobile_no}
              color={isDarkMode ? Colors.dark.black : Colors.light.white}
              size={textScale(13)}
            />
          </View>
          {isSelected && (
            <SvgIcon.CheckIcon
              width={spacing.WIDTH_24}
              height={spacing.HEIGHT_24}
              style={styles.checkIcon}
            />
          )}
        </TouchableOpacity>
      );
    },
    [selectedContacts, isDarkMode, handleSelectContact]
  );
  

  return (
    <ContainerComponent
      noPadding
      useScrollView={false}
      bottomComponent={
        hasSelection && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSelectConstact}>
            <TextComponent
              text={`Proceed with ${selectedContacts.length} selected contacts`}
            />
          </TouchableOpacity>
        )
      }>
      <DynamicSearch
        ref={dynamicSearchRef}
        data={[]} 
        searchKeys={['full_name', 'mobile_no']}
        useRemoteSearch
        fetchSearchResults={handleFetchSearchResults}
        placeholder="Search contacts..."
        debounceTime={400}
        maxResults={50}
        isgoBackArrowShow
        renderCustomItem={renderContactItem}
      />
    </ContainerComponent>
  );
};

export default SearchAndAddMemberForBroadCastGroup;

const styles = StyleSheet.create({
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.PADDING_12,
    borderRadius: spacing.RADIUS_8,
    marginVertical: spacing.MARGIN_4,
  },
  contactInfo: {
    flex: 1,
    marginLeft: spacing.MARGIN_10,
  },
  checkIcon: {
    marginLeft: spacing.MARGIN_10,
  },
  avatarPlaceholder: {
    width: spacing.HEIGHT_40,
    height: spacing.HEIGHT_40,
    borderRadius: spacing.HEIGHT_40 / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    marginTop: spacing.MARGIN_12,
    padding: spacing.PADDING_10,
    backgroundColor: Colors.default.accent,
    borderRadius: spacing.RADIUS_8,
    alignItems: 'center',
  },
});
