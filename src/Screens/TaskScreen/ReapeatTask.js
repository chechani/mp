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
import * as SvgIcon from '../../assets';
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
import {CommonToastMessage, goBack} from '../../Utils/helperFunctions';
import THEME_COLOR from '../../Utils/Constant';
import {useTheme} from '../../Components/hooks';

const ReapeatTask = ({}) => {
  const {theme} = useTheme();
  const [taskData, setTaskData] = useState({
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
    repetitionFrequency: '',
    dateOfMonth: '',
    day: '',
    month: '',
    yearlyDateOfMonth: '',
    errors: {},
  });
  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const {
    GET_TASK_CATEGORY,
    CREATE_REPEAT_TASK,
    GET_TASK_FREQUENCY,
    GET_TASK_HOUR,
    GET_TASK_MINUTES,
    GET_TASK_PRIORITY,
    GET_TASK_IMPORTANCE,
    GET_TASK_SELECT_TEAM_MEMBER,
    GET_TASK_MONTH,
    GET_TASK_DAY,
    GET_TASK_DATE_OF_MONTH,
    GET_TASK_EXPECTED_TIME,
  } = useApiURLs();
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.selectedValue) {
        handleSetData(route.params.selectedValue, route.params.fieldType);
      }
    });
    return unsubscribe;
  }, [navigation, route.params?.selectedValue, route.params?.fieldType]);

  // Function to handle setting state based on field type
  const handleSetData = (value, fieldType) => {
    switch (fieldType) {
      case 'taskCategory':
        setTaskData(prevState => ({...prevState, taskCategory: value?.name}));
        break;
      case 'repetitionFrequency':
        setTaskData(prevState => ({
          ...prevState,
          repetitionFrequency: value?.name,
          dateOfMonth: '',
          month: '',
          day: '',
          yearlyDateOfMonth: '',
        }));
        break;
      case 'hour':
        setTaskData(prevState => ({...prevState, hour: value?.title}));
        break;
      case 'minute':
        setTaskData(prevState => ({...prevState, minute: value?.title}));
        break;
      case 'expectedTime':
        setTaskData(prevState => ({...prevState, expectedTime: value?.title}));
        break;
      case 'taskPriority':
        setTaskData(prevState => ({...prevState, taskPriority: value?.name}));
        break;
      case 'importance':
        setTaskData(prevState => ({...prevState, importance: value?.name}));
        break;
      case 'selectTeamMembers':
        setTaskData(prevState => ({
          ...prevState,
          selectedTeamMembers: value?.id,
          selectedTeamMembersDisplay: value?.title,
        }));
        break;
      case 'dateOfMonth':
        setTaskData(prevState => ({...prevState, dateOfMonth: value?.title}));
        break;
      case 'selectDay':
        setTaskData(prevState => ({...prevState, day: value?.title}));
        break;
      case 'month':
        setTaskData(prevState => ({...prevState, month: value?.title}));
        break;
      case 'Yearlymonth':
        setTaskData(prevState => ({...prevState, month: value?.title}));
        break;
      case 'YearlyDateOfMonth':
        setTaskData(prevState => ({
          ...prevState,
          yearlyDateOfMonth: value?.title,
        }));
        break;
      default:
        break;
    }
  };

  // Function to navigate to different screens for data selection
  const handleCommonNavigation = (screenName, title, url, fieldType) => {
    navigation.dispatch(
      StackActions.push(screenName, {
        title: title,
        url: url,
        fieldType: fieldType,
      }),
    );
  };

  // Function to format a Date object into "YYYY-MM-DD" format
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
  // Handle task update
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
      expectedTime:
        taskData.expectedTime === '' ? 'Expected Time is required' : '',
      duration: taskData.duration === '' ? 'Duration is required' : '',
      selectedTeamMembers:
        taskData.selectedTeamMembers === '' ? 'Team Members are required' : '',
      repetitionFrequency:
        taskData.repetitionFrequency === ''
          ? 'Repetition Frequency is required'
          : '',
      ...(taskData.repetitionFrequency === 'Monthly' && {
        dateOfMonth:
          taskData.dateOfMonth === ''
            ? 'Date of Month is required for Monthly frequency'
            : '',
      }),
      ...(taskData.repetitionFrequency === 'Yearly' && {
        yearlyDateOfMonth:
          taskData.yearlyDateOfMonth === ''
            ? 'Date of Month is required for Yearly frequency'
            : '',
      }),
      ...(taskData.repetitionFrequency === 'Yearly' && {
        month:
          taskData.month === ''
            ? 'Select Month is required for Yearly frequency'
            : '',
      }),
    };

    setTaskData(prevState => ({...prevState, errors}));
    for (const key in errors) {
      if (errors[key] !== '') {
        CommonToastMessage('error', 'Missing Fields', errors[key]);
        return;
      }
    }

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
      month_date: taskData.dateOfMonth,
      start_month: taskData.month,
      start_day: taskData.day,
      frequency: taskData.repetitionFrequency,
    };

    setLoading(true);
    try {
      const res = await apiPost(CREATE_REPEAT_TASK, data);
      console.log(res);
      if (res.status_code === 200) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: res.message,
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
        repetitionFrequency: '',
        dateOfMonth: '',
        day: '',
        month: '',
        yearlyDateOfMonth: '',
        errors: {},
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    } finally {
      setLoading(false);
      goBack();
    }
  };

  return (
    <>
      <CommoneHeader
        title={'Repeat Task'}
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
          editable={false}
          isRightIcon={true}
          rightIcon={
            taskData.taskCategory !== ''
              ? SvgIcon.Wrong
              : SvgIcon.RightArrowIcon
          }
          rightIconPress={() =>
            setTaskData(prevData => ({...prevData, taskCategory: ''}))
          }
          onPressContainer={() =>
            handleCommonNavigation(
              NavigationString.RepeatTaskComponent,
              'Task Category',
              GET_TASK_CATEGORY,
              'taskCategory',
            )
          }
          istextInputLeftIcon={false}
        />
        <TextInputComp
          error={taskData.errors?.subjectMatter}
          placeholder="Subject Matter"
          placeholderTextColor={colors.grey500}
          value={taskData.subjectMatter}
          onChangeText={text =>
            setTaskData(prevData => ({...prevData, subjectMatter: text}))
          }
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
          onChangeText={text =>
            setTaskData(prevData => ({...prevData, description: text}))
          }
          multiline
          istextInputLeftIcon={false}
        />
        <TextInputComp
          error={taskData.errors?.startDate}
          placeholder="Start Date"
          placeholderTextColor={colors.grey500}
          value={taskData.startDateDisplay}
          editable={false}
          isRightIcon={true}
          rightIcon={taskData.startDate !== '' ? SvgIcon.Wrong : false}
          rightIconPress={() =>
            setTaskData(prevData => ({
              ...prevData,
              startDate: '',
              startDateDisplay: '',
            }))
          }
          onPressContainer={() => setShowStartPicker(true)}
          istextInputLeftIcon={false}
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
          editable={false}
          isRightIcon={true}
          rightIcon={taskData.endDate !== '' ? SvgIcon.Wrong : false}
          rightIconPress={() =>
            setTaskData(prevData => ({
              ...prevData,
              endDate: '',
              endDateDisplay: '',
            }))
          }
          onPressContainer={() => setShowEndPicker(true)}
          istextInputLeftIcon={false}
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
        <TextInputComp
          error={taskData.errors?.repetitionFrequency}
          placeholder="Repetition Frequency"
          placeholderTextColor={colors.grey500}
          value={taskData.repetitionFrequency}
          editable={false}
          isRightIcon={true}
          rightIcon={
            taskData.repetitionFrequency !== ''
              ? SvgIcon.Wrong
              : SvgIcon.RightArrowIcon
          }
          rightIconPress={() =>
            setTaskData(prevData => ({...prevData, repetitionFrequency: ''}))
          }
          onPressContainer={() =>
            handleCommonNavigation(
              NavigationString.RepeatTaskComponent,
              'Repetition Frequency',
              GET_TASK_FREQUENCY,
              'repetitionFrequency',
            )
          }
          istextInputLeftIcon={false}
        />
        {taskData.repetitionFrequency === 'Quarterly' && (
          <TextInputComp
            error={taskData.errors?.dateOfMonth}
            placeholder="Date of Month"
            placeholderTextColor={colors.grey500}
            value={taskData.dateOfMonth}
            editable={false}
            isRightIcon={true}
            rightIcon={
              taskData.dateOfMonth !== ''
                ? SvgIcon.Wrong
                : SvgIcon.RightArrowIcon
            }
            rightIconPress={() =>
              setTaskData(prevData => ({...prevData, dateOfMonth: ''}))
            }
            onPressContainer={() =>
              handleCommonNavigation(
                NavigationString.RepeatTaskComponent,
                'Date of Month',
                GET_TASK_DATE_OF_MONTH,
                'dateOfMonth',
              )
            }
            istextInputLeftIcon={false}
          />
        )}
        {taskData.repetitionFrequency === 'Weekly' && (
          <TextInputComp
            error={taskData.errors?.day}
            placeholder="Select Day"
            placeholderTextColor={colors.grey500}
            value={taskData.day}
            editable={false}
            isRightIcon={true}
            rightIcon={
              taskData.day !== '' ? SvgIcon.Wrong : SvgIcon.RightArrowIcon
            }
            rightIconPress={() =>
              setTaskData(prevData => ({...prevData, day: ''}))
            }
            onPressContainer={() =>
              handleCommonNavigation(
                NavigationString.RepeatTaskComponent,
                'Select Day',
                GET_TASK_DAY,
                'selectDay',
              )
            }
            istextInputLeftIcon={false}
          />
        )}
        {taskData.repetitionFrequency === 'Monthly' && (
          <TextInputComp
            error={taskData.errors?.dateOfMonth}
            placeholder="Date of Month"
            placeholderTextColor={colors.grey500}
            value={taskData.dateOfMonth}
            editable={false}
            isRightIcon={true}
            rightIcon={
              taskData.dateOfMonth !== ''
                ? SvgIcon.Wrong
                : SvgIcon.RightArrowIcon
            }
            rightIconPress={() =>
              setTaskData(prevData => ({...prevData, dateOfMonth: ''}))
            }
            onPressContainer={() =>
              handleCommonNavigation(
                NavigationString.RepeatTaskComponent,
                'Date of Month',
                GET_TASK_DATE_OF_MONTH,
                'dateOfMonth',
              )
            }
            istextInputLeftIcon={false}
          />
        )}
        {taskData.repetitionFrequency === 'Yearly' && (
          <TextInputComp
            error={taskData.errors?.month}
            placeholder="Select Month"
            placeholderTextColor={colors.grey500}
            value={taskData.month}
            editable={false}
            isRightIcon={true}
            rightIcon={
              taskData.month !== '' ? SvgIcon.Wrong : SvgIcon.RightArrowIcon
            }
            rightIconPress={() =>
              setTaskData(prevData => ({...prevData, month: ''}))
            }
            onPressContainer={() =>
              handleCommonNavigation(
                NavigationString.RepeatTaskComponent,
                'Select Month',
                GET_TASK_MONTH,
                'month',
              )
            }
            istextInputLeftIcon={false}
          />
        )}
        {taskData.repetitionFrequency === 'Yearly' && (
          <TextInputComp
            error={taskData.errors?.yearlyDateOfMonth}
            placeholder="Date of Month"
            placeholderTextColor={colors.grey500}
            value={taskData.yearlyDateOfMonth}
            editable={false}
            isRightIcon={true}
            rightIcon={
              taskData.yearlyDateOfMonth !== ''
                ? SvgIcon.Wrong
                : SvgIcon.RightArrowIcon
            }
            rightIconPress={() =>
              setTaskData(prevData => ({...prevData, yearlyDateOfMonth: ''}))
            }
            onPressContainer={() =>
              handleCommonNavigation(
                NavigationString.RepeatTaskComponent,
                'Yearly Date of Month',
                GET_TASK_DATE_OF_MONTH,
                'YearlyDateOfMonth',
              )
            }
            istextInputLeftIcon={false}
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
          placeholder="Hour"
          placeholderTextColor={colors.grey500}
          value={taskData.hour}
          editable={false}
          isRightIcon={true}
          rightIcon={
            taskData.hour !== '' ? SvgIcon.Wrong : SvgIcon.RightArrowIcon
          }
          rightIconPress={() =>
            setTaskData(prevData => ({...prevData, hour: ''}))
          }
          onPressContainer={() =>
            handleCommonNavigation(
              NavigationString.RepeatTaskComponent,
              'Select Hour',
              GET_TASK_HOUR,
              'hour',
            )
          }
          istextInputLeftIcon={false}
        />
        <TextInputComp
          error={taskData.errors?.minute}
          placeholder="Minute"
          placeholderTextColor={colors.grey500}
          value={taskData.minute}
          editable={false}
          isRightIcon={true}
          rightIcon={
            taskData.minute !== '' ? SvgIcon.Wrong : SvgIcon.RightArrowIcon
          }
          rightIconPress={() =>
            setTaskData(prevData => ({...prevData, minute: ''}))
          }
          onPressContainer={() =>
            handleCommonNavigation(
              NavigationString.RepeatTaskComponent,
              'Select Minute',
              GET_TASK_MINUTES,
              'minute',
            )
          }
          istextInputLeftIcon={false}
        />
        <TextInputComp
          error={taskData.errors?.expectedTime}
          placeholder="Expected Time"
          placeholderTextColor={colors.grey500}
          value={taskData.expectedTime}
          editable={false}
          isRightIcon={true}
          rightIcon={
            taskData.expectedTime !== ''
              ? SvgIcon.Wrong
              : SvgIcon.RightArrowIcon
          }
          rightIconPress={() =>
            setTaskData(prevData => ({...prevData, expectedTime: ''}))
          }
          onPressContainer={() =>
            handleCommonNavigation(
              NavigationString.RepeatTaskComponent,
              'Expected Time',
              GET_TASK_EXPECTED_TIME,
              'expectedTime',
            )
          }
          istextInputLeftIcon={false}
        />
        <TextInputComp
          error={taskData.errors?.duration}
          placeholder="Duration"
          placeholderTextColor={colors.grey500}
          value={taskData.duration}
          onChangeText={text =>
            setTaskData(prevData => ({...prevData, duration: text}))
          }
          keyboardType="phone-pad"
          istextInputLeftIcon={false}
        />
        <TextInputComp
          error={taskData.errors?.taskPriority}
          placeholder="Task Priority"
          placeholderTextColor={colors.grey500}
          value={taskData.taskPriority}
          editable={false}
          isRightIcon={true}
          rightIcon={
            taskData.taskPriority !== ''
              ? SvgIcon.Wrong
              : SvgIcon.RightArrowIcon
          }
          rightIconPress={() =>
            setTaskData(prevData => ({...prevData, taskPriority: ''}))
          }
          onPressContainer={() =>
            handleCommonNavigation(
              NavigationString.RepeatTaskComponent,
              'Task Priority',
              GET_TASK_PRIORITY,
              'taskPriority',
            )
          }
          istextInputLeftIcon={false}
        />
        <TextInputComp
          error={taskData.errors?.importance}
          placeholder="Importance"
          placeholderTextColor={colors.grey500}
          value={taskData.importance}
          editable={false}
          isRightIcon={true}
          rightIcon={
            taskData.importance !== '' ? SvgIcon.Wrong : SvgIcon.RightArrowIcon
          }
          rightIconPress={() =>
            setTaskData(prevData => ({...prevData, importance: ''}))
          }
          onPressContainer={() =>
            handleCommonNavigation(
              NavigationString.RepeatTaskComponent,
              'Importance',
              GET_TASK_IMPORTANCE,
              'importance',
            )
          }
          istextInputLeftIcon={false}
        />
        <TextInputComp
          error={taskData.errors?.selectedTeamMembers}
          placeholder="Team Members"
          placeholderTextColor={colors.grey500}
          value={taskData.selectedTeamMembersDisplay}
          editable={false}
          isRightIcon={true}
          rightIcon={
            taskData.selectedTeamMembers !== ''
              ? SvgIcon.Wrong
              : SvgIcon.RightArrowIcon
          }
          rightIconPress={() =>
            setTaskData(prevData => ({
              ...prevData,
              selectedTeamMembers: '',
              selectedTeamMembersDisplay: '',
            }))
          }
          onPressContainer={() =>
            handleCommonNavigation(
              NavigationString.RepeatTaskComponent,
              'Team Members',
              GET_TASK_SELECT_TEAM_MEMBER,
              'selectTeamMembers',
            )
          }
          istextInputLeftIcon={false}
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

export default ReapeatTask;
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
    paddingVertical: spacing.PADDING_16,
    paddingHorizontal:spacing.PADDING_10,
    backgroundColor: colors.white,
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
  createOptionButton: {
    backgroundColor: '#00bfff',
    paddingVertical: spacing.PADDING_12,
    borderRadius: spacing.RADIUS_8,
    alignItems: 'center',
    marginVertical: spacing.MARGIN_10,
    marginHorizontal: spacing.MARGIN_16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: textScale(16),
  },
  createTaskHeader: {
    alignSelf: 'center',
    fontSize: textScale(18),
    color: colors.black,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
    marginVertical: spacing.MARGIN_12,
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
});
