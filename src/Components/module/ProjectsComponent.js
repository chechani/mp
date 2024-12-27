import DateTimePicker from '@react-native-community/datetimepicker';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import {
  useCreateProjectMutation,
  useCreateProjectSchemeMutation,
  useLazyGetAllProjectQuery,
  useLazyGetProjectAllPanchayatQuery,
  useLazyGetProjectAllVillagesQuery,
  useLazyGetProjectPanchayatQuery,
  useLazyGetProjectSchemeQuery,
  useLazyGetProjectStatusQuery,
  useLazyGetProjectTehsilQuery,
  useLazyGetProjectTypeQuery,
  useLazyGetProjectVillagesQuery,
  useUpdateProjectDetailsMutation,
} from '../../api/store/slice/ProjectSlice';
import * as SvgIcon from '../../assets';
import { textScale } from '../../styles/responsiveStyles';
import { spacing } from '../../styles/spacing';
import { fontNames } from '../../styles/typography';
import Colors from '../../theme/colors';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import { openDrawer } from '../../Utils/helperFunctions';
import ProjectlistColums from '../Colums/ProjectlistColums';
import CommoneHeader from '../Common/CommoneHeader';
import CustomBottomSheet from '../Common/CustomBottomSheet';
import CustomBottomSheetFlatList from '../Common/CustomBottomSheetFlatList';
import CustomButton from '../Common/CustomButton';
import CustomInput from '../Common/CustomInput';
import LoadingScreen from '../Common/Loader';
import RegularText from '../Common/RegularText';
import TextComponent from '../Common/TextComponent';
import { useTheme } from '../hooks';

const ProjectsComponent = () => {
  const {theme} = useTheme();
  const isDarkMode = theme === THEME_COLOR;
  const projectAddRef = useRef(null);
  const schemeBottonSheetRef = useRef(null);
  const editProjectRef = useRef(null);
  const nestedprojectBottomSheetRef = useRef(null);
  const [selectTicket, setSelectTicket] = useState({
    showModal: false,
    item: null,
  });

  const [filters, setFilters] = useState({
    village: '',
    panchayat: '',
    tehsil: '',
    status: '',
  });
  const [formState, setFormState] = useState({
    project_name: '',
    project_code: '',
    project_type: '',
    project_scheme: '',
    status: '',
    village: '',
    estimated_cost: '',
    allocated_cost: '',
    actual_cost: '',
    project_description: '',
    start_date: '',
    end_date: '',
    actual_start_date: null,
    actual_end_date: null,
  });
  const [formStateDisplay, setFormStateDisplay] = useState({
    project_type: '',
    project_scheme: '',
    status: '',
    village: '',
    start_date: '',
    end_date: '',
  });

  const [editFormState, setEditFormState] = useState({
    name: selectTicket?.item?.name || '',
    project_name: selectTicket?.item?.project_name || '',
    project_code: selectTicket?.item?.project_code || '',
    project_type: selectTicket?.item?.project_type || '',
    project_scheme: selectTicket?.item?.project_scheme || '',
    status: selectTicket?.item?.status || '',
    village: selectTicket?.item?.village || '',
    estimated_cost: selectTicket?.item?.estimated_cost || 0,
    allocated_cost: selectTicket?.item?.allocated_cost || 0,
    actual_cost: selectTicket?.item?.actual_cost || 0,
    project_description: selectTicket?.item?.detail || '',
    start_date: selectTicket?.item?.start_date || '',
    end_date: selectTicket?.item?.end_date || '',
    actual_start_date: selectTicket?.item?.actual_start_date || null,
    actual_end_date: selectTicket?.item?.actual_end_date || null,
  });

  const [editFormStateDisplay, setEditFormStateDisplay] = useState({
    project_type: '',
    project_scheme: '',
    status: '',
    village: '',
    start_date: '',
    end_date: '',
  });

  const formatDate = date => {
    if (!date) return '';
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return '';

    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = parsedDate.getFullYear().toString();

    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    if (selectTicket?.showModal && selectTicket?.item) {
      setEditFormState({
        name: selectTicket?.item?.name || '',
        project_name: selectTicket.item?.project_name || '',
        project_code: selectTicket.item?.project_code || '',
        project_type: selectTicket.item?.project_type || '',
        project_scheme: selectTicket.item?.project_scheme || '',
        status: selectTicket.item?.status || '',
        village: selectTicket.item?.village || '',
        estimated_cost: selectTicket.item?.estimated_cost || '',
        allocated_cost: selectTicket.item?.allocated_cost || '',
        actual_cost: selectTicket.item?.actual_cost || '',
        project_description: selectTicket.item?.detail || '',
        start_date: formatDate(selectTicket.item?.start_date),
        end_date: formatDate(selectTicket.item?.end_date),
        actual_start_date: formatDate(selectTicket.item?.actual_start_date),
        actual_end_date: formatDate(selectTicket.item?.actual_end_date),
      });

      setEditFormStateDisplay({
        project_type: selectTicket.item?.project_type || '',
        project_scheme: selectTicket.item?.project_scheme || '',
        status: selectTicket.item?.status || '',
        village: selectTicket.item?.village || '',
        start_date: formatDate(selectTicket.item?.start_date),
        end_date: formatDate(selectTicket.item?.end_date),
      });
      setEditProjectCode(selectTicket.item?.project_code);
    }
  }, [selectTicket]);

  const [isEditProjectCode, setEditProjectCode] = useState(true);

  const [hasMoreData, setHasMoreData] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingFilterData, setIsFetchingFilterData] = useState(false);
  const [isDataAvailable, setIsDataAvailable] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [modalVisible, setModalVisible] = useState({key: null, visible: false});
  const [projectData, setProjectData] = useState([]);
  const [currentField, setCurrentField] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [scheme, setScheme] = useState('');

  // Lazy Queries for fetching filter options
  const [triggerGetVillages, {data: villages, isFetching: isFetchingVillages}] =
    useLazyGetProjectVillagesQuery();
  const [
    triggerGetPanchayat,
    {data: panchayats, isFetching: isFetchingPanchayats},
  ] = useLazyGetProjectPanchayatQuery();
  const [triggerGetAllTehsil, {data: tehsils, isFetching: isFetchingTehsils}] =
    useLazyGetProjectTehsilQuery();
  const [
    triggerGetAllStatus,
    {data: statuses, isFetching: isFetchingStatuses},
  ] = useLazyGetProjectStatusQuery();
  const [triggerGetAllFilteredProjectData] = useLazyGetAllProjectQuery();
  const [triggerGetAllPanchayat, {data: Allpanchayats}] =
    useLazyGetProjectAllPanchayatQuery();
  const [triggerGetAllVillage, {data: Allvillages}] =
    useLazyGetProjectAllVillagesQuery();
  const [triggerGetProjectType, {data: projectType}] =
    useLazyGetProjectTypeQuery();
  const [triggerGetProjectScheme, {data: projectScheme}] =
    useLazyGetProjectSchemeQuery();
  const [createProject, {isLoading: isLoadingCreateProject}] =
    useCreateProjectMutation();
  const [createProjectScheme, {isLoading: isLoadingcreateProjectScheme}] =
    useCreateProjectSchemeMutation();
  const [EditProject, {isLoading: isLoadingEditProject}] =
    useUpdateProjectDetailsMutation();

  const fetchProjectData = async currentPage => {
    if (isFetching) return;

    if (currentPage === 1) setIsRefreshing(true);
    setIsFetching(true);
    try {
      const response = await triggerGetAllFilteredProjectData({
        page: currentPage,
        limit: 20,
        village: filters.village,
        panchayat: filters.panchayat,
        tehsil: filters.tehsil,
        status: filters.status,
      }).unwrap();
      const newData = response.data.projects;
      setHasMoreData(newData.length > 0);
      setProjectData(prevData =>
        currentPage === 1 ? newData : [...prevData, ...newData],
      );
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setIsFetching(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjectData(1);
  }, [filters]);

  const handleFilterChange = (filterKey, value) => {
    setFilters(prevFilters => ({...prevFilters, [filterKey]: value}));
    setModalVisible({key: null, visible: false});
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
      status: '',
    });
    setFiltersApplied(false);
    setPage(1);
  }, []);

  const loadMoreData = () => {
    if (!isFetching && hasMoreData) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProjectData(nextPage);
    }
  };

  const refreshData = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchProjectData(1, true);
  };

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
      case 'village':
        triggerGetVillages({panchayat: filters.panchayat});
        break;
      case 'panchayat':
        triggerGetPanchayat({tehsil: filters.tehsil});
        break;
      case 'tehsil':
        triggerGetAllTehsil();
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
    isFetchingStatuses,
    modalVisible.key,
  ]);

  const filterData = {
    village: villages,
    panchayat: panchayats,
    tehsil: tehsils,
    status: statuses,
  };

  const areAllFiltersSelected = () => {
    return (
      filters.village !== '' ||
      filters.panchayat !== '' ||
      filters.tehsil !== '' ||
      filters.status !== ''
    );
  };

  const handleCommonBarRightIconPress = index => {
    const actions = {
      0: () => {
        projectAddRef.current?.present(),
          setFormState({
            project_name: '',
            project_code: '',
            project_type: '',
            project_scheme: '',
            status: '',
            village: '',
            estimated_cost: '',
            allocated_cost: '',
            actual_cost: '',
            project_description: '',
            actual_end_date: '',
            actual_start_date: '',
            start_date: '',
            end_date: '',
          });
        setFormStateDisplay({
          end_date: '',
          project_scheme: '',
          project_type: '',
          start_date: '',
          status: '',
          village: '',
        });
      },
      1: () => fetchProjectData,
    };

    const action = actions[index];
    if (action) {
      action();
    }
  };

  const handleInputChange = (key, value) => {
    setFormState(prevState => ({...prevState, [key]: value}));
  };
  const handleEditInputChange = (key, value) => {
    setEditFormState(prevState => ({...prevState, [key]: value}));
  };
  const handleEditInputDisplayShow = (key, value) => {
    setEditFormStateDisplay(prevState => ({...prevState, [key]: value}));
  };
  const handleInputDisplayShow = (key, value) => {
    setFormStateDisplay(prevState => ({...prevState, [key]: value}));
  };

  const themeColors = {
    borderColor: !isDarkMode ? colors.grey200 : colors.grey600,
    backgroundColor: !isDarkMode ? colors.black : colors.white,
    textColor: !isDarkMode ? colors.white : colors.black,
  };

  const openNestedBottomSheet = (field, fetchData = null) => {
    setCurrentField(field);

    if (fetchData) fetchData();

    nestedprojectBottomSheetRef.current?.present();
  };

  const [temporarySelection, setTemporarySelection] = useState({
    tehsil: '',
    panchayat: '',
  });

  const handleNestedSelection = item => {
    if (currentField === 'tehsil') {
      setTemporarySelection(prev => ({
        ...prev,
        tehsil: item.name || '',
        panchayat: '',
      }));
      openNestedBottomSheet('panchayat', () =>
        triggerGetAllPanchayat({tehsil: item.name}),
      );
    } else if (currentField === 'panchayat') {
      setTemporarySelection(prev => ({
        ...prev,
        panchayat: item.name || '',
      }));
      openNestedBottomSheet('village', () =>
        triggerGetAllVillage({
          panchayat: item.name,
          tehsil: temporarySelection.tehsil,
        }),
      );
    } else if (currentField === 'village') {
      handleInputChange('village', item.name || '');
      handleInputDisplayShow('village', item.village_name_hindi || '');
      nestedprojectBottomSheetRef.current?.dismiss();
    } else if (currentField === 'project_type') {
      handleInputChange('project_type', item.name || '');
      handleInputDisplayShow('project_type', item.name || '');
      handleEditInputChange('project_type', item.name || '');
      handleEditInputDisplayShow('project_type', item.name || '');
      nestedprojectBottomSheetRef.current?.dismiss();
    } else if (currentField === 'project_scheme') {
      handleInputChange('project_scheme', item.project_scheme || '');
      handleInputDisplayShow('project_scheme', item.project_scheme || '');
      handleEditInputChange('project_scheme', item.project_scheme || '');
      handleEditInputDisplayShow('project_scheme', item.project_scheme || '');
      nestedprojectBottomSheetRef.current?.dismiss();
    } else if (currentField === 'status') {
      handleInputChange('status', item || '');
      handleEditInputChange('status', item || '');
      nestedprojectBottomSheetRef.current?.dismiss();
    }
  };

  const handleCreateProject = async () => {
    const createProjectPayload = {
      project_name: formState.project_name || '',
      project_type: formState.project_type || '',
      project_code: formState.project_code || '',
      project_scheme: formState.project_scheme || '',
      status: formState.status || 'New',
      village: formState.village || '',
      estimated_cost: formState.estimated_cost || '',
      allocated_cost: formState.allocated_cost || '',
      actual_cost: formState.actual_cost || '',
      project_description: formState.project_description || '',
      start_date: formState.start_date || '',
      end_date: formState.end_date || '',
      actual_start_date: formState.actual_start_date || '',
      actual_end_date: formState.actual_end_date || '',
    };
    try {
      const res = await createProject(createProjectPayload).unwrap();
      if (res?.status_code === 200) {
        Toast.show({
          type: 'success',
          text1: 'success',
          text2: res?.message,
        });
        projectAddRef.current?.dismiss();
        setFormState({
          project_name: '',
          project_code: '',
          project_type: '',
          project_scheme: '',
          status: '',
          village: '',
          estimated_cost: '',
          allocated_cost: '',
          actual_cost: '',
          project_description: '',
          actual_end_date: '',
          actual_start_date: '',
          start_date: '',
          end_date: '',
        });
        setFormStateDisplay({
          end_date: '',
          project_scheme: '',
          project_type: '',
          start_date: '',
          status: '',
          village: '',
        });
      }
    } catch (error) {
      console.log(error);
      projectAddRef.current?.dismiss();
      setFormState({
        project_name: '',
        project_code: '',
        project_type: '',
        project_scheme: '',
        status: '',
        village: '',
        estimated_cost: '',
        allocated_cost: '',
        actual_cost: '',
        project_description: '',
        actual_end_date: '',
        actual_start_date: '',
        start_date: '',
        end_date: '',
      });
      setFormStateDisplay({
        end_date: '',
        project_scheme: '',
        project_type: '',
        start_date: '',
        status: '',
        village: '',
      });
    }
  };

  const getCurrentFieldData = () => {
    switch (currentField) {
      case 'tehsil':
        return tehsils?.data;
      case 'panchayat':
        return Allpanchayats?.data;
      case 'village':
        return Allvillages?.data;
      case 'project_type':
        return projectType?.data || [];
      case 'project_scheme':
        return projectScheme?.data || [];
      case 'status':
        return statuses?.data || [];
      default:
        return [];
    }
  };

  const getDisplayValue = item => {
    return (
      item?.village_name_hindi ||
      item?.abbreviated_name_hindi ||
      item?.project_scheme ||
      item?.name ||
      item
    );
  };

  const isDisableCreateProjectBtn = !(
    formState.project_name && formState.village
  );

  const formatDateForDisplay = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getValidDate = dateString => {
    if (!dateString) return new Date();
    try {
      return new Date(dateString);
    } catch {
      console.error('Error converting date string to Date');
      return new Date();
    }
  };
  const handleDateChange = (type, event, selectedDate) => {
    if (Platform.OS === 'android' && event.type === 'dismissed') {
      type === 'start' ? setShowStartPicker(false) : setShowEndPicker(false);
      return;
    }

    const currentDate = selectedDate || getValidDate(formState[type + 'Date']);
    type === 'start' ? setShowStartPicker(false) : setShowEndPicker(false);

    if (
      (type === 'start' &&
        formState.end_date &&
        new Date(currentDate) > new Date(formState.end_date)) ||
      (type === 'end' &&
        formState.start_date &&
        new Date(currentDate) < new Date(formState.start_date))
    ) {
      Alert.alert(
        'Invalid Date',
        `The ${type} date cannot be after the other date.`,
      );
      return;
    }

    setFormState(prevState => ({
      ...prevState,
      [type + '_date']: formatDate(currentDate),
    }));
    setFormStateDisplay(preState => ({
      ...preState,
      [type + '_date']: formatDateForDisplay(currentDate),
    }));
    setEditFormState(prevState => ({
      ...prevState,
      [type + '_date']: formatDate(currentDate),
    }));
    setEditFormStateDisplay(preState => ({
      ...preState,
      [type + '_date']: formatDateForDisplay(currentDate),
    }));
  };

  const handleCreateProjectScheme = async () => {
    if (scheme.trim() === '') return;
    try {
      const res = await createProjectScheme({scheme_name: scheme});
      if (res?.data?.status_code === 200) {
        Toast.show({
          type: 'success',
          text1: 'success',
          text2: res?.data?.message,
        });
        schemeBottonSheetRef.current?.dismiss();
        setScheme('');
      } else if (res?.data?.status_code === 409) {
        Toast.show({
          type: 'warning',
          text1: 'warning',
          text2: res?.data?.message,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLongPress = ticketId => {
    setSelectTicket({
      showModal: true,
      item: ticketId,
    });
    editProjectRef.current?.present();
  };

  const handleCloseSheet = () => {
    setSelectTicket({
      showModal: false,
      item: '',
    });
    editProjectRef.current?.dismiss();
  };

  const handleEditProject = async () => {
    const payload = {
      name: editFormState.name,
      project_type: editFormState.project_type,
      project_code: editFormState.project_code,
      project_scheme: editFormState.project_scheme,
      status: editFormState.status,
      estimated_cost: editFormState.estimated_cost,
      allocated_cost: editFormState.allocated_cost,
      actual_cost: editFormState.actual_cost,
      project_description: editFormState.project_description,
      start_date: editFormState.start_date,
      end_date: editFormState.end_date,
      actual_start_date: editFormState.actual_start_date,
      actual_end_date: editFormState.actual_end_date,
    };
    console.log(payload);

    try {
      const res = await EditProject(payload);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <CommoneHeader
        title="Projects"
        showLeftIcon={true}
        leftIcon={SvgIcon.MenuIcon}
        onLeftIconPress={() => openDrawer()}
        showRightIcons={true}
        rightIcons={[SvgIcon.AddICon, SvgIcon.ReloadIcon]}
        onRightIconPress={handleCommonBarRightIconPress}
      />
      <View style={styles.filterContainer}>
        {/* Filter dropdown buttons */}
        {['tehsil', 'panchayat', 'village', 'status'].map(key => {
          let displayValue = '';

          switch (key) {
            case 'tehsil':
              displayValue = filters.tehsil
                ? filterData.tehsil?.data?.find(
                    item => item.name === filters.tehsil,
                  )?.tehsil
                : '';
              break;
            case 'panchayat':
              displayValue = filters.panchayat
                ? filterData.panchayat?.data?.find(
                    item => item.name === filters.panchayat,
                  )?.panchayat
                : '';
              break;
            case 'village':
              displayValue = filters.village
                ? filterData.village?.data?.find(
                    item => item.name === filters.village,
                  )?.village_name
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
              <RegularText
                style={[
                  styles.dropdownText,
                  {color: isDarkMode ? colors.black : colors.white},
                ]}>
                {displayValue
                  ? displayValue
                  : `${key.charAt(0).toUpperCase() + key.slice(1)}`}
              </RegularText>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{alignItems: 'flex-end'}}>
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
        <LoadingScreen color={Colors.default.primaryText} />
      ) : (
        <>
          <FlashList
            data={projectData}
            renderItem={({item}) => (
              <ProjectlistColums
                item={item}
                fetchData={() => fetchProjectData(1)}
                setSelectTicket={handleLongPress}
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
              projectData.length === 0 && (
                <TextComponent
                  text={'No Project available'}
                  size={textScale(16)}
                  style={{
                    color: isDarkMode ? Colors.dark.black : Colors.light.white,
                    textAlign: 'center',
                  }}
                />
              )
            }
          />
        </>
      )}
      <Modal
        transparent={true}
        visible={modalVisible.visible}
        animationType="slide"
        onRequestClose={() => setModalVisible({key: null, visible: false})}>
        {/* Backdrop Overlay */}
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setModalVisible({key: null, visible: false})}
        />

        {/* Modal Content */}
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: isDarkMode
                  ? Colors.light.white
                  : Colors.dark.black,
              },
            ]}>
            <TextComponent
              text={'Select ' + modalVisible.key}
              size={textScale(18)}
              fontWeight="600"
              style={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
            />

            {isFetchingFilterData ? (
              <ActivityIndicator
                size="large"
                color={Colors.default.primaryText}
              />
            ) : isDataAvailable ? (
              <ScrollView style={styles.modalScrollView}>
                {modalVisible.key === 'status' ? (
                  filterData[modalVisible.key]?.data?.length > 0 ? (
                    filterData[modalVisible.key]?.data?.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.modalItem}
                        onPress={() =>
                          handleFilterChange(modalVisible.key, item)
                        }>
                        <TextComponent
                          text={item}
                          size={textScale(16)}
                          style={{
                            color: isDarkMode
                              ? Colors.dark.black
                              : Colors.light.white,
                          }}
                        />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <TextComponent
                      text={'No options available'}
                      size={textScale(16)}
                      style={{
                        color: isDarkMode
                          ? Colors.dark.black
                          : Colors.light.white,
                      }}
                    />
                  )
                ) : Array.isArray(filterData[modalVisible.key]?.data) &&
                  filterData[modalVisible.key]?.data?.length > 0 ? (
                  filterData[modalVisible.key]?.data?.map(item => {
                    let label = '';
                    let value = '';

                    switch (modalVisible.key) {
                      case 'village':
                        label = item.village_name_hindi;
                        value = item.name;
                        break;
                      case 'panchayat':
                        label = item.abbreviated_name_hindi;
                        value = item.name;
                        break;
                      case 'tehsil':
                        label = item.tehsil_name_hindi;
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
                        onPress={() =>
                          handleFilterChange(modalVisible.key, value)
                        }>
                        <TextComponent
                          text={label}
                          size={textScale(16)}
                          style={{
                            color: isDarkMode
                              ? Colors.dark.black
                              : Colors.light.white,
                          }}
                        />
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <TextComponent
                    text={'No options available'}
                    size={textScale(16)}
                    style={{
                      color: isDarkMode
                        ? Colors.dark.black
                        : Colors.light.white,
                    }}
                  />
                )}
              </ScrollView>
            ) : (
              <TextComponent
                text={'No options available'}
                size={textScale(16)}
                style={{
                  color: isDarkMode ? Colors.dark.black : Colors.light.white,
                }}
              />
            )}
            <CustomButton
              title={'Close'}
              onPress={() => setModalVisible({key: null, visible: false})}
            />
          </View>
        </View>
      </Modal>

      <CustomBottomSheetFlatList
        ref={projectAddRef}
        snapPoints={['100%']}
        keyExtractor={index => index.toString()}
        data={[1]}
        renderItem={() => (
          <View
            style={{
              flexGrow: 1,
              paddingVertical: spacing.PADDING_16,
              paddingHorizontal: spacing.PADDING_10,
            }}>
            {/* <RegularText
              style={[styles.header, {color: themeColors.textColor}]}>
              Create Project
            </RegularText> */}

            <TextComponent
              text={' Create Project'}
              size={textScale(16)}
              style={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
                marginBottom: spacing.MARGIN_10,
              }}
              textAlign={'center'}
            />

            <CustomInput
              placeholder="Project Name"
              value={formState.project_name}
              onChange={text => handleInputChange('project_name', text)}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              showSecondChildren={formState.project_name}
              SecondChildren={
                <TouchableOpacity
                  onPress={() => {
                    setFormState(preState => ({
                      ...preState,
                      project_name: '',
                    }));
                  }}>
                  <SvgIcon.Wrong
                    color={
                      isDarkMode ? Colors.dark.black : Colors.light.white
                    }
                  />
                </TouchableOpacity>
              }
            />

            {/* Project Code */}
            <CustomInput
              placeholder="Project Code"
              value={formState.project_code}
              onChange={text => handleInputChange('project_code', text)}
              inputStyles={{
                color:isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              showSecondChildren={formState.project_code}
              SecondChildren={
                <TouchableOpacity
                  onPress={() => {
                    setFormState(preState => ({
                      ...preState,
                      project_code: '',
                    }));
                  }}>
                  <SvgIcon.Wrong
                    color={
                      isDarkMode ? Colors.dark.black : Colors.light.white
                    }
                  />
                </TouchableOpacity>
              }
            />

            {/* Project Type */}
            <CustomInput
              placeholder="Project Type"
              value={formStateDisplay.project_type}
              onPressTextInput={() =>
                openNestedBottomSheet('project_type', triggerGetProjectType)
              }
              editable={false}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              showSecondChildren={true}
              SecondChildren={
                editFormState.project_type ? (
                  <TouchableOpacity
                    onPress={() => (
                      setFormState(preState => ({
                        ...preState,
                        project_type: '',
                      })),
                      setFormStateDisplay(preState => ({
                        ...preState,
                        project_type: '',
                      }))
                    )}>
                    <SvgIcon.Wrong
                      color={
                        isDarkMode ? Colors.dark.black : Colors.light.white
                      }
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() =>
                      openNestedBottomSheet(
                        'project_type',
                        triggerGetProjectType,
                      )
                    }>
                    <SvgIcon.RightArrowIcon
                      color={
                        isDarkMode ? Colors.dark.black : Colors.light.white
                      }
                    />
                  </TouchableOpacity>
                )
              }
            />

            {/* Project Scheme */}
            <CustomInput
              placeholder="Project Scheme"
              value={formStateDisplay.project_scheme}
              onPressTextInput={() =>
                openNestedBottomSheet('project_scheme', triggerGetProjectScheme)
              }
              editable={false}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white
              }}
              showSecondChildren={true}
              SecondChildren={
                editFormState.project_scheme ? (
                  <TouchableOpacity
                    onPress={() => {
                      setFormStateDisplay(preState => ({
                        ...preState,
                        project_scheme: '',
                      })),
                        setFormState(preState => ({
                          ...preState,
                          project_scheme: '',
                        }));
                    }}>
                    <SvgIcon.Wrong
                      color={
                        isDarkMode ? Colors.dark.black : Colors.light.white
                      }
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() =>
                      openNestedBottomSheet(
                        'project_scheme',
                        triggerGetProjectScheme,
                      )
                    }>
                    <SvgIcon.RightArrowIcon
                      color={
                        isDarkMode ? Colors.dark.black : Colors.light.white
                      }
                    />
                  </TouchableOpacity>
                )
              }
            />

            {/* Status */}
            <CustomInput
              placeholder="Status"
              value={formState.status}
              onPressTextInput={() =>
                openNestedBottomSheet('status', triggerGetAllStatus)
              }
              editable={false}
              inputStyles={{
                color:isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              showSecondChildren={true}
              SecondChildren={
                formState.status ? (
                  <TouchableOpacity
                    onPress={() => {
                      setFormState(preState => ({
                        ...preState,
                        status: '',
                      }));
                    }}>
                    <SvgIcon.Wrong
                      color={
                        isDarkMode ? Colors.dark.black : Colors.light.white
                      }
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() =>
                      openNestedBottomSheet('status', triggerGetAllStatus)
                    }>
                    <SvgIcon.RightArrowIcon
                      color={
                        isDarkMode ? Colors.dark.black : Colors.light.white
                      }
                    />
                  </TouchableOpacity>
                )
              }
            />
            {/* Village */}
            <CustomInput
              placeholder="Village"
              value={formStateDisplay.village}
              onPressTextInput={() => {
                openNestedBottomSheet('tehsil', triggerGetAllTehsil);
              }}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white
              }}
              editable={false}
              showSecondChildren={true}
              SecondChildren={
                formStateDisplay.village ? (
                  <TouchableOpacity
                    onPress={() => {
                      setFormStateDisplay(preState => ({
                        ...preState,
                        village: '',
                      })),
                        setFormState(preState => ({
                          ...preState,
                          village: '',
                        }));
                    }}>
                    <SvgIcon.Wrong
                      color={
                        isDarkMode ? Colors.dark.black : Colors.light.white
                      }
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() =>
                      openNestedBottomSheet('tehsil', triggerGetAllTehsil)
                    }>
                    <SvgIcon.RightArrowIcon
                      color={
                        isDarkMode ? Colors.dark.black : Colors.light.white
                      }
                    />
                  </TouchableOpacity>
                )
              }
            />
            {/* Cost Fields */}
            <CustomInput
              placeholder="Estimated Cost"
              value={formState.estimated_cost}
              onChange={text => handleInputChange('estimated_cost', text)}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white
              }}
              type={'numeric'}
              showSecondChildren={formState.estimated_cost}
              SecondChildren={
                <TouchableOpacity
                  onPress={() =>
                    setFormState(preState => ({
                      ...preState,
                      estimated_cost: '',
                    }))
                  }>
                  <SvgIcon.Wrong
                    color={
                      isDarkMode ? Colors.dark.black : Colors.light.white
                    }
                  />
                </TouchableOpacity>
              }
            />
            <CustomInput
              placeholder="Allocated Cost"
              value={formState.allocated_cost}
              onChange={text => handleInputChange('allocated_cost', text)}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white
              }}
              type={'numeric'}
              showSecondChildren={formState.allocated_cost}
              SecondChildren={
                <TouchableOpacity
                  onPress={() =>
                    setFormState(preState => ({
                      ...preState,
                      allocated_cost: '',
                    }))
                  }>
                  <SvgIcon.Wrong
                    color={
                      isDarkMode ? Colors.dark.black : Colors.light.white
                    }
                  />
                </TouchableOpacity>
              }
            />
            <CustomInput
              placeholder="Actual Cost"
              value={formState.actual_cost}
              type={'numeric'}
              onChange={text => handleInputChange('actual_cost', text)}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              showSecondChildren={formState.actual_cost}
              SecondChildren={
                <TouchableOpacity
                  onPress={() =>
                    setFormState(preState => ({
                      ...preState,
                      actual_cost: '',
                    }))
                  }>
                  <SvgIcon.Wrong
                    color={
                      isDarkMode ? Colors.dark.black : Colors.light.white
                    }
                  />
                </TouchableOpacity>
              }
            />

            {/* start date */}
            <CustomInput
              placeholder="Start Date"
              value={formStateDisplay.start_date}
              editable={false}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              onPressTextInput={() => setShowStartPicker(true)}
              showSecondChildren={formState.start_date}
              SecondChildren={
                <TouchableOpacity
                  onPress={() => {
                    setFormState(prevState => ({
                      ...prevState,
                      start_date: '',
                    })),
                      setFormStateDisplay(prevState => ({
                        ...prevState,
                        start_date: '',
                      }));
                  }}>
                  <SvgIcon.Wrong
                    color={
                      isDarkMode ? Colors.dark.black : Colors.light.white
                    }
                  />
                </TouchableOpacity>
              }
            />
            {Platform.OS === 'android' && showStartPicker && (
              <DateTimePicker
                value={getValidDate(formState.start_date)}
                mode="date"
                is24Hour={false}
                display="spinner"
                onChange={(event, selectedDate) =>
                  handleDateChange('start', event, selectedDate)
                }
              />
            )}
            <CustomInput
              placeholder="End Date"
              value={formStateDisplay.end_date}
              editable={false}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              showSecondChildren={editFormState.end_date}
              onPressTextInput={() => setShowEndPicker(true)}
              SecondChildren={
                <TouchableOpacity
                  onPress={() => {
                    setFormState(prevState => ({
                      ...prevState,
                      end_date: '',
                    })),
                      setFormStateDisplay(prevState => ({
                        ...prevState,
                        end_date: '',
                      }));
                  }}>
                  <SvgIcon.Wrong
                    color={
                      isDarkMode ? Colors.dark.black : Colors.light.white
                    }
                  />
                </TouchableOpacity>
              }
            />
            {Platform.OS === 'android' && showEndPicker && (
              <DateTimePicker
                value={getValidDate(formState.end_date)}
                mode="date"
                is24Hour={false}
                display="spinner"
                onChange={(event, selectedDate) =>
                  handleDateChange('end', event, selectedDate)
                }
              />
            )}

            {/* Description */}
            <CustomInput
              placeholder="Project Description"
              value={formState.project_description}
              onChange={text => handleInputChange('project_description', text)}
              styles={[styles.descriptionInput]}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              multiline
              showSecondChildren={formState.project_description}
              SecondChildren={
                <TouchableOpacity
                  onPress={() =>
                    setFormState(preState => ({
                      ...preState,
                      project_description: '',
                    }))
                  }>
                  <SvgIcon.Wrong
                    color={
                      isDarkMode ? Colors.dark.black : Colors.light.white
                    }
                  />
                </TouchableOpacity>
              }
            />

            {/* Submit Button */}
            <CustomButton
              title="Create Project"
              onPress={handleCreateProject}
              isLoading={isLoadingCreateProject}
              disabled={isDisableCreateProjectBtn}
            />
          </View>
        )}
      />

      <CustomBottomSheetFlatList
        ref={nestedprojectBottomSheetRef}
        snapPoints={['50%']}
        data={getCurrentFieldData()}
        keyExtractor={(item, index) => `Project_${index.toString()}`}
        renderItem={({item}) => {
          if (!item || !(item.name || item)) {
            return null;
          }
          return (
            <TouchableOpacity
              onPress={() => handleNestedSelection(item)}
              style={{
                padding: 10,
                borderBottomWidth: 1,
                borderBottomColor: themeColors.borderColor,
              }}>
              <RegularText
                style={{
                  color: themeColors.textColor,
                  fontSize: textScale(18),
                  fontFamily: fontNames.ROBOTO_FONT_FAMILY_MEDIUM,
                }}>
                {getDisplayValue(item)}
              </RegularText>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <RegularText
            style={{textAlign: 'center', color: themeColors.textColor}}>
            No data available
          </RegularText>
        }
        ListHeaderComponent={
          <View
            style={{
              position: 'relative',
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            {/* Centered Text */}
            {currentField ? (
              <RegularText
                style={{
                  textAlign: 'center',
                  color: themeColors.textColor,
                  fontSize: textScale(18),
                  fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
                }}>
                {currentField.replace(/_/g, ' ').toLocaleUpperCase()}
              </RegularText>
            ) : null}

            {/* Right-Aligned Icon */}
            {currentField === 'project_scheme' && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                }}
                onPress={() => schemeBottonSheetRef.current.present()}>
                <SvgIcon.AddICon
                  color={isDarkMode ? colors.black : colors.white}
                />
              </TouchableOpacity>
            )}
          </View>
        }
      />
      <CustomBottomSheet ref={schemeBottonSheetRef} snapPoints={['40%']}>
        <View style={{paddingHorizontal: spacing.PADDING_16}}>
          <RegularText
            style={{
              alignSelf: 'center',
              fontSize: textScale(18),
              color: isDarkMode ? Colors.dark.black : Colors.light.white,
              marginBottom: spacing.MARGIN_16,
            }}>
            Create Scheme
          </RegularText>
          <CustomInput
            placeholder="Scheme"
            value={scheme}
            onChange={setScheme}
            bgColor={
              isDarkMode ? Colors.light.grey : Colors.light.greyTransparent
            }
            inputStyles={{
              color: isDarkMode ? Colors.dark.black : Colors.light.white,
            }}
          />
          <CustomButton
            title="Create Scheme"
            onPress={handleCreateProjectScheme}
            isLoading={isLoadingcreateProjectScheme}
          />
        </View>
      </CustomBottomSheet>

      <CustomBottomSheetFlatList
        ref={editProjectRef}
        snapPoints={['100%']}
        keyExtractor={index => index.toString()}
        onDismiss={handleCloseSheet}
        data={[1]}
        renderItem={() => (
          <View
            style={{
              flexGrow: 1,
              paddingVertical: spacing.PADDING_16,
              paddingHorizontal: spacing.PADDING_10,
            }}>
            <RegularText
              style={[styles.header, {color: themeColors.textColor}]}>
              Edit Project
            </RegularText>
            <CustomInput
              placeholder="Project Name"
              value={editFormState.project_name}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              editable={false}
            />

            {/* Project Code */}
            <CustomInput
              placeholder="Project Code"
              value={editFormState.project_code}
              onChange={text => {
                handleEditInputChange('project_code', text);
              }}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              editable={!isEditProjectCode}
              showSecondChildren={
                !!editFormState.project_code && !isEditProjectCode
              }
              SecondChildren={
                <TouchableOpacity
                  onPress={() => {
                    if (editFormState.project_code) {
                      setEditFormState(prevState => ({
                        ...prevState,
                        project_code: '',
                      }));
                      setEditProjectCode(false);
                    }
                  }}>
                  <SvgIcon.Wrong
                    color={
                      isDarkMode ? Colors.dark.black : Colors.light.white
                    }
                  />
                </TouchableOpacity>
              }
            />

            {/* Project Type */}
            <CustomInput
              placeholder="Project Type"
              value={editFormStateDisplay.project_type}
              onPressTextInput={() =>
                openNestedBottomSheet('project_type', triggerGetProjectType)
              }
              editable={false}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              showSecondChildren={true}
              SecondChildren={
                editFormState.project_type ? (
                  <TouchableOpacity
                    onPress={() => (
                      setEditFormState(preState => ({
                        ...preState,
                        project_type: '',
                      })),
                      setEditFormStateDisplay(preState => ({
                        ...preState,
                        project_type: '',
                      }))
                    )}>
                    <SvgIcon.Wrong
                      color={
                        isDarkMode ? Colors.dark.black : Colors.light.white
                      }
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() =>
                      openNestedBottomSheet(
                        'project_type',
                        triggerGetProjectType,
                      )
                    }>
                    <SvgIcon.RightArrowIcon
                      color={
                        isDarkMode ? Colors.dark.black : Colors.light.white
                      }
                    />
                  </TouchableOpacity>
                )
              }
            />

            {/* Project Scheme */}
            <CustomInput
              placeholder="Project Scheme"
              value={editFormStateDisplay.project_scheme}
              onPressTextInput={() =>
                openNestedBottomSheet('project_scheme', triggerGetProjectScheme)
              }
              editable={true}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              showSecondChildren={true}
              SecondChildren={
                editFormState.project_scheme ? (
                  <TouchableOpacity
                    onPress={() => {
                      setEditFormStateDisplay(preState => ({
                        ...preState,
                        project_scheme: '',
                      }));
                      setEditFormState(preState => ({
                        ...preState,
                        project_scheme: '',
                      }));
                    }}>
                    <SvgIcon.Wrong
                      color={
                        isDarkMode ? Colors.dark.black : Colors.light.white
                      }
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() =>
                      openNestedBottomSheet(
                        'project_scheme',
                        triggerGetProjectScheme,
                      )
                    }>
                    <SvgIcon.RightArrowIcon
                      color={
                        isDarkMode ? Colors.dark.black : Colors.light.white
                      }
                    />
                  </TouchableOpacity>
                )
              }
            />

            {/* Status */}
            <CustomInput
              placeholder="Status"
              value={editFormState.status}
              onPressTextInput={() =>
                openNestedBottomSheet('status', triggerGetAllStatus)
              }
              editable={true}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              showSecondChildren={editFormState.status}
              SecondChildren={
                editFormState.status ? (
                  <TouchableOpacity
                    onPress={() =>
                      setEditFormState(preState => ({
                        ...preState,
                        status: '',
                      }))
                    }>
                    <SvgIcon.Wrong
                      color={
                        isDarkMode ? Colors.dark.black : Colors.light.white
                      }
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() =>
                      openNestedBottomSheet('status', triggerGetAllStatus)
                    }>
                    <SvgIcon.RightArrowIcon
                      color={
                        isDarkMode ? Colors.dark.black : Colors.light.white
                      }
                    />
                  </TouchableOpacity>
                )
              }
            />

            {/* Village */}
            <CustomInput
              placeholder="Village"
              value={editFormStateDisplay.village}
              editable={false}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
            />

            {/* Cost Fields */}
            <CustomInput
              placeholder="Estimated Cost"
              value={editFormState.estimated_cost?.toString()}
              type={'numeric'}
              onChange={text => handleEditInputChange('estimated_cost', text)}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              showSecondChildren={editFormState.estimated_cost}
              SecondChildren={
                <TouchableOpacity
                  onPress={() =>
                    setEditFormState(preState => ({
                      ...preState,
                      estimated_cost: '',
                    }))
                  }>
                  <SvgIcon.Wrong
                    color={
                      isDarkMode ? Colors.dark.black : Colors.light.white
                    }
                  />
                </TouchableOpacity>
              }
            />

            <CustomInput
              placeholder="Allocated Cost"
              value={editFormState.allocated_cost?.toString()}
              type={'numeric'}
              onChange={text => handleEditInputChange('allocated_cost', text)}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              showSecondChildren={editFormState.allocated_cost}
              SecondChildren={
                <TouchableOpacity
                  onPress={() =>
                    setEditFormState(preState => ({
                      ...preState,
                      allocated_cost: '',
                    }))
                  }>
                  <SvgIcon.Wrong
                    color={
                      isDarkMode ? Colors.dark.black : Colors.light.white
                    }
                  />
                </TouchableOpacity>
              }
            />

            <CustomInput
              placeholder="Actual Cost"
              value={editFormState.actual_cost?.toString()}
              type={'numeric'}
              onChange={text => handleEditInputChange('actual_cost', text)}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              showSecondChildren={editFormState.actual_cost}
              SecondChildren={
                <TouchableOpacity
                  onPress={() =>
                    setEditFormState(preState => ({
                      ...preState,
                      actual_cost: '',
                    }))
                  }>
                  <SvgIcon.Wrong
                    color={
                      isDarkMode ? Colors.dark.black : Colors.light.white
                    }
                  />
                </TouchableOpacity>
              }
            />

            {/* start date */}
            <CustomInput
              placeholder="Start Date"
              value={editFormStateDisplay.start_date}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              editable={false}
              onPressTextInput={() => setShowStartPicker(true)}
              showSecondChildren={editFormState.start_date}
              SecondChildren={
                <TouchableOpacity
                  onPress={() => {
                    setEditFormState(prevState => ({
                      ...prevState,
                      start_date: '',
                    })),
                      setEditFormStateDisplay(prevState => ({
                        ...prevState,
                        start_date: '',
                      }));
                  }}>
                  <SvgIcon.Wrong
                    color={
                      isDarkMode ? Colors.dark.black : Colors.light.white
                    }
                  />
                </TouchableOpacity>
              }
            />
            {Platform.OS === 'android' && showStartPicker && (
              <DateTimePicker
                value={getValidDate(editFormState.start_date)}
                mode="date"
                is24Hour={false}
                display="spinner"
                onChange={(event, selectedDate) =>
                  handleDateChange('start', event, selectedDate)
                }
              />
            )}

            <CustomInput
              placeholder="End Date"
              value={editFormStateDisplay.end_date}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              editable={false}
              onPressTextInput={() => setShowEndPicker(true)}
              showSecondChildren={editFormState.end_date}
              SecondChildren={
                <TouchableOpacity
                  onPress={() => {
                    setEditFormState(prevState => ({
                      ...prevState,
                      end_date: '',
                    })),
                      setEditFormStateDisplay(prevState => ({
                        ...prevState,
                        end_date: '',
                      }));
                  }}>
                  <SvgIcon.Wrong
                    color={
                      isDarkMode ? Colors.dark.black : Colors.light.white
                    }
                  />
                </TouchableOpacity>
              }
            />

            {Platform.OS === 'android' && showEndPicker && (
              <DateTimePicker
                value={getValidDate(editFormState.end_date)}
                mode="date"
                is24Hour={false}
                display="spinner"
                onChange={(event, selectedDate) =>
                  handleDateChange('end', event, selectedDate)
                }
              />
            )}

            {/* Description */}
            <CustomInput
              placeholder="Project Description"
              value={editFormState.project_description}
              onChange={text =>
                handleEditInputChange('project_description', text)
              }
              styles={[styles.descriptionInput]}
              inputStyles={{
                color: isDarkMode ? Colors.dark.black : Colors.light.white,
              }}
              multiline
              showSecondChildren={editFormState.project_description}
              SecondChildren={
                <TouchableOpacity
                  onPress={() =>
                    setEditFormState(preState => ({
                      ...preState,
                      project_description: '',
                    }))
                  }>
                  <SvgIcon.Wrong
                    color={
                      isDarkMode ? Colors.dark.black : Colors.light.white
                    }
                  />
                </TouchableOpacity>
              }
            />

            {/* Submit Button */}
            <CustomButton
              title="Edit Project"
              onPress={handleEditProject}
              isLoading={isLoadingEditProject}
            />
          </View>
        )}
      />
    </>
  );
};

export default ProjectsComponent;

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
  dropdownText: {
    fontSize: textScale(14),
    textAlign: 'center',
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
  },
  
  buttonText: {
    color: colors.white,
    fontSize: textScale(14),
    fontWeight: 'bold',
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
    backgroundColor: colors.white,
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


  header: {
    fontSize: textScale(20),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
    marginBottom: spacing.MARGIN_20,
    alignSelf: 'center',
  },
 
  buttonText: {
    color: '#fff',
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
    fontSize: textScale(14),
  },
  descriptionInput: {
    height: spacing.HEIGHT_105,
    color: colors.black,
    flex: 1,
  },
});
