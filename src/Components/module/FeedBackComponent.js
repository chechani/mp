import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useLazyGetAllFilteredComplaintsDataQuery,
  useLazyGetAllPanchayatQuery,
  useLazyGetAllProfessionQuery,
  useLazyGetAllStatusQuery,
  useLazyGetAllTehsilQuery,
  useLazyGetAllVillagesQuery,
} from '../../api/store/slice/feedBackSlice';
import * as SvgIcon from '../../assets';
import {useTheme} from '../hooks';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import {openDrawer} from '../../Utils/helperFunctions';
import FeedBackColums from '../Colums/FeedBackColums';
import CommoneHeader from '../Common/CommoneHeader';
import LoadingScreen from '../Common/Loader';
import RegularText from '../Common/RegularText';
import CustomButton from '../Common/CustomButton';
import TextComponent from '../Common/TextComponent';
import CustomInput from '../Common/CustomInput';
import Colors from '../../theme/colors';
import CustomModal from '../Common/CustomModal';

const ComplainsComponent = () => {
  const {theme} = useTheme();
  const isDarkMode = theme === THEME_COLOR;

  // State for filters
  const [filters, setFilters] = useState({
    village: '',
    panchayat: '',
    tehsil: '',
    profession: '',
    mobile: '',
    status: '',
  });

  const [filtersApplied, setFiltersApplied] = useState(false);
  const [modalVisible, setModalVisible] = useState({key: null, visible: false});
  const [isFetchingFilterData, setIsFetchingFilterData] = useState(false);
  const [isDataAvailable, setIsDataAvailable] = useState(false);
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [complaintsData, setComplaintsData] = useState([]);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Lazy Queries for fetching filter options
  const [
    triggerGetAllVillages,
    {data: villages, isFetching: isFetchingVillages},
  ] = useLazyGetAllVillagesQuery();
  const [
    triggerGetAllPanchayat,
    {data: panchayats, isFetching: isFetchingPanchayats},
  ] = useLazyGetAllPanchayatQuery();
  const [triggerGetAllTehsil, {data: tehsils, isFetching: isFetchingTehsils}] =
    useLazyGetAllTehsilQuery();
  const [
    triggerGetAllProfession,
    {data: professions, isFetching: isFetchingProfessions},
  ] = useLazyGetAllProfessionQuery();
  const [
    triggerGetAllStatus,
    {data: statuses, isFetching: isFetchingStatuses},
  ] = useLazyGetAllStatusQuery();
  const [triggerGetAllFilteredComplaintsData] =
    useLazyGetAllFilteredComplaintsDataQuery();

  useEffect(() => {
    fetchComplaintsData(1);
  }, [filters]);

  const fetchComplaintsData = async currentPage => {
    if (isFetching) return;

    if (currentPage === 1) setIsRefreshing(true);
    setIsFetching(true);
    try {
      const response = await triggerGetAllFilteredComplaintsData({
        page: currentPage,
        limit: 20,
        village: filters.village,
        panchayat: filters.panchayat,
        tehsil: filters.tehsil,
        profession: filters.profession,
        mobile: filters.mobile,
        status: filters.status,
      }).unwrap();
      const newData = response.data.tickets;
      setHasMoreData(newData.length > 0);
      setComplaintsData(prevData =>
        currentPage === 1 ? newData : [...prevData, ...newData],
      );
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setIsFetching(false);
      setIsRefreshing(false);
    }
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prevFilters => ({...prevFilters, [filterKey]: value}));
    setModalVisible({key: null, visible: false});
  };

  const handleMobileChange = text => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    if (cleanedText.length <= 10) {
      setFilters(prevFilters => ({...prevFilters, mobile: cleanedText}));
    }
  };

  const handleApplyFilters = () => {
    if (areAllFiltersSelected()) {
      setPage(1);
      setFiltersApplied(true);
    }
  };

  const handleResetFilters = useCallback(() => {
    setFilters({
      village: '',
      panchayat: '',
      tehsil: '',
      profession: '',
      mobile: '',
      status: '',
    });
    setFiltersApplied(false);
  }, []);

  const loadMoreData = () => {
    if (!isFetching && hasMoreData) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchComplaintsData(nextPage);
    }
  };

  const refreshData = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchComplaintsData(1, true);
  };

  // Render footer for loading indicator
  const RenderFooter = () => {
    if (isFetching && !isRefreshing) {
      return (
        <ActivityIndicator
          size="large"
          color="green"
          style={{marginVertical: 20}}
        />
      );
    }
    return null;
  };

  // Open filter modal and trigger corresponding lazy query
  const openModal = key => {
    setModalVisible({key, visible: true});
    setIsFetchingFilterData(true);
    switch (key) {
      case 'society':
        triggerGetAllVillages({
          panchayat: filters.panchayat,
          tehsil: filters.tehsil,
        });
        break;
      case 'Ward':
        triggerGetAllPanchayat({tehsil: 'Indore'});
        break;
      case 'tehsil':
        triggerGetAllTehsil();
        break;
      case 'profession':
        triggerGetAllProfession();
        break;
      case 'status':
        triggerGetAllStatus();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (
      !isFetchingVillages &&
      !isFetchingPanchayats &&
      !isFetchingTehsils &&
      !isFetchingProfessions &&
      !isFetchingStatuses
    ) {
      const currentData =
        modalVisible.key && filterData[modalVisible.key]?.data;

      if (currentData && currentData.length > 0) {
        setIsDataAvailable(true);
      } else {
        setIsDataAvailable(false);
      }

      setIsFetchingFilterData(false);
    }
  }, [
    isFetchingVillages,
    isFetchingPanchayats,
    isFetchingTehsils,
    isFetchingProfessions,
    isFetchingStatuses,
    modalVisible.key,
  ]);

  const filterData = {
    society: villages,
    Ward: panchayats,
    tehsil: tehsils,
    profession: professions,
    status: statuses,
  };

  const areAllFiltersSelected = () => {
    return (
      filters.society !== '' ||
      filters.society !== '' ||
      filters.tehsil !== '' ||
      filters.profession !== '' ||
      filters.status !== '' ||
      filters.mobile !== ''
    );
  };

  return (
    <View style={{flex: 1}}>
      <CommoneHeader
        title="FeedBack"
        showLeftIcon={true}
        leftIcon={SvgIcon.MenuIcon}
        onLeftIconPress={() => openDrawer()}
        showRightIcons={true}
        rightIcons={[SvgIcon.ReloadIcon]}
      />

      <View style={styles.filterContainer}>
        {/* Filter dropdown buttons */}
        {['Ward', 'society', 'profession', 'status'].map(key => {
          let displayValue = '';

          switch (key) {
            case 'Ward':
              displayValue = filters.panchayat
                ? filterData?.panchayat?.data?.find(
                    item => item.name === filters.name,
                  )?.panchayat
                : '';
              break;

            case 'society':
              displayValue = filters.village
                ? filterData?.village?.data?.find(
                    item => item.name === filters.village,
                  )?.village_name
                : '';
              break;
            case 'profession':
              displayValue = filters.profession
                ? filterData.profession?.data?.find(
                    item => item.name === filters.profession,
                  )?.profession
                : '';
              break;
            case 'status':
              displayValue = filters.status ? filters.status : '';
              break;
            default:
              displayValue = filters[key] || '';
              break;
          }
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.filterItem,
                {
                  backgroundColor: !isDarkMode
                    ? Colors.dark.grey
                    : Colors.light.grey,
                },
              ]}
              onPress={() => openModal(key)}>
              <TextComponent
                text={
                  displayValue
                    ? displayValue
                    : `${key.charAt(0).toUpperCase() + key.slice(1)}`
                }
                color={isDarkMode ? Colors.dark.black : Colors.light.white}
              />
            </TouchableOpacity>
          );
        })}

        <CustomInput
          styles={styles.mobileInput}
          placeholder="Mobile"
          value={filters.mobile}
          onChange={handleMobileChange}
          maxLength={10}
          inputStyles={{
            color: isDarkMode ? Colors.dark.white : Colors.light.white,
          }}
        />
      </View>

      <View style={{alignItems: 'flex-end'}}>
        {/* Reset Filters Button */}
        <CustomButton
          title="Reset"
          onPress={handleResetFilters}
          disabled={!areAllFiltersSelected()}
          style={{
            width: '30%',
            marginRight: spacing.MARGIN_8,
          }}
          textStyle={{fontSize: textScale(12)}}
        />
      </View>

      {isRefreshing ? (
        <LoadingScreen />
      ) : (
        <FlashList
          data={complaintsData}
          renderItem={({item}) => (
            <FeedBackColums
              item={item}
              fetchData={() => fetchComplaintsData(1)}
            />
          )}
          estimatedItemSize={100}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.1}
          ListFooterComponent={RenderFooter}
          refreshing={isRefreshing}
          onRefresh={refreshData}
          ListEmptyComponent={
            !isFetching &&
            complaintsData.length === 0 && (
              <TextComponent
                text={'No complaints available'}
                size={textScale(16)}
                style={{
                  color: isDarkMode ? Colors.dark.black : Colors.light.white,
                  textAlign: 'center',
                }}
              />
            )
          }
        />
      )}

      <CustomModal
        visible={modalVisible.visible}
        onClose={() => setModalVisible({key: null, visible: false})}
        title={`Select ${modalVisible.key}`}>
        {isFetchingFilterData ? (
          <ActivityIndicator size="large" color={Colors.default.primaryText} />
        ) : isDataAvailable ? (
          <ScrollView style={styles.modalScrollView}>
            {modalVisible.key === 'status' ? (
              filterData[modalVisible.key]?.data?.length > 0 ? (
                filterData[modalVisible.key]?.data?.map((item, index) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.modalItem}
                      onPress={() =>
                        handleFilterChange(modalVisible.key, item)
                      }>
                      <TextComponent
                        text={item}
                        size={textScale(16)}
                        color={
                          isDarkMode ? Colors.dark.black : Colors.light.white
                        }
                      />
                    </TouchableOpacity>
                  );
                })
              ) : (
                <TextComponent
                  text={'No options available'}
                  size={textScale(16)}
                  color={isDarkMode ? Colors.dark.black : Colors.light.white}
                />
              )
            ) : Array.isArray(filterData[modalVisible.key]?.data) &&
              filterData[modalVisible.key]?.data?.length > 0 ? (
              filterData[modalVisible.key]?.data?.map((item, index) => {
                let label = '';
                let value = '';

                switch (modalVisible.key) {
                  case 'society':
                    label = item.village_name || 'Unnamed Society';
                    value = item.name;
                    break;
                  case 'ward':
                    label = item.panchayat || 'Unnamed Ward';
                    value = item.name;
                    break;
                  case 'tehsil':
                    label = item.tehsil_name_hindi || 'Unnamed Tehsil';
                    value = item.name;
                    break;
                  case 'profession':
                    label = item.profession_hindi || 'Unnamed Profession';
                    value = item.name;
                    break;
                  default:
                    label = item.name;
                    value = item.name;
                    break;
                }
                return (
                  <TouchableOpacity
                    key={value}
                    style={styles.modalItem}
                    onPress={() => handleFilterChange(modalVisible.key, value)}>
                    <TextComponent
                      text={label}
                      size={textScale(16)}
                      color={
                        isDarkMode ? Colors.dark.black : Colors.light.white
                      }
                    />
                  </TouchableOpacity>
                );
              })
            ) : (
              <TextComponent
                text={'No options available'}
                size={textScale(16)}
                color={isDarkMode ? Colors.dark.black : Colors.light.white}
              />
            )}
          </ScrollView>
        ) : (
          <TextComponent
            text={'No options available'}
            size={textScale(16)}
            color={isDarkMode ? Colors.dark.black : Colors.light.white}
          />
        )}
        <CustomButton
          title={'Close'}
          onPress={() => setModalVisible({key: null, visible: false})}
        />
      </CustomModal>
    </View>
  );
};

export default ComplainsComponent;

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.PADDING_8,
    flexWrap: 'wrap',
  },
  filterItem: {
    width: '30%',
    marginVertical: spacing.MARGIN_6,
    paddingVertical: spacing.PADDING_14,
    borderRadius: spacing.RADIUS_8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  mobileInput: {
    width: '31%',
  },

  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: Colors.default.white,
    borderTopLeftRadius: spacing.RADIUS_20,
    borderTopRightRadius: spacing.RADIUS_20,
    padding: spacing.PADDING_20,
    alignItems: 'center',
  },

  modalScrollView: {
    width: '100%',
    marginBottom: spacing.MARGIN_10,
  },
  modalItem: {
    paddingVertical: spacing.PADDING_10,
  },
});
