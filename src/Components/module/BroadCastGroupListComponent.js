import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useGetBroadCastGroupQuery,
  useCreateNewGroupMutation,
} from '../../api/store/slice/broadCastGroupSlice';
import {
  useLazyGetAllContactQuery,
  useLazySearchContactQuery,
} from '../../api/store/slice/contactSlice';
import * as SvgIcon from '../../assets/index';
import {useApiURLs} from '../../Config/url';
import {boxShadow, boxShadowLess} from '../../styles/Mixins';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import {apiGet} from '../../Utils/apiCalls';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import {
  CommonToastMessage,
  getColorForParticipant,
  openDrawer,
} from '../../Utils/helperFunctions';
import BroadCastGroupColum from '../Colums/BroadCastGroupColum';
import BottomComp from '../Common/BottonComp';
import CommonHeader from '../Common/CommoneHeader';
import CustomBottomSheetFlatList from '../Common/CustomBottomSheetFlatList';
import LoadingScreen from '../Common/Loader';
import RegularText from '../Common/RegularText';
import TextInputComp from '../Common/TextInputComp';
import {useTheme} from '../hooks';
import CustomInput from '../Common/CustomInput';
import Colors from '../../theme/colors';

const INITIAL_PAGE = 1;
const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 500;

const GroupInfo = ({groupName, title, setCreateGroup, isDarkMode}) => {
  return (
    <View style={styles.groupInfoContainer}>
      <CustomInput
        placeholder="Group Name"
        label="Group Name"
        required={true}
        value={groupName}
        onChange={text =>
          setCreateGroup(prevState => ({...prevState, groupName: text}))
        }
        inputStyles={{
          color: isDarkMode ? Colors.dark.black : Colors.light.white,
        }}
        showFirstChildren={true}
        FirstChildren={
          <SvgIcon.GroupIcon
            color={isDarkMode ? Colors.dark.black : Colors.light.white}
          />
        }
      />
      <CustomInput
        placeholder="Title"
        label="Title"
        required={true}
        value={title}
        onChange={text =>
          setCreateGroup(prevState => ({...prevState, title: text}))
        }
        inputStyles={{
          color: isDarkMode ? Colors.dark.black : Colors.light.white,
        }}
        showFirstChildren={true}
        FirstChildren={
          <SvgIcon.Artical
            color={isDarkMode ? Colors.dark.black : Colors.light.white}
          />
        }
      />
    </View>
  );
};
const ListHeaderComponent = ({
  groupName,
  title,
  setCreateGroup,
  isDarkMode,
  isContactBtn,
  setIsDynamicFilters,
  onClickContactBotton,
  contactRef,
}) => {
  return (
    <View>
      <RegularText
        style={[
          styles.modalHeader,
          {color: isDarkMode ? colors.black : colors.white},
        ]}>
        Create New Group
      </RegularText>
      <GroupInfo
        groupName={groupName}
        title={title}
        setCreateGroup={setCreateGroup}
        isDarkMode={isDarkMode}
      />
      {isContactBtn && (
        <BottomComp
          text="Select Contact"
          style={styles.selectContactButton}
          textStyle={styles.selectContactButtonText}
          onPress={async () => {
            await onClickContactBotton;
            contactRef.current?.present();
            setIsDynamicFilters(false);
          }}
        />
      )}
    </View>
  );
};

const DynamicFiltersRow = React.memo(
  ({index, filter, onFilterChange, handleDynamicFilterApiCall, isDarkMode, url}) => {
    return (
      <View style={{flex: 1}}>
        <RegularText
          style={{
            color: isDarkMode ? colors.black : colors.white,
            marginLeft: spacing.MARGIN_14,
            fontSize: textScale(16),
            marginVertical: spacing.MARGIN_8,
          }}>
          {`Row ${index + 1}`}
        </RegularText>

        <TextInputComp
          placeholder="Filter on Field"
          placeholderTextColor={colors.grey500}
          value={filter.filterOnField}
          inputStyle={[styles.groupInput]}
          autoCapitalize="none"
          autoCorrect={false}
          editable={false}
          onPressContainer={() =>
            handleDynamicFilterApiCall(url[0], 'filterOnField', index)
          }
        />
        <TextInputComp
          placeholder="Operator"
          placeholderTextColor={colors.grey500}
          value={filter.operator}
          inputStyle={[styles.groupInput]}
          autoCapitalize="none"
          autoCorrect={false}
          editable={false}
          onPressContainer={() =>
            handleDynamicFilterApiCall(url[1], 'operator', index)
          }
        />
        <TextInputComp
          placeholder="Value"
          placeholderTextColor={colors.grey500}
          value={filter.value}
          onChangeText={text => onFilterChange(index, 'value', text)}
          inputStyle={[styles.groupInput]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInputComp
          placeholder="Logical Operator"
          placeholderTextColor={colors.grey500}
          value={filter.logicalOperator}
          inputStyle={[styles.groupInput]}
          autoCapitalize="none"
          autoCorrect={false}
          editable={false}
          onPressContainer={() =>
            handleDynamicFilterApiCall(url[2], 'logicalOperator', index)
          }
        />
      </View>
    );
  },
);

const BroadCastGroupListComponent = () => {
  const {theme} = useTheme();
  const isDarkMode = theme === THEME_COLOR;
  const createGroupRef = useRef(null);
  const contactRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const isMounted = useRef(true);
  const dynamicFiltersSubOptionRef = useRef(null);

  const {
    data: GetBroadCastGroup,
    isLoading: isLoadingGetBroadCast,
    isError: isErrorGetBroadCast,
    refetch: refetchBroadCastGroup,
  } = useGetBroadCastGroupQuery();
  const [triggerAllContact] = useLazyGetAllContactQuery();
  const [triggerSearchContact] = useLazySearchContactQuery();
  const {GET_LOGICAL_OPERATOR, GET_OPERATOR, GET_CRITERIA} = useApiURLs();

  const [createNewGroup] = useCreateNewGroupMutation();

  // State management

  const [createGroup, setCreateGroup] = useState({
    title: '',
    groupName: '',
  });

  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [contacts, setContacts] = useState([]);
  const [page, setPage] = useState(INITIAL_PAGE);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingMoreContacts, setIsLoadingMoreContacts] = useState(false);
  const [hasMoreContacts, setHasMoreContacts] = useState(true);
  const [refreshingContacts, setRefreshingContacts] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [contactsError, setContactsError] = useState(null);
  const [isDynamicFilters, setIsDynamicFilters] = useState(true);
  const [isContactBtn, setIsContactBtn] = useState(false);
  const [dynamicFilters, setDynamicFilters] = useState([]);
  const [dynamicFiltersSubOption, setDynamicFiltersSubOption] = useState([]);
  const [dynamicSelectedFilterType, setdynamicSelectedFilterType] =
    useState('');
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchText.trim() === '') {
      setPage(INITIAL_PAGE);
      setContacts([]);
      setHasMoreContacts(true);
      fetchContacts({page: INITIAL_PAGE});
    } else {
      // Debounce search requests
      searchTimeoutRef.current = setTimeout(() => {
        setPage(INITIAL_PAGE);
        setContacts([]);
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

  const onClickContactBotton = async () => {
    try {
      await fetchContacts({page: INITIAL_PAGE, isSearch: false});
    } catch (error) {
      console.error('Error in onClickContactBotton:', error);
    }
  };

  const fetchContacts = async ({
    page = INITIAL_PAGE,
    isSearch = false,
  } = {}) => {
    if (!isMounted.current) return;

    // Set loading states
    const setLoadingState = (loading, moreLoading) => {
      setIsLoadingContacts(loading);
      setIsLoadingMoreContacts(moreLoading);
    };

    setLoadingState(page === INITIAL_PAGE, page !== INITIAL_PAGE);
    setContactsError(null);

    try {
      // Trigger the appropriate query
      const query =
        isSearch && searchText.trim()
          ? triggerSearchContact({
              search_query: searchText.trim(),
              limit: PAGE_SIZE,
            })
          : triggerAllContact({page, limit: PAGE_SIZE});

      const response = await query.unwrap();

      // Handle the response
      const contactsData = response?.data || response?.message || [];
      console.log(contactsData);

      if (!Array.isArray(contactsData)) {
        throw new Error('Unexpected response format');
      }

      // Update state
      setContacts(prevContacts =>
        page === INITIAL_PAGE
          ? contactsData
          : [...prevContacts, ...contactsData],
      );
      setHasMoreContacts(contactsData.length >= PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContactsError(error.message || 'Failed to fetch contacts');
    } finally {
      if (!isMounted.current) return;
      setLoadingState(false, false);
      setRefreshingContacts(false);
    }
  };

  const handleLoadMoreContacts = useCallback(() => {
    if (!isLoadingMoreContacts && hasMoreContacts && !contactsError) {
      if (searchText.trim()) {
        // Don't load more for search results
        return;
      }
      const nextPage = page + 1;
      setPage(nextPage);
      fetchContacts({page: nextPage});
    }
  }, [isLoadingMoreContacts, hasMoreContacts, contactsError, searchText, page]);
  const handleSelectContact = useCallback(contactMobile => {
    setSelectedContacts(prevSelectedContacts => {
      const isSelected = prevSelectedContacts.includes(contactMobile);
      return isSelected
        ? prevSelectedContacts.filter(mobile => mobile !== contactMobile)
        : [...prevSelectedContacts, contactMobile];
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
      const id = item?.name;
      if (!id) return null;

      const isSelected = selectedContacts.includes(id);
      const backgroundColor = isSelected
        ? colors.green200
        : isDarkMode
        ? colors.white
        : '#151414';

      return (
        <TouchableOpacity
          style={[styles.contactItem, {backgroundColor}]}
          activeOpacity={0.7}
          onPress={() => handleSelectContact(id)}>
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
  const handleSearch = useCallback(text => {
    setSearchText(text);
  }, []);
  const resetSearch = useCallback(() => {
    setSearchText('');
    setPage(INITIAL_PAGE);
    setContacts([]);
    setHasMoreContacts(true);
    fetchContacts({page: INITIAL_PAGE});
  }, []);
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
  const resetForm = useCallback(() => {
    setCreateGroup({title: '', groupName: ''});
    setSelectedContacts([]);
    setSearchText('');
  }, []);

  const createGroupHandler = async () => {
    if (!createGroup.groupName.trim()) {
      CommonToastMessage('info', 'Please enter a group name.');
      return;
    }
    if (!createGroup.title.trim()) {
      CommonToastMessage('info', 'Please enter a title.');
      return;
    }
    setIsCreatingGroup(true);

    try {
      let payload = {
        group_name: createGroup.groupName.trim(),
        title: createGroup.title.trim(),
      };

      if (dynamicFilters.length > 0) {
        payload = {
          ...payload,
          is_dynamic_group: 1,
          dynamic_filters: dynamicFilters.map(filter => ({
            filter_on_field: filter.filterOnField,
            criteria: filter.operator,
            value: filter.value,
            logical_operator: filter.logicalOperator,
          })),
        };
      } else {
        const formattedContacts = selectedContacts.map(contact => ({
          group_member: contact.trim(),
        }));
        payload = {
          ...payload,
          is_dynamic_group: 0,
          contacts: formattedContacts,
        };
      }

      const response = await createNewGroup(payload);

      if (!isMounted.current) return;

      if (response.data?.status_code === 200) {
        CommonToastMessage('success', 'Group created successfully');
        createGroupRef.current?.dismiss();
        resetForm();
        refetchBroadCastGroup();
      } else {
        CommonToastMessage('error', response.data?.message);
      }
    } catch (error) {
      if (!isMounted.current) return;
      console.error('Error creating group:', error);
      Alert.alert(
        'Error',
        error.message || 'An error occurred while creating the group.',
      );
    } finally {
      if (isMounted.current) {
        setIsCreatingGroup(false);
      }
    }
  };

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
        {/* <TouchableOpacity
          onPress={() => {
            contactRef.current?.dismiss();
          }}
          style={styles.backButton}>
          <SvgIcon.Filter
            width={spacing.WIDTH_24}
            height={spacing.WIDTH_24}
            color={isDarkMode ? colors.grey800 : colors.white}
          />
        </TouchableOpacity> */}
      </View>
    ),
    [theme, searchText, resetSearch],
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
  const GroupListEmpty = useMemo(
    () => (
      <RegularText style={styles.noDataText}>
        {isErrorGetBroadCast || 'No Broadcast Groups Available'}
      </RegularText>
    ),
    [isErrorGetBroadCast],
  );

  const addFilterRow = () => {
    if (isContactBtn) {
      setIsContactBtn(false);
    }
    setDynamicFilters(prevFilters => [
      ...prevFilters,
      {filter_on_field: '', criteria: '', value: '', logicalOperator: ''},
    ]);
  };

  const handleDynamicFilterApiCall = async (url, filterType, index) => {
    try {
      const res = await apiGet(url);
      if (res?.status_code === 200) {
        setDynamicFiltersSubOption(res?.data);
        setdynamicSelectedFilterType(filterType);
        setSelectedFilterIndex(index);
        dynamicFiltersSubOptionRef.current?.present();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectOption = option => {
    setDynamicFilters(prevFilters => {
      const updatedFilters = [...prevFilters];
      if (selectedFilterIndex !== null) {
        updatedFilters[selectedFilterIndex][dynamicSelectedFilterType] =
          option.name || option;
      }
      return updatedFilters;
    });
    dynamicFiltersSubOptionRef.current?.dismiss();
  };

  const handleFilterChange = (index, key, value) => {
    setDynamicFilters(prevFilters => {
      const updatedFilters = [...prevFilters];
      updatedFilters[index] = {
        ...updatedFilters[index],
        [key]: value,
      };
      return updatedFilters;
    });
  };

  const ListFooterComponent = () => {
    return (
      <>
        {isDynamicFilters && (
          <BottomComp
            text={dynamicFilters.length > 0 ? 'Add Row' : 'Dynamic Filter'}
            style={styles.selectDynamicFiltersButton}
            textStyle={styles.selectDynamicFiltersButtonText}
            onPress={addFilterRow}
          />
        )}
        <BottomComp
          text="Create Group"
          style={styles.CreateGroupctButton}
          textStyle={styles.CreateGroupButtonText}
          onPress={createGroupHandler}
          isLoading={isCreatingGroup}
        />
      </>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <CommonHeader
          title={'Broadcast Group'}
          showLeftIcon={true}
          leftIcon={SvgIcon.MenuIcon}
          onLeftIconPress={openDrawer}
          showRightIcons={true}
          rightIcons={[SvgIcon.ReloadIcon]}
          onRightIconPress={refetchBroadCastGroup}
        />

        {isLoadingGetBroadCast ? (
          <LoadingScreen color={colors.green} />
        ) : (
          <FlatList
            data={GetBroadCastGroup?.data}
            keyExtractor={item => item?.name?.toString()}
            renderItem={({item}) => <BroadCastGroupColum item={item} />}
            ListEmptyComponent={GroupListEmpty}
          />
        )}
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.createGroupButton}
        onPress={() => {
          setDynamicFilters([]), setIsContactBtn(true);
          setIsDynamicFilters(true), createGroupRef.current?.present();
        }}>
        <SvgIcon.AddICon
          color={colors.white}
          width={spacing.WIDTH_30}
          height={spacing.HEIGHT_30}
        />
        <RegularText style={styles.createGroupText}>Create Group</RegularText>
      </TouchableOpacity>

      <CustomBottomSheetFlatList
        ref={createGroupRef}
        snapPoints={['50%', '90%']}
        enableDynamicSizing={false}
        data={dynamicFilters}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => (
          <DynamicFiltersRow
            filter={item}
            index={index}
            isDarkMode={isDarkMode}
            onFilterChange={handleFilterChange}
            handleDynamicFilterApiCall={handleDynamicFilterApiCall}
            url={[GET_CRITERIA, GET_OPERATOR, GET_LOGICAL_OPERATOR]}
          />
        )}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <ListHeaderComponent
            groupName={createGroup.groupName}
            title={createGroup.title}
            setCreateGroup={setCreateGroup}
            isDarkMode={isDarkMode}
            contactRef={contactRef}
            isContactBtn={isContactBtn}
            setIsDynamicFilters={setIsDynamicFilters}
            onClickContactBotton={onClickContactBotton}
          />
        }
        ListFooterComponent={<ListFooterComponent />}
      />

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
      <CustomBottomSheetFlatList
        ref={dynamicFiltersSubOptionRef}
        data={dynamicFiltersSubOption}
        snapPoints={['60%']}
        keyExtractor={(item, index) => {
          if (item.hasOwnProperty('name')) {
            return `criteria-${item.name
              .toLowerCase()
              .replace(/\s+/g, '-')}-${index}`;
          }

          if (typeof item === 'string') {
            return `operator-${item
              .toLowerCase()
              .replace(/\s+/g, '-')}-${index}`;
          }
          return `item-${index}`;
        }}
        renderItem={({item}) => {
          return (
            <TouchableOpacity
              style={{
                paddingHorizontal: spacing.PADDING_10,
                paddingVertical: spacing.PADDING_16,
              }}
              onPress={() => handleSelectOption(item)}>
              <RegularText
                style={{
                  fontSize: textScale(16),
                  fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
                  color: colors.white,
                }}>
                {item.name || item}
              </RegularText>
            </TouchableOpacity>
          );
        }}
      />
    </>
  );
};

export default BroadCastGroupListComponent;

const styles = StyleSheet.create({
  groupInfoContainer: {
    paddingHorizontal: spacing.PADDING_16,
  },
  container: {
    flex: 1,
  },
  noDataText: {
    marginTop: spacing.MARGIN_20,
    textAlign: 'center',
    fontSize: textScale(16),
    color: '#666666',
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
  },
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
  modalHeader: {
    fontSize: textScale(16),
    alignSelf: 'center',
    marginVertical: spacing.MARGIN_4,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_MEDIUM,
  },
  modalStyle: {
    zIndex: -1,
  },
  groupInput: {
    width: '95%',
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: spacing.MARGIN_10,
  },
  selectContactButton: {
    marginHorizontal: spacing.MARGIN_10,
    paddingVertical: spacing.PADDING_12,
    backgroundColor: colors.green700,
    marginBottom: spacing.MARGIN_4,
  },
  selectContactButtonText: {
    fontSize: textScale(16),
    color: colors.white,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
  },
  CreateGroupctButton: {
    marginHorizontal: spacing.MARGIN_10,
    paddingVertical: spacing.PADDING_12,
    backgroundColor: colors.green700,
  },
  CreateGroupButtonText: {
    fontSize: textScale(16),
    color: colors.white,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
  },
  selectDynamicFiltersButton: {
    marginHorizontal: spacing.MARGIN_10,
    paddingVertical: spacing.PADDING_12,
    backgroundColor: colors.green700,
    marginBottom: spacing.MARGIN_4,
  },
  selectDynamicFiltersButtonText: {
    fontSize: textScale(16),
    color: colors.white,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.PADDING_10,
    ...boxShadowLess(),
    paddingHorizontal: spacing.PADDING_20,
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
  contactName: {
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
    fontSize: textScale(15),
  },
  contactMobile: {
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
    fontSize: textScale(13),
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
    marginHorizontal: spacing.MARGIN_10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: spacing.RADIUS_8,
    paddingHorizontal: spacing.PADDING_10,
    color: colors.black,
  },
  contactInfo: {
    flex: 1,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
});
