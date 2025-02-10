import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';

// Import components
import AnimatedModal from '../Common/AnimatedModal';
import CommonPopupModal from '../Common/CommonPopupModal';
import TextComponent from '../Common/TextComponent';

// Import styles and utilities
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import Colors from '../../theme/colors';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';

// Import API and navigation
import {CommonToastMessage, truncateText} from '../../Utils/helperFunctions';
import {useAppSelector, useTheme} from '../hooks';

// Import API hooks
import {getSocket} from '../../api/SocketManager';
import {
  useAddActionToWaMessageMutation,
  useAlldeleteChatMutation,
  useCreateNewActionMutation,
  useDeleteChatsMutation,
  useGetAllChatQuery,
  useLazyChatMarkAsReadQuery,
  useLazyGetNextActionsQuery,
  useLazyGetWhatsAppFlowsQuery,
  useLazyGetWhatsAppInteractiveMessagesQuery,
  useLazyGetWhatsAppMessageKeywordListQuery,
  useLazyGetWhatsAppOptionMessagesQuery,
  useSendOutGoingMediaMessageMutation,
  useSendOutGoingTextMessageMutation,
} from '../../api/store/slice/chatSlice';
import {useLazyGetAllMessageListQuery} from '../../api/store/slice/messageSlice';
import * as SvgIcon from '../../assets/index';
import {QUERY_TYPES} from '../../Screens/ChatScreen/constats';
import {boxShadow} from '../../styles/Mixins';
import {textScale} from '../../styles/responsiveStyles';
import {pickAndSendMediaMessage} from '../../Utils/commonImagePicker';
import {MessageHeader} from '../Colums/ChatList/MessageHeader';
import MessageInput from '../Colums/ChatList/MessageInput';
import MessageListContent from '../Colums/ChatList/MessageListContent';
import TemaplateItemColum from '../Colums/TemaplateItemColum';
import CustomBottomSheetFlatList from '../Common/CustomBottomSheetFlatList';
import CustomButton from '../Common/CustomButton';
import CustomInput from '../Common/CustomInput';
import LoadingScreen from '../Common/Loader';
import MediaPreviewModal from '../Common/MediaPreviewModal';

const MessageListComponent = ({Mobile_No, title, unreadMessages}) => {
  //ref
  const tamplateBottomSheetRef = useRef(null);
  const messageBottomSheetRef = useRef(null);
  const createActionBottomSheetRef = useRef(null);
  const getActionBottomSheetRef = useRef(null);
  const createNewActionBottomSheetRef = useRef(null);

  const socket = getSocket();

  const {theme} = useTheme();
  const isDarkMode = theme === THEME_COLOR;
  const selectedDomain = useAppSelector(
    state => state?.domains?.selectedDomain?.domain,
  );

  const [messageBottomSheetData, setMessageBottomSheetData] = useState([]);
  // loading item id for keyword message
  const [loadingItemId, setLoadingItemId] = useState(null);

  const [state, setState] = useState({
    // Existing state properties
    data: [],
    currentPage: 1,
    hasMoreData: true,
    loadingMore: false,
    loading: false,
    message: '',
    inputHeight: 40,
    maxTextInputHeight: 100,
    isMarkAsRead: !!unreadMessages,
    isSessionExpired: false,
    replyingMessage: {
      message: '',
      attach: null,
      message_id: null,
    },
    isReplyingMessage: false,
    whatsAppMessageKeywordDocType: '',
    selectedMessages: [],
    selectedMessageForAction: null,
    setSelectedMessages: [],
    isToolBarVisible: false,
    showPreviewModal: false,
    isDeleteMode: false,
    isClearChat: false,
    isChatToolBarOptionModalVisible: false,
    loadingDocName: null,
    isSubscribe: false,
    modalMessage: '',
    confirmationModalDocument: false,
    previewMedia: {},
    sendDocumentState: {},
    // Add this new state property
    openChatTemplate: false,

    activeQuery: '',

    // create action
    openCreateAction: false,
    nextActions: [],
    nextAction: null,
    actionName: '',
    isAddActionLoading: false,
    isCreateNewActionLoading: false,
  });

  // Destructure commonly used state
  const {
    data,
    currentPage,
    message,
    inputHeight,
    isMarkAsRead,
    isSessionExpired,
    replyingMessage,
    isReplyingMessage,
    selectedMessages,
    isToolBarVisible,
    isChatToolBarOptionModalVisible,
    openCreateAction,
    nextActions,
    nextAction,
    actionName,
    isAddActionLoading,
    isCreateNewActionLoading,
  } = state;

  const options = [
    {
      name: 'Template',
      icon: SvgIcon.TemplateIcon,
      action: () => {
        setState(prev => ({...prev, openChatTemplate: false}));
        if (tamplateBottomSheetRef.current) {
          tamplateBottomSheetRef.current.present();
        }
      },
      iconColor: colors.orange800,
    },
    {
      name: 'Document',
      icon: SvgIcon.Document,
      action: async () => {
        try {
          const result = await pickAndSendMediaMessage();
          setState(prev => ({...prev, openChatTemplate: false}));

          if (result.status === 'success') {
            setState(prev => ({
              ...prev,
              confirmationModalDocument: true,
              sendDocumentState: {
                mobile_no: Mobile_No,
                content_type: result?.data?.fileExtension,
                file_data: result?.data?.base64String,
                file_name: result?.data?.name,
              },
            }));
          }
        } catch (error) {
          console.error('Document error:', error);
          CommonToastMessage('error', 'Failed to process document');
        }
      },
      iconColor: colors.red800,
    },
    {
      name: 'Gallery',
      icon: SvgIcon.Gallery,
      action: async () => {
        try {
          const result = await pickAndSendMediaMessage();
          setState(prev => ({...prev, openChatTemplate: false}));

          if (result.status === 'success') {
            setState(prev => ({
              ...prev,
              showPreviewModal: true,
              previewMedia: {
                fileExtension: result?.data?.fileExtension,
                base64String: result?.data?.base64String,
                name: result?.data?.name,
                uri: result?.data?.uri,
              },
            }));
          }
        } catch (error) {
          console.error('Gallery error:', error);
          CommonToastMessage('error', 'Failed to process media');
        }
      },
      iconColor: colors.purple800,
    },
    {
      name: 'Message',
      icon: SvgIcon.ChatIcon,
      action: () => {
        setState(prev => ({...prev, openChatTemplate: false}));
        if (messageBottomSheetRef.current) {
          messageBottomSheetRef.current.present();
          // Reset data states
          optionDataReset();
          interactiveDataReset();
          flowDataReset();
          keywordDataReset();
        }
      },
      iconColor: colors.green800,
    },
  ];

  // query map
  const queryMap = {
    WhatsApp_Keyword_Message: {
      fetch: () => fetchKeywordMessages(),
      data: keywordData,
      isLoading: isKeywordLoading,
      reset: keywordDataReset,
    },
    WhatsApp_Flow: {
      fetch: () => fetchFlows(),
      data: flowData,
      isLoading: isFlowLoading,
      reset: flowDataReset,
    },
    WhatsApp_Interactive_Message: {
      fetch: () => fetchInteractiveMessages(),
      data: interactiveData,
      isLoading: isInteractiveLoading,
      reset: interactiveDataReset,
    },
    WhatsApp_Option_Message: {
      fetch: () => fetchOptionMessages(),
      data: optionData,
      isLoading: isOptionLoading,
      reset: optionDataReset,
    },
  };

  const [alldeleteChat] = useAlldeleteChatMutation();
  const {
    data: chatData,
    isLoading,
    refetch: refetchChat,
  } = useGetAllChatQuery(
    {
      page: currentPage,
      limit: 20,
      mobile: Mobile_No,
    },
    {
      skip: !Mobile_No,
      refetchOnMountOrArgChange: true,
    },
  );
  const [triggerGetMessages] = useLazyGetAllMessageListQuery();
  const [deleteChats] = useDeleteChatsMutation();
  const [chatsMarkAsRead] = useLazyChatMarkAsReadQuery();
  const [sendOutGoingTextMessage] = useSendOutGoingTextMessageMutation();
  const [sendOutGoingMediaMessage] = useSendOutGoingMediaMessageMutation();
  const [addActionToWaMessage] = useAddActionToWaMessageMutation();
  const [getNextActions] = useLazyGetNextActionsQuery();

  const [
    fetchOptionMessages,
    {data: optionData, isLoading: isOptionLoading, reset: optionDataReset},
  ] = useLazyGetWhatsAppOptionMessagesQuery();

  const [
    fetchInteractiveMessages,
    {
      data: interactiveData,
      isLoading: isInteractiveLoading,
      reset: interactiveDataReset,
    },
  ] = useLazyGetWhatsAppInteractiveMessagesQuery();

  const [
    fetchFlows,
    {data: flowData, isLoading: isFlowLoading, reset: flowDataReset},
  ] = useLazyGetWhatsAppFlowsQuery();

  const [
    fetchKeywordMessages,
    {data: keywordData, isLoading: isKeywordLoading, reset: keywordDataReset},
  ] = useLazyGetWhatsAppMessageKeywordListQuery();
  const [createNewAction] = useCreateNewActionMutation();

  // Update when chatData changes
  useEffect(() => {
    if (!!chatData?.data?.paginated_messages) {
      setState(prev => ({
        ...prev,
        data:
          currentPage === 1
            ? chatData.data.paginated_messages
            : [...prev.data, ...chatData.data.paginated_messages],
        hasMoreData: chatData.data.paginated_messages.length === 20,
        loadingMore: false,
        isSessionExpired:
          chatData?.interactive_message === 'Yes' ? true : false,
      }));
    } else {
      setState(prev => ({
        ...prev,
        data: [],
        hasMoreData: false,
        loadingMore: false,
        isSessionExpired:
          chatData?.interactive_message === 'Yes' ? true : false,
      }));
    }
  }, [chatData]);

  // Simplified load more handler
  const handleLoadMore = useCallback(() => {
    const {hasMoreData, loadingMore} = state;

    if (!loadingMore && hasMoreData) {
      setState(prev => ({
        ...prev,
        currentPage: prev.currentPage + 1,
        loadingMore: true,
      }));
    }
  }, [state]);

  // handle clear chat
  const handleClearChat = () => {
    setState(prev => ({
      ...prev,
      isClearChat: true,
    }));
  };

  // handle confirm clear chat
  const handleComfirmClearChat = async () => {
    try {
      const res = await alldeleteChat({contacts: [title]});
      const allChatDeleteResponse = res?.data;
      console.log(allChatDeleteResponse);

      if (allChatDeleteResponse?.status_code === 200) {
        CommonToastMessage('success', allChatDeleteResponse?.message);
        setState(prev => ({
          ...prev,
          isClearChat: false,
          data: [],
          currentPage: 1,
          hasMoreData: true,
          loadingMore: false,
          isMarkAsRead: false,
        }));
        triggerGetMessages({
          page: 1,
          page_size: 20,
        });
      }
    } catch (error) {
      console.log(error);
      setState(prev => ({
        ...prev,
        isClearChat: false,
      }));
    }
  };

  // handle cancle clear chat
  const handleCancleClearChat = () => {
    setState(prev => ({
      ...prev,
      isClearChat: false,
    }));
  };

  // handle swipe to reply
  const handleSwipeToReply = message => {
    setState(prev => ({
      ...prev,
      isReplyingMessage: true,
      replyingMessage: message,
    }));
  };

  // List Empty Component
  const ListEmptyComponent = (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <TextComponent
        text="No messages available."
        font={fontNames.ROBOTO_FONT_FAMILY_MEDIUM}
        color={isDarkMode ? Colors.dark.black : Colors.light.white}
        textAlign={'center'}
      />
    </View>
  );

  // handle common tool bar left icon press
  const handleCommonToolBarLeftIconPres = () => {
    setState(prev => ({
      ...prev,
      selectedMessages: [],
      isToolBarVisible: false,
    }));
  };
  // handle common tool bar right icon press
  const handleCommonToolBarRightIconPress = index => {
    const actions = {
      0: () => handleDeletePress(),
      1: () => handleCreatePress(),
    };

    const action = actions[index];
    if (action) {
      action();
    }
  };
  // handle delete press
  const handleDeletePress = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDeleteMode: true,
    }));
  }, []);

  // handle cancel delete press
  const handleConfirmDeletePress = useCallback(async () => {
    try {
      const names = state.selectedMessages.reduce((acc, {name}) => {
        acc.push(name);
        return acc;
      }, []);
      const res = await deleteChats({record_names: names});
      const deleteResponse = res?.data;
      console.log(res);

      setState(prev => ({
        ...prev,
        selectedMessages: [],
        isToolBarVisible: false,
        isDeleteMode: false,
        data: state.data.filter(message => !names.includes(message.name)),
      }));

      if (deleteResponse?.status_code === 200) {
        CommonToastMessage('success', deleteResponse.message);
        refetchChat();
      }
    } catch (error) {
      console.error('Delete error:', error);
      setState(prev => ({
        ...prev,
        isDeleteMode: false,
      }));
    }
  }, [state.selectedMessages, refetchChat]);

  // handle cancel delete press
  const handleCancelDeletePress = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedMessages: [],
      isToolBarVisible: false,
      isDeleteMode: false,
    }));
  }, []);

  // handle common header right icon press
  const handleCommoneHeaderRightIconPress = index => {
    const actions = {
      0: () => refetchChat(),
      1: () =>
        setState(prev => ({
          ...prev,
          isChatToolBarOptionModalVisible:
            !prev.isChatToolBarOptionModalVisible,
        })),
    };
    const action = actions[index];
    if (action) {
      action();
    }
  };

  // handle mark as read
  const handleMarkAsRead = async () => {
    try {
      const res = await chatsMarkAsRead({
        number: Mobile_No,
      });
      const markAsReadResponse = res?.data;
      if (markAsReadResponse?.status_code === 200) {
        setState(prev => ({
          ...prev,
          isMarkAsRead: false,
        }));
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };
  // handle cancel reply
  const handleCancelReply = () => {
    setState(prev => ({
      ...prev,
      isReplyingMessage: false,
      replyingMessage: {
        message: '',
        attach: null,
        message_id: null,
      },
    }));
  };
  // handle send message
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const payload = {
        mobile_no: Mobile_No,
        message,
        ...(isReplyingMessage && {
          reply_to_message_id: replyingMessage.message_id,
          is_reply: 1,
        }),
      };

      // Clear message and reply state before sending
      setState(prev => ({
        ...prev,
        message: '',
        isReplyingMessage: false,
        replyingMessage: {
          message: '',
          attach: null,
          message_id: null,
        },
      }));

      const response = await sendOutGoingTextMessage(payload);
      const sendResponse = response?.data;

      if (sendResponse?.status_code === 500) {
        setState(prev => ({
          ...prev,
          modalMessage: sendResponse?.message,
          isSubscribe: true,
        }));
        return;
      }

      // Optionally refresh the chat list after successful send
      refetchChat();
    } catch (error) {
      console.error('Error sending message:', error);
      CommonToastMessage('error', error?.message || 'Failed to send message');
    }
  };
  // handle chat template modal
  const handleChatTemplateModal = () => {
    if (tamplateBottomSheetRef.current) {
      tamplateBottomSheetRef.current.present();
    }
  };
  // Handle chat option modal
  const handleChatOption = () => {
    // Reset all data states
    const resetAllStates = () => {
      // Reset query data
      optionDataReset?.();
      interactiveDataReset?.();
      flowDataReset?.();
      keywordDataReset?.();

      // Reset bottom sheet data
      setMessageBottomSheetData([]);
      setLoadingItemId(null);

      // Reset active states
      setState(prev => ({
        ...prev,
        whatsAppMessageKeywordDocType: '',
        activeQuery: '',
        openChatTemplate: false,
      }));
    };

    // Toggle chat template and reset states
    setState(prev => {
      // If we're opening the template, reset everything
      if (!prev.openChatTemplate) {
        resetAllStates();
      }
      return {
        ...prev,
        openChatTemplate: !prev.openChatTemplate,
      };
    });

    // Close any open bottom sheets
    if (messageBottomSheetRef.current) {
      messageBottomSheetRef.current.dismiss();
    }
    if (tamplateBottomSheetRef.current) {
      tamplateBottomSheetRef.current.dismiss();
    }
  };
  // handle confirm attach photo
  const handleConfirmAttachPhoto = useCallback(async () => {
    try {
      const payload = {
        mobile_no: Mobile_No,
        content_type: state.previewMedia.fileExtension,
        file_data: state.previewMedia.base64String,
        file_name: state.previewMedia.name,
      };
      if (replyingMessage?.message_id) {
        payload.reply_to_message_id = replyingMessage.message_id;
        payload.is_reply = 1;
      }
      const res = await sendOutGoingMediaMessage(payload);
      const sendResponse = res?.data;
      console.log(sendResponse);

      if (sendResponse?.status_code === 500) {
        setState(prev => ({
          ...prev,
          modalMessage: sendResponse?.message,
          isSubscribe: true,
        }));
        return;
      }

      if (sendResponse?.status_code === 200) {
        CommonToastMessage('success', 'Media sent successfully');
      } else {
        CommonToastMessage(
          'error',
          sendResponse?.message || 'Failed to send media',
        );
      }
    } catch (error) {
      console.error('Error sending photo:', error);
      CommonToastMessage('error', 'Failed to send photo');
    } finally {
      setState(prev => ({
        ...prev,
        showPreviewModal: false,
        previewMedia: {},
        isReplyingMessage: false,
        replyingMessage: {
          message: '',
          attach: null,
          message_id: null,
        },
      }));
    }
  }, [state.previewMedia, replyingMessage, Mobile_No]);

  // Cancel Attach Photo
  const handleCancelAttachPhoto = useCallback(() => {
    setState(prev => ({
      ...prev,
      showPreviewModal: false,
      previewMedia: {},
    }));
  }, [state.previewMedia]);

  // Message Bottom Sheet Item
  const renderMessageBottomSheetItem = useCallback(
    ({item}) => (
      <View style={styles.whatsAppMessageKeyWordListContainer}>
        <TextComponent
          text={
            item?.name.replace(/_/g, ' ').length > 25
              ? `${item?.name.replace(/_/g, ' ').slice(0, 25)}...`
              : item?.name.replace(/_/g, ' ')
          }
          font={fontNames.ROBOTO_FONT_FAMILY_MEDIUM}
          color={Colors.default.black}
        />
        <CustomButton
          title={'Send'}
          onPress={() => handleSendWhatsAppMessageKeyWord(item?.name, item?.id)}
          isLoading={loadingItemId === item?.id}
          gradientColors={['#fff', '#fff']}
          textColor={Colors.default.black}
        />
      </View>
    ),
    [loadingItemId],
  );

  const handleSendWhatsAppMessageKeyWord = async (keyword, itemId) => {
    setLoadingItemId(itemId);
    try {
      const payload = {
        mobile_no: Mobile_No,
        message: keyword,
      };

      const response = await sendOutGoingTextMessage(payload).unwrap();
      if (response?.status_code === 200) {
        CommonToastMessage('success', 'Message sent successfully');
        messageBottomSheetRef.current?.dismiss();
      } else {
        throw new Error(response?.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending keyword message:', error);
      CommonToastMessage('error', error.message || 'Failed to send message');
    } finally {
      setLoadingItemId(null);
    }
  };

  // Message Bottom Sheet List Item
  const handleSelection = async (docType, index) => {
    try {
      const originalDocType = docType.replace(/_/g, ' ');
      setState(prev => ({
        ...prev,
        whatsAppMessageKeywordDocType: originalDocType,
      }));
      setState(prev => ({
        ...prev,
        activeQuery: docType,
      }));

      const queryHandler = queryMap[docType];
      if (!queryHandler) {
        throw new Error(`No query handler found for type: ${docType}`);
      }

      const response = await queryHandler.fetch();

      if (response?.data?.data) {
        setMessageBottomSheetData(response.data.data);
      } else {
        console.warn('No data in response:', response);
        setMessageBottomSheetData([]);
      }
    } catch (error) {
      console.error(`Error fetching ${docType}:`, error);
      CommonToastMessage('error', `Failed to fetch ${docType}`);
      setMessageBottomSheetData([]);
    } finally {
      setLoadingItemId(null);
    }
  };
  // Message Bottom Sheet List Empty Component
  const messageBottomSheetListEmptyComponent = () => {
    if (loadingItemId) {
      return <LoadingScreen />;
    }
    return (
      <View style={styles.chatOptionContainer}>
        {QUERY_TYPES.map((docType, index) => (
          <CustomButton
            key={index}
            title={docType.split('_')[1]}
            onPress={() => handleSelection(docType, index)}
            buttonStyle={{marginVertical: spacing.MARGIN_12}}
          />
        ))}
      </View>
    );
  };
  // Handle Confirm Attach Document
  const handleConfirmAttachDocument = async () => {
    try {
      const res = await sendOutGoingMediaMessage(state.sendDocumentState);
      const sendResponse = res?.data;
      console.log(sendResponse);

      if (sendResponse?.status_code === 500) {
        CommonToastMessage('error', sendResponse?.message);
        setState(prev => ({
          ...prev,
          modalMessage: sendResponse?.message,
          isSubscribe: true,
          openChatTemplate: false,
        }));
        return;
      }
      if (sendResponse?.status_code === 200) {
        CommonToastMessage('success', 'Document sent successfully');
      }
    } catch (error) {
      console.error('Error sending document:', error);
      setState(prev => ({
        ...prev,
        openChatTemplate: false,
      }));
    } finally {
      setState(prev => ({
        ...prev,
        confirmationModalDocument: false,
        openChatTemplate: false,
        sendDocumentState: {},
      }));
      refetchChat();
    }
  };
  // Cancel Attach Document
  const handleCancelAttachDocument = () => {
    setState(prev => ({
      ...prev,
      confirmationModalDocument: false,
      sendDocumentState: {},
    }));
  };
  // handle Icon create press
  const handleCreatePress = () => {
    if (createActionBottomSheetRef.current) {
      createActionBottomSheetRef.current.present();
    }
  };

  // handle get next actions
  const handleGetNextActions = async () => {
    const response = await getNextActions().unwrap();
    setState(prev => ({...prev, nextActions: response.data}));
    if (getActionBottomSheetRef.current) {
      getActionBottomSheetRef.current.present();
    }
  };

  // handle add action
  const handleAddAction = async () => {
    try {
      setState(prev => ({...prev, isAddActionLoading: true}));
      const payload = {
        name: selectedMessages[0]?.name,
        action: state.nextAction,
        status_date: '',
      };
      const response = await addActionToWaMessage(payload).unwrap();

      if (response?.status_code === 200) {
        CommonToastMessage('success', 'Action added successfully');
        refetchChat();
        if (createActionBottomSheetRef.current) {
          createActionBottomSheetRef.current.dismiss();
        }
        setState(prev => ({...prev, nextAction: ''}));
        setState(prev => ({...prev, selectedMessageForAction: null}));
        setState(prev => ({...prev, selectedMessages: []}));
        setState(prev => ({...prev, isToolBarVisible: false}));
      } else {
        CommonToastMessage(
          'error',
          response?.message || 'Failed to add action',
        );
      }
    } catch (error) {
      console.error('Error adding action:', error);
      CommonToastMessage('error', error?.message || 'Failed to add action');
    } finally {
      setState(prev => ({...prev, isAddActionLoading: false}));
    }
  };
  // handle add action
  const handleAddActionPress = () => {
    if (createNewActionBottomSheetRef.current) {
      createNewActionBottomSheetRef.current.present();
    }
  };

  // handle create action
  const renderCreateActionItem = () => {
    return (
      <View style={styles.createActionContainer}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View />
          <TextComponent
            text="Create Action"
            color={isDarkMode ? Colors.dark.black : Colors.light.white}
            font={fontNames.ROBOTO_FONT_FAMILY_BOLD}
            textAlign={'center'}
          />
          <TouchableOpacity onPress={handleAddActionPress}>
            <SvgIcon.AddICon
              color={isDarkMode ? Colors.dark.black : Colors.light.white}
            />
          </TouchableOpacity>
        </View>
        <TextComponent
          text="Selected Message"
          color={isDarkMode ? Colors.dark.black : Colors.light.white}
          style={{marginLeft: spacing.MARGIN_6}}
        />
        <View
          style={{
            marginVertical: spacing.MARGIN_12,
            backgroundColor: isDarkMode
              ? Colors.light.white
              : Colors.dark.black,
            padding: spacing.PADDING_16,
            borderRadius: spacing.RADIUS_8,
            borderWidth: 1,
            borderColor: isDarkMode ? Colors.dark.black : Colors.light.white,
            opacity: 0.9,
          }}>
          <TextComponent
            text={truncateText(state.selectedMessageForAction?.message, 100)}
            color={!isDarkMode ? Colors.light.white : Colors.dark.black}
            lineHeight={20}
            font={fontNames.ROBOTO_FONT_FAMILY_REGULAR}
          />
        </View>
        <CustomInput
          label="Action"
          value={state.nextAction}
          editable={false}
          placeholder="Tap to select action"
          style={{marginBottom: spacing.MARGIN_10}}
          onPressTextInput={handleGetNextActions}
          SecondChildren={
            state.nextAction && (
              <TouchableOpacity
                onPress={() => setState(prev => ({...prev, nextAction: ''}))}>
                <SvgIcon.Wrong
                  color={isDarkMode ? Colors.dark.black : Colors.light.white}
                  height={spacing.HEIGHT_20}
                  width={spacing.WIDTH_20}
                />
              </TouchableOpacity>
            )
          }
          showSecondChildren={true}
          required={true}
          inputStyles={{
            color: isDarkMode ? Colors.dark.black : Colors.light.white,
          }}
        />
        <CustomButton
          title="Add Action"
          onPress={handleAddAction}
          isLoading={state.isAddActionLoading}
          disabled={!state.nextAction}
        />
      </View>
    );
  };
  // handle get next action
  const handleGetNextAction = async item => {
    setState(prev => ({...prev, nextAction: item}));
    if (getActionBottomSheetRef.current) {
      getActionBottomSheetRef.current.dismiss();
    }
  };
  // handle get next action item
  const renderGetNextActionItem = item => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.getNextActionContainer}
        onPress={() => handleGetNextAction(item?.action)}>
        <TextComponent
          text={item?.action}
          font={fontNames.ROBOTO_FONT_FAMILY_MEDIUM}
          style={{marginBottom: spacing.MARGIN_10}}
          color={isDarkMode ? Colors.dark.black : Colors.light.white}
          textAlign={'center'}
        />
      </TouchableOpacity>
    );
  };
  // handle get next action list empty component
  const renderGetNextActionListEmptyComponent = () => {
    return (
      <View style={styles.emptyActionText}>
        <TextComponent text="No actions found" />
      </View>
    );
  };

  // handle create new action
  const handleCreateNewAction = async () => {
    try {
      setState(prev => ({...prev, isCreateNewActionLoading: true}));
      const payload = {
        action_name: state.actionName,
      };
      const response = await createNewAction(payload).unwrap();
      console.log(response);
      if (response?.status_code === 200) {
        getNextActions();
        CommonToastMessage('success', 'Action created successfully');
        if (createNewActionBottomSheetRef.current) {
          createNewActionBottomSheetRef.current.dismiss();
        }
        setState(prev => ({...prev, actionName: ''}));
      } else {
        throw new Error(response?.message || 'Failed to create new action');
      }
    } catch (error) {
      console.error('Error creating new action:', error);
      CommonToastMessage(
        'error',
        error?.message || 'Failed to create new action',
      );
    } finally {
      setState(prev => ({...prev, isCreateNewActionLoading: false}));
    }
  };

  // handle create new action
  const renderCreateNewActionItem = () => {
    return (
      <View style={{paddingHorizontal: spacing.PADDING_20}}>
        <TextComponent
          text="Create New Action"
          font={fontNames.ROBOTO_FONT_FAMILY_BOLD}
          color={isDarkMode ? Colors.dark.black : Colors.light.white}
          textAlign={'center'}
          style={{marginBottom: spacing.MARGIN_10}}
        />
        <CustomInput
          label="Action Name"
          value={actionName}
          placeholder="Enter Action Name"
          onChange={text => setState(prev => ({...prev, actionName: text}))}
          style={{marginBottom: spacing.MARGIN_10}}
          required={true}
          inputStyles={{
            color: isDarkMode ? Colors.dark.black : Colors.light.white,
          }}
        />
        <CustomButton
          title="Create Action"
          onPress={handleCreateNewAction}
          isLoading={state.isCreateNewActionLoading}
          disabled={!state.actionName}
        />
      </View>
    );
  };

  // useEffect(() => {
  //   if (!socket || !socket.connected) return;

  //   const handleNewMessage = (message) => {
  //     updateState(prev => ({
  //       data: prev.data.some(msg => msg.message_id === message.message_id)
  //         ? prev.data
  //         : [...prev.data, message]
  //     }));
  //   };

  //   socket.on(MESSAGE_RECEIVED_EVENT, handleNewMessage);
  //   return () => socket.off(MESSAGE_RECEIVED_EVENT, handleNewMessage);
  // }, [socket]);

  return (
    <>
      <MessageHeader
        title={title}
        Mobile_No={Mobile_No}
        isToolBarVisible={isToolBarVisible}
        selectedMessages={selectedMessages}
        onBackPress={handleCommonToolBarLeftIconPres}
        onRightIconPressToolBar={handleCommonToolBarRightIconPress}
        onRightIconPressHeader={handleCommoneHeaderRightIconPress}
        isSelectedMessageForAction={state.selectedMessages.length > 1}
      />
      <View style={{flex: 1}}>
        <MessageListContent
          data={state.data}
          loading={isLoading}
          loadingMore={state.loadingMore}
          selectedMessages={state.selectedMessages}
          setSelectedMessages={messages =>
            setState(prev => ({
              ...prev,
              selectedMessages: messages,
              isToolBarVisible: messages.length > 0,
            }))
          }
          // onMessageSelect={handleMessageSelect}
          onSwipeToReply={handleSwipeToReply}
          onLoadMore={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={ListEmptyComponent}
          selectedDomain={selectedDomain}
          setSelectedMessageForAction={value =>
            setState(prev => ({...prev, selectedMessageForAction: value}))
          }
        />
      </View>
      <MessageInput
        isDarkMode={isDarkMode}
        isMarkAsRead={isMarkAsRead}
        isSessionExpired={isSessionExpired}
        isReplyingMessage={isReplyingMessage}
        replyingMessage={replyingMessage}
        message={message}
        inputHeight={inputHeight}
        selectedDomain={selectedDomain}
        onMarkAsReadPress={handleMarkAsRead}
        onChatOptionPress={handleChatOption}
        onCancelReply={handleCancelReply}
        onMessageChange={text => setState(prev => ({...prev, message: text}))}
        onSendMessage={handleSendMessage}
        onTemplatePress={handleChatTemplateModal}
        setInputHeight={height =>
          setState(prev => ({...prev, inputHeight: height}))
        }
        onReplyPress={() => setState(prev => ({...prev, isMarkAsRead: false}))}
      />
      {/* Add the confirmation modal */}
      <CommonPopupModal
        isVisible={state.isClearChat}
        message="Are you sure you want to clear this chat?"
        buttons={[
          {
            text: 'Cancel',
            color: colors.red600,
            onPress: handleCancleClearChat,
          },
          {
            text: 'Confirm',
            color: colors.green600,
            onPress: handleComfirmClearChat,
          },
        ]}
      />

      <AnimatedModal
        isVisible={state.isChatToolBarOptionModalVisible}
        close={() =>
          setState(prev => ({
            ...prev,
            isChatToolBarOptionModalVisible: false,
          }))
        }
        animationType="none"
        top={spacing.HEIGHT_60}
        right={spacing.WIDTH_10}
        modalStyle={{
          borderRadius: spacing.RADIUS_6,
          backgroundColor: isDarkMode ? colors.white : colors.black,
          paddingHorizontal: spacing.PADDING_20,
        }}>
        <TouchableOpacity onPress={handleClearChat}>
          <TextComponent
            text={'clear chat'}
            font={fontNames.ROBOTO_FONT_FAMILY_BOLD}
            color={isDarkMode ? Colors.dark.black : Colors.light.white}
          />
        </TouchableOpacity>
      </AnimatedModal>

      {/* Delete Confirmation Modal */}
      <CommonPopupModal
        isVisible={state.isDeleteMode}
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
      {/* BottomSheet for WhatsApp Template */}
      <TemaplateItemColum
        Mobile_No={Mobile_No}
        templateBottomSheetRef={tamplateBottomSheetRef}
      />
      {/* Chat Option Modal */}
      <AnimatedModal
        isVisible={state.openChatTemplate}
        close={() => setState(prev => ({...prev, openChatTemplate: false}))}
        animationType="bottom-to-top"
        bottom={spacing.HEIGHT_56}
        left={spacing.WIDTH_10}
        right={spacing.WIDTH_10}
        modalStyle={{
          elevation: 0,
          backgroundColor: isDarkMode ? colors.grey600 : colors.grey900,
        }}>
        <View style={styles.optionGrid}>
          {options.map((option, index) => (
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
              <TextComponent
                text={option.name}
                color={isDarkMode ? Colors.dark.black : Colors.light.white}
                textAlign={'center'}
                size={textScale(12)}
                font={fontNames.ROBOTO_FONT_FAMILY_BOLD}
              />
            </TouchableOpacity>
          ))}
        </View>
      </AnimatedModal>

      {/* Message Bottom Sheet */}
      <CustomBottomSheetFlatList
        ref={messageBottomSheetRef}
        snapPoints={['40%', '80%']}
        data={messageBottomSheetData}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        renderItem={renderMessageBottomSheetItem}
        ListEmptyComponent={messageBottomSheetListEmptyComponent}
        contentContainerStyle={{paddingBottom: spacing.PADDING_20}}
      />

      {/* Preview modal */}
      <MediaPreviewModal
        visible={state.showPreviewModal}
        media={state?.previewMedia}
        onConfirm={handleConfirmAttachPhoto}
        onCancel={handleCancelAttachPhoto}
      />

      <CommonPopupModal
        isVisible={state.confirmationModalDocument}
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
      <CustomBottomSheetFlatList
        ref={createActionBottomSheetRef}
        snapPoints={['40%', '80%']}
        data={[1]}
        keyExtractor={index => index.toString()}
        renderItem={renderCreateActionItem}
        contentContainerStyle={{paddingBottom: spacing.PADDING_20}}
      />
      {/* Get Next Action Modal */}
      <CustomBottomSheetFlatList
        ref={getActionBottomSheetRef}
        snapPoints={['40%', '80%']}
        data={nextActions}
        keyExtractor={(item, index) =>
          item?.name?.toString() || index.toString()
        }
        renderItem={({item}) => renderGetNextActionItem(item)}
        ListEmptyComponent={renderGetNextActionListEmptyComponent}
        contentContainerStyle={{paddingBottom: spacing.PADDING_20}}
      />
      <CustomBottomSheetFlatList
        ref={createNewActionBottomSheetRef}
        snapPoints={['40%']}
        data={[1]}
        renderItem={renderCreateNewActionItem}
        contentContainerStyle={{paddingBottom: spacing.PADDING_20}}
      />
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
    width: '25%',
  },
  optionText: {
    fontSize: textScale(12),
    textAlign: 'center',
    fontFamily: fontNames.POPPINS_FONT_FAMILY_BOLD,
  },
  createActionContainer: {
    paddingHorizontal: spacing.PADDING_16,
    paddingVertical: spacing.PADDING_10,
    borderRadius: spacing.RADIUS_8,
  },
  getNextActionContainer: {
    paddingHorizontal: spacing.PADDING_16,
    paddingVertical: spacing.PADDING_10,
    borderRadius: spacing.RADIUS_12,
    backgroundColor: colors.green200,
    marginVertical: spacing.MARGIN_6,
    marginHorizontal: spacing.MARGIN_16,
  },
  emptyActionText: {
    fontSize: textScale(16),
    color: colors.black,
    textAlign: 'center',
    marginTop: spacing.MARGIN_16,
  },
});
