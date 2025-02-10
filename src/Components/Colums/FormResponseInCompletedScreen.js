import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {useLazyGetAllInCompleteFromQuery} from '../../api/store/slice/formSlice';
import * as SvgIcon from '../../assets';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import Colors from '../../theme/colors';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import {goBack, truncateText} from '../../Utils/helperFunctions';
import AnimatedComponentToggle from '../Common/AnimatedComponentToggale';
import CommoneHeader from '../Common/CommoneHeader';
import TextComponent from '../Common/TextComponent';
import {useTheme} from '../hooks';

const FormResponseInCompletedScreen = ({route}) => {
  const {theme} = useTheme();
  const isDarkMode = theme === THEME_COLOR;
  // Calculate default dates
  const today = new Date();
  const priorDate = new Date().setDate(today.getDate() - 30);
  const defaultFromDate = new Date(priorDate).toISOString().split('T')[0];
  const defaultToDate = today.toISOString().split('T')[0];

  const {Flow_name} = route.params;
  const [noDataFound, setNoDataFound] = useState(false);
  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [featchInCompleteData] = useLazyGetAllInCompleteFromQuery();

  useEffect(() => {
    if (fromDate && toDate) {
      fetchData();
    }
  }, [Flow_name, fromDate, toDate]);

  const fetchData = async () => {
    const requestData = {
      flow_name: Flow_name,
      from_date: fromDate,
      to_date: toDate,
    };
    try {
      const response = await featchInCompleteData(requestData);
      if (
        response?.data?.message?.message ===
        'No records found for the specified date range and flow name.'
      ) {
        setData([]);
        setNoDataFound(true);
      } else {
        setData(response?.message?.data || []);
        setNoDataFound(false);
      }
    } catch (error) {
      console.log('Error fetching data:', error);
    }
  };

  const renderRecord = ({item, index}) => {
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
          tabName={item.contact === null ? item?.user_wa : item?.contact}
          isLeftImg={true}
          leftImage={SvgIcon.PersonIcon}
          tabNameStyle={{
            color: colors.black,
            fontSize: textScale(16),
            fontFamily: fontNames?.ROBOTO_FONT_FAMILY_MEDIUM,
          }}>
          <TextComponent
            text={`Received At: ${item?.timestamp_sending}`}
            color={isDarkMode ? Colors.dark.black : Colors.light.white}
            size={textScale(12)}
            style={{
              marginBottom: spacing.MARGIN_12,
              paddingHorizontal: spacing.PADDING_16,
              opacity: 0.8,
            }}
          />
        </AnimatedComponentToggle>
      </View>
    );
  };
  return (
    <View
      style={{
        backgroundColor: isDarkMode ? colors.white : colors.black,
        flex: 1,
      }}>
      <CommoneHeader
        title={`${truncateText(Flow_name, 50)}`}
        showLeftIcon={true}
        onLeftIconPress={() => goBack()}
      />

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
    </View>
  );
};

export default FormResponseInCompletedScreen;

const styles = StyleSheet.create({
  listContentContainer: {
    paddingBottom: spacing.PADDING_16,
  },
  noDataText: {
    fontSize: textScale(18),
    color: colors.grey700,
    textAlign: 'center',
    fontFamily: fontNames.POPPINS_FONT_FAMILY_EXTRA_BOLD,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.PADDING_16,
  },
  card: {
    backgroundColor: colors.white,
    borderBottomWidth: 0.2,
    borderRadius: spacing.RADIUS_8,
  },
  recordDetails: {
    padding: spacing.PADDING_12,
  },
  detailText: {
    fontSize: textScale(14),
    color: colors.black,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
    marginBottom: spacing.MARGIN_4,
  },
  timestampText: {
    fontSize: textScale(12),
    color: colors.grey500,
    marginBottom: spacing.MARGIN_12,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
    paddingHorizontal: spacing.PADDING_16,
  },
});
