import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useGetAllTempleteQuery,
  useSendTemplateToMultipleNumberMutation,
  useUploadeMediaMutation,
} from '../../api/store/slice/templeteSlice';
import * as SvgIcon from '../../assets';
import { textScale } from '../../styles/responsiveStyles';
import { spacing } from '../../styles/spacing';
import { fontNames } from '../../styles/typography';
import Colors from '../../theme/colors';
import colors from '../../Utils/colors';
import { pickAndSendMediaMessage } from '../../Utils/commonImagePicker';
import THEME_COLOR from '../../Utils/Constant';
import { CommonToastMessage } from '../../Utils/helperFunctions';
import AnimatedComponentToggle from '../Common/AnimatedComponentToggale';
import AnimatedModal from '../Common/AnimatedModal';
import BottomComp from '../Common/BottonComp';
import CommonPopupModal from '../Common/CommonPopupModal';
import CustomBottomSheetFlatList from '../Common/CustomBottomSheetFlatList';
import RegularText from '../Common/RegularText';
import { useTheme } from '../hooks';

const TemaplateItemColum = ({Mobile_No, templateBottomSheetRef}) => {
  const {theme} = useTheme();

  const secondBottomSheetRef = useRef(null);
  const templateCategoryBottomSheetRef = useRef(null);

  const {data: templeteData, isLoading: isTempleteLoading} =
    useGetAllTempleteQuery();
  const [uploadMidea] = useUploadeMediaMutation();
  const [sendTemplateToMultiplateNumber] =
    useSendTemplateToMultipleNumberMutation();

  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [uploadedHeaderSamples, setUploadedHeaderSamples] = useState([]);
  const [templateCategories, setTemplateCategories] = useState([]);
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

  const handleHeaderNameChange = (templateId, value) => {
    setTemplateState(prev => ({
      ...prev,
      headerNames: {
        ...prev.headerNames,
        [templateId]: value,
      },
    }));
  };

  useEffect(() => {
    if (templeteData?.data) {
      setTemplateData(templeteData.data);
      const categories = templeteData.data
        .map(item => item.template_category)
        .filter(template_category => template_category);

      setFilteredTemplates(categories);
    }
  }, [templeteData]);

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
    secondBottomSheetRef.current?.close();
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
    templateCategoryBottomSheetRef.current?.close();
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
      } else if (templateState.mediaType === 'Uploaded at Meta') {
        return (
          !templateState.uploadedMediaId ||
          !templateState.headerNames[templateState.template]
        );
      }
      return true; // Enable button if media type conditions are met
    } else {
      // Enable button if header type is not VIDEO or IMAGE and the template name is provided
      return !templateState.template;
    }
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
      mobile: Mobile_No,
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
      } else if (res?.data?.status_code === 500) {
        console.log('Status 500 detected, setting modal visible');
        setUiState(prev => ({
          ...prev,
          modalMessage: res?.data?.message,
          subscribeModalVisible: true,
        }));
      }
    } catch (error) {
      console.error('Error during upload:', error);
      Alert.alert('Failed to upload file.');
    } finally {
      setUiState(prev => ({...prev, activeTemplateId: null}));
      setUiState(prev => ({...prev, isUploading: false}));
      templateBottomSheetRef.current?.close();
    }
  };
  const RenderHeaderType = ({item}) => {
    if (!['VIDEO', 'IMAGE'].includes(item?.header_type)) return null;

    return (
      <>
        <RegularText
          style={[
            styles.headerTypeTitle,
            {color: theme === THEME_COLOR ? colors.black : colors.white},
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
  const RenderHeaderNameInput = ({item}) => {
    if (!['VIDEO', 'IMAGE'].includes(item?.header_type)) return null;

    return (
      <>
        <RegularText
          style={[
            styles.headerNameTitle,
            {color: theme === THEME_COLOR ? colors.black : colors.white},
          ]}>
          Header Name
        </RegularText>
        <TextInput
          style={[
            styles.headerNameInput,
            {
              borderColor:
                theme === THEME_COLOR ? colors.grey600 : colors.grey400,
              color: theme === THEME_COLOR ? colors.black : colors.white,
            },
          ]}
          placeholder="Enter Header Name"
          placeholderTextColor={
            theme === THEME_COLOR ? colors.grey400 : colors.grey600
          }
          value={templateState.headerNames[templateState.template] || ''}
          onChangeText={value =>
            handleHeaderNameChange(templateState.template, value)
          }
        />
      </>
    );
  };
  const RenderMediaTypeSection = ({item}) => {
    if (!['VIDEO', 'IMAGE'].includes(item?.header_type)) return null;

    return (
      <>
        <RegularText
          style={[
            styles.mediaTypeText,
            {color: theme === THEME_COLOR ? colors.black : colors.white},
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
          bottom={spacing.HEIGHT_50}
          left={spacing.WIDTH_10}
          backDropColor="rgba(255,255,255, 0.3)">
          {['Uploaded at Meta', 'Upload Now'].map(option => (
            <TouchableOpacity
              key={option}
              onPress={() => {
                setTemplateState(prev => ({...prev, mediaType: option}));
                setMediaModalVisible(false);
              }}>
              <RegularText style={styles.toggleText}>{option}</RegularText>
            </TouchableOpacity>
          ))}
        </AnimatedModal>
      </>
    );
  };
  const RenderUploadedSampleSection = ({item}) => {
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
  const renderListHeaderComponent = () => (
    <>
      <View style={styles.headerContainer}>
        <RegularText
          style={[
            styles.whatsAppTemplateHeader,
            {color: theme === THEME_COLOR ? colors.black : colors.white},
          ]}>
          WhatsApp Template
        </RegularText>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity
            style={styles.filterIconContainer}
            onPress={() => templateCategoryBottomSheetRef.current?.present()}>
            <SvgIcon.Filter
              height={spacing.HEIGHT_24}
              width={spacing.WIDTH_24}
              color={theme === THEME_COLOR ? colors.black : colors.white}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => templateBottomSheetRef.current?.close()}>
            <SvgIcon.Wrong
              height={spacing.HEIGHT_24}
              width={spacing.WIDTH_24}
              color={theme === THEME_COLOR ? colors.black : colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
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
    <RegularText
      style={[
        styles.filterTitle,
        {color: theme === THEME_COLOR ? colors.black : colors.white},
      ]}>
      Uploaded Header Sample
    </RegularText>
  );
  const renderTemplateCategoryItem = ({item}) => {
    if (!item) return;
    return (
      <TouchableOpacity
        style={[
          styles.templateCategoryButton,
          selectedCategory === item && styles.selectedTemplateCategory,
        ]}
        onPress={() => handleCategorySelection(item)}>
        <RegularText
          style={[
            styles.categoryTemplateText,
            {color: selectedCategory === item ? colors.black : colors.white},
          ]}>
          {item}
        </RegularText>
      </TouchableOpacity>
    );
  };
  const renderTemplateCategoryHeader = () => (
    <RegularText
      style={[
        styles.filterTitle,
        {color: theme === THEME_COLOR ? colors.black : colors.white},
      ]}>
      Select Category
    </RegularText>
  );

  const renderTemplateItem = ({item}) => {
    return (
      <TouchableOpacity
        style={[
          styles.whatsAppTemplateContainer,
          {borderColor: theme === THEME_COLOR ? colors.black : colors.white},
        ]}
        activeOpacity={1}>
        <AnimatedComponentToggle
          tabName={item?.name.replace(/_/g, ' ').toUpperCase()}
          isActive={uiState.activeTemplateId === item?.name}
          containerStyle={{paddingHorizontal: 0}}
          onPress={() => handleSelectTemplateData(item)}>
          <View
            style={[
              styles.templateContentContainer,
              {
                backgroundColor:
                  theme === THEME_COLOR ? colors.grey900 : colors.white,
              },
            ]}>
            <RegularText
              style={[
                styles.templateText,
                {
                  color: theme === THEME_COLOR ? colors.white : colors.black,
                },
              ]}>
              {item?.template}
            </RegularText>
          </View>

          <View style={styles.templateDetailsContainer}>
            <RenderHeaderType item={item} />
            <RenderHeaderNameInput item={item} />
            <RenderMediaTypeSection item={item} />
            <RenderUploadedSampleSection item={item} />
          </View>
          <BottomComp
            text="Send"
            style={styles.submitButton}
            textStyle={styles.submitButtonText}
            onPress={handleSubmitTemplate}
            isLoading={uiState.isUploading}
            disabled={isDisableTemplateSubmit}
          />
        </AnimatedComponentToggle>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {isTempleteLoading ? (
        <Loader color={Colors.default.primaryText} />
      ) : (
        <CustomBottomSheetFlatList
          ref={templateBottomSheetRef}
          snapPoints={['50%', '80%']}
          data={templateData}
          keyExtractor={item => item?.name?.toString()}
          renderItem={renderTemplateItem}
          ListHeaderComponent={() => renderListHeaderComponent()}
        />
      )}

      <CustomBottomSheetFlatList
        ref={secondBottomSheetRef}
        snapPoints={['60%']}
        data={uploadedHeaderSamples}
        keyExtractor={item => item?.media_id.toString()}
        renderItem={renderUploadedSampleItem}
        ListHeaderComponent={renderUploadedSampleHeader}
      />

      {/* BottomSheet for WhatsApp Template Categories */}
      <CustomBottomSheetFlatList
        snapPoints={['60%']}
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
    fontSize: textScale(14),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
    color: colors.grey700,
  },
  templateDetailsContainer: {
    marginVertical: spacing.MARGIN_10,
    paddingHorizontal: spacing.PADDING_10,
  },
  headerTypeTitle: {
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
    fontSize: textScale(18),
    color: colors.black,
    marginVertical: spacing.MARGIN_6,
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
  headerNameTitle: {
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
    fontSize: textScale(18),
    color: colors.black,
    marginVertical: spacing.MARGIN_6,
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
  mediaTypeContainer: {
    position: 'relative',
  },
  mediaTypeText: {
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
    fontSize: textScale(18),
    color: colors.black,
    marginVertical: spacing.MARGIN_6,
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
  toggleText: {
    borderBottomWidth: 1,
    textAlign: 'center',
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
  uploadedSampleButtonText: {
    color: colors.white,
    fontSize: textScale(16),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_BOLD,
  },
  uploadNowTitle: {
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
    fontSize: textScale(18),
    color: colors.black,
    marginLeft: spacing.MARGIN_12,
  },
  uploadNowButton: {
    backgroundColor: colors.grey500,
    padding: spacing.PADDING_14,
    borderRadius: spacing.RADIUS_8,
    borderWidth: 0,
  },
  uploadNowButtonText: {
    color: colors.white,
    fontSize: textScale(14),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_BOLD,
  },
  submitButton: {
    backgroundColor: colors.green600,
    marginBottom: spacing.MARGIN_10,
    borderWidth: 0,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: textScale(15),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.MARGIN_20,
  },
  whatsAppTemplateHeader: {
    alignSelf: 'center',
    fontSize: textScale(18),
    color: colors.black,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
  },
  whatsAppTemplateTopBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: spacing.MARGIN_16,
    marginVertical: spacing.MARGIN_8,
  },
  createTemplateButton: {
    borderRadius: spacing.RADIUS_8,
    padding: spacing.PADDING_6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green200,
  },
  filterIconContainer: {
    borderRadius: spacing.RADIUS_16,
    padding: spacing.PADDING_6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateCategoryButton: {
    padding: spacing.PADDING_12,
    margin: spacing.MARGIN_8,
    borderRadius: spacing.RADIUS_8,
    backgroundColor: colors.green200,
  },
  selectedTemplateCategory: {
    backgroundColor: colors.grey200,
  },
  categoryTemplateText: {
    fontSize: textScale(14),
    color: colors.black,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
    textTransform: 'capitalize',
  },
  filterTitle: {
    fontSize: textScale(18),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
    alignSelf: 'center',
  },
  uploadedSampleItem: {
    backgroundColor: colors.green200,
    marginVertical: spacing.PADDING_10,
    borderRadius: spacing.RADIUS_10,
    paddingHorizontal: spacing.PADDING_12,
    paddingVertical: spacing.PADDING_10,
  },
  uploadedSampleItemText: {
    color: colors.white,
    fontSize: textScale(14),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_MEDIUM,
  },
});
