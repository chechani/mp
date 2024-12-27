import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import NavigationString from '../../Navigations/NavigationString';
import THEME_COLOR from '../../Utils/Constant';
import colors from '../../Utils/colors';
import {
  CommonToastMessage,
  getColorForParticipant,
  navigate,
  openDrawer,
} from '../../Utils/helperFunctions';
import {
  useCreateContactMutation,
  useDeleteContactMutation,
  useLazyGetAllContactQuery,
  useLazyGetWhatsAppContactCategoryQuery,
} from '../../api/store/slice/contactSlice';
import * as SvgIcon from '../../assets';
import { textScale } from '../../styles/responsiveStyles';
import { spacing } from '../../styles/spacing';
import { fontNames } from '../../styles/typography';
import BottonComp from '../Common/BottonComp';
import CommonPopupModal from '../Common/CommonPopupModal';
import CommonToolBar from '../Common/CommonToolBar';
import CommoneHeader from '../Common/CommoneHeader';
import CustomBottomSheet from '../Common/CustomBottomSheet';
import CustomBottomSheetFlatList from '../Common/CustomBottomSheetFlatList';
import LoadingScreen from '../Common/Loader';
import RegularText from '../Common/RegularText';
import { useTheme } from '../hooks';

const ContactListComponent = () => {
  const {theme} = useTheme();
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isCreateContact, setIsCreateContact] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isToolBarVisible, setIsToolBarVisible] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const bottomSheetRef = useRef(null);
  const filterFormCategoryBottomSheet = useRef(null);
  const [newContact, setNewContact] = useState({
    first_name: '',
    last_name: '',
    mobile: '',
    email: '',
  });

  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 50; // Adjust as per your API's page size

  const [featchConatctCategory] = useLazyGetWhatsAppContactCategoryQuery();
  const [fetchConatct] = useLazyGetAllContactQuery();
  const [createContact] = useCreateContactMutation();
  const [deleteContact] = useDeleteContactMutation();

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch contacts when category changes
  useEffect(() => {
    setPage(1);
    setContacts([]);
    setHasMoreData(true);
    fetchContacts({page: 1, category: selectedCategory});
  }, [selectedCategory]);

  // Fetch contacts when page changes
  useEffect(() => {
    if (page > 1) {
      fetchContacts({page, category: selectedCategory});
    }
  }, [page]);

  // Filter contacts when search query or contacts change
  useEffect(() => {
    const filtered = filterContacts(contacts, searchQuery);
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  const fetchCategories = async () => {
    try {
      const categoryResponse = await featchConatctCategory();
      const contactCategories = categoryResponse?.data?.message;
      if (contactCategories) {
        setCategories(contactCategories);
      } else {
        console.error('No categories found in API response');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchContacts = async ({page = 1, category = 'All'}) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    try {
      const params = {page, limit: pageSize};
      if (category !== 'All') {
        params.category = category;
      }
      const response = await fetchConatct(params);
      const contactsData = response?.data?.message;
      if (contactsData && contactsData.length > 0) {
        if (page === 1) {
          setContacts(contactsData);
        } else {
          setContacts(prevContacts => [...prevContacts, ...contactsData]);
        }
        if (contactsData.length < pageSize) {
          setHasMoreData(false);
        }
      } else {
        if (page === 1) {
          setContacts([]);
        }
        setHasMoreData(false);
      }
    } catch (error) {
      console.log('Error fetching contacts:', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
      setRefreshing(false);
    }
  };

  // Toggle BottomSheet for adding new contact
  const toggleBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.present();
    }
  };
  const isContactBtnDisabled =
    !newContact.first_name.trim() ||
    !newContact.last_name.trim() ||
    !newContact.mobile.trim();
  // Add contact with proper structure
  const handleAddContact = async () => {
    const contactPayload = {
      first_name: newContact.first_name,
      last_name: newContact.last_name,
      mobile: newContact.mobile,
      email: newContact.email,
    };
    if (
      !contactPayload.first_name ||
      !contactPayload.last_name ||
      !contactPayload.mobile
    ) {
      return Toast.show({
        type: 'info',
        position: 'top',
        text1: 'Warning',
        text2: 'Fill all details',
        visibilityTime: 4000,
        text2Style: {fontSize: textScale(14)},
        text1Style: {fontSize: textScale(15)},
      });
    }
    // Validate mobile number with country code +91
    const mobileNumberWithCountryCode = contactPayload.mobile.startsWith('91')
      ? contactPayload.mobile
      : `91${contactPayload.mobile}`;

    // Ensure mobile number is 10 digits after +91
    const mobileNumberRegex = /^\91[0-9]{10}$/;

    if (!mobileNumberRegex.test(mobileNumberWithCountryCode)) {
      return Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a valid 10-digit mobile number',
      });
    }

    try {
      setIsCreateContact(true);
      const response = await createContact({
        ...contactPayload,
        mobile: mobileNumberWithCountryCode,
      });

      if (response.data?.message?.message === 'Contact created successfully') {
        fetchContacts({page: 1, category: selectedCategory});
        setContacts(prevContacts => [response.data?.message, ...prevContacts]);
        setNewContact({first_name: '', last_name: '', mobile: '', email: ''});
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Contact added successfully',
        });
        setIsCreateContact(false);
        bottomSheetRef.current.dismiss();
      } else {
        setIsCreateContact(false);
        if (
          response?.data?.message?.error ===
          'Contact with this mobile number already exists.'
        ) {
          CommonToastMessage(
            'error',
            'Contact with this mobile number already exists.',
          );
          setNewContact({first_name: '', last_name: '', mobile: '', email: ''});
        } else {
          console.log('Failed to create contact');
          CommonToastMessage('error', response?.data?.message?.error);
        }
      }
    } catch (error) {
      setIsCreateContact(false);
      console.log('Error adding contact:', error);
      setNewContact({first_name: '', last_name: '', mobile: '', email: ''});
    }
  };

  const handleCategoryChange = category => {
    console.log('Selected category:', category);
    setSelectedCategory(category);
  };

  // Function to filter contacts based on name or mobile number
  const filterContacts = (contactsList, query) => {
    const textData = query.toLowerCase();
    return contactsList.filter(item => {
      const name = item.full_name ? item.full_name.toLowerCase() : '';
      const number = item.mobile_no ? item.mobile_no.toLowerCase() : '';
      return name.includes(textData) || number.includes(textData);
    });
  };

  const renderAvatar = contact => {
    const {backgroundColor, textColor} = getColorForParticipant(
      contact.mobile_no.toString(),
    );
    const firstLetter = contact.full_name ? contact.full_name.charAt(0) : '?';
    return (
      <View
        style={[styles.avatarPlaceholder, {backgroundColor: backgroundColor}]}>
        <RegularText style={[styles.avatarText, {color: textColor}]}>
          {firstLetter}
        </RegularText>
      </View>
    );
  };

  const renderContactItem = ({item}) => {
    const isSelected = selectedContacts.some(
      selectedItem => selectedItem.mobile_no === item.mobile_no,
    );
    const isSelectionMode = selectedContacts.length > 0;

    const handleSelectContact = () => {
      setSelectedContacts(prevSelectedContacts => {
        const isAlreadySelected = prevSelectedContacts.some(
          selectedItem => selectedItem.mobile_no === item.mobile_no,
        );

        let updatedContacts;

        if (isAlreadySelected) {
          updatedContacts = prevSelectedContacts.filter(
            selectedItem => selectedItem.mobile_no !== item.mobile_no,
          );
        } else if (prevSelectedContacts.length < 10) {
          updatedContacts = [
            ...prevSelectedContacts,
            {
              name: item.full_name,
              mobile_no: item.mobile_no,
            },
          ];
        } else {
          CommonToastMessage('info', 'You can only select up to 10 contacts');
          return prevSelectedContacts;
        }
        setIsToolBarVisible(updatedContacts.length > 0);

        return updatedContacts;
      });
    };

    const handlePress = () => {
      if (isSelectionMode) {
        // If in selection mode, toggle selection with a tap
        handleSelectContact();
      } else {
        // If not in selection mode, navigate to the contact details screen
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
      <>
        <TouchableOpacity
          style={[
            styles.contactItem,
            isSelected
              ? styles.selectedContactBackground
              : {
                  backgroundColor:
                    theme === THEME_COLOR ? colors.white : colors.black,
                },
          ]}
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.7}>
          {renderAvatar(item)}
          <View style={[styles.contactInfo]}>
            <RegularText
              style={[
                styles.contactName,
                {color: theme === THEME_COLOR ? colors.black : colors.white},
              ]}>
              {item?.full_name}
            </RegularText>
            {item?.company_name && (
              <RegularText
                style={[
                  styles.companyName,
                  {color: theme === THEME_COLOR ? colors.black : colors.white},
                ]}>
                {item?.company_name}
              </RegularText>
            )}
            {item?.custom_category && (
              <RegularText
                style={[
                  styles.customCategory,
                  {color: theme === THEME_COLOR ? colors.black : colors.white},
                ]}>
                {item?.custom_category}
              </RegularText>
            )}
          </View>
        </TouchableOpacity>
        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                theme === THEME_COLOR ? colors.grey300 : colors.grey600,
            },
          ]}
        />
      </>
    );
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMoreData && searchQuery === '') {
      setPage(prevPage => prevPage + 1);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setContacts([]);
    setHasMoreData(true);
    fetchContacts({page: 1, category: selectedCategory});
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <LoadingScreen color={colors.green} />
      </View>
    );
  }
  const handleBackPress = () => {
    setSelectedContacts([]);
    setIsToolBarVisible(false);
  };

  const handleDeletePress = () => {
    setIsDeleteMode(true);
  };

  const handleConfirmDeletePress = async () => {
    try {
      const names = selectedContacts.reduce((acc, {name}) => {
        acc.push(name);
        return acc;
      }, []);
      const res = await deleteContact({contact_names: names});
      setIsToolBarVisible(false);
      setSelectedContacts([]);
      setIsDeleteMode(false);
      if (res.data?.status_code === 200) {
        CommonToastMessage('success', res.data?.message);
      }
    } catch (error) {
      console.log(error);
      setIsDeleteMode(false);
    }
  };

  const handleCancelDeletePress = () => {
    setIsToolBarVisible(false);
    setSelectedContacts([]);
    setIsDeleteMode(false);
  };

  // filterFormCategory
  const renderfilterFormCategoryItem = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => handleCategoryChange(item)}
        style={[
          styles.categoryItem,
          selectedCategory === item && styles.activeFilter,
        ]}>
        <RegularText style={[styles.filterText]}>{item}</RegularText>
      </TouchableOpacity>
    );
  };
  const filterFormCategoryListHeaderComponent = () => (
    <View
      style={[
        styles.headerContainer,
        {backgroundColor: theme === THEME_COLOR ? colors.white : '#151414'},
      ]}>
      <RegularText
        style={[
          styles.filterTitle,
          {color: theme === THEME_COLOR ? colors.black : colors.white},
        ]}>
        Filter by Category
      </RegularText>
    </View>
  );

  const handleRightIconPress = index => {
    const actions = {
      0: () => navigate(NavigationString.searchContact),
      1: () => filterFormCategoryBottomSheet.current.present(),
    };

    const action = actions[index];
    if (action) {
      action();
    } else {
      console.log(index);
    }
  };

  return (
    <>
      {isToolBarVisible ? (
        <CommonToolBar
          onBackPress={handleBackPress}
          count={selectedContacts.length}
          showLeftIcons={true}
          leftIcons={[SvgIcon.BackIcon]}
          onLeftIconPress={handleBackPress}
          rightIcons={[SvgIcon.DeleteIcon]}
          showRightIcons={true}
          onRightIconPress={handleDeletePress}
        />
      ) : (
        <CommoneHeader
          title="Contact"
          showLeftIcon={true}
          onLeftIconPress={() => openDrawer()}
          leftIcon={SvgIcon.MenuIcon}
          showRightIcons={true}
          rightIcons={[SvgIcon.Search, SvgIcon.Filter]}
          onRightIconPress={handleRightIconPress}
        />
      )}

      <View
        style={[
          styles.container,
          {
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          },
        ]}>
        <View style={{marginHorizontal: spacing.MARGIN_10}}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <RegularText
              onPress={() => handleCategoryChange('All')}
              style={[
                styles.filterText,
                {color: theme === THEME_COLOR ? colors.black : colors.white},
                selectedCategory === 'All',
              ]}>
              Reset All
            </RegularText>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={toggleBottomSheet}
                style={styles.addContactBtnContainer}>
                <SvgIcon.AddICon
                  width={spacing.WIDTH_30}
                  height={spacing.HEIGHT_30}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  fetchContacts({page, category: selectedCategory})
                }
                style={[
                  styles.addContactBtnContainer,
                  {marginLeft: spacing.MARGIN_6},
                ]}>
                <SvgIcon.ReloadIcon
                  width={spacing.WIDTH_30}
                  height={spacing.HEIGHT_30}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <FlatList
          // estimatedItemSize={100}
          data={filteredContacts}
          keyExtractor={item => item?.mobile_no?.toString()}
          renderItem={renderContactItem}
          ListEmptyComponent={() => (
            <RegularText
              style={[
                styles.noDataText,
                {color: theme === THEME_COLOR ? colors.black : colors.white},
              ]}>
              No contacts found.
            </RegularText>
          )}
          contentContainerStyle={styles.flatListContainer}
          onEndReached={searchQuery === '' ? handleLoadMore : null}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore && (
              <ActivityIndicator size="large" color={colors.green} style={{}} />
            )
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>

      {/* BottomSheet for adding a new contact */}
      <CustomBottomSheet ref={bottomSheetRef} snapPoints={['80%']}>
        <View style={styles.bottomSheetContent}>
          <RegularText
            style={[
              styles.bottomSheetTitle,
              {color: theme === THEME_COLOR ? colors.black : colors.white},
            ]}>
            Add New Contact
          </RegularText>
          <TextInput
            style={[
              styles.input,
              {
                color: theme === THEME_COLOR ? colors.grey700 : colors.grey300,
              },
            ]}
            placeholder="First Name"
            placeholderTextColor={
              theme === THEME_COLOR ? colors.grey700 : colors.grey300
            }
            value={newContact.first_name}
            onChangeText={text =>
              setNewContact({...newContact, first_name: text})
            }
          />
          <TextInput
            style={[
              styles.input,
              {
                color: theme === THEME_COLOR ? colors.grey700 : colors.grey300,
              },
            ]}
            placeholder="Last Name"
            placeholderTextColor={
              theme === THEME_COLOR ? colors.grey700 : colors.grey300
            }
            value={newContact.last_name}
            onChangeText={text =>
              setNewContact({...newContact, last_name: text})
            }
          />
          <TextInput
            style={[
              styles.input,
              {
                color: theme === THEME_COLOR ? colors.grey700 : colors.grey300,
              },
            ]}
            placeholder="Mobile Number"
            placeholderTextColor={
              theme === THEME_COLOR ? colors.grey700 : colors.grey300
            }
            value={newContact.mobile}
            keyboardType="numeric"
            onChangeText={text => setNewContact({...newContact, mobile: text})}
          />
          <TextInput
            style={[
              styles.input,
              {
                color: theme === THEME_COLOR ? colors.grey700 : colors.grey300,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={
              theme === THEME_COLOR ? colors.grey700 : colors.grey300
            }
            value={newContact.email}
            onChangeText={text => setNewContact({...newContact, email: text})}
          />
          <BottonComp
            style={styles.addContactBtn}
            text="Add Contact"
            textStyle={styles.addContactText}
            onPress={handleAddContact}
            isLoading={isCreateContact}
            disabled={isContactBtnDisabled}
          />
        </View>
      </CustomBottomSheet>
      <CustomBottomSheetFlatList
        ref={filterFormCategoryBottomSheet}
        snapPoints={['60%']}
        data={categories}
        renderItem={renderfilterFormCategoryItem}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={filterFormCategoryListHeaderComponent}
        contentContainerStyle={styles.flatListContainer}
        stickyHeaderIndicesFlatList={[0]}
      />

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
        messageColor="#4B0082"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: {
    padding: spacing.PADDING_10,
    color: colors.white,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
    fontSize: textScale(14),
  },
  activeFilter: {
    backgroundColor: colors.grey600,
  },
  flatListContainer: {
    paddingBottom: spacing.PADDING_20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.PADDING_6,
    paddingHorizontal: spacing.PADDING_16,
    backgroundColor: '#fff',
  },
  avatar: {
    width: spacing.HEIGHT_40,
    height: spacing.HEIGHT_40,
    borderRadius: spacing.HEIGHT_40 / 2,
    marginRight: spacing.MARGIN_10,
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
    color: '#fff',
    fontSize: textScale(15),
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_MEDIUM,
    fontSize: textScale(15),
    color: colors.black,
  },
  companyName: {
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_MEDIUM,
    fontSize: textScale(13),
    color: colors.black,
  },
  customCategory: {
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_LIGHT,
    fontSize: textScale(12),
    color: colors.black,
  },
  bottomSheetContent: {
    padding: spacing.PADDING_16,
  },
  bottomSheetTitle: {
    fontSize: textScale(18),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
    marginBottom: spacing.MARGIN_12,
    alignSelf: 'center',
  },
  input: {
    height: spacing.HEIGHT_50,
    borderColor: colors.grey300,
    borderWidth: 1,
    borderRadius: spacing.RADIUS_8,
    marginBottom: spacing.MARGIN_12,
    paddingHorizontal: spacing.PADDING_10,
    fontSize: textScale(16),
    color: colors.black,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
  },
  addContactBtn: {
    backgroundColor: colors.green600,
    padding: spacing.PADDING_12,
    borderRadius: spacing.RADIUS_8,
    alignItems: 'center',
    borderWidth: 0,
  },
  addContactText: {
    color: '#fff',
    fontSize: textScale(16),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_BOLD,
  },
  addContactBtnContainer: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.RADIUS_6,
    padding: spacing.PADDING_4,
  },
  addContactBtnStyle: {
    width: spacing.WIDTH_30,
    height: spacing.HEIGHT_30,
    resizeMode: 'contain',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: spacing.MARGIN_10,
    color: '#666',
    fontSize: textScale(14),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
  },
  filterTitle: {
    fontSize: textScale(18),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
  },
  categoryItem: {
    paddingVertical: spacing.PADDING_6,
    paddingHorizontal: spacing.PADDING_16,
    backgroundColor: colors.green200,
    marginVertical: spacing.MARGIN_4,
    marginHorizontal: spacing.MARGIN_16,
    borderRadius: spacing.RADIUS_8,
  },
  selectedContactBackground: {
    backgroundColor: colors.green400,
  },
  headerContainer: {
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.grey300,
  },
});

export default ContactListComponent;