import React, { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import THEME_COLOR from '../../Utils/Constant';
import colors from '../../Utils/colors';
import { goBack, truncateText } from '../../Utils/helperFunctions';
import { useLazyGetAllCompleteFromQuery } from '../../api/store/slice/formSlice';
import * as SvgIcon from '../../assets';
import { textScale } from '../../styles/responsiveStyles';
import { spacing } from '../../styles/spacing';
import { fontNames } from '../../styles/typography';
import Colors from '../../theme/colors';
import AnimatedComponentToggle from '../Common/AnimatedComponentToggale';
import CommoneHeader from '../Common/CommoneHeader';
import CustomBottomSheet from '../Common/CustomBottomSheet';
import LoadingScreen from '../Common/Loader';
import TextComponent from '../Common/TextComponent';
import { useTheme } from '../hooks';

const FormResponseCompleteScreen = ({route}) => {
  const {Flow_name} = route?.params;

  const {theme} = useTheme();
  const isDarkMode = theme === THEME_COLOR;
  const filterBottomSheetRef = useRef(null);

  // Calculate default dates
  const today = new Date();
  const priorDate = new Date().setDate(today.getDate() - 30);
  const defaultFromDate = new Date(priorDate).toISOString().split('T')[0];
  const defaultToDate = today.toISOString().split('T')[0];

  const [data, setData] = useState([]);
  const [noDataFound, setNoDataFound] = useState(false);
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [loading, setLoading] = useState(false);
  const [toDate, setToDate] = useState(defaultToDate);
  const [fetchCompleteFormData] = useLazyGetAllCompleteFromQuery();

  useEffect(() => {
    if (fromDate && toDate) {
      fetchData();
    }
  }, [Flow_name, fromDate, toDate]);

  const fetchData = async () => {
    setLoading(true);
    const requestData = {
      flow_name: Flow_name,
      from_date: fromDate,
      to_date: toDate,
    };
    try {
      const response = await fetchCompleteFormData(requestData);
      if (
        response?.data?.message ===
        'No records found for the specified date range and flow name.'
      ) {
        setData([]);
        setNoDataFound(true);
      } else {
        setData(response?.message || []);
        setNoDataFound(false);
      }
    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRecord = ({item}) => {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDarkMode ? colors.white : colors.black,
            borderColor: isDarkMode ? colors.grey600 : colors.grey300,
          },
        ]}>
        <AnimatedComponentToggle
          tabName={item?.Contact || 'Unknown Contact'}
          isLeftImg={true}
          leftImage={SvgIcon.PersonIcon}
          tabNameStyle={{
            color: colors.black,
            fontSize: textScale(16),
            fontFamily: fontNames.ROBOTO_FONT_FAMILY_MEDIUM,
          }}>
          <TextComponent
            text={`Received At: ${item['Timestamp Sending'] || 'Unknown'}`}
            color={isDarkMode ? Colors.dark.black : Colors.light.white}
            size={textScale(16)}
            style={{
              opacity: 0.8,
              marginBottom: spacing.MARGIN_12,
              paddingHorizontal: spacing.PADDING_16,
            }}
            font={fontNames.ROBOTO_FONT_FAMILY_MEDIUM}
          />
          {/* Dynamically render each field */}
          {Object.entries(item).map(([key, value], index) => {
            if (Array.isArray(value)) {
              // Handle arrays (e.g., Select Features, Attach Documents, etc.)
              return (
                <AnimatedComponentToggle
                  key={index}
                  tabName={key}
                  tabNameStyle={{color: colors.grey700}}>
                  {value.map((val, idx) => {
                    // Handle object inside arrays like Attach Documents
                    if (typeof val === 'object') {
                      return (
                        <View key={idx} style={styles.sectionItem}>
                          {Object.entries(val).map(([docKey, docValue]) => (
                            <TextComponent
                              text={`${docKey}: ${docValue}`}
                              key={docKey}
                              color={
                                isDarkMode
                                  ? Colors.light.white
                                  : Colors.dark.black
                              }
                              size={textScale(14)}
                              style={{
                                paddingHorizontal: spacing.PADDING_16,
                                paddingVertical: spacing.PADDING_2,
                              }}
                            />
                          ))}
                        </View>
                      );
                    }
                    return (
                      <TextComponent
                        text={`- ${val}`}
                        key={idx}
                        color={
                          isDarkMode ? Colors.dark.black : Colors.light.white
                        }
                        size={textScale(14)}
                        style={{
                          paddingHorizontal: spacing.PADDING_16,
                          paddingVertical: spacing.PADDING_2,
                          opacity: 0.8,
                        }}
                      />
                    );
                  })}
                </AnimatedComponentToggle>
              );
            } else if (typeof value === 'object' && value !== null) {
              // Handle nested objects (if applicable)
              return (
                <AnimatedComponentToggle
                  key={index}
                  tabName={key}
                  tabNameStyle={{color: colors.grey700}}>
                  {Object.entries(value).map(([nestedKey, nestedValue]) => (
                    <TextComponent
                      text={`${nestedKey}: ${nestedValue}`}
                      key={nestedKey}
                      color={
                        isDarkMode ? Colors.dark.black : Colors.light.white
                      }
                      style={{
                        opacity: 0.7,
                        paddingHorizontal: spacing.PADDING_16,
                        paddingVertical: spacing.PADDING_2,
                      }}
                      size={textScale(14)}
                    />
                  ))}
                </AnimatedComponentToggle>
              );
            } else if (value !== null) {
              // Handle primitive values (string, number, boolean)
              return (
                <View key={index} style={styles.infoRow}>
                  <TextComponent
                    text={key?.replace(/_/g, ' ')}
                    color={isDarkMode ? Colors.dark.black : Colors.light.white}
                    style={{opacity: 0.8}}
                    size={textScale(14)}
                  />
                  <TextComponent
                    text={value?.toString()}
                    color={isDarkMode ? Colors.dark.black : Colors.light.white}
                    style={{opacity: 0.8}}
                    size={textScale(14)}
                  />
                </View>
              );
            }
            return null;
          })}
        </AnimatedComponentToggle>
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? Colors.light.white : Colors.dark.black,
      }}>
      <CommoneHeader
        title={`${truncateText(Flow_name, 50)}`}
        showLeftIcon={true}
        onLeftIconPress={() => goBack()}
        showRightIcons={true}
        rightIcons={[SvgIcon.Filter]}
        onRightIconPress={() => filterBottomSheetRef.current?.present()}
      />

      {/* Date Pickers */}
      {/* <View style={styles.customDatePickersContainer}>
        <CustomDatePicker
          label={fromDate ? fromDate : 'Select From Date'}
          selectedDate={fromDate}
          onDateChange={(date) => setFromDate(date)}
          placeholder="Pick a from date"
        />
        <CustomDatePicker
          label={toDate ? toDate : 'Select To Date'}
          selectedDate={toDate}
          onDateChange={(date) => setToDate(date)}
          placeholder="Pick a to date"
        />
      </View> */}

      {loading ? (
        <LoadingScreen color={colors.green} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderRecord}
          contentContainerStyle={styles.listContentContainer}
          ListEmptyComponent={() => (
            <View style={[styles.noDataContainer]}>
              <TextComponent
                text={
                  'No records found for the specified date range and flow name.'
                }
                color={isDarkMode ? Colors.dark.black : Colors.light.white}
                size={textScale(18)}
                textAlign={'center'}
              />
            </View>
          )}
        />
      )}
      <CustomBottomSheet
        ref={filterBottomSheetRef}
        snapPoints={['30%']}></CustomBottomSheet>
    </View>
  );
};

export default FormResponseCompleteScreen;

const styles = StyleSheet.create({
  listContentContainer: {
    paddingBottom: spacing.PADDING_16,
  },
  card: {
    backgroundColor: colors.white,
    borderBottomWidth: 0.2,
    borderRadius: spacing.RADIUS_8,
  },
  datePickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.PADDING_16,
    paddingVertical: spacing.PADDING_12,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.PADDING_12,
    borderRadius: spacing.RADIUS_8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  datePickerText: {
    color: colors.white,
    marginLeft: spacing.MARGIN_8,
    fontSize: textScale(14),
  },
  customDatePickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.PADDING_16,
    paddingVertical: spacing.PADDING_12,
  },
  timestampText: {
    fontSize: textScale(12),
    color: colors.grey500,
    marginBottom: spacing.MARGIN_12,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
    paddingHorizontal: spacing.PADDING_16,
  },
  sectionItem: {
    fontSize: textScale(14),
    color: colors.grey900,
    paddingVertical: spacing.PADDING_2,
    paddingHorizontal: spacing.PADDING_16,
  },
  extraInfoContainer: {
    marginTop: spacing.MARGIN_12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.MARGIN_4,
    paddingHorizontal: spacing.PADDING_16,
  },
  detailsText: {
    fontSize: textScale(14),
    color: colors.grey700,
  },
  detailsValue: {
    fontSize: textScale(14),
    fontWeight: 'bold',
    color: colors.black,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.PADDING_16,
  },
  noDataText: {
    fontSize: textScale(18),
    color: colors.grey700,
    textAlign: 'center',
    fontFamily: fontNames.POPPINS_FONT_FAMILY_EXTRA_BOLD,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
