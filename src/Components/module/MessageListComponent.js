import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';

// Import your custom components and utilities
import MessageListColum from '../Colums/MessageListColum';
import Loader from '../Common/Loader';
import RegularText from '../Common/RegularText';

// Import your custom styles and utilities
import { boxShadow } from '../../styles/Mixins';
import { textScale } from '../../styles/responsiveStyles';
import { spacing } from '../../styles/spacing';
import { fontNames } from '../../styles/typography';

// Import your API calls and utilities
import {
  useAlldeleteChatMutation,
  useDeleteChatsMutation,
  useLazyChatMarkAsReadQuery,
  useLazyGetAllChatQuery,
  useLazyGetWhatsAppFlowsQuery,
  useLazyGetWhatsAppInteractiveMessagesQuery,
  useLazyGetWhatsAppMessageKeywordListQuery,
  useLazyGetWhatsAppOptionMessagesQuery,
  useSendOutGoingMediaMessageMutation,
  useSendOutGoingTextMessageMutation,
  useSendWhatsappKeyWordMessageMutation,
} from '../../api/store/slice/chatSlice';
import * as SvgIcon from '../../assets/index';
import NavigationString from '../../Navigations/NavigationString';
import colors from '../../Utils/colors';
import { pickAndSendMediaMessage } from '../../Utils/commonImagePicker';
import THEME_COLOR from '../../Utils/Constant';
import {
  CommonToastMessage,
  goBack,
  navigate,
} from '../../Utils/helperFunctions';
import TemaplateItemColum from '../Colums/TemaplateItemColum';
import AnimatedModal from '../Common/AnimatedModal';
import CommoneHeader from '../Common/CommoneHeader';
import CommonPopupModal from '../Common/CommonPopupModal';
import CommonToolBar from '../Common/CommonToolBar';
import CustomBottomSheetFlatList from '../Common/CustomBottomSheetFlatList';
import MediaPreviewModal from '../Common/MediaPreviewModal';
import { useAppSelector, useTheme } from '../hooks';
import BottomComp from './../Common/BottonComp';
const MESSAGE_RECEIVED_EVENT = 'new_whatsapp_message';

const MessageListComponent = ({Mobile_No, unreadMessages, title}) => {
  const {theme} = useTheme();
  const isDarkMode = theme === THEME_COLOR;

  // Your API endpoints
  const [triggerChatGetData] = useLazyGetAllChatQuery();
  const [sendOutGoingTextMessage] = useSendOutGoingTextMessageMutation();
  const [sendOutGoingMediaMessage] = useSendOutGoingMediaMessageMutation();
  const [
    fetchKeywordMessages,
    {data: keywordData, isLoading: isKeywordLoading, reset: keywordDataReset},
  ] = useLazyGetWhatsAppMessageKeywordListQuery();

  const [
    fetchFlows,
    {data: flowData, isLoading: isFlowLoading, reset: flowDataReset},
  ] = useLazyGetWhatsAppFlowsQuery();

  const [
    fetchInteractiveMessages,
    {
      data: interactiveData,
      isLoading: isInteractiveLoading,
      reset: interactiveDataReset,
    },
  ] = useLazyGetWhatsAppInteractiveMessagesQuery();

  const [
    fetchOptionMessages,
    {data: optionData, isLoading: isOptionLoading, reset: optionDataReset},
  ] = useLazyGetWhatsAppOptionMessagesQuery();
  const [sendWhatsappKeyWordMessage] = useSendWhatsappKeyWordMessageMutation();
  const [chatsMarkAsRead] = useLazyChatMarkAsReadQuery();
  const [deleteChats] = useDeleteChatsMutation();
  const [allDeleteChat] = useAlldeleteChatMutation();

  // Refs
  const messageBottomSheetRef = useRef(null);
  const tamplateBottomSheetRef = useRef(null);

  const socket = useAppSelector(state => state.socket.socket);
  // State variables
  const [data, setData] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [openChatTemplate, setOpenChatTemplate] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [loadingDocName, setLoadingDocName] = useState(null);
  const [whatsAppMessageKeywordDocType, setWhatsAppMessageKeywordDocType] =
    useState('');
  const [isMarkAsRead, setIsMarkAsRead] = useState(!!unreadMessages);
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [sendDocumentState, setSendDocumentState] = useState({});
  const [confirmationModalDocument, setConfirmationModalDocument] =
    useState(false);
  const [inputHeight, setInputHeight] = useState(40);
  const inputHeightAnim = useRef(new Animated.Value(60)).current;
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [replyingMessage, setReplyingMessage] = useState('');
  const [isReplyingMessage, setIsReplyingMessage] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isToolBarVisible, setIsToolBarVisible] = useState(false);
  const [previewMedia, setPreviewMedia] = useState({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isClearChat, setIsClearChat] = useState(false);
  const [isChatToolBarOptionModalVisible, setIsChatToolBarOptionModalVisible] =
    useState(false);

  const selectionMode = selectedMessages.length > 0;
  const LIMIT = 30;
  const selectedDomain = useAppSelector(
    state => state.domains?.selectedDomain?.domain,
  );

  const [activeQuery, setActiveQuery] = useState(null);

  // Throttle function to limit the frequency of executing a function
  const throttle = (func, limit) => {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  const throttledSetToolBarVisibility = useCallback(
    throttle(newSelectedMessages => {
      if (newSelectedMessages.length > 0) {
        setIsToolBarVisible(true);
      } else {
        setIsToolBarVisible(false);
      }
    }, 100),
    [],
  );

  const handleSetSelectedMessages = newSelectedMessages => {
    setSelectedMessages(newSelectedMessages);
    throttledSetToolBarVisibility(newSelectedMessages);
  };

  // Fetch messages based on mobile number
  useEffect(() => {
    const initializeMessages = async () => {
      if (Mobile_No) {
        setLoading(true);
        await fetchMessages(Mobile_No, 1, false);
        setCurrentPage(1);
        setHasMoreData(true);
      }
    };
    initializeMessages();
  }, [Mobile_No]);

  const fetchMessages = async (mobile_no, page, reset = false) => {
    setLoadingMore(true);
    if (reset) {
      setData([]);
      setHasMoreData(true);
      setCurrentPage(1);
    }
    try {
      const response = await triggerChatGetData({
        mobile: mobile_no,
        page,
        limit: LIMIT,
      });
      setIsSessionExpired(response?.data?.interactive_message === 'Yes');
      const fetchedMessages = response?.data?.data?.paginated_messages || [];
      if (fetchedMessages.length === 0) {
        console.log('No more messages found.');
        setHasMoreData(false);
      }

      setData(prevMessages => {
        const newMessages = fetchedMessages.filter(
          message =>
            !prevMessages.some(
              prevMessage => prevMessage.message_id === message.message_id,
            ),
        );
        return [...prevMessages, ...newMessages];
      });
    } catch (e) {
      console.error('Error fetching messages:', e);
      CommonToastMessage('error', e?.message);
    } finally {
      setLoadingMore(false);
      setLoading(false);
    }
  };

  // Send outgoing text message
  const sendOutgoingTextMessage = async () => {
    if (message.trim() === '') return;
    try {
      setMessage('');
      setIsReplyingMessage(false);
      const payload = {
        mobile_no: Mobile_No,
        message,
      };
      // If replying to a message, add `reply_to_id` to the payload
      if (replyingMessage) {
        payload.reply_to_message_id = replyingMessage.message_id;
        payload.is_reply = 1;
      }

      const response = await sendOutGoingTextMessage(payload);
      const sendResponse = response?.data?.data;

      setReplyingMessage('');
      if (sendResponse?.status_code === 500) {
        setModalMessage(sendResponse?.message);
        setIsSubscribe(true);
        return;
      }

      return sendResponse;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Handle chat option modal
  const handleChatOption = () => {
    setOpenChatTemplate(!openChatTemplate);
  };

  // Handle tab on template
  const handleTabOnTemplet = () => {
    messageBottomSheetRef.current?.present();
    setOpenChatTemplate(false);
    setWhatsAppMessageKeywordDocType('');
    optionDataReset(),
      interactiveDataReset(),
      flowDataReset(),
      keywordDataReset();
  };

  const handleTabOnPhoto = async () => {
    const result = await pickAndSendMediaMessage([
      DocumentPicker.types.images,
      DocumentPicker.types.video,
    ]);

    setOpenChatTemplate(false);

    if (result.status === 'success') {
      // Set the preview modal with media details
      setPreviewMedia({
        content_type: result?.data?.fileExtension,
        uri: result?.data?.uri,
        name: result?.data?.name,
        base64: result?.data?.base64String,
      });
      setShowPreviewModal(true);
    } else if (result.status === 'cancelled') {
      setShowPreviewModal(false);
      console.log('User cancelled the document picking.');
    } else {
      console.error('Error picking or sending document:', result);
    }
  };

  const handleConfirmAttachPhoto = async () => {
    try {
      const payload = {
        mobile_no: Mobile_No,
        content_type: previewMedia.content_type,
        file_data: previewMedia.base64,
        file_name: previewMedia.name,
      };
      if (replyingMessage) {
        payload.reply_to_message_id = replyingMessage.message_id;
        payload.is_reply = 1;
        // payload.message = replyingMessage.message;
      }

      const res = await sendOutGoingMediaMessage(payload);
      const sendResponse = res?.data?.data;
      if (sendResponse?.status_code === 500) {
        setModalMessage(sendResponse?.message);
        setIsSubscribe(true);
        return;
      }
    } catch (error) {
      console.error('Error sending photo:', error);
    } finally {
      setShowPreviewModal(false);
      setPreviewMedia({});
      await fetchMessages(Mobile_No, 1, false);
    }
  };

  // Cancel Attach Photo
  const handleCancelAttachPhoto = () => {
    setShowPreviewModal(false);
    setPreviewMedia({});
  };

  // Handle tab on document
  const handleTabOnDocument = async () => {
    const result = await pickAndSendMediaMessage();
    setOpenChatTemplate(false);
    if (result.status === 'success') {
      setConfirmationModalDocument(true);
      setSendDocumentState({
        mobile_no: Mobile_No,
        content_type: result?.data?.fileExtension,
        file_data: result?.data?.base64String,
        file_name: result?.data?.name,
      });
    } else if (result.status === 'cancelled') {
      setConfirmationModalDocument(false);
      setOpenChatTemplate(false);
      console.log('User cancelled the document picking.');
    } else if (result.status === 'incomplete_details') {
      console.log('Incomplete file details:', result.data);
    } else if (result.status === 'no_document') {
      console.log('No document was selected.');
    } else if (result.status === 'error') {
      console.log('Error picking or sending document:', result.error);
    }
  };

  // Confirm Attach Document
  const handleConfirmAttachDocument = async () => {
    try {
      const res = await sendOutGoingMediaMessage(sendDocumentState);
      const sendResponse = res?.data?.data;
      console.log('Document sent:', sendResponse.status_code);
      if (sendResponse?.status_code === 500) {
        setModalMessage(sendResponse?.message);
        setIsSubscribe(true);
        setOpenChatTemplate(false);
        return;
      }
    } catch (error) {
      console.log(error);
      setOpenChatTemplate(false);
    } finally {
      setConfirmationModalDocument(false);
      setOpenChatTemplate(false);
      setSendDocumentState({});
      fetchMessages(Mobile_No, 1, false);
    }
  };
  // Cancel Attach Document
  const handleCancelAttachDocument = () => {
    setConfirmationModalDocument(false);
    setSendDocumentState({});
  };

  // Handle swipe to reply
  const handleSwipeToReply = message => {
    if (message) {
      setIsReplyingMessage(true);
      setReplyingMessage(message);
    }
  };

  // Render each item in the list
  const renderItem = ({item, index}) => {
    const nextItem = index < data.length - 1 ? data[index + 1] : null;
    return (
      <MessageListColum
        item={item}
        nextItem={nextItem}
        selectedMessages={selectedMessages}
        setSelectedMessages={handleSetSelectedMessages}
        selectionMode={selectionMode}
        onSwipeToReply={handleSwipeToReply}
      />
    );
  };

  // Handle send WhatsApp message keyword
  const handleSendWhatsAppMessageKeyWord = async doc_name => {
    try {
      const payload = {
        doc_type: whatsAppMessageKeywordDocType,
        doc_name,
        number: Mobile_No,
      };

      setLoadingDocName(doc_name);
      const res = await sendWhatsappKeyWordMessage(payload);
      const sendResponse = res?.data?.data;

      setLoadingDocName(null);
      if (sendResponse?.status_code === 500) {
        setModalMessage(sendResponse?.message);
        setIsSubscribe(true);
        messageBottomSheetRef.current?.dismiss();
        return;
      }
    } catch (error) {
      console.error('Error sending keyword message:', error);
    } finally {
      messageBottomSheetRef.current?.dismiss();
      setLoadingDocName(null);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      const res = await chatsMarkAsRead({
        number: Mobile_No,
      });
      const markAsReadResponse = res?.data;
      if (markAsReadResponse?.status_code === 200) {
        setIsMarkAsRead(false);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // socket event listener
  const onMessageReceived = (message, event, user, docname) => {
    setData(prevData => {
      if (prevData.some(msg => msg.message_id === message.message_id)) {
        return prevData;
      }
      return [...prevData, message];
    });
  };

  useEffect(() => {
    if (!socket || !socket.connected) return;
    socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
    return () => {
      socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
    };
  }, [socket]);

  const handleSendTemplate = () => {
    setOpenChatTemplate(false);
    tamplateBottomSheetRef.current.present();
  };

  const handleChatTemplateModal = () => {
    if (tamplateBottomSheetRef.current) {
      tamplateBottomSheetRef.current.present();
    }
  };

  const selectedMessageAction = message => {
    navigate(NavigationString.CreateTask, {message});
  };

  const handleLoadMore = async () => {
    if (!loadingMore && hasMoreData) {
      const nextPage = currentPage + 1;
      await fetchMessages(Mobile_No, nextPage, false);
      setCurrentPage(nextPage);
    }
  };

  const maxTextInputHeight = 100;
  const inputRef = useRef(null);

  useEffect(() => {
    if (replyingMessage) {
      Animated.timing(inputHeightAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(inputHeightAnim, {
        toValue: 60,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }

    if (replyingMessage && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingMessage]);

  const handleCancelReply = () => {
    setReplyingMessage('');
    setIsReplyingMessage(false);
    setMessage('');
  };

  const handleCommonToolBarLeftIconPres = () => {
    setSelectedMessages([]);
    setIsToolBarVisible(false);
  };
  const handleDeletePress = async () => {
    setIsDeleteMode(true);
  };
  const handleConfirmDeletePress = async () => {
    try {
      const names = selectedMessages.reduce((acc, {name}) => {
        acc.push(name);
        return acc;
      }, []);
      const res = await deleteChats({record_names: names});
      const deleteResponse = res?.data;
      console.log(deleteResponse);

      setIsToolBarVisible(false);
      setSelectedMessages([]);
      setIsDeleteMode(false);
      if (deleteResponse.status_code === 200) {
        CommonToastMessage('success', deleteResponse.message);
      }
    } catch (error) {
      console.log(error);
      setIsDeleteMode(false);
    }
  };

  const handleCancelDeletePress = () => {
    setIsToolBarVisible(false);
    setSelectedMessages([]);
    setIsDeleteMode(false);
  };

  const options = [
    {
      name: 'Template',
      icon: SvgIcon.TemplateIcon,
      action: handleSendTemplate,
      iconColor: colors.orange800,
    },
    {
      name: 'Document',
      icon: SvgIcon.Document,
      action: handleTabOnDocument,
      iconColor: colors.red800,
    },
    {
      name: 'Gallery',
      icon: SvgIcon.Gallery,
      action: handleTabOnPhoto,
      iconColor: colors.purple800,
    },
    {
      name: 'Message',
      icon: SvgIcon.ChatIcon,
      action: handleTabOnTemplet,
      iconColor: colors.green800,
    },
  ];

  // messageBottomSheet

  const renderMessageBottomSheetItem = ({item}) => (
    <View style={styles.whatsAppMessageKeyWordListContainer}>
      <RegularText style={styles.templateKeyWord}>
        {item?.name.replace(/_/g, ' ').length > 25
          ? `${item?.name.replace(/_/g, ' ').slice(0, 25)}...`
          : item?.name.replace(/_/g, ' ')}
      </RegularText>
      <BottomComp
        style={styles.sendButtonBottomSheet}
        text="Send"
        textStyle={styles.sendButtonTextBottomSheet}
        onPress={() => handleSendWhatsAppMessageKeyWord(item?.name)}
        isLoading={loadingDocName === item?.name}
      />
    </View>
  );
  const queryMap = {
    WhatsApp_Keyword_Message: {
      fetch: fetchKeywordMessages,
      data: keywordData,
      isLoading: isKeywordLoading,
      reset: keywordDataReset,
    },
    WhatsApp_Flow: {
      fetch: fetchFlows,
      data: flowData,
      isLoading: isFlowLoading,
      reset: flowDataReset,
    },
    WhatsApp_Interactive_Message: {
      fetch: fetchInteractiveMessages,
      data: interactiveData,
      isLoading: isInteractiveLoading,
      reset: interactiveDataReset,
    },
    WhatsApp_Option_Message: {
      fetch: fetchOptionMessages,
      data: optionData,
      isLoading: isOptionLoading,
      reset: optionDataReset,
    },
  };

  const handleSelection = async (docType, index) => {
    const originalDocType = docType.replace(/_/g, ' ');
    setWhatsAppMessageKeywordDocType(originalDocType);
    setActiveQuery(docType);
    try {
      await queryMap[docType]?.fetch();
    } catch (error) {
      console.error(`Error fetching ${docType}:`, error);
    }
  };

  const messageBottomSheetData = queryMap[activeQuery]?.data?.data || [];
  const isLoading = queryMap[activeQuery]?.isLoading;

  const messageBottomSheetListEmptyComponent = () => {
    if (isLoading) {
      return <Loader />;
    }
    return (
      <View style={styles.chatOptionContainer}>
        {[
          'WhatsApp_Keyword_Message',
          'WhatsApp_Flow',
          'WhatsApp_Interactive_Message',
          'WhatsApp_Option_Message',
        ].map((docType, index) => (
          <BottomComp
            key={index}
            style={styles.templateBtnStyle}
            text={docType.split('_')[1]}
            textStyle={styles.templateKeyWord}
            onPress={() => handleSelection(docType)}
          />
        ))}
      </View>
    );
  };
  const handleCommonToolBarRightIconPress = index => {
    const actions = {
      0: () => handleDeletePress(),
    };

    const action = actions[index];
    if (action) {
      action();
    } else {
    }
  };

  const handleCommoneHeaderRightIconPress = index => {
    const actions = {
      0: async () => await fetchMessages(Mobile_No, 1, true),
      1: () =>
        setIsChatToolBarOptionModalVisible(!isChatToolBarOptionModalVisible),
    };

    const action = actions[index];
    if (action) {
      action();
    } else {
    }
  };

  const handleClearChat = () => {
    setIsClearChat(!isClearChat);
    setIsChatToolBarOptionModalVisible(false);
  };
  const handleComfirmClearChat = async () => {
    try {
      const res = await allDeleteChat({contacts: [title]});
      const allChatDeleteResponse = res?.data;
      console.log(allChatDeleteResponse);

      if (allChatDeleteResponse?.status_code === 200) {
        CommonToastMessage('success', allChatDeleteResponse?.message);
        setIsClearChat(false);
      }
    } catch (error) {
      console.log(error);
      setIsClearChat(!isClearChat);
    }
  };
  const handleCancleClearChat = () => {
    setIsClearChat(!isClearChat);
  };
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          {isToolBarVisible ? (
            <CommonToolBar
              onBackPress={handleCommonToolBarLeftIconPres}
              count={selectedMessages.length}
              showLeftIcons={true}
              leftIcons={[SvgIcon.BackIcon]}
              onLeftIconPress={handleCommonToolBarLeftIconPres}
              showRightIcons={true}
              rightIcons={[SvgIcon.DeleteIcon]}
              onRightIconPress={handleCommonToolBarRightIconPress}
            />
          ) : (
            <CommoneHeader
              title={title}
              showLeftIcon={true}
              onLeftIconPress={goBack}
              showRightIcons={true}
              rightIcons={[SvgIcon.ReloadIcon, SvgIcon.DotMenu]}
              onRightIconPress={handleCommoneHeaderRightIconPress}
              showNumber
              number={Mobile_No}
              onTitlePress={() =>
                navigate(NavigationString.ContactListDetailsRowScreen, {
                  contactName: title,
                  mobileNo: Mobile_No,
                })
              }
            />
          )}
          <View style={styles.mainContainer}>
            <FlatList
              data={data}
              keyExtractor={item => item?.message_id.toString()}
              inverted
              // estimatedItemSize={100}
              renderItem={renderItem}
              onEndReachedThreshold={0.5}
              onEndReached={handleLoadMore}
              ListFooterComponent={loadingMore && <Loader />}
              ListEmptyComponent={
                <RegularText
                  style={[
                    styles.emptyText,
                    {
                      color: isDarkMode ? colors.black : colors.white,
                    },
                  ]}>
                  No messages found.
                </RegularText>
              }
            />

            {/* Mark as Read and Send Message */}
            {isMarkAsRead ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                  paddingHorizontal: spacing.PADDING_4,
                }}>
                <BottomComp
                  text="Reply"
                  style={styles.markAsReadBtnStyle}
                  textStyle={styles.markAsReadBtnTextStyle}
                  onPress={() => setIsMarkAsRead(false)}
                />
                <BottomComp
                  text="Mark as Read"
                  style={styles.markAsReadBtnStyle}
                  textStyle={styles.markAsReadBtnTextStyle}
                  onPress={handleMarkAsRead}
                />
              </View>
            ) : (
              <View style={styles.textInputRow}>
                {isSessionExpired && (
                  <TouchableOpacity
                    style={styles.sendIconContainer}
                    activeOpacity={0.6}
                    onPress={handleChatOption}>
                    <SvgIcon.AddICon
                      height={spacing.HEIGHT_34}
                      width={spacing.WIDTH_34}
                      color={isDarkMode ? colors.black : colors.white}
                    />
                  </TouchableOpacity>
                )}

                {isSessionExpired ? (
                  <Animated.View
                    style={[
                      styles.textInputContainer,
                      {
                        backgroundColor: isDarkMode
                          ? colors.white
                          : colors.grey800,
                      },
                      // {height: inputHeightAnim},
                    ]}>
                    {isReplyingMessage && (
                      <View
                        style={[
                          styles.replyingMessageContainer,
                          {
                            backgroundColor: isDarkMode
                              ? colors.grey200
                              : colors.grey700,
                          },
                        ]}>
                        <View style={styles.replyingMessageContent}>
                          {!!replyingMessage.message && (
                            <RegularText
                              style={[
                                styles.replyText,
                                {
                                  color: isDarkMode
                                    ? colors.grey600
                                    : colors.grey100,
                                },
                              ]}
                              numberOfLines={2}>
                              {replyingMessage.message}
                            </RegularText>
                          )}
                          {!!replyingMessage.attach && (
                            <Image
                              source={{
                                uri: `${selectedDomain}${replyingMessage.attach}`,
                              }}
                              style={{
                                width: spacing.WIDTH_24,
                                height: spacing.HEIGHT_30,
                                resizeMode: 'cover',
                              }}
                            />
                          )}
                          <TouchableOpacity
                            onPress={handleCancelReply}
                            style={styles.cancelReplyButton}>
                            <SvgIcon.Wrong
                              color={isDarkMode ? colors.black : colors.white}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <TextInput
                        ref={inputRef}
                        placeholder="Send Message"
                        placeholderTextColor={
                          isDarkMode ? colors.grey500 : colors.grey100
                        }
                        style={[
                          styles.inputTextStyle,
                          {
                            height: inputHeight,
                            maxHeight: maxTextInputHeight,
                            color: isDarkMode ? colors.black : colors.white,
                          },
                        ]}
                        multiline
                        value={message}
                        onChangeText={setMessage}
                        onContentSizeChange={event => {
                          const newHeight = Math.min(
                            event.nativeEvent.contentSize.height,
                            maxTextInputHeight,
                          );
                          setInputHeight(newHeight);
                        }}
                      />
                      <TouchableOpacity
                        style={styles.sendIconContainer}
                        activeOpacity={0.6}
                        onPress={sendOutgoingTextMessage}>
                        <SvgIcon.SendMessage
                          height={spacing.HEIGHT_24}
                          width={spacing.WIDTH_24}
                          color={isDarkMode ? colors.grey800 : colors.grey100}
                        />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                ) : (
                  <BottomComp
                    text="Send Template"
                    style={styles.sendTemplateBtnStyle}
                    textStyle={styles.sendTemplateBtnTextStyle}
                    onPress={handleChatTemplateModal}
                  />
                )}
              </View>
            )}
          </View>

          {/* BottomSheet for WhatsApp Message */}
          <CustomBottomSheetFlatList
            ref={messageBottomSheetRef}
            snapPoints={['40%', '80%']}
            data={messageBottomSheetData}
            keyExtractor={(item, index) =>
              item?.id?.toString() || index.toString()
            }
            renderItem={renderMessageBottomSheetItem}
            ListEmptyComponent={messageBottomSheetListEmptyComponent}
            contentContainerStyle={{paddingBottom: spacing.PADDING_20}}
          />

          {/* BottomSheet for WhatsApp Template */}
          <TemaplateItemColum
            Mobile_No={Mobile_No}
            templateBottomSheetRef={tamplateBottomSheetRef}
          />
        </>
      )}
      {/* Popup for subscribe*/}
      <CommonPopupModal
        isVisible={isSubscribe}
        buttons={[
          {
            text: 'OK',
            color: colors.red600,
            onPress: () => setIsSubscribe(false),
          },
        ]}
        message={modalMessage}
        messageColor={colors.red600}
      />
      {/* Popup for confirmationDocument*/}
      <CommonPopupModal
        isVisible={confirmationModalDocument}
        buttons={[
          {
            text: 'Cancel',
            color: colors.red600,
            onPress: handleCancelAttachDocument,
          },
          {
            text: 'Confirm',
            color: colors.green600,
            onPress: handleConfirmAttachDocument,
          },
        ]}
        message="Are you sure you want to attach a document?"
        messageColor="#4B0082"
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
      />

      <CommonPopupModal
        isVisible={isClearChat}
        buttons={[
          {
            text: 'Cancel',
            color: colors.red600,
            onPress: handleCancleClearChat,
          },
          {
            text: 'Delete',
            color: colors.green600,
            onPress: handleComfirmClearChat,
          },
        ]}
        message="clear this chat"
      />

      <MediaPreviewModal
        visible={showPreviewModal}
        media={previewMedia}
        onConfirm={handleConfirmAttachPhoto}
        onCancel={handleCancelAttachPhoto}
      />

      <AnimatedModal
        isVisible={openChatTemplate}
        close={() => setOpenChatTemplate(false)}
        animationType="bottom-to-top"
        bottom={spacing.HEIGHT_56}
        left={spacing.WIDTH_10}
        right={spacing.WIDTH_10}
        modalStyle={{
          elevation: 0,
          backgroundColor: isDarkMode ? colors.grey600 : colors.grey900,
        }}>
        <View style={styles.optionGrid}>
          {options.map((option, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={option.action}>
                <View style={[styles.iconContainer]}>
                  {React.createElement(option.icon, {
                    width: spacing.WIDTH_30,
                    height: spacing.HEIGHT_30,
                    color: option.iconColor,
                  })}
                </View>
                <RegularText
                  style={[
                    styles.optionText,
                    {
                      color: isDarkMode ? colors.black : colors.white,
                    },
                  ]}>
                  {option.name}
                </RegularText>
              </TouchableOpacity>
            );
          })}
        </View>
      </AnimatedModal>
      <AnimatedModal
        isVisible={isChatToolBarOptionModalVisible}
        close={() => setIsChatToolBarOptionModalVisible(false)}
        animationType="none"
        top={spacing.HEIGHT_60}
        right={spacing.WIDTH_10}
        modalStyle={{
          borderRadius: spacing.RADIUS_6,
          backgroundColor: isDarkMode ? colors.white : colors.black,
          paddingHorizontal: spacing.PADDING_20,
        }}>
        <TouchableOpacity onPress={handleClearChat}>
          <RegularText
            style={{
              fontSize: textScale(14),
              fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
              color: isDarkMode ? colors.black : colors.white,
            }}>
            clear chat
          </RegularText>
        </TouchableOpacity>
      </AnimatedModal>
    </>
  );
};

export default MessageListComponent;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  flatListContainer: {
    flex: 1,
  },
  textInputRow: {
    flexDirection: 'row',
    marginBottom: spacing.MARGIN_8,
    alignItems: 'center',
    paddingHorizontal: spacing.PADDING_8,
  },
  textInputContainer: {
    borderRadius: spacing.RADIUS_20,
    paddingHorizontal: spacing.PADDING_12,
    backgroundColor: colors.grey700,
    flex: 1,
  },
  inputTextStyle: {
    fontSize: textScale(16),
    color: colors.black,
    flex: 1,
  },
  sendIconContainer: {
    borderRadius: spacing.RADIUS_16,
    padding: spacing.PADDING_4,
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  sendMessageIconStyle: {
    width: spacing.WIDTH_24,
    height: spacing.HEIGHT_24,
    resizeMode: 'contain',
    tintColor: colors.black,
  },
  openChatOptionModal: {
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: spacing.HEIGHT_56,
    left: spacing.WIDTH_10,
    paddingVertical: spacing.PADDING_5,
    paddingHorizontal: spacing.PADDING_20,
    ...boxShadow('#000', {height: 10, width: 8}, 10, 0.2),
    borderRadius: spacing.RADIUS_8,
  },
  chatOptionTextStyle: {
    fontSize: textScale(18),
    color: colors.black,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
    paddingVertical: spacing.PADDING_8,
  },
  chatOptionContainer: {
    paddingHorizontal: spacing.PADDING_16,
  },
  templateKeyWord: {
    fontSize: textScale(14),
    color: colors.white,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
  },
  templateBtnStyle: {
    padding: spacing.PADDING_16,
    marginVertical: spacing.MARGIN_6,
    borderRadius: spacing.RADIUS_6,
    backgroundColor: colors.green200,
  },
  modaleTextHeading: {
    fontSize: textScale(18),
    fontWeight: '600',
    color: colors.black,
    fontFamily: fontNames.ROBOTO_FONT,
  },
  underLineStyle: {
    height: 1,
    backgroundColor: '#000',
    width: '100%',
    marginVertical: spacing.MARGIN_6,
  },
  templateKeyWordListContainer: {
    backgroundColor: 'gray',
    marginVertical: spacing.MARGIN_6,
    marginHorizontal: spacing.MARGIN_8,
    paddingHorizontal: spacing.PADDING_8,
    paddingVertical: spacing.PADDING_8,
    opacity: 0.5,
    borderRadius: spacing.RADIUS_10,
  },
  templateOptionContainer: {
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  templateModalStyle: {
    backgroundColor: '#fff',
    height: '100%',
    borderTopRightRadius: spacing.RADIUS_10,
    borderTopLeftRadius: spacing.RADIUS_10,
    paddingVertical: spacing.PADDING_16,
  },

  toggleContent: {
    position: 'absolute',
    backgroundColor: colors.grey200,
    paddingVertical: spacing.PADDING_8,
    borderRadius: spacing.RADIUS_8,
    bottom: -spacing.MARGIN_30,
    left: 0,
    right: 0,
    alignItems: 'center',
    ...boxShadow(),
    zIndex: 5,
  },

  whatsAppMessageKeyWordListContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.green200,
    paddingHorizontal: spacing.PADDING_16,
    paddingVertical: spacing.PADDING_10,
    marginHorizontal: spacing.MARGIN_16,
    marginVertical: spacing.MARGIN_6,
    borderRadius: spacing.RADIUS_8,
  },
  markAsReadBtnStyle: {
    backgroundColor: colors.green600,
    width: '48%',
    borderWidth: 0,
    marginVertical: spacing.MARGIN_6,
  },
  markAsReadBtnTextStyle: {
    color: colors.white,
    fontSize: textScale(15),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
    textAlign: 'center',
  },
  sendTemplateBtnStyle: {
    flex: 1,
    backgroundColor: colors.green600,
    borderWidth: 0,
  },
  sendTemplateBtnTextStyle: {
    color: colors.white,
    fontSize: textScale(15),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: textScale(16),
    color: colors.black,
    textAlign: 'center',
    marginTop: spacing.MARGIN_16,
  },

  replyContainer: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    backgroundColor: '#e0e0e0',
    padding: spacing.PADDING_10,
    borderBottomWidth: 1,
    borderColor: '#c0c0c0',
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  replyText: {
    fontSize: textScale(14),
    color: 'gray',
    flex: 1,
  },
  sendButtonBottomSheet: {
    paddingVertical: spacing.PADDING_6,
    backgroundColor: colors.green500,
    borderWidth: 0,
  },
  sendButtonTextBottomSheet: {
    color: colors.white,
    fontSize: textScale(15),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
  },
  replyingMessageContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: spacing.RADIUS_8,
    padding: spacing.PADDING_8,
    marginBottom: spacing.MARGIN_6,
    marginTop: spacing.MARGIN_6,
  },
  replyingMessageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelReplyButton: {
    marginLeft: spacing.MARGIN_10,
  },
  iconContainer: {
    backgroundColor: colors.white,
    width: spacing.HEIGHT_50,
    height: spacing.HEIGHT_50,
    borderRadius: spacing.HEIGHT_50 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.MARGIN_6,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: spacing.PADDING_20,
  },
  optionButton: {
    alignItems: 'center',
    marginVertical: spacing.MARGIN_10,
    width: '30%',
  },
  optionText: {
    fontSize: textScale(12),
    textAlign: 'center',
    fontFamily: fontNames.POPPINS_FONT_FAMILY_BOLD,
  },
});
