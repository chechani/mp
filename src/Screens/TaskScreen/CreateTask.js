import DateTimePicker from '@react-native-community/datetimepicker';
import {StackActions, useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import * as SvgIcon from '../../assets/';
import BottonComp from '../../Components/Common/BottonComp';
import CommoneHeader from '../../Components/Common/CommoneHeader';
import RegularText from '../../Components/Common/RegularText';
import TextInputComp from '../../Components/Common/TextInputComp';
import {useApiURLs} from '../../Config/url';
import NavigationString from '../../Navigations/NavigationString';
import {boxShadow} from '../../styles/Mixins';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import {apiPost} from '../../Utils/apiCalls';
import colors from '../../Utils/colors';
import {
  goBack,
  navigate,
  CommonToastMessage,
} from '../../Utils/helperFunctions';
import THEME_COLOR from '../../Utils/Constant';
import {useTheme} from '../../Components/hooks';

const CreateTask = () => {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const {message = []} = route?.params || {};

  const concatenatedMessage =
    Array.isArray(message) && message.length > 0
      ? message.map(item => item?.message || '').join(' ')
      : '';

  const [taskData, setTaskData] = useState({
    subjectMatter: '',
    taskCategory: '',
    startDate: '',
    endDate: '',
    startDateDisplay: '',
    endDateDisplay: '',
    description: concatenatedMessage,
    expectedTime: '',
    duration: '',
    taskPriority: '',
    importance: '',
    selectedTeamMembers: '',
    selectedTeamMembersDisplay: '',
    hour: '',
    minute: '',
    timePeriod: 'AM',
    day: '',
    month: '',
    errors: {},
  });

  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const {
    CREATE_TASK,
    GET_TASK_CATEGORY,
    GET_TASK_HOUR,
    GET_TASK_MINUTES,
    GET_TASK_EXPECTED_TIME,
    GET_TASK_PRIORITY,
    GET_TASK_IMPORTANCE,
    GET_TASK_SELECT_TEAM_MEMBER,
  } = useApiURLs();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.selectedValue) {
        handleSetData(route.params.selectedValue, route.params.fieldType);
      }
    });

    return unsubscribe;
  }, [navigation, route.params?.selectedValue, route.params?.fieldType]);
  const handleCommonNavigation = (screenName, title, url, fieldType) => {
    navigation.dispatch(
      StackActions.push(screenName, {
        title: title,
        url: url,
        fieldType: fieldType,
      }),
    );
  };
  const handleSetData = (value, fieldType) => {
    setTaskData(prevState => {
      switch (fieldType) {
        case 'taskCategory':
          return {...prevState, taskCategory: value?.name};
        case 'selectHour':
          return {...prevState, hour: value?.title};
        case 'selectMinutes':
          return {...prevState, minute: value?.title};
        case 'expectedTime':
          return {...prevState, expectedTime: value?.title};
        case 'taskPriority':
          return {...prevState, taskPriority: value?.name};
        case 'importance':
          return {...prevState, importance: value?.name};
        case 'selectTeamMembers':
          return {
            ...prevState,
            selectedTeamMembers: value?.id,
            selectedTeamMembersDisplay: value?.title,
          };
        case 'dateOfMonth':
          return {...prevState, day: value?.title};
        case 'month':
          return {...prevState, month: value?.title};
        default:
          return prevState;
      }
    });
  };

  const formatDate = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

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

    const currentDate = selectedDate || getValidDate(taskData[type + 'Date']);
    type === 'start' ? setShowStartPicker(false) : setShowEndPicker(false);

    if (
      (type === 'start' &&
        taskData.endDate &&
        new Date(currentDate) > new Date(taskData.endDate)) ||
      (type === 'end' &&
        taskData.startDate &&
        new Date(currentDate) < new Date(taskData.startDate))
    ) {
      Alert.alert(
        'Invalid Date',
        `The ${type} date cannot be after the other date.`,
      );
      return;
    }

    setTaskData(prevState => ({
      ...prevState,
      [type + 'Date']: formatDate(currentDate),
      [type + 'DateDisplay']: formatDateForDisplay(currentDate),
    }));
  };

  const handleUpdateTask = async () => {
    const errors = {
      subjectMatter:
        taskData.subjectMatter === '' ? 'Subject Matter is required' : '',
      taskCategory:
        taskData.taskCategory === '' ? 'Task Category is required' : '',
      startDate: taskData.startDate === '' ? 'Start Date is required' : '',
      endDate: taskData.endDate === '' ? 'End Date is required' : '',
      description: taskData.description === '' ? 'Description is required' : '',
      hour: taskData.hour === '' ? 'Hour is required' : '',
      minute: taskData.minute === '' ? 'Minutes are required' : '',
      taskPriority:
        taskData.taskPriority === '' ? 'Task Priority is required' : '',
      importance: taskData.importance === '' ? 'Importance is required' : '',
    };

    setTaskData(prevState => ({...prevState, errors}));
    for (const key in errors) {
      if (errors[key] !== '') {
        CommonToastMessage('error', 'Missing Fields', errors[key]);
        return;
      }
    }

    setLoading(true);
    const data = {
      task_name: taskData.subjectMatter,
      category: taskData.taskCategory,
      start_date: taskData.startDate,
      end_date: taskData.endDate,
      description: taskData.description,
      hour: taskData.hour,
      minute: taskData.minute,
      priority: taskData.taskPriority,
      importance: taskData.importance,
      assigned_to: taskData.selectedTeamMembers,
      ampm: taskData.timePeriod,
      expected_duration: taskData.duration,
      start_minutes_options: taskData.expectedTime,
    };
    try {
      const res = await apiPost(CREATE_TASK, data);
      console.log(res);
      if (res.status_code === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: res.message,
          visibilityTime: 2000,
        });
      }
      setTaskData({
        subjectMatter: '',
        taskCategory: '',
        startDate: '',
        endDate: '',
        startDateDisplay: '',
        endDateDisplay: '',
        description: '',
        expectedTime: '',
        duration: '',
        taskPriority: '',
        importance: '',
        selectedTeamMembers: '',
        selectedTeamMembersDisplay: '',
        hour: '',
        minute: '',
        timePeriod: 'AM',
        errors: {},
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
        visibilityTime: 2000,
      });
    } finally {
      setLoading(false);
      goBack();
    }
  };

  return (
    <>
      <CommoneHeader
        title={'Create Task'}
        showRightIcons={true}
        rightIcons={[SvgIcon.Wrong]}
        onRightIconPress={() => goBack()}
      />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          },
        ]}>
        <TextInputComp
          error={taskData.errors?.taskCategory}
          placeholder="Task Category"
          placeholderTextColor={colors.grey500}
          value={taskData.taskCategory}
          textInputLeftIcon={false}
          istextInputLeftIcon={false}
          isRightIcon={true}
          secureText={false}
          rightIcon={
            taskData.taskCategory !== ''
              ? SvgIcon.Wrong
              : SvgIcon.RightArrowIcon
          }
          rightIconPress={() =>
            taskData.taskCategory === ''
              ? {}
              : setTaskData(prevState => ({...prevState, taskCategory: ''}))
          }
          editable={false}
          inputStyle={{
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          }}
          onPressContainer={() =>
            handleCommonNavigation(
              NavigationString.CreateTaskComponent,
              'Task Category',
              GET_TASK_CATEGORY,
              'taskCategory',
            )
          }
        />
        <TextInputComp
          error={taskData.errors?.subjectMatter}
          placeholder="Subject Matter"
          placeholderTextColor={colors.grey500}
          value={taskData.subjectMatter}
          onChangeText={value =>
            setTaskData(prevState => ({...prevState, subjectMatter: value}))
          }
          textInputLeftIcon={false}
          istextInputLeftIcon={false}
        />
        <TextInputComp
          error={taskData.errors?.description}
          style={[
            styles.descriptionInput,
            {color: theme === THEME_COLOR ? colors.black : colors.white},
          ]}
          placeholder="Description"
          placeholderTextColor={colors.grey500}
          value={taskData.description}
          onChangeText={value =>
            setTaskData(prevState => ({...prevState, description: value}))
          }
          multiline
          textInputLeftIcon={false}
          istextInputLeftIcon={false}
        />
        <TextInputComp
          error={taskData.errors?.startDate}
          placeholder="Start Date"
          placeholderTextColor={colors.grey500}
          value={taskData.startDateDisplay}
          textInputLeftIcon={false}
          istextInputLeftIcon={false}
          editable={false}
          isRightIcon={true}
          inputStyle={{
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          }}
          rightIcon={
            (taskData.startDate && taskData.startDateDisplay) !== ''
              ? SvgIcon.Wrong
              : false
          }
          rightIconPress={() =>
            setTaskData(prevState => ({
              ...prevState,
              startDate: '',
              startDateDisplay: '',
            }))
          }
          onPressContainer={() => setShowStartPicker(true)}
        />
        {Platform.OS === 'android' && showStartPicker && (
          <DateTimePicker
            value={getValidDate(taskData.startDate)}
            mode="date"
            is24Hour={false}
            display="spinner"
            onChange={(event, selectedDate) =>
              handleDateChange('start', event, selectedDate)
            }
          />
        )}

        <TextInputComp
          error={taskData.errors?.endDate}
          placeholder="End Date"
          placeholderTextColor={colors.grey500}
          value={taskData.endDateDisplay}
          textInputLeftIcon={false}
          istextInputLeftIcon={false}
          editable={false}
          isRightIcon={true}
          inputStyle={{
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          }}
          rightIcon={
            (taskData.endDate && taskData.endDateDisplay) !== ''
              ? SvgIcon.Wrong
              : false
          }
          rightIconPress={() =>
            setTaskData(prevState => ({
              ...prevState,
              endDate: '',
              endDateDisplay: '',
            }))
          }
          onPressContainer={() => setShowEndPicker(true)}
        />
        {Platform.OS === 'android' && showEndPicker && (
          <DateTimePicker
            value={getValidDate(taskData.endDate)}
            mode="date"
            is24Hour={false}
            display="spinner"
            onChange={(event, selectedDate) =>
              handleDateChange('end', event, selectedDate)
            }
          />
        )}

        <View style={styles.radioButtonContainer}>
          <RegularText
            style={[
              styles.label,
              {color: theme === THEME_COLOR ? colors.black : colors.white},
            ]}>
            Choose AM/PM:
          </RegularText>
          <RegularText
            style={[
              styles.labelDescription,
              {color: theme === THEME_COLOR ? colors.grey700 : colors.grey400},
            ]}>
            AM/PM: Whether the task occurs in the morning or afternoon/evening
          </RegularText>

          <TouchableOpacity
            style={styles.radioBtn}
            onPress={() =>
              setTaskData(prevState => ({...prevState, timePeriod: 'AM'}))
            }>
            <RegularText
              style={[
                styles.radioLabel,
                {
                  color:
                    theme === THEME_COLOR ? colors.grey700 : colors.grey400,
                },
              ]}>
              AM
            </RegularText>
            <View
              style={[
                styles.outerCircle,
                taskData.timePeriod === 'AM' && styles.selectedOuterCircle,
              ]}>
              <View
                style={[
                  styles.innerCircle,
                  taskData.timePeriod === 'AM' && styles.selectedInnerCircle,
                ]}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioBtn}
            onPress={() =>
              setTaskData(prevState => ({...prevState, timePeriod: 'PM'}))
            }>
            <RegularText
              style={[
                styles.radioLabel,
                {
                  color:
                    theme === THEME_COLOR ? colors.grey700 : colors.grey400,
                },
              ]}>
              PM
            </RegularText>
            <View
              style={[
                styles.outerCircle,
                taskData.timePeriod === 'PM' && styles.selectedOuterCircle,
              ]}>
              <View
                style={[
                  styles.innerCircle,
                  taskData.timePeriod === 'PM' && styles.selectedInnerCircle,
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        <TextInputComp
          error={taskData.errors?.hour}
          placeholder="Select Hour"
          placeholderTextColor={colors.grey500}
          value={taskData.hour}
          keyboardType="numeric"
          textInputLeftIcon={false}
          istextInputLeftIcon={false}
          editable={false}
          inputStyle={{
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          }}
          isRightIcon={true}
          rightIcon={
            taskData.hour !== '' ? SvgIcon.Wrong : SvgIcon.RightArrowIcon
          }
          rightIconPress={() =>
            taskData.hour === ''
              ? {}
              : setTaskData(prevState => ({...prevState, hour: ''}))
          }
          secureText={false}
          onPressContainer={() =>
            handleCommonNavigation(
              NavigationString.CreateTaskComponent,
              'Select Hour',
              GET_TASK_HOUR,
              'selectHour',
            )
          }
        />
        <TextInputComp
          error={taskData.errors?.minute}
          placeholder="Select Minutes"
          placeholderTextColor={colors.grey500}
          value={taskData.minute}
          keyboardType="numeric"
          textInputLeftIcon={false}
          istextInputLeftIcon={false}
          editable={false}
          inputStyle={{
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          }}
          isRightIcon={true}
          rightIcon={
            taskData.minute !== '' ? SvgIcon.Wrong : SvgIcon.RightArrowIcon
          }
          rightIconPress={() =>
            taskData.minute === ''
              ? {}
              : setTaskData(prevState => ({...prevState, minute: ''}))
          }
          secureText={false}
          onPressContainer={() =>
            handleCommonNavigation(
              NavigationString.CreateTaskComponent,
              'Select Minutes',
              GET_TASK_MINUTES,
              'selectMinutes',
            )
          }
        />
        <TextInputComp
          error={taskData.errors?.expectedTime}
          placeholder="Expected Time (optional)"
          placeholderTextColor={colors.grey500}
          value={taskData.expectedTime}
          textInputLeftIcon={false}
          istextInputLeftIcon={false}
          editable={false}
          inputStyle={{
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          }}
          isRightIcon={true}
          rightIcon={
            taskData.expectedTime !== ''
              ? SvgIcon.Wrong
              : SvgIcon.RightArrowIcon
          }
          rightIconPress={() =>
            taskData.expectedTime === ''
              ? {}
              : setTaskData(prevState => ({...prevState, expectedTime: ''}))
          }
          secureText={false}
          onPressContainer={() =>
            handleCommonNavigation(
              NavigationString.CreateTaskComponent,
              'Expected Time',
              GET_TASK_EXPECTED_TIME,
              'expectedTime',
            )
          }
        />
        <TextInputComp
          placeholder="Duration (optional)"
          placeholderTextColor={colors.grey500}
          value={taskData.duration}
          onChangeText={value =>
            setTaskData(prevState => ({...prevState, duration: value}))
          }
          textInputLeftIcon={false}
          istextInputLeftIcon={false}
          keyboardType="numeric"
        />

        <TextInputComp
          error={taskData.errors?.taskPriority}
          placeholder="Task Priority"
          placeholderTextColor={colors.grey500}
          value={taskData.taskPriority}
          textInputLeftIcon={false}
          istextInputLeftIcon={false}
          isRightIcon={true}
          secureText={false}
          rightIcon={
            taskData.taskPriority !== ''
              ? SvgIcon.Wrong
              : SvgIcon.RightArrowIcon
          }
          inputStyle={{
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          }}
          rightIconPress={() =>
            taskData.taskPriority === ''
              ? {}
              : setTaskData(prevState => ({...prevState, taskPriority: ''}))
          }
          onPressContainer={() =>
            handleCommonNavigation(
              NavigationString.CreateTaskComponent,
              'Task Priority',
              GET_TASK_PRIORITY,
              'taskPriority',
            )
          }
          editable={false}
        />
        <TextInputComp
          error={taskData.errors?.importance}
          placeholder="Importance"
          placeholderTextColor={colors.grey500}
          value={taskData.importance}
          textInputLeftIcon={false}
          istextInputLeftIcon={false}
          isRightIcon={true}
          secureText={false}
          rightIcon={
            taskData.importance !== '' ? SvgIcon.Wrong : SvgIcon.RightArrowIcon
          }
          rightIconPress={() =>
            taskData.importance === ''
              ? {}
              : setTaskData(prevState => ({...prevState, importance: ''}))
          }
          onPressContainer={() =>
            handleCommonNavigation(
              NavigationString.CreateTaskComponent,
              'Importance',
              GET_TASK_IMPORTANCE,
              'importance',
            )
          }
          editable={false}
          inputStyle={{
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          }}
        />
        <TextInputComp
          placeholder="Select Team Members (optional)"
          placeholderTextColor={colors.grey500}
          value={taskData.selectedTeamMembersDisplay}
          textInputLeftIcon={false}
          istextInputLeftIcon={false}
          isRightIcon={true}
          secureText={false}
          rightIcon={
            (taskData.selectedTeamMembers &&
              taskData.selectedTeamMembersDisplay) !== ''
              ? SvgIcon.Wrong
              : SvgIcon.RightArrowIcon
          }
          rightIconPress={() => {
            setTaskData(prevState => ({
              ...prevState,
              selectedTeamMembers: '',
              selectedTeamMembersDisplay: '',
            }));
          }}
          onPressContainer={() =>
            handleCommonNavigation(
              NavigationString.CreateTaskComponent,
              'Select Team Members',
              GET_TASK_SELECT_TEAM_MEMBER,
              'selectTeamMembers',
            )
          }
          editable={false}
          inputStyle={{
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          }}
        />

        <BottonComp
          style={styles.createButton}
          text="Create Task"
          textStyle={styles.createButtontext}
          onPress={handleUpdateTask}
          isLoading={loading}
        />
      </ScrollView>
    </>
  );
};

export default CreateTask;
const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.PADDING_16,
    marginVertical: spacing.MARGIN_6,
    borderRadius: spacing.RADIUS_8,
    ...boxShadow(),
  },
  sectionHeader: {
    fontSize: textScale(18),
    fontWeight: 'bold',
    marginBottom: spacing.MARGIN_8,
  },
  taskCard: {
    padding: spacing.PADDING_10,
    marginBottom: spacing.MARGIN_8,
    backgroundColor: colors.white,
    borderRadius: spacing.RADIUS_8,
    ...boxShadow(),
  },
  taskTitle: {
    fontSize: textScale(16),
    fontWeight: 'bold',
  },
  taskCard: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.PADDING_12,
    marginVertical: spacing.MARGIN_8,
    borderRadius: spacing.RADIUS_8,
    ...boxShadow(),
  },
  taskTitle: {
    color: colors.black,
    fontSize: textScale(16),
    fontWeight: 'bold',
  },
  taskDetails: {
    marginTop: spacing.MARGIN_8,
  },
  sectionItem: {
    fontSize: textScale(14),
    color: colors.black,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.white,
    paddingVertical:spacing.PADDING_16,
    paddingHorizontal:spacing.PADDING_10
  },
  input: {
    height: spacing.HEIGHT_40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: spacing.RADIUS_8,
    paddingHorizontal: spacing.PADDING_10,
    marginBottom: spacing.MARGIN_16,
    color: colors.grey800,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    flex: 1,
    marginHorizontal: spacing.MARGIN_8,
  },
  descriptionInput: {
    height: spacing.HEIGHT_105,
    color: colors.black,
    flex: 1,
  },
  createButton: {
    backgroundColor: colors.green600,
    height: spacing.HEIGHT_40,
    borderWidth: 0,
    maxHeight: spacing.HEIGHT_40,
  },
  createButtontext: {
    fontSize: textScale(14),
    color: colors.white,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
  },
  radioButtonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    // alignItems: 'center',
    marginVertical: spacing.MARGIN_16,
    paddingHorizontal: spacing.PADDING_4,
  },
  label: {
    fontSize: textScale(14),
    color: colors.grey800,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
  },
  labelDescription: {
    fontSize: textScale(10),
    color: colors.grey600,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
  },
  radioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  outerCircle: {
    height: spacing.HEIGHT_20,
    width: spacing.HEIGHT_20,
    borderRadius: spacing.HEIGHT_20 / 2,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.MARGIN_8,
  },
  selectedOuterCircle: {
    borderColor: colors.green600,
  },
  innerCircle: {
    height: spacing.HEIGHT_10,
    width: spacing.HEIGHT_10,
    borderRadius: spacing.HEIGHT_10 / 2,
    backgroundColor: '#fff',
  },
  selectedInnerCircle: {
    backgroundColor: colors.green600,
  },
  radioLabel: {
    color: colors.grey800,
    fontSize: textScale(14),
    marginVertical: spacing.MARGIN_4,
  },
  headingContainer: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.PADDING_16,
  },
});
