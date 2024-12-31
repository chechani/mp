import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useFetchBroadCastGroupDetailsQuery,
  useAddMemberInGroupMutation,
} from '../../api/store/slice/broadCastGroupSlice';
import * as SvgIcon from '../../assets/index';
import { useApiURLs } from '../../Config/url';
import NavigationString from '../../Navigations/NavigationString';
import { boxShadow, boxShadowLess } from '../../styles/Mixins';
import { textScale } from '../../styles/responsiveStyles';
import { spacing } from '../../styles/spacing';
import { fontNames } from '../../styles/typography';
import { apiGet } from '../../Utils/apiCalls';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import {
  CommonToastMessage,
  getColorForParticipant,
  goBack,
  navigate,
  truncateText,
} from '../../Utils/helperFunctions';
import BroadCastGroupDetailColum from '../Colums/BroadCastGroupDetailColum';
import BottomComp from '../Common/BottonComp';
import CommonHeader from '../Common/CommoneHeader';
import CustomBottomSheet from '../Common/CustomBottomSheet';
import CustomBottomSheetFlatList from '../Common/CustomBottomSheetFlatList';
import LoadingScreen from '../Common/Loader';
import RegularText from '../Common/RegularText';
import TextInputComp from '../Common/TextInputComp';
import { useTheme } from '../hooks';

const INITIAL_PAGE = 1;
const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 500;

const BroadCastGroupDetails = ({route}) => {
  const {theme} = useTheme();

  const isDarkMode = theme === THEME_COLOR;

  const contactRef = useRef(null);
  const isMounted = useRef(true);
  const searchTimeoutRef = useRef(null);
  const contactSelectRef = useRef(null);
  const {name} = route.params;
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isLoadingMoreContacts, setIsLoadingMoreContacts] = useState(false);
  const [hasMoreContacts, setHasMoreContacts] = useState(true);
  const [contactsError, setContactsError] = useState(null);
  const [page, setPage] = useState(INITIAL_PAGE);
  const [searchText, setSearchText] = useState('');
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [refreshingContacts, setRefreshingContacts] = useState(false);
  const [isAddMember, setIsAddMemeber] = useState(false);

  const {GET_WHATSAPP_CONTACTS, SEARCH_CONTACT} = useApiURLs();
  const {
    data: BroadCastGroupDetailsData,
    isLoading: BroadCastGroupDetailsIsLoading,
    refetch: BroadCastGroupDetailsDatRefetch,
  } = useFetchBroadCastGroupDetailsQuery({name});

  const [addMemberInGroup] = useAddMemberInGroupMutation();

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchText.trim() === '') {
      // Reset to initial state and fetch default contacts when search is cleared
      setPage(INITIAL_PAGE);
      setContacts([]); // Clear existing contacts
      setHasMoreContacts(true);
      fetchContacts({page: INITIAL_PAGE});
    } else {
      // Debounce search requests
      searchTimeoutRef.current = setTimeout(() => {
        setPage(INITIAL_PAGE);
        setContacts([]); // Clear existing contacts
        setHasMoreContacts(true);
        fetchContacts({page: INITIAL_PAGE, isSearch: true});
      }, SEARCH_DEBOUNCE_MS);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText]);
  useEffect(() => {
    if (selectedContacts.length > 0) {
      contactRef.current?.dismiss();
      contactSelectRef.current?.present();
    }
  }, [selectedContacts]);

  const handleSelectContact = useCallback(contactMobile => {
    setSelectedContacts(prevSelectedContacts => {
      if (prevSelectedContacts.includes(contactMobile)) {
        return [];
      } else {
        return [contactMobile];
      }
    });
  }, []);

  const renderAvatar = useCallback(contact => {
    const mobileNo = contact?.name || 'N/A';
    const {backgroundColor, textColor} = getColorForParticipant(
      mobileNo.toString(),
    );
    const firstLetter = contact?.full_name ? contact.full_name.charAt(0) : '?';

    return (
      <View style={[styles.avatarPlaceholder, {backgroundColor}]}>
        <RegularText style={[styles.avatarText, {color: textColor}]}>
          {firstLetter}
        </RegularText>
      </View>
    );
  }, []);

  const renderContactItem = useCallback(
    ({item}) => {
      const isSelected = selectedContacts.includes(item);
      const backgroundColor = isSelected
        ? colors.green200
        : isDarkMode
        ? colors.white
        : '#151414';

      return (
        <TouchableOpacity
          style={[styles.contactItem, {backgroundColor}]}
          activeOpacity={0.7}
          onPress={() => handleSelectContact(item)}>
          {renderAvatar(item)}
          <View style={styles.contactInfo}>
            <RegularText
              style={[
                styles.contactName,
                {color: isDarkMode ? colors.black : colors.white},
              ]}>
              {item?.full_name || 'Unknown Contact'}
            </RegularText>
            <RegularText
              style={[
                styles.contactMobile,
                {color: isDarkMode ? colors.black : colors.white},
              ]}>
              {item?.mobile_no}
            </RegularText>
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
    [theme, selectedContacts],
  );

  const ContactListEmpty = useMemo(
    () => (
      <RegularText
        style={[
          styles.noDataText,
          {color: isDarkMode ? colors.black : colors.white},
        ]}>
        {contactsError || 'No contacts found.'}
      </RegularText>
    ),
    [theme, contactsError],
  );
  const handleLoadMoreContacts = useCallback(() => {
    if (!isLoadingMoreContacts && hasMoreContacts && !contactsError) {
      if (searchText.trim()) {
        return;
      }
      const nextPage = page + 1;
      setPage(nextPage);
      fetchContacts({page: nextPage});
    }
  }, [isLoadingMoreContacts, hasMoreContacts, contactsError, searchText, page]);

  const fetchContacts = async ({
    page = INITIAL_PAGE,
    isSearch = false,
  } = {}) => {
    if (!isMounted.current) return;

    if (page === INITIAL_PAGE) {
      setIsLoadingContacts(true);
      setContactsError(null);
    } else {
      setIsLoadingMoreContacts(true);
    }

    try {
      let endpoint;
      let params = {
        limit: PAGE_SIZE,
      };

      // Determine endpoint and params based on search state
      if (isSearch && searchText.trim()) {
        endpoint = SEARCH_CONTACT;
        params.search_query = searchText.trim();
      } else {
        endpoint = GET_WHATSAPP_CONTACTS;
        params.page = page;
      }

      const response = await apiGet(endpoint, {params});
      if (!isMounted.current) return;

      // Handle different data structures ("data" or "message")
      const contactsData = response?.data || response?.message || []; // Extract from "data" or "message" key, whichever exists

      // Check if contactsData is an array
      if (!Array.isArray(contactsData)) {
        throw new Error('Unexpected response format for contacts data');
      }

      setContacts(prevContacts =>
        page === INITIAL_PAGE
          ? contactsData
          : [...prevContacts, ...contactsData],
      );

      // Update hasMoreContacts based on the response length
      setHasMoreContacts(contactsData.length >= PAGE_SIZE);
    } catch (error) {
      if (!isMounted.current) return;
      console.error('Error fetching contacts:', error);
      setContactsError(error.message || 'Failed to fetch contacts');
    } finally {
      if (!isMounted.current) return;
      setIsLoadingContacts(false);
      setIsLoadingMoreContacts(false);
      setRefreshingContacts(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshingContacts(true);
    setPage(INITIAL_PAGE);
    setContacts([]); // Clear existing contacts
    setHasMoreContacts(true);
    if (searchText.trim()) {
      fetchContacts({page: INITIAL_PAGE, isSearch: true});
    } else {
      fetchContacts({page: INITIAL_PAGE});
    }
  }, [searchText]);

  const handleSearch = useCallback(text => {
    setSearchText(text);
  }, []);
  const ContactListHeader = useMemo(
    () => (
      <View
        style={[
          styles.searchHeader,
          {
            backgroundColor: isDarkMode ? colors.white : '#151414',
          },
        ]}>
        <TouchableOpacity
          onPress={() => {
            resetSearch();
            contactRef.current?.dismiss();
          }}
          style={styles.backButton}>
          <SvgIcon.BackIcon
            width={spacing.WIDTH_24}
            height={spacing.WIDTH_24}
            color={isDarkMode ? colors.grey800 : colors.white}
          />
        </TouchableOpacity>
        <TextInput
          placeholder="Search contacts by Name or Number"
          placeholderTextColor={colors.grey800}
          value={searchText}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />
      </View>
    ),
    [theme, searchText, resetSearch],
  );

  const resetSearch = useCallback(() => {
    setSearchText('');
    setPage(INITIAL_PAGE);
    setContacts([]);
    setHasMoreContacts(true);
    fetchContacts({page: INITIAL_PAGE});
  }, []);

  const addNewMemberHandler = async () => {
    setIsAddMemeber(true);
    try {
      const payload = {
        name: name,
        contact_name: selectedContacts[0].full_name,
        contact_mobile_no: selectedContacts[0].mobile_no,
      };
      const res = await addMemberInGroup(payload);
      console.log(res);
      if (res?.data?.status_code === 200) {
        setSelectedContacts([]);
        contactSelectRef.current?.dismiss();
        CommonToastMessage('success', res?.data?.message);
        setIsAddMemeber(false);
      }
      if (res.data?.status_code === 400) {
        CommonToastMessage('success', res?.data?.message);
        setIsAddMemeber(false);
      }
    } catch (error) {
      console.log(error);
      setIsAddMemeber(false);
    } finally {
      setIsAddMemeber(false);
    }
  };
  const handleCommonHeaderIcon = index => {
    const actions = {
      0: () =>
        navigate(NavigationString.BroadCastGroupSearchContactScreen, {name}),
      1: () => BroadCastGroupDetailsDatRefetch(),
    };

    const action = actions[index];
    if (action) {
      action();
    } else {
    }
  };

  return (
    <>
      <View
        style={{
          backgroundColor: isDarkMode ? colors.white : colors.black,
          flex: 1,
        }}>
        <CommonHeader
          title={`${truncateText(
            BroadCastGroupDetailsData?.data[0]?.name || 'Group Details',
            25,
          )}`}
          showLeftIcon={true}
          leftIcon={SvgIcon.BackIcon}
          onLeftIconPress={() => goBack()}
          showRightIcons={true}
          rightIcons={[SvgIcon.Search, SvgIcon.ReloadIcon]}
          onRightIconPress={handleCommonHeaderIcon}
        />
        {BroadCastGroupDetailsIsLoading ? (
          <LoadingScreen color={colors.green} />
        ) : (
          <FlatList
            data={BroadCastGroupDetailsData?.data[0]?.contacts || []}
            renderItem={({item}) => <BroadCastGroupDetailColum item={item} />}
            keyExtractor={item => item?.name?.toString()}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <RegularText style={styles.emptyText}>
                  No contacts available
                </RegularText>
              </View>
            }
          />
        )}
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.createGroupButton}
        onPress={() => contactRef.current?.present()}>
        <SvgIcon.AddICon
          color={colors.white}
          width={spacing.WIDTH_30}
          height={spacing.HEIGHT_30}
        />
        <RegularText style={styles.createGroupText}>Add Member</RegularText>
      </TouchableOpacity>
      <CustomBottomSheetFlatList
        ref={contactRef}
        snapPoints={['100%']}
        enableDynamicSizing={false}
        keyExtractor={item => item?.name?.toString()}
        backgroundStyle={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
        data={contacts}
        renderItem={renderContactItem}
        ListEmptyComponent={ContactListEmpty}
        contentContainerStyle={styles.flatListContainer}
        onEndReached={handleLoadMoreContacts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMoreContacts && (
            <ActivityIndicator size="large" color={colors.green} />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshingContacts}
            onRefresh={onRefresh}
          />
        }
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={ContactListHeader}
        stickyHeaderIndicesFlatList={[0]}
      />
      <CustomBottomSheet
        ref={contactSelectRef}
        snapPoints={['50%']}
        modalStyle={styles.modalStyle}>
        <RegularText
          style={[
            styles.modalHeader,
            {color: isDarkMode ? colors.black : colors.white},
          ]}>
          Add New Member
        </RegularText>
        <TextInputComp
          value={
            selectedContacts.length > 0 ? selectedContacts[0].full_name : ''
          }
          textInputLeftIcon={SvgIcon.GroupIcon}
          istextInputLeftIcon={true}
          inputStyle={styles.groupInput}
          containerStyle={styles.inputContainer}
          editable={false}
        />
        <TextInputComp
          value={
            selectedContacts.length > 0 ? selectedContacts[0].mobile_no : ''
          }
          textInputLeftIcon={SvgIcon.Artical}
          istextInputLeftIcon={true}
          inputStyle={styles.groupInput}
          containerStyle={styles.inputContainer}
          editable={false}
        />
        <BottomComp
          text={'Add Member'}
          style={styles.CreateGroupctButton}
          textStyle={styles.CreateGroupButtonText}
          onPress={addNewMemberHandler}
          isLoading={isAddMember}
        />
      </CustomBottomSheet>
    </>
  );
};

export default BroadCastGroupDetails;

const styles = StyleSheet.create({
  createGroupButton: {
    paddingHorizontal: spacing.PADDING_12,
    paddingVertical: spacing.PADDING_14,
    backgroundColor: colors.green600,
    position: 'absolute',
    bottom: spacing.MARGIN_16,
    right: spacing.MARGIN_16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.RADIUS_10,
    flexDirection: 'row',
    ...boxShadow(),
  },
  createGroupText: {
    color: colors.white,
    marginLeft: spacing.MARGIN_4,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.PADDING_10,
    ...boxShadowLess(),
    paddingHorizontal: spacing.PADDING_20,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
    fontSize: textScale(15),
  },
  contactMobile: {
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
    fontSize: textScale(13),
  },
  noDataText: {
    marginTop: spacing.MARGIN_20,
    textAlign: 'center',
    fontSize: textScale(16),
    color: '#666666',
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
  },
  flatListContainer: {
    paddingBottom: spacing.PADDING_24,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.PADDING_20,
  },
  backButton: {
    marginRight: spacing.MARGIN_10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: spacing.RADIUS_8,
    paddingHorizontal: spacing.PADDING_10,
    color: colors.black,
  },
  avatarPlaceholder: {
    width: spacing.HEIGHT_40,
    height: spacing.HEIGHT_40,
    borderRadius: spacing.HEIGHT_40 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.MARGIN_10,
  },
  avatarText: {
    fontSize: textScale(15),
  },
  CreateGroupctButton: {
    marginHorizontal: spacing.MARGIN_10,
    paddingVertical: spacing.PADDING_12,
    backgroundColor: colors.green700,
    marginVertical: spacing.MARGIN_4,
  },
  CreateGroupButtonText: {
    fontSize: textScale(16),
    color: colors.white,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
  },
  modalHeader: {
    fontSize: textScale(16),
    alignSelf: 'center',
    marginVertical: spacing.MARGIN_4,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_MEDIUM,
  },
  groupInput: {
    width: '95%',
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: spacing.MARGIN_10,
  },
});
