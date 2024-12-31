import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import CustomHeader from '../Common/CommoneHeader';
import * as SvgIcon from '../../assets';
import {getColorForParticipant, goBack} from '../../Utils/helperFunctions';
import {useFetchContactsByStatusQuery} from '../../api/store/slice/broadCastMessageSlice';
import RegularText from '../Common/RegularText';
import {useTheme} from '../hooks';
import THEME_COLOR from '../../Utils/Constant';
import colors from '../../Utils/colors';
import {textScale} from '../../styles/responsiveStyles';
import {fontNames} from '../../styles/typography';
import {spacing} from '../../styles/spacing';

const BroadCastGroupMessageContactDetails = ({route}) => {
  const {theme} = useTheme();
  const {broadcast_name, status} = route.params;
  const [selectedStatus, setSelectedStatus] = useState(status);

  // Predefined statuses
  const predefinedStatuses = ['read', 'failed', 'delivered', 'Success', 'sent'];

  // Fetch contacts based on the selected status
  const {data, isLoading, isError, refetch} = useFetchContactsByStatusQuery({
    broadcast_name,
    status: selectedStatus,
  });

  if (isLoading) {
    return (
      <View
        style={[
          styles.center,
          {backgroundColor: theme === THEME_COLOR ? '#f1f1f1' : '#333'},
        ]}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          styles.center,
          {backgroundColor: theme === THEME_COLOR ? '#f1f1f1' : '#333'},
        ]}>
        <Text style={styles.errorText}>
          Failed to load contacts. Please try again.
        </Text>
      </View>
    );
  }

  const contacts = data?.data || [];

  return (
    <>
      <CustomHeader
        title={'Broadcast Details'}
        showLeftIcon={true}
        leftIcon={SvgIcon.BackIcon}
        onLeftIconPress={goBack}
        showRightIcons={true}
        rightIcons={[SvgIcon.ReloadIcon]}
        onRightIconPress={() => refetch()}
      />

      {/* Status Filter */}
      <View
        style={[
          styles.filterContainer,
          {backgroundColor: theme === THEME_COLOR ? '#f1f1f1' : colors.black},
        ]}>
        {predefinedStatuses.map(statusItem => (
          <TouchableOpacity
            key={statusItem}
            style={[
              styles.filterButton,
              selectedStatus.toLowerCase() === statusItem.toLowerCase() &&
                styles.activeFilterButton,
            ]}
            onPress={() => setSelectedStatus(statusItem)}>
            <RegularText
              style={[
                styles.filterButtonText,
                selectedStatus.toLowerCase() === statusItem.toLowerCase() &&
                  styles.activeFilterButtonText,
              ]}>
              {statusItem.charAt(0).toUpperCase() + statusItem.slice(1)}
            </RegularText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contacts List */}
      <View
        style={[
          styles.container,
          {backgroundColor: theme === THEME_COLOR ? '#f1f1f1' : colors.black},
        ]}>
        {contacts.length === 0 ? (
          <RegularText style={styles.noDataText}>
            No contacts available
          </RegularText>
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={(item, index) => `${item.to}-${index}`}
            renderItem={({item, index}) => {
              const {backgroundColor} = getColorForParticipant(
                `${item.to}-${index}`,
              );
              return (
                <View
                  style={[
                    styles.contactCard,
                    {
                      backgroundColor:
                        theme === THEME_COLOR ? '#ffffff' : '#555',
                    },
                  ]}>
                  <View style={styles.avatarContainer}>
                    <View
                      style={[
                        styles.avatar,
                        {backgroundColor: backgroundColor},
                      ]}>
                      <RegularText style={styles.avatarText}>
                        {item.contact ? item.contact[0] : 'U'}
                      </RegularText>
                    </View>
                  </View>
                  <View style={styles.contactInfoContainer}>
                    <RegularText
                      style={[
                        styles.contactName,
                        {color: theme === THEME_COLOR ? '#000' : '#fff'},
                      ]}>
                      {item.contact || 'Unknown Contact'}
                    </RegularText>
                    <RegularText
                      style={[
                        styles.contactDetails,
                        {color: theme === THEME_COLOR ? '#333' : '#ddd'},
                      ]}>
                      Phone: {item.to || 'N/A'}
                    </RegularText>
                    <RegularText
                      style={[
                        styles.contactStatus,
                        {color: theme === THEME_COLOR ? '#007bff' : '#1e90ff'},
                      ]}>
                      Status: {item.status || 'N/A'}
                    </RegularText>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </>
  );
};

export default BroadCastGroupMessageContactDetails;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    color: colors.red800,
    fontSize: textScale(16),
    textAlign: 'center',
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
  },
  container: {
    flex: 1,
    paddingVertical: spacing.PADDING_10,
    backgroundColor: '#f9f9f9',
  },
  noDataText: {
    fontSize: textScale(16),
    textAlign: 'center',
    color: '#555',
  },
  contactCard: {
    flexDirection: 'row',
    padding: spacing.PADDING_16,
    backgroundColor: colors.white,
    borderRadius: spacing.RADIUS_8,
  },
  avatarContainer: {
    marginRight: spacing.PADDING_16,
  },
  avatar: {
    width: spacing.HEIGHT_40,
    height: spacing.HEIGHT_40,
    borderRadius: spacing.HEIGHT_40 / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: textScale(16),
    fontWeight: 'bold',
  },
  contactInfoContainer: {
    flex: 1,
  },
  contactName: {
    fontSize: textScale(18),
    marginBottom: spacing.MARGIN_4,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
  },
  contactDetails: {
    fontSize: textScale(16),
    color: colors.grey800,
    marginBottom: spacing.MARGIN_4,
  },
  contactStatus: {
    fontSize: textScale(14),
    color: colors.blue800,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f1f1f1',
    padding: spacing.PADDING_8,
  },
  filterButton: {
    paddingVertical: spacing.PADDING_6,
    paddingHorizontal: spacing.PADDING_12,
    backgroundColor: colors.white,
    borderRadius: spacing.RADIUS_8,
  },
  activeFilterButton: {
    backgroundColor: colors.blue800,
  },
  filterButtonText: {
    fontSize: textScale(14),
    color: colors.grey800,
  },
  activeFilterButtonText: {
    color: colors.white,
  },
});
