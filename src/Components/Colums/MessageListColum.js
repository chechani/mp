import React, {useRef, useState} from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import * as SvgIcon from '../../assets';
import {useTheme} from '../hooks';
import {boxShadow} from '../../styles/Mixins';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import {
  formatTimestamp,
  isImageAttachment,
  isVideoAttachment,
  openLink,
  openPhoneDialer,
} from '../../Utils/helperFunctions';
import CommonVideoPlayer from '../Common/CommonVideoPlayer';
import ImageViewer from '../Common/ImageViewer';
import openPDFFile from '../Common/PdfViewer';
import RegularText from '../Common/RegularText';
import {useAppSelector} from '../hooks';

const MessageListColum = ({
  item,
  nextItem,
  selectedMessages,
  setSelectedMessages,
  selectionMode,
  onSwipeToReply,
  isFirstMessageInList,
}) => {
  const isIncoming = item?.type?.toLowerCase() === 'outgoing';
  const [isVideoPaused, setIsVideoPaused] = useState(true);
  const {theme} = useTheme();
  const selectedDomain = useAppSelector(state => state.domains?.selectedDomain?.domain);

  const isAttachMent =
    item?.attach?.startsWith('/files/') ||
    /\.(jpeg|jpg|png|mp4|mov|avi|wmv|flv|mkv)$/i.test(item?.attach);

  const isMessage =
    item?.message?.startsWith('/files/') ||
    /\.(jpeg|jpg|png|mp4|mov|avi|wmv|flv|mkv)$/i.test(item?.message);

  const isTextMessage = item.message && !item.attach;
  const isSelected = selectedMessages.some(
    msg => msg.message_id === item.message_id,
  );

  const handleSelectMessage = () => {
    const isAlreadySelected = selectedMessages.some(
      msg => msg.message_id === item.message_id,
    );

    let updatedMessages;

    if (isAlreadySelected) {
      updatedMessages = selectedMessages.filter(
        msg => msg.message_id !== item.message_id,
      );
    } else {
      updatedMessages = [
        ...selectedMessages,
        {
          message_id: item.message_id,
          message: item.message,
          name: item.name,
        },
      ];
    }

    setSelectedMessages(updatedMessages);
  };

  const handlePress = () => {
    if (selectionMode && isTextMessage) {
      handleSelectMessage();
    } else {
      // Perform normal actions when not in selection mode
      // For text messages, you might open a detailed view
      // For attachments, you can open them here if needed
    }
  };

  const handlePressPlayVideo = () => {
    setIsVideoPaused(prevPaused => !prevPaused);
  };

  const statusIcons = {
    read: {
      type: 'svg',
      component: SvgIcon.DoubleCheckIcon,
      color: colors.blue800,
    },
    failed: {type: 'svg', component: SvgIcon.Wrong, color: colors.redA700},
    delivered: {
      type: 'svg',
      component: SvgIcon.DoubleCheckIcon,
      color: colors.green900,
    },
    sent: {type: 'svg', component: SvgIcon.CheckIcon, color: colors.black},
  };
  const statusIcon = statusIcons[item?.status];

  // Block rendering the entire component if `isMessage` is true
  if (isMessage) {
    return null;
  }

  const renderJsonContent = jsonString => {
    // Recursive function to extract and display all key-value pairs
    const renderNestedKeyValuePairs = (key, value, level = 0) => {
      const indentation = {marginLeft: level * 15}; // Increased margin for better indentation

      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          // Handle array case
          const shouldNumberItems = value.length > 1;

          return (
            <View key={key} style={indentation}>
              {key && (
                <RegularText
                  style={[
                    styles.messageTextStyle,
                    {
                      fontWeight: '700',
                      color: '#333',
                      marginBottom: 5,
                      color:
                        theme === THEME_COLOR ? colors.black : colors.white,
                    },
                  ]}>
                  {key.replace(/_/g, ' ').toUpperCase()}:
                </RegularText>
              )}
              {value.map((item, index) => (
                <View
                  key={index}
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      marginLeft: 10,
                    },
                    shouldNumberItems && {marginBottom: 5},
                  ]}>
                  {shouldNumberItems && (
                    <RegularText
                      style={[
                        styles.messageTextStyle,
                        styles.listItemNumber,
                        {
                          color:
                            theme === THEME_COLOR ? colors.black : colors.white,
                        },
                      ]}>
                      {index + 1}.
                    </RegularText>
                  )}
                  <View style={{flex: 1}}>
                    {renderNestedKeyValuePairs('', item, level + 1)}
                  </View>
                </View>
              ))}
            </View>
          );
        } else {
          // Handle object case
          return (
            <View key={key} style={indentation}>
              {key && (
                <RegularText
                  style={[
                    styles.messageTextStyle,
                    {
                      fontWeight: '700',
                      color: '#333',
                      marginBottom: 5,
                      color:
                        theme === THEME_COLOR ? colors.black : colors.white,
                    },
                  ]}>
                  {key.replace(/_/g, ' ').toUpperCase()}:
                </RegularText>
              )}
              {Object.entries(value).map(([nestedKey, nestedValue]) => (
                <View key={nestedKey}>
                  {renderNestedKeyValuePairs(nestedKey, nestedValue, level + 1)}
                </View>
              ))}
            </View>
          );
        }
      } else {
        // Handle primitive values
        return (
          <View key={key} style={indentation}>
            {key && (
              <RegularText
                style={[
                  styles.messageTextStyle,
                  {
                    fontWeight: '700',
                    color: '#333',
                    marginBottom: 2,
                    color: theme === THEME_COLOR ? colors.black : colors.white,
                  },
                ]}>
                {key.replace(/_/g, ' ').toUpperCase()}:
              </RegularText>
            )}
            <RegularText
              style={[
                styles.messageTextStyle,
                {color: theme === THEME_COLOR ? colors.black : colors.white},
              ]}>
              {String(value)}
            </RegularText>
          </View>
        );
      }
    };

    try {
      const parsedContent = JSON.parse(jsonString);

      return (
        <View style={styles.jsonContentContainer}>
          <RegularText style={styles.jsonStringHeader}>
            Flow Response Details
          </RegularText>
          {Object.entries(parsedContent).map(([key, value]) => (
            <View key={key} style={{marginBottom: 15}}>
              {renderNestedKeyValuePairs(key, value)}
            </View>
          ))}
        </View>
      );
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return <RegularText>Error parsing JSON data</RegularText>;
    }
  };
  const renderMessageContent = () => {
    const {message} = item;
    if (typeof message === 'string') {
      const trimmedMessage = message.trim();

      // Render JSON content if message starts with '{'
      if (trimmedMessage.startsWith('{')) {
        return renderJsonContent(trimmedMessage);
      }

      // Regular expressions to match phone numbers and URLs
      const phoneRegex = /\b(?:\+91|91)?\d{10}\b/g;
      const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

      // Function to parse message and identify URLs and phone numbers
      const parseMessage = text => {
        const combinedRegex = new RegExp(
          `${phoneRegex.source}|${urlRegex.source}`,
          'gi',
        );
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = combinedRegex.exec(text)) !== null) {
          if (match.index > lastIndex) {
            parts.push({
              text: text.substring(lastIndex, match.index),
              type: 'text',
            });
          }

          const matchedText = match[0];

          let partType = '';
          if (new RegExp(`^${phoneRegex.source}$`).test(matchedText)) {
            partType = 'phone';
          } else if (
            new RegExp(`^${urlRegex.source}$`, 'i').test(matchedText)
          ) {
            partType = 'url';
          }

          parts.push({
            text: matchedText,
            type: partType,
          });

          lastIndex = match.index + matchedText.length;

          phoneRegex.lastIndex = 0;
          urlRegex.lastIndex = 0;
        }

        if (lastIndex < text.length) {
          parts.push({
            text: text.substring(lastIndex),
            type: 'text',
          });
        }

        return parts;
      };

      // Parse the message
      const messageParts = parseMessage(trimmedMessage) || [];

      // Render the parsed message
      return (
        <RegularText
          style={[
            styles.messageTextStyle,
            {color: theme === THEME_COLOR ? colors.black : colors.white},
          ]}>
          {messageParts.map((part, index) => {
            if (part.type === 'text') {
              return (
                <RegularText
                  key={index}
                  style={{
                    color: theme === THEME_COLOR ? colors.black : colors.white,
                  }}>
                  {part.text}
                </RegularText>
              );
            } else if (part.type === 'phone') {
              return (
                <RegularText
                  key={index}
                  style={{color: 'blue', textDecorationLine: 'underline'}}
                  onPress={() => {
                    if (!selectionMode) {
                      openPhoneDialer(part.text);
                    } else {
                      handleSelectMessage();
                    }
                  }}>
                  {part.text}
                </RegularText>
              );
            } else if (part.type === 'url') {
              const url = part.text.startsWith('http')
                ? part.text
                : `http://${part.text}`;
              return (
                <RegularText
                  key={index}
                  style={{color: 'blue', textDecorationLine: 'underline'}}
                  onPress={() => {
                    if (!selectionMode) {
                      openLink(url);
                    } else {
                      handleSelectMessage();
                    }
                  }}>
                  {part.text}
                </RegularText>
              );
            }
          })}
        </RegularText>
      );
    }

    return (
      <RegularText
        style={[
          styles.messageTextStyle,
          {color: theme === THEME_COLOR ? colors.black : colors.white},
        ]}>
        No content available
      </RegularText>
    );
  };

  const renderAttachmentContent = () => {
    if (item.attach?.startsWith('/files/') && item?.attach?.endsWith('.pdf')) {
      return (
        <>
          {/* Replied Message Section */}
          {item?.is_reply === 1 && item?.replied_message ? (
            <View
              style={[
                styles.repliedMessageContainer,
                // {maxHeight: spacing.HEIGHT_60},
                {
                  backgroundColor: isIncoming
                    ? theme === THEME_COLOR
                      ? '#d1f4cc'
                      : '#128C7E'
                    : theme === THEME_COLOR
                    ? colors.white
                    : colors.grey900,
                },
              ]}>
              {isIncoming && (
                <RegularText
                  style={{
                    color: colors.grey700,
                    fontSize: textScale(12),
                    flexWrap: 'wrap',
                    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
                  }}>
                  Sent by: {item?.sent_by}
                </RegularText>
              )}
              <RegularText
                style={{
                  color: colors.grey900,
                  fontSize: textScale(14),
                  fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
                  borderLeftWidth: 4,
                  borderLeftColor: 'blue',
                  paddingLeft: spacing.PADDING_8,
                }}
                numberOfLines={3}
                ellipsizeMode="tail">
                {item?.replied_message}
              </RegularText>
            </View>
          ) : null}
          <TouchableOpacity
            style={{
              backgroundColor: colors.grey500,
              paddingVertical: spacing.PADDING_12,
              paddingHorizontal: spacing.PADDING_20,
              borderRadius: spacing.RADIUS_12,
              ...boxShadow(),
            }}
            onPress={() => {
              if (!selectionMode) {
                openPDFFile(`${item?.attach}`);
              } else {
                // Do nothing or show a message
              }
            }}>
            <RegularText style={{fontSize: textScale(15), color: colors.white}}>
              Open PDF
            </RegularText>
          </TouchableOpacity>
        </>
      );
    } else if (isAttachMent) {
      if (isImageAttachment(item?.attach)) {
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              if (!selectionMode) {
                // Handle image tap if needed
              } else {
                // Do nothing or show a message
              }
            }}>
            <View
              style={{
                backgroundColor: isIncoming
                  ? theme === THEME_COLOR
                    ? '#d1f4cc'
                    : '#075E54'
                  : theme === THEME_COLOR
                  ? colors.white
                  : colors.grey900,

                paddingVertical: spacing.PADDING_4,
                paddingHorizontal: spacing.PADDING_4,
                borderRadius: spacing.RADIUS_16,
              }}>
              {isIncoming && (
                <RegularText
                  style={{
                    color:
                      theme === THEME_COLOR ? colors.grey700 : colors.white,
                    fontSize: textScale(12),
                    flexWrap: 'wrap',
                    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
                    paddingLeft: spacing.PADDING_4,
                  }}>
                  Sent by: {item?.sent_by}
                </RegularText>
              )}
              {/* Replied Message Section */}
              {item?.is_reply === 1 && item?.replied_message ? (
                <View
                  style={[
                    styles.repliedMessageContainer,
                    // {maxHeight: spacing.HEIGHT_60},
                    {
                      backgroundColor: isIncoming
                        ? theme === THEME_COLOR
                          ? '#d1f4cc'
                          : '#128C7E'
                        : theme === THEME_COLOR
                        ? colors.white
                        : colors.grey900,
                    },
                  ]}>
                  {isIncoming && (
                    <RegularText
                      style={{
                        color:
                          theme === THEME_COLOR ? colors.grey700 : colors.white,
                        fontSize: textScale(12),
                        flexWrap: 'wrap',
                        fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
                      }}>
                      Sent by: {item?.sent_by}
                    </RegularText>
                  )}
                  <RegularText
                    style={{
                      color: colors.grey900,
                      fontSize: textScale(14),
                      fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
                      borderLeftWidth: 4,
                      borderLeftColor: 'blue',
                      paddingLeft: spacing.PADDING_8,
                    }}
                    numberOfLines={3}
                    ellipsizeMode="tail">
                    {item?.replied_message}
                  </RegularText>
                </View>
              ) : null}
              <ImageViewer
                baseUrl={selectedDomain}
                message={item?.attach}
                thumbnailStyle={styles.imageMessage}
              />
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {statusIcon && isIncoming && statusIcon.type === 'svg' && (
                  <statusIcon.component
                    color={statusIcon.color}
                    width={spacing.WIDTH_22}
                    height={spacing.HEIGHT_22}
                  />
                )}
                <RegularText
                  style={{
                    color:
                      theme === THEME_COLOR ? colors.grey700 : colors.white,
                    fontSize: textScale(13),
                    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
                  }}>
                  {formatTimestamp(item?.creation)}
                </RegularText>
              </View>
            </View>
          </TouchableOpacity>
        );
      } else if (isVideoAttachment(item.attach)) {
        const getFilePath = url => {
          if (url?.startsWith('https')) {
            const startIndex = url.indexOf('/files');
            if (startIndex !== -1) {
              return url.slice(startIndex);
            }
          }
          return url;
        };
        return (
          <CommonVideoPlayer
            source={{
              uri: `${selectedDomain}${getFilePath(item?.attach)}`,
            }}
            paused={isVideoPaused}
            repeat={false}
            onPressPlayPause={handlePressPlayVideo}
            mainViewStyle={{width: '80%', aspectRatio: 3 / 4}}
          />
        );
      } else {
        return (
          <RegularText style={styles.unsupportedText}>
            Unsupported attachment type.
          </RegularText>
        );
      }
    }
  };

  const handleLongPress = () => {
    if (isTextMessage) {
      Vibration.vibrate([50, 100]);
      handleSelectMessage();
    }
  };

  const isSameDay = (currentItem, nextItem) => {
    if (!nextItem || !nextItem.creation) return false;

    const currentDate = new Date(currentItem.creation);
    const nextDate = new Date(nextItem.creation);

    return (
      currentDate.getFullYear() === nextDate.getFullYear() &&
      currentDate.getMonth() === nextDate.getMonth() &&
      currentDate.getDate() === nextDate.getDate()
    );
  };

  // Function to get the label for the date
  const getDateLabel = date => {
    const today = new Date();
    const messageDate = new Date(date);

    // Reset the time portions to compare only dates in local time (midnight)
    today.setHours(0, 0, 0, 0);
    messageDate.setHours(0, 0, 0, 0);

    // Calculate the difference in days
    const diffTime = today.getTime() - messageDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      // Format date as 'Month Day, Year', e.g., 'October 5, 2023'
      const options = {year: 'numeric', month: 'long', day: 'numeric'};
      return messageDate.toLocaleDateString(undefined, options);
    }
  };

  const isFirstMessageOfTheDay = (currentItem, nextItem) => {
    if (!nextItem || !nextItem.creation) return true;

    return !isSameDay(currentItem, nextItem);
  };

  // Determine if we need to show the date label
  const showDateLabel = isFirstMessageOfTheDay(item, nextItem);
  const translateX = useRef(new Animated.Value(0)).current;

  const onGestureEvent = Animated.event(
    [{nativeEvent: {translationX: translateX}}],
    {useNativeDriver: true},
  );

  const onHandlerStateChange = ({nativeEvent}) => {
    if (nativeEvent.state === State.END) {
      if (nativeEvent.translationX > 50) {
        onSwipeToReply({
          message: item?.message,
          message_id: item?.message_id,
          is_reply: item?.is_reply,
          attach: item.attach,
        });
        Vibration.vibrate([50]);
      }

      Animated.timing(translateX, {
        toValue: 0,
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else if (
      nativeEvent.state === State.CANCELLED ||
      nativeEvent.state === State.FAILED
    ) {
      // Resetting the position if the gesture was cancelled or failed
      Animated.timing(translateX, {
        toValue: 0,
        duration: 150,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <>
      {showDateLabel && (
        <View style={styles.dateLabelContainer}>
          <RegularText
            style={[
              styles.dateLabelText,
              {color: theme === THEME_COLOR ? colors.black : colors.white},
            ]}>
            {getDateLabel(item.creation)}
          </RegularText>
        </View>
      )}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 0]}
        shouldCancelWhenOutside={true}>
        <Animated.View
          style={{
            transform: [
              {
                translateX: translateX.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, 50],
                  extrapolate: 'clamp',
                }),
              },
            ],
          }}>
          {/* Reply Icon */}
          <Animated.View
            style={[
              {
                opacity: translateX.interpolate({
                  inputRange: [0, 30],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
              },
              styles.replyIconContainer,
            ]}>
            <SvgIcon.Reply
              width={spacing.WIDTH_24}
              height={spacing.HEIGHT_24}
              color={theme === THEME_COLOR ? colors.black : colors.white}
            />
          </Animated.View>

          {/* Message Container */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              isSelected && isTextMessage && styles.selectedMessageBackground,
            ]}
            onPress={handlePress}
            onLongPress={handleLongPress}
            disabled={!isTextMessage}>
            {isSelected && isTextMessage && (
              <View style={styles.checkmarkContainer}>
                <SvgIcon.CheckIcon
                  width={spacing.WIDTH_20}
                  height={spacing.HEIGHT_20}
                  color="blue"
                />
              </View>
            )}

            {/* Message Block */}
            {item?.message ? (
              <View
                style={[
                  styles.chatContainer,
                  isIncoming ? styles.sentMessage : styles.receivedMessage,
                ]}>
                <View
                  style={[
                    isIncoming ? styles.sentMessage : styles.receivedMessage,
                  ]}>
                  <View
                    style={[
                      styles.messageContainer,
                      isIncoming
                        ? styles.sendBackgroundMessgeColor
                        : styles.receivedbackgroundMessgeColor,
                      {
                        backgroundColor: isIncoming
                          ? theme === THEME_COLOR
                            ? '#d1f4cc'
                            : '#056162'
                          : theme === THEME_COLOR
                          ? colors.white
                          : colors.grey900,
                      },
                    ]}>
                    {isIncoming && (
                      <RegularText
                        style={{
                          color:
                            theme === THEME_COLOR ? colors.black : colors.white,
                          fontSize: textScale(12),
                          flexWrap: 'wrap',
                          fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
                        }}>
                        Sent by: {item?.sent_by}
                      </RegularText>
                    )}
                    {/* Replied Message Section */}
                    {item?.is_reply === 1 && item?.replied_message ? (
                      <View
                        style={[
                          styles.repliedMessageContainer,
                          // {maxHeight: spacing.HEIGHT_60},
                          {
                            backgroundColor: isIncoming
                              ? theme === THEME_COLOR
                                ? '#d1f4cc'
                                : '#128C7E'
                              : theme === THEME_COLOR
                              ? colors.white
                              : colors.grey700,
                          },
                        ]}>
                        {isIncoming && (
                          <RegularText
                            style={{
                              color:
                                theme === THEME_COLOR
                                  ? colors.grey700
                                  : colors.grey300,
                              fontSize: textScale(12),
                              flexWrap: 'wrap',
                              fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
                            }}>
                            Sent by: {item?.sent_by}
                          </RegularText>
                        )}
                        <RegularText
                          style={{
                            color:
                              theme === THEME_COLOR
                                ? colors.grey900
                                : colors.white,
                            fontSize: textScale(14),
                            fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
                            borderLeftWidth: 4,
                            borderLeftColor: 'blue',
                            paddingLeft: spacing.PADDING_8,
                          }}
                          numberOfLines={3}
                          ellipsizeMode="tail">
                          {item?.replied_message}
                        </RegularText>
                      </View>
                    ) : null}

                    {/* Render the message content */}
                    {renderMessageContent()}
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      {statusIcon &&
                        isIncoming &&
                        statusIcon.type === 'svg' && (
                          <statusIcon.component
                            color={statusIcon.color}
                            width={22}
                            height={22}
                          />
                        )}
                      <RegularText
                        style={{
                          color:
                            theme === THEME_COLOR ? colors.black : colors.white,
                          fontSize: textScale(12),
                          fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
                        }}>
                        {formatTimestamp(item?.creation)}
                      </RegularText>
                    </View>
                  </View>
                </View>
              </View>
            ) : null}

            {/* Failed Message Block */}
            {item?.status === 'failed' ? (
              <View
                style={[
                  styles.chatContainer,
                  isIncoming ? styles.sentMessage : styles.receivedMessage,
                ]}>
                <View
                  style={[
                    isIncoming ? styles.sentMessage : styles.receivedMessage,
                  ]}>
                  <View
                    style={[
                      styles.messageContainer,
                      isIncoming
                        ? styles.sendBackgroundMessgeColor
                        : styles.receivedbackgroundMessgeColor,
                      {
                        backgroundColor: isIncoming
                          ? theme === THEME_COLOR
                            ? '#d1f4cc'
                            : '#128C7E'
                          : theme === THEME_COLOR
                          ? colors.white
                          : colors.grey900,
                      },
                    ]}>
                    {isIncoming && (
                      <RegularText
                        style={{
                          color:
                            theme === THEME_COLOR
                              ? colors.grey900
                              : colors.white,
                          fontSize: textScale(12),
                          flexWrap: 'wrap',
                          fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
                        }}>
                        Sent by: {item?.sent_by}
                      </RegularText>
                    )}
                    {/* Render the error reason */}
                    <RegularText
                      style={{
                        color:
                          theme === THEME_COLOR ? colors.grey900 : colors.white,
                      }}>
                      {item?.error_reason}
                    </RegularText>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      {statusIcon &&
                        isIncoming &&
                        statusIcon.type === 'svg' && (
                          <statusIcon.component
                            color={statusIcon.color}
                            width={22}
                            height={22}
                          />
                        )}
                      <RegularText
                        style={{
                          color:
                            theme === THEME_COLOR
                              ? colors.grey900
                              : colors.white,
                          fontSize: textScale(12),
                          fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
                        }}>
                        {formatTimestamp(item?.creation)}
                      </RegularText>
                    </View>
                  </View>
                </View>
              </View>
            ) : null}

            {/* Attachment Block */}
            {item?.attach !== null ? (
              <View
                style={[
                  styles.chatContainer,
                  isIncoming ? styles.sentMessage : styles.receivedMessage,
                ]}>
                <View
                  style={[
                    styles.messageContainer,
                    isIncoming ? styles.sentMessage : styles.receivedMessage,
                  ]}>
                  {/* Render the attachment content */}
                  {renderAttachmentContent()}
                </View>
              </View>
            ) : null}
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </>
  );
};

export default React.memo(MessageListColum);

const styles = StyleSheet.create({
  selectedMessageBackground: {
    backgroundColor: '#e0e0e0',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  messageTextStyle: {
    color: colors.black,
    fontSize: textScale(15),
    fontWeight: '500',
    flexWrap: 'wrap',
  },
  chatContainer: {
    marginHorizontal: spacing.MARGIN_8,
    maxWidth: '75%',
    borderRadius: 1,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    marginVertical: spacing.MARGIN_2,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    marginVertical: spacing.MARGIN_2,
  },
  messageContainer: {
    paddingHorizontal: spacing.PADDING_12,
    flexShrink: 1,
  },
  timetextStyle: {
    color: colors.grey500,
    fontSize: textScale(16),
    fontWeight: '800',
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
  },
  keyValuePair: {
    flexDirection: 'row',
    marginBottom: spacing.MARGIN_4,
    flexWrap: 'wrap',
  },
  jsonStringHeader: {
    fontSize: textScale(16),
    color: colors.black,
    fontWeight: '800',
    marginBottom: spacing.MARGIN_6,
  },
  jsonContentContainer: {
    borderRadius: spacing.RADIUS_8,
    paddingVertical: spacing.PADDING_8,
  },
  imageMessage: {
    height: spacing.HEIGHT_300 * 1.5,
    resizeMode: 'contain',
  },
  imageMessageContainer: {
    paddingVertical: spacing.PADDING_6,
  },
  imageBackground: {},
  attachMentSytle: {
    width: spacing.WIDTH_250,
    height: spacing.WIDTH_250,
  },
  sendBackgroundMessgeColor: {
    backgroundColor: '#d1f4cc',
    borderTopLeftRadius: spacing.RADIUS_10,
    borderBottomLeftRadius: spacing.RADIUS_16,
    borderBottomRightRadius: spacing.RADIUS_16,
  },
  receivedbackgroundMessgeColor: {
    backgroundColor: '#fff',
    borderTopRightRadius: spacing.RADIUS_10,
    borderBottomLeftRadius: spacing.RADIUS_16,
    borderBottomRightRadius: spacing.RADIUS_16,
  },
  dateLabelContainer: {
    alignItems: 'center',
    marginVertical: spacing.MARGIN_10,
  },
  statusCheckIcon: {
    width: spacing.WIDTH_14,
    height: spacing.WIDTH_14,
    resizeMode: 'contain',
    marginRight: spacing.MARGIN_4,
  },
  selectedMessageBackground: {
    backgroundColor: 'rgba(209, 244, 204,0.5)',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  listItemNumber: {
    fontSize: textScale(14),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
    marginRight: spacing.MARGIN_4,
    color: '#555',
  },
  dateLabelText: {
    fontSize: textScale(16),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_MEDIUM,
  },
  replyIconContainer: {
    position: 'absolute',
    left: -30,
    top: '50%',
    transform: [{translateY: -12}],
    zIndex: 1,
  },
  repliedMessageContainer: {
    borderRadius: spacing.RADIUS_6,
    paddingVertical: spacing.PADDING_8,
    paddingHorizontal: spacing.PADDING_10,
  },
});
