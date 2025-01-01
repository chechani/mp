import React, { useRef, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useGetAllFromDatQuery } from '../../api/store/slice/formSlice';
import * as SvgIcon from '../../assets';
import NavigationString from '../../Navigations//NavigationString';
import { boxShadow } from '../../styles/Mixins';
import { textScale } from '../../styles/responsiveStyles';
import { spacing } from '../../styles/spacing';
import { fontNames } from '../../styles/typography';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import { navigate, openDrawer, truncateText } from '../../Utils/helperFunctions';
import BottonComp from '../Common/BottonComp';
import CommoneHeader from '../Common/CommoneHeader';
import CustomBottomSheet from '../Common/CustomBottomSheet';
import CustomBottomSheetFlatList from '../Common/CustomBottomSheetFlatList';
import LoadingScreen from '../Common/Loader';
import RegularText from '../Common/RegularText';
import { useTheme } from '../hooks';

const FormListComponent = () => {
  const {theme} = useTheme();
  const isDarkMode = theme === THEME_COLOR
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [formName, setFormName] = useState('');
  const bottomSheetRef = useRef(null);
  const filterFormCategoryBottomSheet = useRef(null);
  const {data, isLoading} = useGetAllFromDatQuery();
  
  const filteredFlows =
    selectedCategory === 'All'
      ? data?.message?.data
      : data?.message?.data.filter(flow => flow.category === selectedCategory);

  const renderFlowItem = ({item}) => {
    return (
      <>
        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor:
                isDarkMode ? colors.white : colors.black,
            },
          ]}
          onPress={() => {
            bottomSheetRef.current?.present(), setFormName(item?.name);
          }}>
          {item?.name && (
            <RegularText
              style={[
                styles.cardTitle,
                {color: isDarkMode ? colors.black : colors.white},
              ]}>{`${truncateText(item?.name, 50).replace(
              /_/g,
              ' ',
            )}`}</RegularText>
          )}
          {item?.category && (
            <RegularText
              style={[
                styles.categoryText,
                {color: isDarkMode ? colors.black : colors.grey300},
              ]}>
              {item?.category}
            </RegularText>
          )}
          {item?.flow_description && (
            <RegularText
              style={[
                styles.description,
                {
                  color:
                    isDarkMode ? colors.grey800 : colors.grey500,
                },
              ]}>
              {truncateText(item?.flow_description, 30)}
            </RegularText>
          )}
        </TouchableOpacity>
        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                isDarkMode ? colors.grey300 : colors.grey600,
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
      <RegularText
        style={[
          styles.filterText,
          selectedCategory === item && {color: colors.black},
        ]}>
        {item}
      </RegularText>
    </TouchableOpacity>
  );
  const filterFormCategoryListHeaderComponent = () => (
    <RegularText
      style={[
        styles.filterTitle,
        {color: isDarkMode ? colors.black : colors.white},
      ]}>
      Filter by Category
    </RegularText>
  );
  const filterFormCategoryListEmptyComponent = () => (
    <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
      <RegularText
        style={{
          fontSize: textScale(16),
          fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
          color: isDarkMode ? colors.black : colors.white,
        }}>
        No Data Present
      </RegularText>
    </View>
  );

  return (
    <>
      <CommoneHeader
        title={'Form'}
        showLeftIcon={true}
        leftIcon={SvgIcon.MenuIcon}
        onLeftIconPress={() => {
          openDrawer(), setSelectedCategory('All');
        }}
        showRightIcons={true}
        rightIcons={[SvgIcon.Filter]}
        onRightIconPress={() => filterFormCategoryBottomSheet.current.present()}
      />

      {isLoading ? (
        <LoadingScreen color={colors.green} />
      ) : (
        <View
          style={[
            styles.container,
            {
              backgroundColor:
                isDarkMode ? colors.white : colors.black,
            },
          ]}>
          <View
            style={{
              marginHorizontal: spacing.MARGIN_16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <RegularText
              onPress={() => setSelectedCategory('All')}
              style={[
                styles.filterText,
                selectedCategory === 'All' && styles.activeFilter,
                {color: isDarkMode ? colors.black : colors.white},
              ]}>
              Reset All
            </RegularText>
            <TouchableOpacity
              onPress={() => fetchData()}
              style={[
                styles.refreshtBtnContainer,
                {marginLeft: spacing.MARGIN_6},
              ]}>
              <SvgIcon.ReloadIcon
                width={spacing.WIDTH_30}
                height={spacing.HEIGHT_30}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredFlows}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderFlowItem}
            contentContainerStyle={styles.flatListContainer}
            ListEmptyComponent={() => (
              <RegularText
                style={[
                  styles.noDataText,
                  {color: isDarkMode ? colors.black : colors.white},
                ]}>
                No flows found for the selected category.
              </RegularText>
            )}
          />
        </View>
      )}
      <CustomBottomSheet ref={bottomSheetRef} snapPoints={['25%']}>
        <BottonComp
          text="Completed"
          style={styles.formCompletionCheckBtn}
          textStyle={styles.formCompletionCheckBtnTextStyle}
          onPress={() => {
            navigate(NavigationString.FormResponseCompleteScreen, {
              Flow_name: formName,
            }),
              bottomSheetRef.current?.dismiss();
          }}
        />
        <BottonComp
          text="In Completed"
          style={styles.formCompletionCheckBtn}
          textStyle={styles.formCompletionCheckBtnTextStyle}
          onPress={() => {
            navigate(NavigationString.FormResponseInCompleteScreen, {
              Flow_name: formName,
            });
            bottomSheetRef.current?.dismiss();
          }}
        />
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
    backgroundColor: '#f9f9f9',
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
    backgroundColor: colors.white,
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
    backgroundColor: colors.white,
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
