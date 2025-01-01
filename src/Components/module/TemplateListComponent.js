import React, {useEffect, useMemo, useRef, useState} from 'react';
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
import {useLazyGetAllContactQuery} from '../../api/store/slice/contactSlice';
import {useLazySearchConatctQuery} from '../../api/store/slice/searchSlice';
import {
  useGetAllTempleteQuery,
  useSendTemplateToMultipleNumberMutation,
  useUploadeMediaMutation,
} from '../../api/store/slice/templeteSlice';
import * as SvgIcon from '../../assets';
import {boxShadowLess} from '../../styles/Mixins';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import Colors from '../../theme/colors';
import colors from '../../Utils/colors';
import {pickAndSendMediaMessage} from '../../Utils/commonImagePicker';
import THEME_COLOR from '../../Utils/Constant';
import {
  CommonToastMessage,
  getColorForParticipant,
  openDrawer,
} from '../../Utils/helperFunctions';
import AnimatedComponentToggle from '../Common/AnimatedComponentToggale';
import AnimatedModal from '../Common/AnimatedModal';
import BottomComp from '../Common/BottonComp';
import CommoneHeader from '../Common/CommoneHeader';
import CommonPopupModal from '../Common/CommonPopupModal';
import CustomBottomSheetFlatList from '../Common/CustomBottomSheetFlatList';
import Loader from '../Common/Loader';
import RegularText from '../Common/RegularText';
import {useTheme} from '../hooks';

const TemaplateItemColum = () => {
  const secondBottomSheetRef = useRef(null);
  const templateCategoryBottomSheetRef = useRef(null);
  const {theme} = useTheme();

  const isDarkMode = theme === THEME_COLOR;

  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [uploadedHeaderSamples, setUploadedHeaderSamples] = useState([]);
  const [templateData, setTemplateData] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [templateState, setTemplateState] = useState({
    template: '',
    headerType: '',
    mediaType: '',
    selectedMedia: null,
    uploadedMediaId: '',
    selectedUploadedSampleTitle: '',
    headerNames: {},
  });
  const [uiState, setUiState] = useState({
    selectedCategory: 'All',
    activeTemplateId: null,
    isUploading: false,
    uploadingTemplateId: null,
    modalMessage: '',
    subscribeModalVisible: false,
  });

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]); 
  const pageSize = 50;

  const [featchConatct, {isLoading: isLoadingFeatchConatct}] =
    useLazyGetAllContactQuery();
  const {data: templeteData, isLoading: isTempleteLoading} =
    useGetAllTempleteQuery();
  const [searchConatct] = useLazySearchConatctQuery();
  const [uploadMidea] = useUploadeMediaMutation();
  const [sendTemplateToMultiplateNumber] =
    useSendTemplateToMultipleNumberMutation();

  useEffect(() => {
    if (templeteData?.data) {
      setTemplateData(templeteData.data);
      const categories = templeteData.data
        .map(item => item.template_category)
        .filter(template_category => template_category);

      setFilteredTemplates(categories);
    }
  }, [templeteData]);
  // Fetch contacts on component mount or whenever search text changes
  useEffect(() => {
    setPage(1);
    setHasMoreData(true);
    if (searchText.trim() === '') {
      fetchContacts({page: 1});
    } else {
      searchContacts({page: 1, searchText});
    }
  }, [searchText]);
  // Fetch contacts from the API (listing all contacts)
  const fetchContacts = async ({page = 1}) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    try {
      const params = {
        page,
        limit: pageSize,
      };
      const response = await featchConatct(params);
      const contactsData = response?.data?.message || [];

      if (contactsData?.length > 0) {
        setContacts(prevContacts =>
          page === 1 ? contactsData : [...prevContacts, ...contactsData],
        );
        setHasMoreData(contactsData.length >= pageSize);
      } else {
        setContacts(page === 1 ? [] : [...contacts]);
        setHasMoreData(false);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
      setRefreshing(false);
    }
  };
  // Search contacts from the API
  const searchContacts = async ({page = 1, searchText}) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    try {
      const response = await searchConatct({search_query: searchText.trim()});
      const contactsData = response?.data?.data || [];

      if (contactsData.length > 0) {
        setContacts(prevContacts =>
          page === 1 ? contactsData : [...prevContacts, ...contactsData],
        );
        setHasMoreData(contactsData.length >= pageSize);
      } else {
        setContacts(page === 1 ? [] : [...contacts]);
        setHasMoreData(false);
      }
    } catch (error) {
      console.error('Error searching contacts:', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
      setRefreshing(false);
    }
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
  // Handle contact selection
  const handleSelectContact = contactMobile => {
    setSelectedContacts(prevSelectedContacts => {
      if (prevSelectedContacts.includes(contactMobile)) {
        // If the contact is already selected, remove it
        return prevSelectedContacts.filter(mobile => mobile !== contactMobile);
      } else {
        // If the contact is not selected, add it, but make sure there are no more than 10 contacts selected
        if (prevSelectedContacts.length < 10) {
          // const selectedContact = contacts.find(
          //   contact => contact.mobile_no === contactMobile,
          // );
          // console.log('Selected Contact Details:', selectedContact);
          return [...prevSelectedContacts, contactMobile];
        } else {
          CommonToastMessage('info', 'Cannot select more than 10 contacts.');
          console.log('Cannot select more than 10 contacts.');
          return prevSelectedContacts;
        }
      }
    });
  };

  const renderContactItem = ({item}) => {
    const isSelected = selectedContacts.includes(item.mobile_no);
    return (
      <TouchableOpacity
        style={[
          styles.contactItem,
          isSelected
            ? {backgroundColor: colors.green200}
            : {
                backgroundColor: isDarkMode ? colors.white : colors.black,
              },
        ]}
        activeOpacity={0.7}
        onPress={() => handleSelectContact(item.mobile_no)}>
        {renderAvatar(item)}
        <View>
          <RegularText
            style={[
              styles.contactName,
              {color: isDarkMode ? colors.black : colors.white},
            ]}>
            {item?.full_name}
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
            style={{marginLeft: 'auto'}}
          />
        )}
      </TouchableOpacity>
    );
  };
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMoreData) {
      setPage(prevPage => prevPage + 1);
      if (searchText.trim() === '') {
        fetchContacts({page: page + 1});
      } else {
        searchContacts({searchText});
      }
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMoreData(true);
    if (searchText.trim() === '') {
      fetchContacts({page: 1});
    } else {
      searchContacts({searchText});
    }
  };
  const handleSearch = text => {
    setSearchText(text);
  };
  const handleHeaderNameChange = (templateId, value) => {
    setTemplateState(prev => ({
      ...prev,
      headerNames: {
        ...prev.headerNames,
        [templateId]: value,
      },
    }));
  };

  const handleUploadHeaderSampleLocally = async () => {
    const result = await pickAndSendMediaMessage();
    setTemplateState(prev => ({
      ...prev,
      selectedMedia: result?.status === 'success' ? result?.data : null,
    }));
    if (result.status !== 'success')
      console.log(result.message || 'Error picking file.');
  };
  const handleUploadHeaderSample = async () => {
    try {
      const response = await uploadMidea({
        header_type: templateState.headerType,
      });
      console.log(response);

      setUploadedHeaderSamples(response?.data);
      secondBottomSheetRef.current?.present();
    } catch (error) {
      console.log('Failed to upload sample header:', error);
    }
  };
  const handleUploadedSampleSelect = item => {
    setTemplateState(prev => ({
      ...prev,
      selectedUploadedSampleTitle: item?.title,
      uploadedMediaId: item?.media_id,
    }));
    secondBottomSheetRef.current?.dismiss();
  };
  const handleCategorySelection = category => {
    if (category === 'All') {
      setTemplateData(templeteData?.data);
    } else {
      const filtered = templateData.filter(
        template => template.template_category === category,
      );
      setTemplateData(filtered);
    }
    templateCategoryBottomSheetRef.current?.dismiss();
  };

  const handleSelectTemplateData = item => {
    setUiState(prevUiState => {
      const isCurrentlyActive = prevUiState.activeTemplateId === item.name;

      setTemplateState(prevTemplateState => ({
        ...prevTemplateState,
        template: isCurrentlyActive ? '' : item?.name,
        headerType: isCurrentlyActive ? '' : item?.header_type,
        mediaType: '',
        selectedMedia: null,
        uploadedMediaId: '',
        headerNames: {},
        selectedUploadedSampleTitle: '',
      }));
      setSelectedContacts([]);
      setIsModalVisible(false);
      handleSearch('');
      return {
        ...prevUiState,
        activeTemplateId: isCurrentlyActive ? null : item.name,
      };
    });
  };
  const isDisableTemplateSubmit = useMemo(() => {
    if (['VIDEO', 'IMAGE'].includes(templateState.headerType)) {
      if (templateState.mediaType === 'Upload Now') {
        return (
          !templateState.selectedMedia?.name ||
          !templateState.headerNames[templateState.template]
        );
      }
      if (templateState.mediaType === 'Uploaded at Meta') {
        return (
          !templateState.uploadedMediaId ||
          !templateState.headerNames[templateState.template]
        );
      }
      return true;
    }
    return !templateState.template;
  }, [
    templateState.mediaType,
    templateState.selectedMedia,
    templateState.uploadedMediaId,
    templateState.headerType,
    templateState.headerNames,
    templateState.template,
  ]);
  const handleSubmitTemplate = async () => {
    const requestParam = {
      media_url:
        templateState.mediaType === 'Uploaded at Meta'
          ? templateState.uploadedMediaId
          : '',
      media_type: templateState.mediaType,
      header_type: ['VIDEO', 'IMAGE'].includes(templateState.headerType)
        ? templateState.headerType
        : '',
      template: templateState.template,
      mobile_numbers: selectedContacts,
      components: '',
      filename: templateState.selectedMedia?.name || '',
      filedata:
        templateState.mediaType === 'Upload Now'
          ? templateState.selectedMedia?.base64String
          : '',
      media_name: templateState.headerNames[templateState.template] || '',
    };
    console.log('Request Param:', requestParam);

    // Validation checks before submitting the template
    if (
      templateState.mediaType === 'Upload Now' &&
      !templateState.selectedMedia?.name
    ) {
      CommonToastMessage('error', 'Error', 'Please upload a file');
      return;
    }

    try {
      setUiState(prev => ({...prev, isUploading: true}));
      const res = await sendTemplateToMultiplateNumber(requestParam);
      console.log('API Response:', res);

      if (res?.data?.status_code === 200) {
        CommonToastMessage('success', 'Success', 'Template sent successfully');
        // Reset template state after successful submission
        setTemplateState({
          template: '',
          headerType: '',
          mediaType: '',
          selectedMedia: null,
          uploadedMediaId: '',
          headerNames: {},
          selectedUploadedSampleTitle: '',
        });
        setSelectedContacts([]);
      } else if (res?.data?.status_code === 500) {
        console.log('Status 500 detected, setting modal visible');
        setUiState(prev => ({
          ...prev,
          modalMessage: res?.data?.message,
          subscribeModalVisible: true,
        }));
        setIsModalVisible(false);
        handleSearch('');
      }
    } catch (error) {
      console.error('Error during upload:', error);
      Alert.alert('Failed to upload file.');
    } finally {
      setUiState(prev => ({
        ...prev,
        isUploading: false,
        activeTemplateId: null,
      }));
      setIsModalVisible(false);
      handleSearch('');
    }
  };
  const renderHeaderType = item => {
    if (!['VIDEO', 'IMAGE'].includes(item?.header_type)) return null;

    return (
      <>
        <RegularText
          style={[
            styles.headerTypeTitle,
            {color: isDarkMode ? colors.black : colors.white},
          ]}>
          Header Type
        </RegularText>
        <BottomComp
          text={item?.header_type}
          style={styles.headerTypeButton}
          textStyle={styles.headerTypeButtonText}
        />
      </>
    );
  };
  const renderHeaderNameInput = item => {
    if (!['VIDEO', 'IMAGE'].includes(item?.header_type)) return null;

    return (
      <>
        <RegularText
          style={[
            styles.headerNameTitle,
            {color: isDarkMode ? colors.black : colors.white},
          ]}>
          Header Name
        </RegularText>
        <TextInput
          style={[
            styles.headerNameInput,
            {
              borderColor: isDarkMode ? colors.grey600 : colors.grey400,
              color: isDarkMode ? colors.black : colors.white,
            },
          ]}
          placeholder="Enter Header Name"
          placeholderTextColor={isDarkMode ? colors.grey400 : colors.grey600}
          value={templateState.headerNames[templateState.template] || ''}
          onChangeText={value =>
            handleHeaderNameChange(templateState.template, value)
          }
        />
      </>
    );
  };
  const renderMediaTypeSection = item => {
    if (!['VIDEO', 'IMAGE'].includes(item?.header_type)) return null;

    return (
      <>
        <RegularText
          style={[
            styles.mediaTypeText,
            {color: isDarkMode ? colors.black : colors.white},
          ]}>
          Media Type
        </RegularText>
        <BottomComp
          text={templateState.mediaType || 'Select Media Type'}
          style={styles.bottomCompStyle}
          textStyle={styles.bottomCompTextStyle}
          rightImg={true}
          source={SvgIcon.DownArrow}
          onPress={() => setMediaModalVisible(prev => !prev)}
        />

        <AnimatedModal
          isVisible={mediaModalVisible}
          close={() => setMediaModalVisible(false)}
          animationType="bottom-to-top"
          bottom={spacing.HEIGHT_105}
          left={spacing.WIDTH_10}
          backDropColor="rgba(255,255,255, 0.3)">
          {['Uploaded at Meta', 'Upload Now'].map(option => (
            <TouchableOpacity
              key={option}
              onPress={() => {
                setTemplateState(prev => ({...prev, mediaType: option}));
                setMediaModalVisible(false);
              }}>
              <RegularText style={styles.uploadedtoggleText}>
                {option}
              </RegularText>
            </TouchableOpacity>
          ))}
        </AnimatedModal>
      </>
    );
  };
  const renderUploadedSampleSection = item => {
    if (
      !['VIDEO', 'IMAGE'].includes(item?.header_type) ||
      !templateState.mediaType
    )
      return null;

    return (
      <>
        <RegularText style={styles.uploadedHeaderSampleTitle}>
          {templateState.mediaType === 'Uploaded at Meta'
            ? 'Uploaded Header Sample'
            : 'Header Sample'}
        </RegularText>
        <BottomComp
          text={
            templateState.mediaType === 'Uploaded at Meta'
              ? templateState.selectedUploadedSampleTitle ||
                'Select Uploaded Sample'
              : templateState.selectedMedia?.name || 'Upload File'
          }
          style={
            templateState.mediaType === 'Uploaded at Meta'
              ? styles.uploadedSampleButton
              : styles.uploadNowButton
          }
          textStyle={
            templateState.mediaType === 'Uploaded at Meta'
              ? styles.uploadedSampleButtonText
              : styles.uploadNowButtonText
          }
          rightImg={templateState.mediaType === 'Uploaded at Meta'}
          source={
            templateState.mediaType === 'Uploaded at Meta'
              ? SvgIcon.DownArrow
              : null
          }
          onPress={
            templateState.mediaType === 'Uploaded at Meta'
              ? handleUploadHeaderSample
              : handleUploadHeaderSampleLocally
          }
        />
      </>
    );
  };
  const renderUploadedSampleItem = ({item}) => (
    <TouchableOpacity
      style={styles.uploadedSampleItem}
      onPress={() => handleUploadedSampleSelect(item)}>
      <RegularText style={styles.uploadedSampleItemText}>
        {item?.title}
      </RegularText>
    </TouchableOpacity>
  );
  const renderUploadedSampleHeader = () => (
    <RegularText style={styles.filterTitle}>Uploaded Header Sample</RegularText>
  );
  const renderTemplateCategoryItem = ({item}) => {
    return (
      <TouchableOpacity
        style={[
          styles.templateCategoryButton,
          selectedCategory === item && styles.selectedTemplateCategory,
        ]}
        onPress={() => handleCategorySelection(item)}>
        <RegularText style={styles.categoryTemplateText}>{item}</RegularText>
      </TouchableOpacity>
    );
  };
  const renderTemplateCategoryHeader = () => (
    <RegularText
      style={[
        styles.filterTitle,
        {color: isDarkMode ? colors.black : colors.white},
      ]}>
      Select Category
    </RegularText>
  );

  const renderFilterTempletesItem = ({item}) => {
    return (
      <TouchableOpacity
        style={[
          styles.whatsAppTemplateContainer,
          {borderColor: isDarkMode ? colors.black : colors.white},
        ]}
        activeOpacity={1}>
        <AnimatedComponentToggle
          tabName={item?.name.replace(/_/g, ' ').toUpperCase()}
          isActive={uiState.activeTemplateId === item?.name}
          containerStyle={{paddingHorizontal: 0}}
          onPress={() => handleSelectTemplateData(item)}
          descrption={item?.template_category}>
          <View style={styles.templateContentContainer}>
            <RegularText style={styles.templateText}>
              {item?.template}
            </RegularText>
          </View>

          <View style={styles.templateDetailsContainer}>
            {renderHeaderType(item)}
            {renderHeaderNameInput(item)}
            {renderMediaTypeSection(item)}
            {renderUploadedSampleSection(item)}
          </View>

          <BottomComp
            text="Send to Contacts"
            style={styles.selectContactsButton}
            textStyle={styles.selectContactsButtonText}
            onPress={() => setIsModalVisible(true)}
            disabled={isDisableTemplateSubmit}
          />
        </AnimatedComponentToggle>
      </TouchableOpacity>
    );
  };

  const handleRightIconPress = index => {
    const actions = {
      0: () => templateCategoryBottomSheetRef.current?.present(),
      1: () => {},
    };

    const action = actions[index];
    if (action) {
      action();
    } else {
    }
  };

  return (
    <>
      <View>
        <CommoneHeader
          title="Template"
          showLeftIcon={true}
          leftIcon={SvgIcon.MenuIcon}
          onLeftIconPress={() => openDrawer()}
          showRightIcons={true}
          rightIcons={[SvgIcon.Filter, SvgIcon.ReloadIcon]}
          onRightIconPress={handleRightIconPress}
        />

        {isTempleteLoading ? (
          <Loader color={Colors.default.primaryText} />
        ) : (
          <FlatList
            data={templateData}
            renderItem={renderFilterTempletesItem}
            keyExtractor={item => item?.name.toString()}
            // estimatedItemSize={100}
          />
        )}
      </View>
      <CustomBottomSheetFlatList
        ref={secondBottomSheetRef}
        snapPoints={['40%']}
        data={uploadedHeaderSamples}
        keyExtractor={item => item?.media_id.toString()}
        renderItem={renderUploadedSampleItem}
        ListHeaderComponent={renderUploadedSampleHeader}
      />

      {/* BottomSheet for WhatsApp Template Categories */}
      <CustomBottomSheetFlatList
        snapPoints={['40%']}
        ref={templateCategoryBottomSheetRef}
        data={['All', ...filteredTemplates]}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderTemplateCategoryItem}
        ListHeaderComponent={renderTemplateCategoryHeader}
      />

      {/* Common Popup Modal for unsubscribe */}
      <CommonPopupModal
        isVisible={uiState.subscribeModalVisible}
        buttons={[
          {
            text: 'OK',
            color: colors.red600,
            onPress: () => {
              setUiState(prev => ({...prev, subscribeModalVisible: false}));
            },
          },
        ]}
        message={uiState.modalMessage}
        messageColor={colors.red600}
      />
      <AnimatedModal
        isVisible={isModalVisible}
        close={() => setIsModalVisible(false)}
        animationType="bottom-to-top"
        backDropColor="rgba(0, 0, 0, 0.5)"
        modalStyle={{
          width: '100%',
          borderRadius: 0,
          backgroundColor: isDarkMode ? colors.white : colors.black,
          height: '100%',
        }}>
        {/* Custom Header with Search Bar */}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.PADDING_20,
          }}>
          {/* Left Icon - Close Modal */}
          <TouchableOpacity
            onPress={() => {
              setIsModalVisible(false);
              setSelectedContacts([]);
              setSearchText('');
            }}
            style={{marginRight: 10}}>
            <SvgIcon.BackIcon
              width={spacing.WIDTH_24}
              height={spacing.WIDTH_24}
              color={isDarkMode ? colors.grey800 : colors.white}
            />
          </TouchableOpacity>

          {/* Search Bar */}
          <TextInput
            placeholder="Search contacts by Name or Number"
            placeholderTextColor={colors.grey800}
            value={searchText}
            onChangeText={text => handleSearch(text)}
            style={{
              flex: 1,
              backgroundColor: '#f0f0f0',
              borderRadius: 8,
              paddingHorizontal: 10,
              height: 40,
              color: '#000',
            }}
          />
        </View>

        {/* Contacts List */}
        {isLoadingFeatchConatct ? (
          <Loader color={Colors.default.white} />
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderContactItem}
            ListEmptyComponent={() => (
              <RegularText
                style={[
                  styles.noDataText,
                  {color: isDarkMode ? colors.black : colors.white},
                ]}>
                No contacts found.
              </RegularText>
            )}
            contentContainerStyle={styles.flatListContainer}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingMore && (
                <ActivityIndicator size="large" color={colors.green} />
              )
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsHorizontalScrollIndicator={false}
          />
        )}
      </AnimatedModal>
      {selectedContacts.length > 0 && (
        <BottomComp
          text="Send Template"
          style={styles.sendTemplateButton}
          textStyle={styles.sendTemplateButtonText}
          onPress={handleSubmitTemplate}
          isLoading={uiState.isUploading}
        />
      )}
    </>
  );
};

export default TemaplateItemColum;

const styles = StyleSheet.create({
  whatsAppTemplateContainer: {
    paddingHorizontal: spacing.PADDING_16,
    marginVertical: spacing.MARGIN_6,
    borderRadius: spacing.RADIUS_12,
    flex: 1,
    borderBottomWidth: 0.2,
  },
  templateContentContainer: {
    padding: spacing.PADDING_16,
    backgroundColor: colors.grey200,
    marginVertical: spacing.MARGIN_8,
    borderRadius: spacing.RADIUS_8,
  },
  templateText: {
    fontSize: textScale(15),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
    color: colors.grey800,
  },
  templateDetailsContainer: {
    marginVertical: spacing.MARGIN_8,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    borderRadius: 100,
    padding: spacing.PADDING_12,
    zIndex: 10,
    backgroundColor: '#fff',
    elevation: 5,
  },
  closeButtonText: {
    fontSize: textScale(20),
    color: '#000',
  },
  sendTemplateButton: {
    backgroundColor: colors.green600,
    marginHorizontal: spacing.MARGIN_16,
    borderWidth: 0,
    position: 'absolute',
    bottom: 2,
    width: '90%',
    alignSelf: 'center',
  },
  sendTemplateButtonText: {
    color: colors.white,
    fontSize: textScale(16),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
  },
  selectContactsButton: {
    backgroundColor: colors.green600,
    marginVertical: spacing.MARGIN_10,
  },
  selectContactsButtonText: {
    color: colors.white,
    fontSize: textScale(16),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
  },
  filterTitle: {
    fontSize: textScale(18),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
    alignSelf: 'center',
    marginBottom: spacing.MARGIN_8,
  },
  uploadedSampleItem: {
    backgroundColor: colors.grey100,
    marginVertical: spacing.PADDING_8,
    borderRadius: spacing.RADIUS_10,
    paddingHorizontal: spacing.PADDING_16,
    paddingVertical: spacing.PADDING_12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.PADDING_10,
    backgroundColor: '#fff',
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
  noDataText: {
    textAlign: 'center',
    marginTop: spacing.MARGIN_12,
    color: colors.grey600,
    fontSize: textScale(15),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
  },
  flatListContainer: {
    paddingBottom: spacing.PADDING_24,
  },
  addContactBtnContainer: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.RADIUS_8,
    padding: spacing.PADDING_6,
    marginLeft: spacing.MARGIN_8,
    elevation: 2,
  },
  categoryTemplateText: {
    fontSize: textScale(15),
    color: colors.black,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
    textTransform: 'capitalize',
  },
  headerTypeButton: {
    backgroundColor: colors.grey500,
    borderWidth: 0,
  },
  headerTypeButtonText: {
    color: colors.white,
    fontSize: textScale(16),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_BOLD,
  },
  headerNameInput: {
    borderWidth: 1,
    padding: spacing.PADDING_12,
    borderColor: colors.grey600,
    borderRadius: spacing.RADIUS_8,
    color: colors.black,
    fontSize: textScale(16),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_MEDIUM,
  },
  bottomCompStyle: {
    backgroundColor: colors.grey500,
    borderRadius: spacing.RADIUS_8,
    borderWidth: 0,
  },
  bottomCompTextStyle: {
    color: colors.white,
    fontSize: textScale(16),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_BOLD,
  },
  headerTypeTitle: {
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
    fontSize: textScale(18),
    color: colors.black,
    marginVertical: spacing.MARGIN_6,
  },
  headerNameTitle: {
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
    fontSize: textScale(18),
    color: colors.black,
    marginVertical: spacing.MARGIN_6,
  },
  mediaTypeText: {
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
    fontSize: textScale(18),
    color: colors.black,
    marginVertical: spacing.MARGIN_6,
  },
  uploadedHeaderSampleTitle: {
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
    fontSize: textScale(18),
    color: colors.black,
    marginVertical: spacing.MARGIN_6,
  },
  uploadedSampleButton: {
    backgroundColor: colors.grey500,
    padding: spacing.PADDING_14,
    borderRadius: spacing.RADIUS_8,
    borderWidth: 0,
  },
  uploadNowButton: {
    backgroundColor: colors.grey500,
    padding: spacing.PADDING_14,
    borderRadius: spacing.RADIUS_8,
    borderWidth: 0,
  },
  uploadedSampleButtonText: {
    color: colors.white,
    fontSize: textScale(16),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_BOLD,
  },
  uploadNowButtonText: {
    color: colors.white,
    fontSize: textScale(14),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_BOLD,
  },
  uploadedtoggleText: {
    borderBottomWidth: 1,
    textAlign: 'center',
    marginVertical: spacing.MARGIN_6,
  },
  avatarText: {
    fontSize: textScale(15),
  },
  contactName: {
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
    fontSize: textScale(15),
    color: colors.black,
  },
  contactMobile: {
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
    fontSize: textScale(13),
    color: colors.black,
  },
  templateCategoryButton: {
    padding: spacing.PADDING_12,
    margin: spacing.MARGIN_8,
    borderRadius: spacing.RADIUS_8,
    backgroundColor: colors.grey200,
  },
  selectedTemplateCategory: {
    backgroundColor: colors.green200,
  },
});
