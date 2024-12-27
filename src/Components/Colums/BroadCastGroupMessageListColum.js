import React, {useRef, useState} from 'react';
import {
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useGetBroadCastGroupQuery} from '../../api/store/slice/broadCastGroupSlice';
import {
  useFetchMessageStatusAndDetailsQuery,
  useLazyFetchBroadCastMessageTemplateQuery,
} from '../../api/store/slice/broadCastMessageSlice';
import * as SvgIcon from '../../assets';
import NavigationString from '../../Navigations/NavigationString';
import {textScale, width} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import {goBack, navigate} from '../../Utils/helperFunctions';
import AnimatedModal from '../Common/AnimatedModal';
import BottonComp from '../Common/BottonComp';
import CustomHeader from '../Common/CommoneHeader';
import CustomBottomSheet from '../Common/CustomBottomSheet';
import CustomBottomSheetFlatList from '../Common/CustomBottomSheetFlatList';
import LoadingScreen from '../Common/Loader';
import RegularText from '../Common/RegularText';
import {useTheme} from '../hooks';
import {useAppSelector} from '../hooks/index';
import CustomButton from '../Common/CustomButton';
import CustomInput from '../Common/CustomInput';
import {BottomSheetView} from '@gorhom/bottom-sheet';
import TextComponent from '../Common/TextComponent';

const SelectHeaderName = ({
  selectedBroadCastMessageData,
  setSelectedBroadCastMessageData,
  theme,
}) => {
  return (
    <CustomInput
      placeholder={'Enter Header Name'}
      value={selectedBroadCastMessageData.header_name}
      onChange={text => {
        setSelectedBroadCastMessageData(prev => ({
          ...prev,
          header_name: text,
        }));
      }}
      inputStyles={{
        color: theme === THEME_COLOR ? colors.black : colors.white,
      }}
      label="Header Name"
    />
  );
};

const BroadcastMessagesList = ({route}) => {
  const {theme} = useTheme();
  const sendBroadCastRef = useRef(null);
  const selectTempleteRef = useRef(null);
  const {groupName} = route?.params;
  const {data, isLoading, isError, refetch} = useGetBroadCastGroupQuery();
  const [
    fetchBroadCastMessageTemplate,
    {
      data: BroadCastMessageTemplate,
      isLoading: BroadCastMessageTemplateIsLoading,
      error,
    },
  ] = useLazyFetchBroadCastMessageTemplateQuery();
  
  const [selectedBroadCastMessageData, setSelectedBroadCastMessageData] =
    useState({
      template: '',
      whenToSend: '',
      iswhenToSendModalShow: false,
      mediaTypeModal: false,
      mediaType: '',
      header_name: '',
    });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <LoadingScreen color={colors.green} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <RegularText style={[styles.errorText]}>
          Failed to load messages. Please try again.
        </RegularText>
      </View>
    );
  }

  const messageList = data?.data.find(group => group.name === groupName);

  const SelectMessageTemplateName = () => {
    return (
      <CustomInput
        placeholder={
          selectedBroadCastMessageData.template?.actual_name || 'Select'
        }
        onPressTextInput={() => {
          setSelectedBroadCastMessageData(pre => ({...pre, template: ''}));
          selectTempleteRef.current?.present();
        }}
        editable={false}
        inputStyles={{
          color: theme === THEME_COLOR ? colors.black : colors.white,
        }}
        label="Select Message Template"
        multiline
      />
    );
  };

  const SelectWhenToSendMessageTemplate = () => {
    return (
      <CustomInput
        placeholder={selectedBroadCastMessageData.whenToSend || 'Select'}
        onPressTextInput={() => {
          setSelectedBroadCastMessageData(pre => ({...pre, whenToSend: ''})),
            setSelectedBroadCastMessageData(pre => ({
              ...pre,
              iswhenToSendModalShow:
                !selectedBroadCastMessageData.iswhenToSendModalShow,
            }));
        }}
        editable={false}
        inputStyles={{
          color: theme === THEME_COLOR ? colors.black : colors.white,
        }}
        label=" When to Send"
      />
    );
  };

  const SelectMessageTemplate = () => {
    return (
      <>
        <TextComponent
          text="Message Template"
          color={theme === THEME_COLOR ? colors.black : colors.white}
          style={{marginLeft: spacing.MARGIN_6}}
        />
        <View
          style={{
            marginVertical: spacing.MARGIN_12,
            backgroundColor:
              theme === THEME_COLOR ? colors.grey800 : colors.grey100,
            padding: spacing.PADDING_16,
            borderRadius: spacing.RADIUS_8,
          }}>
          <TextComponent
            text={selectedBroadCastMessageData.template?.template}
            color={theme === THEME_COLOR ? colors.white : colors.black}
            lineHeight={20}
            font={fontNames.ROBOTO_FONT_FAMILY_REGULAR}
          />
        </View>
      </>
    );
  };

  const SelectHeaderType = () => {
    return (
      <CustomInput
        placeholder={selectedBroadCastMessageData.template?.header_type}
        editable={false}
        inputStyles={{
          color: theme === THEME_COLOR ? colors.black : colors.white,
        }}
        label="Header Type"
        multiline
      />
    );
  };

  const SelectMediaType = () => {
    return (
      <CustomInput
        placeholder={selectedBroadCastMessageData.mediaType || 'Select'}
        onPressTextInput={() => {
          setSelectedBroadCastMessageData(pre => ({...pre, whenToSend: ''})),
            setSelectedBroadCastMessageData(pre => ({
              ...pre,
              mediaTypeModal: !selectedBroadCastMessageData.mediaTypeModal,
            }));
        }}
        editable={false}
        inputStyles={{
          color: theme === THEME_COLOR ? colors.black : colors.white,
        }}
        label="Media Type"
      />
    );
  };

  const SelectUploadedHeaderSample = () => {
    return (
      <CustomInput
        placeholder={selectedBroadCastMessageData.mediaType || 'Select'}
        onPressTextInput={() => {
          // setSelectedBroadCastMessageData(pre => ({...pre, whenToSend: ''})),
          //   setSelectedBroadCastMessageData(pre => ({
          //     ...pre,
          //     mediaTypeModal: !selectedBroadCastMessageData.mediaTypeModal,
          //   }));
          console.log('SelectUploadedHeaderSample');
        }}
        editable={false}
        inputStyles={{
          color: theme === THEME_COLOR ? colors.black : colors.white,
        }}
        label="Uploaded Header Sample"
      />
    );
  };
  const SelectMediaID = () => {
    return (
      <CustomInput
        placeholder={selectedBroadCastMessageData.mediaType || 'Select'}
        onPressTextInput={() => {
          // setSelectedBroadCastMessageData(pre => ({...pre, whenToSend: ''})),
          //   setSelectedBroadCastMessageData(pre => ({
          //     ...pre,
          //     mediaTypeModal: !selectedBroadCastMessageData.mediaTypeModal,
          //   }));
          console.log('SelectMediaID');
        }}
        editable={false}
        inputStyles={{
          color: theme === THEME_COLOR ? colors.black : colors.white,
        }}
        label="Media ID"
      />
    );
  };
  const SelectHeaderSample = () => {
    return (
      <CustomInput
        placeholder={selectedBroadCastMessageData.mediaType || 'Select'}
        onPressTextInput={() => {
          // setSelectedBroadCastMessageData(pre => ({...pre, whenToSend: ''})),
          //   setSelectedBroadCastMessageData(pre => ({
          //     ...pre,
          //     mediaTypeModal: !selectedBroadCastMessageData.mediaTypeModal,
          //   }));
          console.log('SelectHeaderSample');
        }}
        editable={false}
        inputStyles={{
          color: theme === THEME_COLOR ? colors.black : colors.white,
        }}
        label="Header Sample"
      />
    );
  };

  const renderSelectTempleteItem = ({item}) => {
    const backgroundColor =
      theme === THEME_COLOR ? colors.grey100 : colors.grey800;
    const textColor = theme === THEME_COLOR ? colors.black : colors.white;
    return (
      <TouchableOpacity
        style={[styles.templateListContainer, {backgroundColor}]}
        onPress={() => {
          setSelectedBroadCastMessageData(prev => ({
            ...prev,
            template: item,
          }));
          selectTempleteRef.current?.dismiss();
        }}>
        <RegularText style={[styles.templateListTextStyle, {color: textColor}]}>
          {item?.actual_name}
        </RegularText>
      </TouchableOpacity>
    );
  };

  const ListHeaderComponentSelectTemplete = () => (
    <RegularText
      style={{
        alignSelf: 'center',
        color: theme === THEME_COLOR ? colors.black : colors.white,
        fontSize: textScale(18),
        fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
      }}>
      Select Template
    </RegularText>
  );

  return (
    <>
      <CustomHeader
        title={groupName}
        showLeftIcon={true}
        leftIcon={SvgIcon.BackIcon}
        onLeftIconPress={goBack}
        showRightIcons={true}
        rightIcons={[SvgIcon.ReloadIcon]}
        onRightIconPress={() => refetch()}
      />
      <View
        style={{
          backgroundColor: theme === THEME_COLOR ? '#f9f9f9' : colors.black,
          flex: 1,
        }}>
        <FlatList
          data={messageList?.brodcasted_records}
          keyExtractor={item => item.name.toString()}
          renderItem={({item}) => <MessageItem message={item} theme={theme} />}
          contentContainerStyle={{paddingBottom: spacing.PADDING_16}}
          ListEmptyComponent={
            <RegularText
              style={[
                styles.errorText,
                {color: theme === THEME_COLOR ? colors.black : colors.white},
              ]}>
              No messages found for {groupName}
            </RegularText>
          }
          inverted
        />

        <BottonComp
          text="Send Message"
          style={styles.createGroupButton}
          textStyle={{color: colors.white, fontSize: textScale(16)}}
          onPress={() => {
            sendBroadCastRef.current?.present(),
              fetchBroadCastMessageTemplate();
          }}
          isLoading={BroadCastMessageTemplateIsLoading}
        />
      </View>
      <CustomBottomSheetFlatList
        ref={sendBroadCastRef}
        snapPoints={['90%']}
        enableDynamicSizing={false}
        data={[1]}
        renderItem={() => (
          <>
            <RegularText
              style={[
                styles.headerTitle,
                {color: theme === THEME_COLOR ? colors.black : colors.white},
              ]}>
              Send WhatsApp Broadcasting to {groupName}
            </RegularText>
            <View
              style={{
                marginHorizontal: spacing.MARGIN_16,
                marginVertical: spacing.MARGIN_12,
              }}>
              <SelectMessageTemplateName />
              <SelectWhenToSendMessageTemplate />
              {selectedBroadCastMessageData.iswhenToSendModalShow && (
                <BottomSheetView
                  style={[
                    styles.optionContainer,
                    {
                      backgroundColor:
                        theme === THEME_COLOR ? colors.grey800 : colors.grey100,
                    },
                  ]}>
                  {['Now', 'Schedule'].map(option => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        setSelectedBroadCastMessageData(prev => ({
                          ...prev,
                          whenToSend: option,
                          iswhenToSendModalShow: false,
                        }));
                      }}
                      style={{
                        paddingVertical: spacing.PADDING_8,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.grey700,
                      }}>
                      <RegularText
                        style={{
                          color:
                            theme === THEME_COLOR ? colors.white : colors.black,
                          textAlign: 'center',
                        }}>
                        {option}
                      </RegularText>
                    </TouchableOpacity>
                  ))}
                </BottomSheetView>
              )}
              <SelectMessageTemplate />
              {!selectedBroadCastMessageData.template && (
                <>
                  <SelectHeaderType />
                  <SelectHeaderName
                    selectedBroadCastMessageData={selectedBroadCastMessageData}
                    setSelectedBroadCastMessageData={
                      setSelectedBroadCastMessageData
                    }
                    theme={theme}
                  />
                  <SelectMediaType />
                </>
              )}
              {selectedBroadCastMessageData.mediaTypeModal && (
                <BottomSheetView
                  style={[
                    styles.optionContainer,
                    {
                      backgroundColor:
                        theme === THEME_COLOR ? colors.grey800 : colors.grey100,
                    },
                  ]}>
                  {['Uploaded to Meta', 'Uploaded Now '].map(option => (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        setSelectedBroadCastMessageData(prev => ({
                          ...prev,
                          mediaType: option,
                          mediaTypeModal: false,
                        }));
                      }}
                      style={{
                        paddingVertical: spacing.PADDING_8,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.grey700,
                      }}>
                      <RegularText
                        style={{
                          color:
                            theme === THEME_COLOR ? colors.white : colors.black,
                          textAlign: 'center',
                        }}>
                        {option}
                      </RegularText>
                    </TouchableOpacity>
                  ))}
                </BottomSheetView>
              )}
              {selectedBroadCastMessageData.mediaType === 'Uploaded to Meta' ? (
                <>
                  <SelectUploadedHeaderSample />
                  <SelectMediaID />
                </>
              ) : (
                <SelectHeaderSample />
              )}
            </View>
          </>
        )}
      />
      <CustomBottomSheetFlatList
        ref={selectTempleteRef}
        snapPoints={['90%']}
        data={BroadCastMessageTemplate?.data}
        renderItem={renderSelectTempleteItem}
        ListHeaderComponent={ListHeaderComponentSelectTemplete}
      />
    </>
  );
};

const MessageItem = ({message, theme}) => {
  const selectedDomain = useAppSelector(
    state => state.domains?.selectedDomain?.domain,
  );

  const {data, isLoading, isError} = useFetchMessageStatusAndDetailsQuery(
    message?.name,
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.messageCard,
          {
            backgroundColor:
              theme === THEME_COLOR ? colors.black : colors.white,
          },
        ]}>
        <RegularText
          style={[
            styles.loadingText,
            {color: theme === THEME_COLOR ? colors.white : colors.black},
          ]}>
          Loading message details...
        </RegularText>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.messageCard}>
        <RegularText style={styles.errorText}>
          Failed to load details for {message.group_name}
        </RegularText>
      </View>
    );
  }

  const statusCount = data?.data?.status_count || {};
  const details = data?.data?.details || [];
  const isImage =
    message?.header_sample?.startsWith('/files/') ||
    /\.(jpeg|jpg|png)$/i.test(message?.header_sample);
  return (
    <View
      style={{
        marginBottom: spacing.PADDING_16,
        maxWidth: '80%',
        alignSelf: 'flex-end',
      }}>
      {isImage && message?.header_sample && (
        <Image
          source={{uri: `${selectedDomain}${message?.header_sample}`}}
          style={{
            width: spacing.WIDTH_105,
            height: spacing.HEIGHT_128,
            resizeMode: 'contain',
            alignSelf: 'center',
          }}
        />
      )}
      <View
        style={[
          styles.messageCard,
          {
            backgroundColor: colors.green200,
            alignSelf: 'flex-end',
          },
        ]}>
        {/* Message Details */}
        <MessageDetails message={{sent_message: details[0]?.sent_message}} />

        {/* Status Counts */}
        <View
          style={[
            styles.statusContainer,
            {
              backgroundColor: colors.green200,
            },
          ]}>
          {['sent', 'failed', 'delivered', 'Success', 'read'].map(
            (status, index) => (
              <TouchableOpacity
                key={index}
                style={styles.statusRow}
                onPress={() =>
                  navigate(
                    NavigationString.BroadCastGroupMessageConatctDetailsScreen,
                    {
                      broadcast_name: message.name,
                      status: status.toLowerCase(),
                    },
                  )
                }>
                <RegularText style={styles.statusText}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}:
                </RegularText>
                <View style={{alignItems: 'center', flexDirection: 'row'}}>
                  <RegularText style={styles.statusValue}>
                    {statusCount[status] || 0}
                  </RegularText>
                  <SvgIcon.RightArrow color={colors.blue700} />
                </View>
              </TouchableOpacity>
            ),
          )}
        </View>
      </View>
    </View>
  );
};
const MessageDetails = ({message}) => {
  const content = message?.sent_message || 'No message content';
  const parseMessage = text => {
    const urlRegex =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;

    const phoneRegex = /(?<!\d)(\+?\d{10,12})(?!\d)/g;

    const parts = [];
    let lastIndex = 0;

    // Find all matches first
    const matches = [
      ...text.matchAll(urlRegex),
      ...text.matchAll(phoneRegex),
    ].sort((a, b) => a.index - b.index);

    matches.forEach(match => {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          value: text.slice(lastIndex, match.index),
        });
      }

      // Determine if it's a URL or phone number
      const isUrl = match[0].match(urlRegex);
      parts.push({
        type: isUrl ? 'url' : 'phone',
        value: match[0],
      });

      lastIndex = match.index + match[0].length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        value: text.slice(lastIndex),
      });
    }

    return parts;
  };

  const handleLinkPress = url => {
    const formattedUrl = url.toLowerCase().startsWith('http')
      ? url
      : `https://${url}`;
    Linking.openURL(formattedUrl).catch(err => {
      console.error('Failed to open URL:', err);
    });
  };

  const handlePhonePress = phoneNumber => {
    // Remove any non-digit characters from phone number
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(err => {
      console.error('Failed to open phone dialer:', err);
    });
  };

  const renderPart = (part, index) => {
    switch (part.type) {
      case 'text':
        return (
          <RegularText key={index} style={styles.messageText}>
            {part.value}
          </RegularText>
        );

      case 'url':
        return (
          <RegularText
            key={index}
            style={styles.linkText}
            onPress={() => handleLinkPress(part.value)}>
            {part.value}
          </RegularText>
        );

      case 'phone':
        return (
          <RegularText
            key={index}
            style={styles.phoneText}
            onPress={() => handlePhonePress(part.value)}>
            {part.value}
          </RegularText>
        );

      default:
        return null;
    }
  };

  const parsedContent = parseMessage(content);

  return (
    <View>{parsedContent.map((part, index) => renderPart(part, index))}</View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginVertical: 5,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  linkText: {
    color: '#1e90ff',
    textDecorationLine: 'underline',
  },
  phoneText: {
    color: '#024ea4',
    textDecorationLine: 'underline',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.red700,
    fontSize: textScale(16),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
    textAlign: 'center',
  },
  messageCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.RADIUS_8,
    padding: spacing.PADDING_16,
  },
  loadingText: {
    fontSize: textScale(16),
    color: colors.grey800,
  },
  messageText: {
    fontSize: textScale(16),
    color: colors.grey900,
    marginBottom: spacing.MARGIN_16,
  },
  statusContainer: {
    paddingVertical: spacing.PADDING_8,
    backgroundColor: '#f9f9f9',
    borderRadius: spacing.RADIUS_8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.PADDING_8,
  },
  statusText: {
    fontSize: textScale(16),
    color: colors.blue700,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
  },
  statusValue: {
    fontSize: textScale(16),
    color: colors.blue700,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_LIGHT,
  },
  createGroupButton: {
    paddingHorizontal: spacing.PADDING_12,
    paddingVertical: spacing.PADDING_12,
    backgroundColor: colors.green600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createGroupText: {
    color: colors.white,
    marginLeft: spacing.MARGIN_4,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
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
  headerTitle: {
    fontSize: textScale(16),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
    color: colors.white,
    alignSelf: 'center',
  },
  headerTypeTitle: {
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
    fontSize: textScale(18),
    color: colors.black,
    marginVertical: spacing.MARGIN_6,
  },
  sendMessageBtn: {
    width: '100%',
    padding: spacing.PADDING_16,
    alignItems: 'center',
    backgroundColor: colors.green700,
    position: 'absolute',
    bottom: 0,
    borderRadius: 0,
  },
  templateListContainer: {
    marginVertical: spacing.MARGIN_8,
    marginHorizontal: spacing.MARGIN_16,
    backgroundColor: colors.grey800,
    paddingVertical: spacing.PADDING_10,
    paddingHorizontal: spacing.PADDING_10,
    alignItems: 'flex-start',
    borderRadius: spacing.RADIUS_8,
  },
  templateListTextStyle: {
    color: colors.white,
    fontSize: textScale(16),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_MEDIUM,
  },
  uploadedtoggleText: {
    textAlign: 'center',
    marginVertical: spacing.MARGIN_6,
  },
  optionContainer: {
    backgroundColor: colors.grey800,
    padding: spacing.PADDING_16,
    borderRadius: spacing.RADIUS_8,
    marginVertical: spacing.MARGIN_8,
    borderWidth: 1,
    borderColor: colors.grey700,
  },
});

export default BroadcastMessagesList;
