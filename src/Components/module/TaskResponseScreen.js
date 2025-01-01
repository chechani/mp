import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import TaskListColum from '../../Components/Colums/TaskListColum';
import CommoneHeader from '../../Components/Common/CommoneHeader';
import { useApiURLs } from '../../Config/url';
import { useTheme } from '../hooks';
import THEME_COLOR from '../../Utils/Constant';
import { apiGet, apiPut } from '../../Utils/apiCalls';
import colors from '../../Utils/colors';
import { pickAndSendMediaMessage } from '../../Utils/commonImagePicker';
import { CommonToastMessage, goBack } from '../../Utils/helperFunctions';
import * as SvgIcon from '../../assets';
import { textScale } from '../../styles/responsiveStyles';
import { spacing } from '../../styles/spacing';
import { fontNames } from '../../styles/typography';
import AnimatedModal from '../Common/AnimatedModal';
import BottonComp from '../Common/BottonComp';
import CommonPopupModal from '../Common/CommonPopupModal';
import CustomBottomSheetFlatList from '../Common/CustomBottomSheetFlatList';
import LoadingScreen from '../Common/Loader';
import openPDFFile from '../Common/PdfViewer';
import RegularText from '../Common/RegularText';
import TextInputComp from '../Common/TextInputComp';
import { useAppSelector } from '../hooks';

const TaskResponseScreen = ({route}) => {
  const {theme} = useTheme();
  const {
    GET_TASK_STATUS,
    CHANGE_TASK_STATUS,
    ATTACH_FILE_TO_TASK,
    GET_FILE_ATTACHMENT_TO_TASK,
  } = useApiURLs();
  const selectedDomain = useAppSelector(state => state.domains?.selectedDomain?.domain)

  const [filteredTasks, setFilteredTasks] = useState([]);
  const [attachments, setAttachments] = useState({}); 
  const [selectedTaskAttachments, setSelectedTaskAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const selectTaskOptionFilterBottomSheet = useRef(null);
  const openChangeStatusModalRef = useRef(null);
  const viewAttachmentSheetRef = useRef(null);
  const [taskIdForChangeStatus, setTaskIdForChangeStatus] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [attachmentTask, setAttachmentTask] = useState({});
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [changeStatusData, setChangeStatusData] = useState([]);
  const [currentTaskNameForUpload, setCurrentTaskNameForUpload] = useState('');
  const [searchByTaskNo, setSearchByTaskNo] = useState('');
  const [searchBySubject, setSearchBySubject] = useState('');
  const [searchByAssignedBy, setSearchByAssignedBy] = useState('');
  const [searchByAssignedTo, setSearchByAssignedTo] = useState('');
  const [searchByCategory, setSearchByCategory] = useState('');
  const [searchByCreatedDate, setSearchByCreatedDate] = useState('');
  const [isSearchByCreateDatePicker, setIsSearchByCreateDatePicker] =
    useState(false);
  const [selectedDates, setSelectedDates] = useState({
    fromStart: '',
    toStart: '',
    endFrom: '',
    endTo: '',
  }); // Final state for storing dates
  const [pickerVisible, setPickerVisible] = useState(false);
  const [temporaryDates, setTemporaryDates] = useState({
    fromStart: '',
    toStart: '',
    endFrom: '',
    endTo: '',
  }); // Temporary state for storing dates before submission
  const [selectedDateField, setSelectedDateField] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const taskNoInputRef = useRef(null);
  const subjectInputRef = useRef(null);
  const assignedByInputRef = useRef(null);
  const assignedToInputRef = useRef(null);
  const categoryInputRef = useRef(null);

  const {url, title, filterKey, extraFilterKey} = route?.params;

  /* Optimized function to apply filters */
  const applyFilters = (tasks, filterKey, extraFilterKey) => {
    return tasks.filter(task => {
      if (!task.status) {
        return true;
      }

      const status = task.status.trim().toLowerCase();
      const isCompleted = task.is_completed;

      if (filterKey) {
        const filterKeyLower = filterKey.trim().toLowerCase();
        if (filterKeyLower === 'in_time') {
          return isCompleted === 1;
        }
        if (filterKeyLower === status) {
          return true;
        }
        return false;
      }

      if (extraFilterKey) {
        const extraFilterKeyLower = extraFilterKey.trim().toLowerCase();
        return status !== extraFilterKeyLower;
      }

      return true;
    });
  };

  /* Fetch Data */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiGet(url);
      let fetchedTasks = [];

      if (response.data && Array.isArray(response.data)) {
        fetchedTasks = [...response.data];
      } else if (response.reponse && Array.isArray(response.reponse)) {
        fetchedTasks = [...response.reponse];
      }
      // Fetch attachments for all tasks
      const attachmentData = {};
      for (const task of fetchedTasks) {
        const taskName = task.name;
        const attachmentResponse = await apiGet(GET_FILE_ATTACHMENT_TO_TASK, {
          params: {task_name: taskName},
        });

        if (attachmentResponse?.reponse?.length > 0) {
          attachmentData[taskName] = attachmentResponse.reponse;
        } else {
          attachmentData[taskName] = [];
        }
      }

      // Update attachment state
      setAttachments(attachmentData);

      // Apply filters to the fetched tasks
      const initialFilteredTasks = applyFilters(
        fetchedTasks,
        filterKey,
        extraFilterKey,
      );
      setFilteredTasks(initialFilteredTasks);
    } catch (error) {
      console.error('Error fetching tasks or attachments:', error);
    } finally {
      setLoading(false);
    }
  }, [url, filterKey, extraFilterKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* Update Callback */
  const handleUpdateCallback = () => {
    fetchData();
  };

  /* Change Status */
  const handleChangeStatus = async id => {
    setTaskIdForChangeStatus(id);
    try {
      const res = await apiGet(GET_TASK_STATUS);
      if (res?.reponse) {
        setChangeStatusData(res.reponse);
        openChangeStatusModalRef.current.present();
      }
    } catch (error) {
      console.log('Error fetching task status:', error);
    }
  };

  /* Change Status */
  const changeStatus = async status => {
    setSelectedStatus(status.name);
    try {
      const res = await apiPut(CHANGE_TASK_STATUS, {
        task_name: taskIdForChangeStatus,
        status: status.name,
      });
      if (res.status_code === 404) {
        Alert.alert(res.message);
        openChangeStatusModalRef.current.dismiss();
      } else if (res.status_code === 200) {
        fetchData();
        openChangeStatusModalRef.current.dismiss();
      }
    } catch (error) {
      console.log('Error changing task status:', error);
    }
  };

  /* Attach Document */
  const handleAttachDocument = async id => {
    setTaskIdForChangeStatus(id);
    setCurrentTaskNameForUpload(id); // Set the task name for upload from BottomSheet
    try {
      const result = await pickAndSendMediaMessage();

      if (result.status === 'success') {
        setAttachmentTask({
          file: result.data.base64String,
          file_name: result.data.name,
        });
        setConfirmationModal(true);
      } else if (result.status === 'cancelled') {
        setConfirmationModal(false);
        console.log('User cancelled the document picking.');
      } else if (result.status === 'incomplete_details') {
        console.log('Incomplete file details:', result.data);
      } else if (result.status === 'no_document') {
        console.log('No document was selected.');
      } else if (result.status === 'error') {
        console.log('Error picking or sending document:', result.error);
      }
    } catch (error) {
      console.log('Error while picking image', error);
    }
  };

  /* Confirm Attach Document */
  const handleConfirmAttach = async () => {
    const data = {
      file_name: attachmentTask.file_name,
      file: attachmentTask.file,
      task_name: taskIdForChangeStatus,
    };
    try {
      const res = await apiPut(ATTACH_FILE_TO_TASK, data);
      if (res.status_code === 200) {
        CommonToastMessage('success', res?.message);

        // Update the attachment state
        setAttachments(prevAttachments => ({
          ...prevAttachments,
          [taskIdForChangeStatus]: [
            ...(prevAttachments[taskIdForChangeStatus] || []),
            {file_name: attachmentTask.file_name},
          ],
        }));
        fetchData();
      }
    } catch (error) {
      CommonToastMessage('error', error?.message);
    } finally {
      setConfirmationModal(false);
      setTaskIdForChangeStatus('');
    }
  };

  /* Cancel Attach Document */
  const handleCancelAttach = () => {
    setConfirmationModal(false);
    setTaskIdForChangeStatus('');
  };

  /* Handle View Document Press */
  const handleViewDocumentPress = taskName => {
    setCurrentTaskNameForUpload(taskName);
    const attachmentsForTask = attachments[taskName] || [];
    setSelectedTaskAttachments(attachmentsForTask);
    viewAttachmentSheetRef.current.present();
  };

  const filterList = [
    'Reset Filter',
    'Task No',
    'Subject',
    'Assigned By',
    'Assigned To',
    'Start Date',
    'End Date',
    'Category',
    'Create Date',
  ];

  const handleFilterClick = filter => {
    setSearchByTaskNo('');
    setSearchBySubject('');
    setSearchByAssignedBy('');
    setSearchByAssignedTo('');
    setSearchByCategory('');
    setSelectedDates({
      fromStart: '',
      toStart: '',
      endFrom: '',
      endTo: '',
    });
    setSelectedDateField(null);
    setPickerVisible(false);
    setSearchByCreatedDate('');
    if (filter === 'Create Date') {
      setIsSearchByCreateDatePicker(true);
    }
    if (filterList.includes(filter)) {
      setActiveFilter(filter);
      selectTaskOptionFilterBottomSheet.current.dismiss();
    }
  };
  const moreFilterData = filteredTasks.filter((task) => {
    const taskNo = searchByTaskNo.trim();
    const subjectTerm = searchBySubject.trim().toLowerCase();
    const assignedByTerm = searchByAssignedBy.trim().toLowerCase();
    const assignedToTerm = searchByAssignedTo.trim().toLowerCase();
    const categoryTerm = searchByCategory.trim().toLowerCase();
    const isCreateDateFilter = activeFilter === 'Create Date' && searchByCreatedDate;
  
    // Filter by Task No
    if (taskNo !== '' && task?.name !== Number(taskNo)) return false;
  
    // Filter by Subject
    if (subjectTerm && !task?.task_name?.toLowerCase().includes(subjectTerm)) return false;
  
    // Filter by Assigned By
    if (
      assignedByTerm &&
      !(
        task?.assigned_by_name?.toLowerCase().includes(assignedByTerm) ||
        task?.assigned_by_phone_no?.toLowerCase().includes(assignedByTerm)
      )
    ) {
      return false;
    }
  
    // Filter by Created Date
    if (isCreateDateFilter && task?.creation?.split(' ')[0] !== searchByCreatedDate) {
      return false;
    }
  
    // Filter by Assigned To
    if (
      assignedToTerm &&
      !(
        task?.assigned_to_name?.toLowerCase().includes(assignedToTerm) ||
        task?.assigned_to_phone_no?.toLowerCase().includes(assignedToTerm)
      )
    ) {
      return false;
    }
  
    // Filter by Start Date Range
    if (selectedDates.fromStart || selectedDates.toStart) {
      const taskStartDate = new Date(task?.start_date);
      const fromStart = selectedDates.fromStart ? new Date(selectedDates.fromStart) : null;
      const toStart = selectedDates.toStart ? new Date(selectedDates.toStart) : null;
  
      if (
        (fromStart && taskStartDate < fromStart) || // Before fromStart
        (toStart && taskStartDate > toStart) // After toStart
      ) {
        return false;
      }
    }
  
    // Filter by End Date Range
    if (selectedDates.endFrom || selectedDates.endTo) {
      const taskEndDate = new Date(task?.end_date);
      const endFrom = selectedDates.endFrom ? new Date(selectedDates.endFrom) : null;
      const endTo = selectedDates.endTo ? new Date(selectedDates.endTo) : null;
  
      if (
        (endFrom && taskEndDate < endFrom) || // Before endFrom
        (endTo && taskEndDate > endTo) // After endTo
      ) {
        return false;
      }
    }
  
    // Filter by Category
    if (categoryTerm && !task?.category?.toLowerCase().includes(categoryTerm)) return false;
  
    return true;
  });

  useEffect(() => {
    if (activeFilter === 'Task No' && taskNoInputRef.current) {
      taskNoInputRef.current.focus();
    } else if (activeFilter === 'Subject' && subjectInputRef.current) {
      subjectInputRef.current.focus();
    } else if (activeFilter === 'Assigned By' && assignedByInputRef.current) {
      assignedByInputRef.current.focus();
    } else if (activeFilter === 'Assigned To' && assignedToInputRef.current) {
      assignedToInputRef.current.focus();
    } else if (activeFilter === 'Category' && categoryInputRef.current) {
      categoryInputRef.current.focus();
    }
  }, [activeFilter]);

  const handleDateClick = (field, type) => {
    setSelectedDateField(field);
    setPickerVisible(true);
    setActiveFilter(type === 'start' ? 'Start Date' : 'End Date');
  };

  const handleDateChange = (field, event, selectedDate) => {
    if (Platform.OS === 'android' && event.type === 'dismissed') {
      setPickerVisible(false);
      setSelectedDateField(null);
      return;
    }

    if (selectedDate) {
      setTemporaryDates(prev => ({
        ...prev,
        [field]: selectedDate.toISOString().split('T')[0],
      }));

      setPickerVisible(false);
      setSelectedDateField(null);
    }
  };
  const SearchByCreatedDateHandler = (event, selectedDate) => {
    if (Platform.OS === 'android' && event.type === 'dismissed') {
      setIsSearchByCreateDatePicker(false);
      return;
    }

    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setSearchByCreatedDate(formattedDate);
      setIsSearchByCreateDatePicker(false);
    }
  };

  const handleSubmit = () => {
    setSelectedDates(temporaryDates);
    setActiveFilter(null);
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
  useEffect(() => {
    if (activeFilter === 'Reset Filter') {
      setSearchByTaskNo('');
      setSearchBySubject('');
      setSearchByAssignedBy('');
      setSearchByAssignedTo('');
      setSearchByCategory('');
      setSelectedDateField(null);
      setPickerVisible(false);
      setSearchByCreatedDate('');
    }
  }, [activeFilter === 'Reset Filter']);

  // viewAttachmentSheet component
  const renderViewAttachmentItem = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.attachmentContainer}
        onPress={() =>
          openPDFFile(`${selectedDomain}${item?.file_url}`)
        }>
        <View style={styles.attachmentItemText}>
          {item?.file_name.endsWith('.jpg') ||
          item?.file_name.endsWith('.jpeg') ||
          item?.file_name.endsWith('.png') ? (
            <SvgIcon.ImageIcon
              width={spacing.WIDTH_40}
              height={spacing.HEIGHT_40}
            />
          ) : item?.file_name.endsWith('.pdf') ? (
            <SvgIcon.Pdf />
          ) : (
            <RegularText style={styles.attachmentItemText}>
              {item?.file_name}
            </RegularText>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  const viewAttachmentListHeaderComponent = () => (
    <>
      <RegularText
        style={[
          styles.sectionHeader,
          {
            color: theme === THEME_COLOR ? colors.black : colors.white,
          },
        ]}>
        Attachments
      </RegularText>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => handleAttachDocument(currentTaskNameForUpload)}>
        <RegularText style={styles.uploadButtonText}>
          Upload Attachment
        </RegularText>
      </TouchableOpacity>
    </>
  );
  const viewAttachmentListEmptyComponent = () => (
    <RegularText style={styles.sectionItem}>
      No Attachments Available
    </RegularText>
  );

  // openChangeStatusModal component
  const renderOpenChangeStatusItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.changeStatusbtnContaiber,
        selectedStatus === item.name && styles.selectedStatusBackground,
      ]}
      onPress={() => changeStatus(item)}>
      <RegularText style={styles.sectionItem}>{item?.name}</RegularText>
    </TouchableOpacity>
  );
  const openChangeStatusListEmptyComponent = () => (
    <RegularText style={styles.sectionItem}>No Data Available</RegularText>
  );
  const openChangeStatusListHeaderComponent = () => (
    <RegularText
      style={[
        styles.sectionHeader,
        {
          color: theme === THEME_COLOR ? colors.black : colors.white,
        },
      ]}>
      Change Status
    </RegularText>
  );

  // selectTaskOptionFilter component
  const renderSelectTaskOptionFilterItem = ({item}) => (
    <TouchableOpacity
      style={[
        styles.filterItem,
        activeFilter === item && styles.selectedFilterItem,
      ]}
      onPress={() => handleFilterClick(item)}>
      <RegularText
        style={[
          styles.filterText,
          {
            color: theme === THEME_COLOR ? colors.black : colors.white,
          },
        ]}>
        {item}
      </RegularText>
    </TouchableOpacity>
  );
  const selectTaskOptionFilterListHeaderComponent = () => (
    <RegularText
      style={[
        styles.sectionHeader,
        {
          color: theme === THEME_COLOR ? colors.black : colors.white,
        },
      ]}>
      Select Filter
    </RegularText>
  );
  const selectTaskOptionFilterListEmptyComponent = () => (
    <RegularText style={styles.sectionItem}>No Data Available</RegularText>
  );

  const renderBottomSheets = () => (
    <>
      <CustomBottomSheetFlatList
        ref={viewAttachmentSheetRef}
        snapPoints={['35%', '50%']}
        data={selectedTaskAttachments}
        keyExtractor={(item, index) => `${item?.file_name}_${index}`}
        renderItem={renderViewAttachmentItem}
        ListEmptyComponent={viewAttachmentListEmptyComponent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={viewAttachmentListHeaderComponent}
      />
      <CustomBottomSheetFlatList
        snapPoints={['35%']}
        ref={openChangeStatusModalRef}
        data={changeStatusData}
        keyExtractor={item => item?.name}
        renderItem={renderOpenChangeStatusItem}
        ListEmptyComponent={openChangeStatusListEmptyComponent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={openChangeStatusListHeaderComponent}
      />
      <CustomBottomSheetFlatList
        snapPoints={['50%']}
        ref={selectTaskOptionFilterBottomSheet}
        data={filterList}
        keyExtractor={item => item}
        renderItem={renderSelectTaskOptionFilterItem}
        ListHeaderComponent={selectTaskOptionFilterListHeaderComponent}
        ListEmptyComponent={selectTaskOptionFilterListEmptyComponent}
      />
    </>
  );

  const renderAnimatedModals = () => (
    <>
      <AnimatedModal
        isVisible={activeFilter === 'Task No'}
        close={() => setActiveFilter(null)}
        animationType="bottom-to-top"
        bottom={spacing.HEIGHT_50}
        left={spacing.WIDTH_18}
        modalStyle={{width: '90%'}}
        backDropColor="rgba(0,0,0, 0.5)">
        <TextInputComp
          ref={taskNoInputRef}
          placeholder="search by task number"
          textStyle={{color: colors.black}}
          value={searchByTaskNo}
          onChangeText={e => setSearchByTaskNo(e)}
          textInputLeftIcon={SvgIcon.Search}
          istextInputLeftIcon={true}
          keyboardType="numeric"
        />
      </AnimatedModal>
      <AnimatedModal
        isVisible={activeFilter === 'Subject'}
        close={() => setActiveFilter(null)}
        animationType="bottom-to-top"
        bottom={spacing.HEIGHT_50}
        left={spacing.WIDTH_18}
        modalStyle={{width: '90%'}}
        backDropColor="rgba(0,0,0, 0.5)">
        <TextInputComp
          ref={subjectInputRef}
          placeholder="search by Subject"
          textStyle={{color: colors.black}}
          value={searchBySubject}
          onChangeText={e => setSearchBySubject(e)}
          textInputLeftIcon={SvgIcon.Search}
          istextInputLeftIcon={true}
        />
      </AnimatedModal>
      <AnimatedModal
        isVisible={activeFilter === 'Assigned By'}
        close={() => setActiveFilter(null)}
        animationType="bottom-to-top"
        bottom={spacing.HEIGHT_50}
        left={spacing.WIDTH_18}
        backDropColor="rgba(0,0,0, 0.5)">
        <FlatList
          data={moreFilterData.filter(
            (item, index, self) =>
              index ===
              self.findIndex(t => t.assigned_by_name === item.assigned_by_name),
          )}
          renderItem={({item}) => {
            return (
              <TouchableOpacity
                style={{
                  paddingHorizontal: spacing.PADDING_10,
                  paddingVertical: spacing.PADDING_16,
                }}
                onPress={() => {
                  setSearchByAssignedBy(item.assigned_by_name);
                  setActiveFilter(null);
                }}>
                <RegularText
                  style={{
                    fontSize: textScale(16),
                    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
                  }}>
                  {item?.assigned_by_name}
                </RegularText>
              </TouchableOpacity>
            );
          }}
        />
      </AnimatedModal>
      <AnimatedModal
        isVisible={activeFilter === 'Assigned By'}
        close={() => setActiveFilter(null)}
        animationType="bottom-to-top"
        bottom={spacing.HEIGHT_50}
        left={spacing.WIDTH_18}
        backDropColor="rgba(0,0,0, 0.5)">
        <FlatList
          data={moreFilterData.filter(
            (item, index, self) =>
              index ===
              self.findIndex(t => t.assigned_by_name === item.assigned_by_name),
          )}
          renderItem={({item}) => {
            return (
              <TouchableOpacity
                style={{
                  paddingHorizontal: spacing.PADDING_10,
                  paddingVertical: spacing.PADDING_16,
                }}
                onPress={() => {
                  setSearchByAssignedBy(item.assigned_by_name);
                  setActiveFilter(null);
                }}>
                <RegularText
                  style={{
                    fontSize: textScale(16),
                    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
                  }}>
                  {item?.assigned_by_name}
                </RegularText>
              </TouchableOpacity>
            );
          }}
        />
      </AnimatedModal>
      <AnimatedModal
        isVisible={activeFilter === 'Assigned To'}
        close={() => setActiveFilter(null)}
        animationType="bottom-to-top"
        bottom={spacing.HEIGHT_50}
        left={spacing.WIDTH_18}
        backDropColor="rgba(0,0,0, 0.5)">
        <FlatList
          data={moreFilterData.filter(
            (item, index, self) =>
              index ===
              self.findIndex(t => t.assigned_to_name === item.assigned_to_name),
          )}
          renderItem={({item}) => {
            return (
              <TouchableOpacity
                style={{
                  paddingHorizontal: spacing.PADDING_10,
                  paddingVertical: spacing.PADDING_16,
                }}
                onPress={() => {
                  setSearchByAssignedTo(item.assigned_to_name);
                  setActiveFilter(null);
                }}>
                <RegularText
                  style={{
                    fontSize: textScale(16),
                    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
                  }}>
                  {item?.assigned_to_name}
                </RegularText>
              </TouchableOpacity>
            );
          }}
        />
      </AnimatedModal>
      <AnimatedModal
        isVisible={activeFilter === 'Category'}
        close={() => setActiveFilter(null)}
        animationType="bottom-to-top"
        bottom={spacing.HEIGHT_50}
        left={spacing.WIDTH_18}
        modalStyle={{width: '90%'}}
        backDropColor="rgba(0,0,0, 0.5)">
        <TextInputComp
          ref={categoryInputRef}
          placeholder="search by category"
          textStyle={{color: colors.black}}
          value={searchByCategory}
          onChangeText={e => setSearchByCategory(e)}
          textInputLeftIcon={SvgIcon.Search}
          istextInputLeftIcon={true}
        />
      </AnimatedModal>
      <AnimatedModal
        isVisible={activeFilter === 'Start Date'}
        close={() => {
          setActiveFilter(null);
          setSelectedDateField(null);
          setPickerVisible(false);
        }}
        animationType="bottom-to-top"
        bottom={spacing.HEIGHT_350}
        modalStyle={{width: '95%'}}
        backDropColor="rgba(0,0,0, 0.5)">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            marginBottom: spacing.MARGIN_10,
          }}>
          <BottonComp
            text={temporaryDates.fromStart || 'Select From Date'}
            style={{
              width: '45%',
              padding: spacing.PADDING_14,
              backgroundColor: colors.green400,
              borderWidth: 0,
            }}
            textStyle={{color: colors.white, fontSize: textScale(16)}}
            onPress={() => handleDateClick('fromStart', 'start')}
          />
          <BottonComp
            text={temporaryDates.toStart || 'Select To Date'}
            style={{
              width: '45%',
              padding: spacing.PADDING_14,
              backgroundColor: colors.green400,
              borderWidth: 0,
            }}
            textStyle={{color: colors.white, fontSize: textScale(16)}}
            onPress={() => handleDateClick('toStart', 'start')}
          />
        </View>
        <BottonComp
          text={'sumbit'}
          style={{
            width: '95%',
            padding: spacing.PADDING_14,
            backgroundColor: colors.green400,
            borderWidth: 0,
            alignSelf: 'center',
          }}
          textStyle={{color: colors.white, fontSize: textScale(16)}}
          onPress={handleSubmit}
        />
      </AnimatedModal>
      <AnimatedModal
        isVisible={activeFilter === 'End Date'}
        close={() => {
          setActiveFilter(null);
          setSelectedDateField(null);
          setPickerVisible(false);
        }}
        animationType="bottom-to-top"
        bottom={spacing.HEIGHT_350}
        modalStyle={{width: '95%'}}
        backDropColor="rgba(0,0,0, 0.5)">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            marginBottom: spacing.MARGIN_10,
          }}>
          <BottonComp
            text={temporaryDates.endFrom || 'Select From Date'}
            style={{
              width: '45%',
              padding: spacing.PADDING_14,
              backgroundColor: colors.green400,
              borderWidth: 0,
            }}
            textStyle={{color: colors.white, fontSize: textScale(16)}}
            onPress={() => handleDateClick('endFrom', 'end')}
          />
          <BottonComp
            text={temporaryDates.endTo || 'Select To Date'}
            style={{
              width: '45%',
              padding: spacing.PADDING_14,
              backgroundColor: colors.green400,
              borderWidth: 0,
            }}
            textStyle={{color: colors.white, fontSize: textScale(16)}}
            onPress={() => handleDateClick('endTo', 'end')}
          />
        </View>
        <BottonComp
          text={'sumbit'}
          style={{
            width: '95%',
            padding: spacing.PADDING_14,
            backgroundColor: colors.green400,
            borderWidth: 0,
            alignSelf: 'center',
          }}
          textStyle={{color: colors.white, fontSize: textScale(16)}}
          onPress={handleSubmit}
        />
      </AnimatedModal>
      {isSearchByCreateDatePicker && (
        <DateTimePicker
          value={getValidDate(searchByCreatedDate)}
          mode="date"
          is24Hour={false}
          display="spinner"
          onChange={(event, selectedDate) =>
            SearchByCreatedDateHandler(event, selectedDate)
          }
        />
      )}
    </>
  );
  return (
    <>
      <CommoneHeader
        title={`${title}`}
        showLeftIcon={true}
        onLeftIconPress={() => goBack()}
        showRightIcons={true}
        rightIcons={[SvgIcon.Filter]}
        onRightIconPress={() =>
          selectTaskOptionFilterBottomSheet.current.present()
        }
      />
      <View
        style={[
          styles.sectionContainer,
          {
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          },
        ]}>
        {loading ? (
          <LoadingScreen color={colors.green} />
        ) : (
          <FlatList
            data={moreFilterData}
            renderItem={({item}) => (
              <TaskListColum
                item={item}
                onUpdateStatus={handleUpdateCallback}
                handleChangeStatus={handleChangeStatus}
                handleAttachDocument={handleAttachDocument}
                hasAttachment={attachments[item.name]?.length > 0}
                handleViewDocumentPress={() =>
                  handleViewDocumentPress(item.name)
                }
              />
            )}
            keyExtractor={(task, index) =>
              task?.name ? `${task.name}_${index}` : `${index}`
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <RegularText style={styles.emptyText}>
                  No tasks found
                </RegularText>
              </View>
            )}
          />
        )}
      </View>
      {renderBottomSheets()}
      {renderAnimatedModals()}
      {pickerVisible && (
        <DateTimePicker
          value={getValidDate(temporaryDates[selectedDateField])}
          mode="date"
          is24Hour={false}
          display="spinner"
          onChange={(event, selectedDate) =>
            handleDateChange(selectedDateField, event, selectedDate)
          }
        />
      )}
      <CommonPopupModal
        isVisible={confirmationModal}
        buttons={[
          {text: 'Cancel', color: colors.red600, onPress: handleCancelAttach},
          {
            text: 'Confirm',
            color: colors.green600,
            onPress: handleConfirmAttach,
          },
        ]}
        message="Are you sure you want to attach a document?"
        messageColor="#4B0082"
      />
    </>
  );
};
export default TaskResponseScreen;

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: spacing.PADDING_16,
    flex: 1,
    backgroundColor: colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.PADDING_16,
  },
  emptyText: {
    fontSize: textScale(16),
    color: '#666',
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
  },
  attachmentContainer: {
    marginVertical: spacing.MARGIN_4,
    paddingHorizontal: spacing.PADDING_16,
    paddingVertical: spacing.PADDING_8,
    backgroundColor: colors.grey100,
    borderRadius: spacing.RADIUS_8,
    marginHorizontal: spacing.MARGIN_16,
  },
  attachmentItemText: {
    fontSize: textScale(14),
    color: colors.black,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
    textTransform: 'capitalize',
  },
  sectionItem: {
    fontSize: textScale(14),
    color: colors.black,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
    marginVertical: spacing.MARGIN_4,
    textTransform: 'capitalize',
    alignSelf: 'center',
  },
  sectionHeader: {
    fontSize: textScale(18),
    color: colors.grey800,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
    marginBottom: spacing.MARGIN_4,
    textAlign: 'center',
  },
  filterContainer: {
    padding: spacing.PADDING_16,
    marginBottom: spacing.MARGIN_16,
  },
  filterButton: {
    paddingVertical: spacing.PADDING_8,
    paddingHorizontal: spacing.PADDING_16,
    backgroundColor: colors.grey100,
    marginVertical: spacing.MARGIN_8,
    borderRadius: spacing.RADIUS_8,
  },
  filterText: {
    fontSize: textScale(16),
    color: colors.grey900,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
  },
  filterTitle: {
    fontSize: textScale(18),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
    alignSelf: 'center',
    marginBottom: spacing.MARGIN_8,
  },
  changeStatusbtnContaiber: {
    marginVertical: spacing.MARGIN_4,
    paddingHorizontal: spacing.PADDING_16,
    paddingVertical: spacing.PADDING_8,
    backgroundColor: colors.grey100,
    borderRadius: spacing.RADIUS_8,
    zIndex: 10,
    marginHorizontal: spacing.MARGIN_16,
  },
  createButton: {
    backgroundColor: colors.green600,
    height: spacing.HEIGHT_40,
    borderWidth: 0,
    maxHeight: spacing.HEIGHT_40,
    flex: 1,
    marginHorizontal: spacing.MARGIN_4,
  },
  createButtontext: {
    fontSize: textScale(14),
    color: colors.white,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
  },
  uploadButton: {
    marginVertical: spacing.MARGIN_8,
    paddingVertical: spacing.PADDING_10,
    paddingHorizontal: spacing.PADDING_16,
    backgroundColor: colors.blue500,
    borderRadius: spacing.RADIUS_8,
    alignItems: 'center',
    marginHorizontal: spacing.MARGIN_16,
  },
  uploadButtonText: {
    fontSize: textScale(16),
    color: colors.white,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_BOLD,
  },
  filterItem: {
    padding: spacing.PADDING_10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedFilterItem: {
    backgroundColor: '#d3f8d3',
  },
  selectedStatusBackground: {
    backgroundColor: '#d3f8d3',
  },
});
