import React, {useRef, useState} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useGetAllFromDataQuery} from '../../api/store/slice/formSlice';
import * as SvgIcon from '../../assets';
import NavigationString from '../../Navigations//NavigationString';
import {boxShadow} from '../../styles/Mixins';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import Colors from '../../theme/colors';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import {navigate, openDrawer, truncateText} from '../../Utils/helperFunctions';
import CommoneHeader from '../Common/CommoneHeader';
import CustomBottomSheet from '../Common/CustomBottomSheet';
import CustomBottomSheetFlatList from '../Common/CustomBottomSheetFlatList';
import CustomButton from '../Common/CustomButton';
import LoadingScreen from '../Common/Loader';
import TextComponent from '../Common/TextComponent';
import {useTheme} from '../hooks';

const FormListComponent = () => {
  const {theme} = useTheme();
  const isDarkMode = theme === THEME_COLOR;
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formName, setFormName] = useState('');
  const bottomSheetRef = useRef(null);
  const filterFormCategoryBottomSheet = useRef(null);
  const {data, isLoading, refetch} = useGetAllFromDataQuery();

  const filteredFlows =
    selectedCategory === ''
      ? data?.message?.data
      : data?.message?.data.filter(flow => flow.category === selectedCategory);

  const renderFlowItem = ({item}) => {
    return (
      <>
        <TouchableOpacity
          style={[styles.card]}
          onPress={() => {
            bottomSheetRef.current?.present(), setFormName(item?.name);
          }}>
          {item?.name && (
            <TextComponent
              text={`${truncateText(item?.name, 50).replace(/_/g, ' ')}`}
              color={isDarkMode ? Colors.dark.black : Colors.light.white}
              font={fontNames.ROBOTO_FONT_FAMILY_MEDIUM}
            />
          )}
          {item?.category && (
            <TextComponent
              text={item?.category}
              color={isDarkMode ? Colors.dark.black : Colors.light.white}
              size={textScale(13)}
              font={fontNames.ROBOTO_FONT_FAMILY_MEDIUM}
            />
          )}
          {item?.flow_description && (
            <TextComponent
              text={truncateText(item?.flow_description, 30)}
              color={isDarkMode ? Colors.dark.black : Colors.light.white}
              font={fontNames.ROBOTO_FONT_FAMILY_MEDIUM}
              style={{opacity: 0.6}}
            />
          )}
        </TouchableOpacity>
        <View
          style={[
            styles.divider,
            {
              backgroundColor: isDarkMode ? colors.grey300 : colors.grey600,
            },
          ]}
        />
      </>
    );
  };

  // FilterFormCategory
  const renderFilterFormCategoryItem = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedCategory(item);
        filterFormCategoryBottomSheet.current.close();
      }}
      style={[
        styles.filterOption,
        selectedCategory === item && styles.selectedFilterOption,
      ]}>
      <TextComponent
        text={item}
        color={
          selectedCategory === item
            ? Colors.default.white
            : Colors.default.black
        }
        style={{padding: spacing.PADDING_10}}
        textAlign={'center'}
      />
    </TouchableOpacity>
  );
  const filterFormCategoryListHeaderComponent = () => (
    <TextComponent
      text={'Filter by Category'}
      color={isDarkMode ? Colors.dark.black : Colors.light.white}
      style={{alignSelf: 'center'}}
      size={textScale(18)}
      font={fontNames.ROBOTO_FONT_FAMILY_MEDIUM}
    />
  );
  const filterFormCategoryListEmptyComponent = () => (
    <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
      <TextComponent
        text={'No Data Present'}
        color={isDarkMode ? Colors.dark.black : Colors.light.white}
        size={textScale(16)}
        font={fontNames.ROBOTO_FONT_FAMILY_BOLD}
      />
    </View>
  );
  const handleRightIconPress = index => {
    const actions = {
      0: () => filterFormCategoryBottomSheet.current.present(),
      1: () => refetch(),
    };

    const action = actions[index];
    if (action) {
      action();
    } else {
      console.log(index);
    }
  };
  return (
    <>
      <CommoneHeader
        title={'Form'}
        showLeftIcon={true}
        leftIcon={SvgIcon.MenuIcon}
        onLeftIconPress={() => {
          openDrawer(), setSelectedCategory('');
        }}
        showRightIcons={true}
        rightIcons={[SvgIcon.Filter, SvgIcon.ReloadIcon]}
        onRightIconPress={handleRightIconPress}
      />

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <View style={[styles.container]}>
          <View style={{margin: spacing.MARGIN_16}}>
            <TextComponent
              text={'Reset All'}
              color={
                selectedCategory
                  ? Colors.default.primaryColor
                  : isDarkMode
                  ? Colors.default.black
                  : Colors.light.white
              }
              font={fontNames.ROBOTO_FONT_FAMILY_MEDIUM}
              onPress={() => setSelectedCategory('')}
            />
          </View>

          <FlatList
            data={filteredFlows}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderFlowItem}
            contentContainerStyle={styles.flatListContainer}
            ListEmptyComponent={() => (
              <TextComponent
                text={'No flows found for the selected category.'}
                color={isDarkMode ? Colors.dark.black : Colors.light.white}
                textAlign={'center'}
                style={{marginTop: spacing.MARGIN_20}}
              />
            )}
          />
        </View>
      )}
      <CustomBottomSheet ref={bottomSheetRef} snapPoints={['30%']}>
        <View
          style={{
            marginHorizontal: spacing.MARGIN_12,
          }}>
          <CustomButton
            title={'Completed'}
            onPress={() => {
              navigate(NavigationString.FormResponseCompleteScreen, {
                Flow_name: formName,
              }),
                bottomSheetRef.current?.dismiss();
            }}
          />
          <CustomButton
            title={'Incompleted'}
            onPress={() => {
              navigate(NavigationString.FormResponseInCompleteScreen, {
                Flow_name: formName,
              });
              bottomSheetRef.current?.dismiss();
            }}
            buttonStyle={{marginVertical: spacing.MARGIN_12}}
          />
        </View>
      </CustomBottomSheet>

      <CustomBottomSheetFlatList
        ref={filterFormCategoryBottomSheet}
        snapPoints={['50%']}
        data={data?.message?.unique_categories}
        renderItem={renderFilterFormCategoryItem}
        keyExtractor={item => item.toString()}
        ListHeaderComponent={filterFormCategoryListHeaderComponent}
        ListEmptyComponent={filterFormCategoryListEmptyComponent}
        contentContainerStyle={styles.flatListContainer}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: {
    color: colors.white,
    fontSize: textScale(14),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
    padding: spacing.PADDING_10,
  },
  activeFilter: {
    fontWeight: 'bold',
    color: colors.black,
    padding: spacing.PADDING_10,
  },
  dropdown: {
    marginVertical: spacing.MARGIN_10,
    backgroundColor: colors.white,
    borderRadius: spacing.RADIUS_8,
    borderColor: '#ddd',
    ...boxShadow('#ddd', {height: 2, width: 0}, 8, 0.1),
  },
  dropdownContainer: {
    backgroundColor: colors.grey200,
    borderColor: '#ddd',
    borderRadius: spacing.RADIUS_8,
  },
  dropdownText: {
    fontSize: textScale(14),
    color: colors.grey800,
  },
  dropdownBadge: {
    backgroundColor: '#e0f7fa',
    borderRadius: spacing.RADIUS_20,
  },
  dropdownBadgeText: {
    color: '#00796b',
  },
  flatListContainer: {
    paddingBottom: spacing.PADDING_20,
  },
  card: {
    padding: spacing.PADDING_14,
  },
  cardTitle: {
    fontSize: textScale(14),
    color: colors.black,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_MEDIUM,
  },
  categoryTag: {
    backgroundColor: colors.green100,
    paddingHorizontal: spacing.PADDING_10,
    paddingVertical: spacing.PADDING_5,
    borderRadius: spacing.RADIUS_8,
    alignSelf: 'flex-start',
    marginBottom: spacing.MARGIN_10,
  },
  categoryText: {
    color: colors.black,
    fontSize: textScale(13),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_MEDIUM,
  },
  description: {
    fontSize: textScale(14),
    color: colors.grey800,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_MEDIUM,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: spacing.MARGIN_20,
    color: colors.grey800,
    fontSize: textScale(14),
  },
  formCompletionCheckBtn: {
    paddingVertical: spacing.PADDING_12,
    marginHorizontal: spacing.MARGIN_16,
    marginVertical: spacing.MARGIN_6,
    backgroundColor: colors.green600,
    borderWidth: 0,
  },
  formCompletionCheckBtnTextStyle: {
    fontSize: textScale(14),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
    color: colors.white,
  },
  filterContainer: {
    padding: spacing.PADDING_16,
  },
  filterOption: {
    paddingVertical: spacing.PADDING_6,
    paddingHorizontal: spacing.PADDING_16,
    backgroundColor: colors.green200,
    marginVertical: spacing.MARGIN_4,
    marginHorizontal: spacing.MARGIN_16,
    borderRadius: spacing.RADIUS_8,
  },
  selectedFilterOption: {
    backgroundColor: colors.green,
  },
  filterOptionText: {
    fontSize: textScale(14),
    color: colors.black,
  },
  selectedFilterOptionText: {
    fontWeight: 'bold',
    color: colors.white,
  },
  filterTitle: {
    fontSize: textScale(18),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
    alignSelf: 'center',
  },
  refreshtBtnContainer: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.RADIUS_6,
    padding: spacing.PADDING_4,
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.grey300,
  },
});

export default FormListComponent;
