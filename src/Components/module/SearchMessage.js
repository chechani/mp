import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useLazySearchMessageQuery} from '../../api/store/slice/searchSlice';
import * as SvgIcon from '../../assets';
import NavigationString from '../../Navigations/NavigationString';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import {
  formatTimestamp,
  getColorForParticipant,
  goBack,
  navigate,
} from '../../Utils/helperFunctions';
import RegularText from '../Common/RegularText';
import {useTheme} from '../hooks';

const SearchMessage = () => {
  const {theme} = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef(null);
  const [triggerSearchMessage] = useLazySearchMessageQuery();

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const searchMessage = async query => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setMessage([]);
      return;
    }
    setLoading(true);
    try {
      const response = await triggerSearchMessage({search_query: trimmedQuery});

      const fetchedMessage = response?.data?.data || [];
      setMessage(fetchedMessage);
    } catch (e) {
      console.error('Error fetching contacts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchMessage(searchQuery);
      } else {
        setMessage([]);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const renderItem = ({item}) => {
    const contactInitial = item?.contact
      ? item.contact.trim().slice(0, 1).toUpperCase()
      : item?.mobile_no?.replace(/\D/g, '').slice(-10, -9) || '?';

    const renderMessagePreview = () => {
      if (!item?.message) return '';

      const trimmedMessage = item.message.trim().replace(/\n/g, ' ');
      if (trimmedMessage.startsWith('{')) return 'Flow Response';

      return trimmedMessage.length > 16
        ? `${trimmedMessage.slice(0, 16)}...`
        : trimmedMessage;
    };

    const {backgroundColor, textColor} = getColorForParticipant(
      item.message_id.toString(),
    );
    return (
      <TouchableOpacity
        style={styles.messageListContainer}
        onPress={() =>
          navigate(NavigationString.ChatScreen, {
            Mobile_No: item?.mobile_no,
            title: item?.contact || item?.mobile_no,
            unreadMessages: item?.unread_messages,
            contact: item?.contact,
          })
        }
        activeOpacity={0.8}>
        <View style={styles.itemContainer}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flexDirection: 'row', flex: 1}}>
              <View style={[styles.userDPStyle, {backgroundColor}]}>
                <RegularText
                  style={{fontSize: textScale(15), color: textColor}}>
                  {contactInitial}
                </RegularText>
              </View>
              <View style={{marginLeft: spacing.MARGIN_6, flex: 1}}>
                <RegularText
                  style={[
                    styles.contactNameTextStyle,
                    {
                      color:
                        theme === THEME_COLOR ? colors.black : colors.white,
                    },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {item?.contact ||
                    item?.mobile_no?.replace(/\D/g, '').slice(-10)}
                </RegularText>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {/* {statusIcon && isOutgoing && statusIcon.type === 'svg' && (
                  <StatusIconComponent
                    color={statusIcon.color}
                    width={20}
                    height={20}
                  />
                )} */}
                  <RegularText
                    style={[
                      styles.messageDescriptionStyle,
                      {
                        color:
                          theme === THEME_COLOR ? colors.black : colors.white,
                      },
                    ]}>
                    {renderMessagePreview()}
                  </RegularText>
                </View>
              </View>
            </View>
            <View style={styles.timestampContainer}>
              {item?.unread_messages > 0 && (
                <RegularText
                  style={[
                    styles.unreadMessagesStyle,
                    {
                      color:
                        theme === THEME_COLOR ? colors.black : colors.white,
                    },
                  ]}>
                  {item.unread_messages}
                </RegularText>
              )}
              <RegularText
                style={[
                  styles.formatTimestampStyle,
                  {
                    color:
                      theme === THEME_COLOR ? colors.grey600 : colors.grey200,
                  },
                ]}>
                {formatTimestamp(item?.creation)}
              </RegularText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme === THEME_COLOR ? colors.white : colors.black,
        }}>
        <TouchableOpacity
          onPress={() => goBack()}
          style={{marginLeft: spacing.MARGIN_6}}>
          <SvgIcon.BackIcon
            width={spacing.WIDTH_24}
            height={spacing.HEIGHT_24}
            color={theme === THEME_COLOR ? colors.black : colors.white}
          />
        </TouchableOpacity>
        <TextInput
          ref={searchInputRef}
          style={[
            styles.searchInput,
            {color: theme === THEME_COLOR ? colors.black : colors.white},
          ]}
          placeholder="Search"
          placeholderTextColor={
            theme === THEME_COLOR ? colors.black : colors.white
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
          spellCheck
          autoCorrect
        />
      </View>
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          },
        ]}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.green} />
        ) : (
          <FlatList
            data={message}
            keyExtractor={item => item.name.toString()}
            renderItem={renderItem}
            ListEmptyComponent={
              <RegularText
                style={{
                  alignSelf: 'center',
                  fontSize: textScale(14),
                  color: theme === THEME_COLOR ? colors.black : colors.white,
                }}>
                No Messages found.
              </RegularText>
            }
          />
        )}
      </View>
    </>
  );
};

export default SearchMessage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: spacing.PADDING_16,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: spacing.HEIGHT_50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: spacing.RADIUS_8,
    paddingHorizontal: spacing.PADDING_16,
    marginBottom: spacing.MARGIN_16,
    color: colors.black,
    flex: 1,
    margin: spacing.MARGIN_16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.PADDING_10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  contactInfo: {
    marginLeft: spacing.MARGIN_10,
  },
  contactName: {
    fontSize: textScale(18),
    fontWeight: 'bold',
  },
  avatar: {
    width: spacing.HEIGHT_40,
    height: spacing.HEIGHT_40,
    borderRadius: spacing.HEIGHT_40 / 2,
  },
  avatarPlaceholder: {
    width: spacing.HEIGHT_40,
    height: spacing.HEIGHT_40,
    borderRadius: spacing.HEIGHT_40 / 2,
    backgroundColor: '#00796b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: textScale(18),
    color: '#fff',
  },

  itemContainer: {
    paddingVertical: spacing.PADDING_4,
  },
  messageListContainer: {
    borderBottomWidth: 1,
    borderColor: colors.grey400,
    marginHorizontal: spacing.MARGIN_14,
    marginVertical: spacing.MARGIN_4,
    justifyContent: 'space-around',
  },
  contactNameTextStyle: {
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
    fontSize: textScale(15),
    color: colors.black,
    flex: 1,
  },
  timestampContainer: {
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  unreadMessagesStyle: {
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
    fontSize: textScale(12),
    color: colors.white,
    backgroundColor: colors.green700,
    borderRadius: spacing.WIDTH_24 / 2,
    width: spacing.WIDTH_24,
    height: spacing.WIDTH_24,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  formatTimestampStyle: {
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
    fontSize: textScale(12),
    color: colors.grey700,
  },
  userDPStyle: {
    width: spacing.WIDTH_40,
    height: spacing.WIDTH_40,
    borderRadius: spacing.WIDTH_40 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.grey300,
  },
});
