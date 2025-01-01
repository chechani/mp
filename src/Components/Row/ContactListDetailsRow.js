import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, StyleSheet, View} from 'react-native';
import {useApiURLs} from '../../Config/url';
import NavigationString from '../../Navigations/NavigationString';
import THEME_COLOR from '../../Utils/Constant';
import colors from '../../Utils/colors';
import {
  formatTimestampWithoutModifying,
  goBack,
  navigate,
  truncateText,
} from '../../Utils/helperFunctions';
import {useLazyContactDetailsQuery} from '../../api/store/slice/contactSlice';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import AnimatedComponentToggle from '../Common/AnimatedComponentToggale';
import BottonComp from '../Common/BottonComp';
import CommoneHeader from '../Common/CommoneHeader';
import RegularText from '../Common/RegularText';
import {useTheme} from '../hooks';
import LoadingScreen from '../Common/Loader';
import Colors from '../../theme/colors';

const ContactListDetailsRow = ({route}) => {
  const {contactName, mobileNo} = route.params;
  const {theme} = useTheme();
  const isDarkMode = theme === THEME_COLOR;

  const [GetContactDetails, {isLoading}] = useLazyContactDetailsQuery();

  const [contactDetails, setContactDetails] = useState(null);

  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        const response = await GetContactDetails({
          contact_name: contactName,
          mobile: mobileNo,
        });

        const data = response?.data?.message;
        setContactDetails(data);
      } catch (error) {
        console.error('Error fetching contact details:', error);
      }
    };

    fetchContactDetails();
  }, [contactName, mobileNo]);

  const ListEmptyComponent = () => (
    <View style={styles.noDataContainer}>
      <RegularText style={styles.noDataText}>Data not found</RegularText>
    </View>
  );

  const createDetailsData = details => {
    const dataSections = [];

    if (details) {
      const personalInfo = Object.keys(details)
        .filter(
          key =>
            ![
              'property',
              'custom_category',
              'last_message_on',
              'name',
              'status',
            ].includes(key),
        )
        .map(key => {
          return {label: formatLabel(key), value: details[key] || 'N/A'};
        });
      dataSections.push({key: 'Personal Information', data: personalInfo});

      const additionalDetails = [
        {label: 'Custom Category', value: details.custom_category || 'N/A'},
        {
          label: 'Last Message On',
          value:
            formatTimestampWithoutModifying(details.last_message_on) || 'N/A',
        },
      ];
      dataSections.push({key: 'Additional Details', data: additionalDetails});

      if (details.property) {
        const companyInfo = Object.keys(details.property).map(key => {
          return {
            label: formatLabel(key),
            value: details.property[key] || 'N/A',
          };
        });
        dataSections.push({key: 'Contact Properties', data: companyInfo});
      }
    }

    return dataSections;
  };

  const formatLabel = label => {
    return label
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  const detailsData = createDetailsData(contactDetails);

  const renderDetailSection = ({item}) => {
    if (!item.data || item.data.length === 0) {
      return (
        <AnimatedComponentToggle tabName={item?.key}>
          <View style={styles.noDataContainer}>
            <RegularText
              style={[
                styles.noDataText,
                {color: isDarkMode ? colors.black : colors.white},
              ]}>
              No details available for this section
            </RegularText>
          </View>
        </AnimatedComponentToggle>
      );
    }

    return (
      <AnimatedComponentToggle tabName={item?.key}>
        {item.data.map((detail, index) => (
          <View key={index} style={styles.contentRow}>
            <RegularText
              style={[
                styles.detailLabel,
                {color: isDarkMode ? colors.black : colors.white},
              ]}>
              {detail?.label}
            </RegularText>
            <RegularText
              style={[
                styles.detailValue,
                {color: isDarkMode ? colors.black : colors.white},
              ]}>
              {detail?.value}
            </RegularText>
          </View>
        ))}
      </AnimatedComponentToggle>
    );
  };

  return (
    <>
      <CommoneHeader
        title={`${truncateText(contactName, 50)}`}
        showLeftIcon={true}
        onLeftIconPress={() => goBack()}
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDarkMode ? colors.white : colors.black,
          },
        ]}>
        {isLoading ? (
          <LoadingScreen color={Colors.default.primaryText} />
        ) : (
          <FlatList
            data={detailsData}
            renderItem={renderDetailSection}
            keyExtractor={item => item.key}
            contentContainerStyle={styles.flatListContainer}
            ListEmptyComponent={ListEmptyComponent}
          />
        )}
      </View>
      <BottonComp
        text="Send Message"
        style={styles.sendMessageBtn}
        textStyle={{color: colors.white, fontSize: textScale(16)}}
        onPress={() =>
          navigate(NavigationString.ChatScreen, {
            Mobile_No: mobileNo,
            title: contactName,
          })
        }
      />
    </>
  );
};

export default ContactListDetailsRow;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.PADDING_16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: textScale(16),
    fontFamily: 'Poppins-SemiBold',
    color: colors.grey700,
  },
  header: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.PADDING_16,
    paddingHorizontal: spacing.PADDING_16,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey300,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.PADDING_8,
    marginVertical: spacing.MARGIN_4,
    borderBottomWidth: 0.5,
    borderColor: colors.grey500,
  },
  detailLabel: {
    fontSize: textScale(14),
    fontFamily: 'Poppins-SemiBold',
    color: colors.black,
  },
  detailValue: {
    fontSize: textScale(14),
    fontFamily: 'Poppins-Regular',
    color: colors.grey700,
  },
  flatListContainer: {
    paddingBottom: spacing.PADDING_20,
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
});
