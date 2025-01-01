import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import * as SvgIcon from '../../assets';
import NavigationString from '../../Navigations/NavigationString';
import {boxShadow} from '../../styles/Mixins';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import {apiGet} from '../../Utils/apiCalls';
import colors from '../../Utils/colors';
import {goBack, navigate} from '../../Utils/helperFunctions';
import CommoneHeader from '../Common/CommoneHeader';
import RegularText from '../Common/RegularText';
import THEME_COLOR from '../../Utils/Constant';
import {useTheme} from '../hooks';

const RepeatTaskComponent = ({route}) => {
  const {theme} = useTheme();
  const {title, url, setData, fieldType} = route.params;
  const [data, setDataTask] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiGet(url);
        setDataTask(res?.reponse || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url]);
  const handleItemClick = item => {
    navigate(NavigationString.RepeatTask, {
      selectedValue: item,
      fieldType: fieldType, // Send fieldType to indicate which field to update
    });
  };

  return (
    <>
      {/* Header */}
      <CommoneHeader
        title={title}
        showLeftIcon={true}
        onLeftIconPress={() => goBack()}
      />
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.black} />
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor:
                theme === THEME_COLOR ? colors.white : colors.black,
            }}>
            <FlatList
              data={data}
              keyExtractor={item => `${item?.id || Math.random()}`}
              renderItem={({item}) => {
                return (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.itemCard,
                        {
                          backgroundColor:
                            theme === THEME_COLOR ? colors.white : colors.black,
                        },
                      ]}
                      onPress={() => handleItemClick(item)}>
                      {item?.name ? (
                        <RegularText
                          style={[
                            styles.itemText,
                            {
                              color:
                                theme === THEME_COLOR
                                  ? colors.black
                                  : colors.white,
                            },
                          ]}>
                          {item?.name}
                        </RegularText>
                      ) : null}
                      {item?.title ? (
                        <RegularText
                          style={[
                            styles.itemText,
                            {
                              color:
                                theme === THEME_COLOR
                                  ? colors.black
                                  : colors.white,
                            },
                          ]}>
                          {item?.title}
                        </RegularText>
                      ) : null}
                    </TouchableOpacity>
                    <View
                      style={[
                        styles.divider,
                        {
                          backgroundColor:
                            theme === THEME_COLOR
                              ? colors.grey300
                              : colors.grey600,
                        },
                      ]}
                    />
                  </>
                );
              }}
            />
          </View>
        )}
      </View>
    </>
  );
};

export default RepeatTaskComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightGrey,
  },
  itemCard: {
    backgroundColor: colors.white,
    padding: spacing.PADDING_8,
    marginVertical: spacing.MARGIN_4,
    borderRadius: spacing.RADIUS_10,
    marginHorizontal: spacing.MARGIN_16,
    ...boxShadow(),
  },
  itemText: {
    fontSize: textScale(16),
    color: colors.grey900,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
  },
  divider: {
    height: 0.5,
    marginTop: spacing.MARGIN_6,
    backgroundColor: colors.grey300,
  },
});
