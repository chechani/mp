import React, {useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import * as SvgIcon from '../../assets';
import {useApiURLs} from '../../Config/url';
import NavigationString from '../../Navigations/NavigationString';
import {boxShadow} from '../../styles/Mixins';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import {apiGet} from '../../Utils/apiCalls';
import colors from '../../Utils/colors';
import {navigate, openDrawer} from '../../Utils/helperFunctions';
import CommoneHeader from '../Common/CommoneHeader';
import CustomBottomSheet from '../Common/CustomBottomSheet';
import LoadingScreen from '../Common/Loader';
import RegularText from '../Common/RegularText';
import CustomBottomSheetFlatList from '../Common/CustomBottomSheetFlatList';
import THEME_COLOR from '../../Utils/Constant';
import {useTheme} from '../hooks';

// Main TaskListComponent that manages the FlatList
const TaskListComponent = () => {
  const {theme} = useTheme();
  const selectTaskOptionBottomSheet = useRef(null);
  const pendingTaskBottomSheet = useRef(null);
  const openAssignedbymeBottomSheet = useRef(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedPendingCount, setSelectedPendingCount] = useState(0);
  const [selectedCompleteCount, setSelectedCompleteCount] = useState(0);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [sectionData, setSectionData] = useState([]);
  const [selectUrl, setSelectUrl] = useState(null);
  const [assignedByMeCounts, setAssignedByMeCounts] = useState({
    pending: 0,
    overdue: 0,
    completed: 0,
  });
  const [selectedTaskOption, setSelectedTaskOption] = useState({
    title: '',
    url: '',
    counts: {pending: 0, completed: 0},
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleTaskSectionPress = item => {
    const {title, counts, url} = item;

    setSelectedTask(title);
    setSelectedTaskOption(item);
    setSelectedPendingCount(
      Object.keys(counts)
        .filter(
          status =>
            status.toLowerCase() !== 'completed' &&
            status.toLowerCase() !== 'in_time',
        )
        .reduce((acc, status) => acc + counts[status], 0),
    );
    setSelectedCompleteCount(counts['in_time'] || 0);
    setSelectedStatuses(counts);
    setSelectUrl(url);
    pendingTaskBottomSheet.current?.present();
  };

  const {
    GET_TODAY_TASK,
    GET_YESTERDAY_TASK,
    GET_LAST_MONTHS_TASK,
    GET_LAST_WEEKS_TASK,
    GET_THIS_MONTHS_TASK,
    GET_THIS_WEEKS_TASK,
    GET_THIS_YEARS_TASK,
    GET_ALL_TIME_TASK,
    GET_PENDING_TASK_ASSIGNED_BY_ME,
    GET_OVERDUE_TASK_ASSIGNED_BY_ME,
    GET_COMPLETED_TASK_ASSIGNED_BY_ME,
  } = useApiURLs();

  const sectionTitles = {
    today: {title: 'Today', url: GET_TODAY_TASK},
    yesterday: {title: 'Yesterday', url: GET_YESTERDAY_TASK},
    this_week: {title: 'This Week', url: GET_THIS_WEEKS_TASK},
    last_week: {title: 'Last Week', url: GET_LAST_WEEKS_TASK},
    this_month: {title: 'This Month', url: GET_THIS_MONTHS_TASK},
    last_month: {title: 'Last Month', url: GET_LAST_MONTHS_TASK},
    this_year: {title: 'This Year', url: GET_THIS_YEARS_TASK},
    all_time: {title: 'All Time', url: GET_ALL_TIME_TASK},
  };

  useEffect(() => {
    fetchTaskCounts();
    fetchAssignedByMeCounts();
  }, []);

  const fetchTaskCounts = async () => {
    setIsLoading(true); // Start loading
    try {
      const sections = await Promise.all(
        Object.keys(sectionTitles).map(async key => {
          const url = sectionTitles[key].url;
          try {
            const response = await apiGet(url);

            let counts = {};
            if (response?.data && Array.isArray(response.data)) {
              counts = response.data.reduce((acc, task) => {
                const status = task.status.toLowerCase();
                acc[status] = (acc[status] || 0) + 1;
                return acc;
              }, {});
            }

            return {key, title: sectionTitles[key].title, url, counts};
          } catch (error) {
            console.error(
              `Failed to fetch counts for ${sectionTitles[key].title}:`,
              error,
            );
            return {key, title: sectionTitles[key].title, url, counts: {}};
          }
        }),
      );

      setSectionData(sections);
    } catch (error) {
      console.error('Failed to fetch task counts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignedByMeCounts = async () => {
    setIsLoading(true);
    try {
      const pendingResponse = await apiGet(GET_PENDING_TASK_ASSIGNED_BY_ME);
      const overdueResponse = await apiGet(GET_OVERDUE_TASK_ASSIGNED_BY_ME);
      const completedResponse = await apiGet(GET_COMPLETED_TASK_ASSIGNED_BY_ME);

      const pendingCount = pendingResponse?.reponse?.length || 0;
      const overdueCount = overdueResponse?.reponse?.length || 0;
      const completedCount = completedResponse?.reponse?.length || 0;

      setAssignedByMeCounts({
        pending: pendingCount,
        overdue: overdueCount,
        completed: completedCount,
      });
    } catch (error) {
      console.error('Failed to fetch assigned by me counts:', error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };
  const handleRefresh = async () => {
    await fetchTaskCounts();
    await fetchAssignedByMeCounts();
  };

  const FlatListSection = ({item}) => {
    return (
      <TouchableOpacity
        style={[
          styles.sectionContainer,
          {
            backgroundColor:
              theme === THEME_COLOR ? colors.grey100 : colors.white,
          },
        ]}
        onPress={() => handleTaskSectionPress(item)}>
        <RegularText style={styles.sectionHeader}>{item.title}</RegularText>
      </TouchableOpacity>
    );
  };

  const pendingTaskData = Object.keys(selectedStatuses).filter(
    status => status !== 'in_time' && status !== 'completed',
  );
  const pendingTaskKeyExtractor = index => index.toString();

  const pendingTaskRenderItem = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.statusRow}
        onPress={() => {
          navigate(NavigationString.TaskResponseScreen, {
            title: item.replace('_', ' ').toUpperCase(),
            url: selectUrl,
            filterKey: item,
          });
          setTimeout(() => {
            pendingTaskBottomSheet.current?.dismiss();
          }, 1000);
        }}>
        <RegularText style={styles.statusText}>
          {item.replace('_', ' ').toUpperCase()}
        </RegularText>
        <RegularText style={styles.statusCount}>
          {selectedStatuses[item]}
        </RegularText>
      </TouchableOpacity>
    );
  };
  const pendingTaskListHeaderComponent = () => {
    return (
      <>
        <View style={styles.pendingHeader}>
          <RegularText style={styles.pendingText}>{selectedTask}</RegularText>
        </View>
        <View>
          <TouchableOpacity
            style={[styles.createOptionButton, {marginHorizontal: 0}]}
            onPress={() => {
              pendingTaskBottomSheet.current?.dismiss();
              navigate(NavigationString.TaskResponseScreen, {
                title: selectedTaskOption.title,
                url: selectedTaskOption.url,
                // filterKey: 'pending',
                extraFilterKey: 'in_time',
              });
            }}
            activeOpacity={0.8}>
            <RegularText style={styles.createButtonText}>
              All Pending
            </RegularText>
            <RegularText style={styles.createButtonText}>
              {selectedPendingCount}
            </RegularText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.createOptionButton, {marginHorizontal: 0}]}
            onPress={() => {
              pendingTaskBottomSheet.current?.dismiss();
              navigate(NavigationString.TaskResponseScreen, {
                title: selectedTaskOption.title,
                url: selectedTaskOption.url,
                filterKey: 'in_time',
              });
            }}>
            <RegularText style={styles.createButtonText}>Completed</RegularText>
            <RegularText style={styles.createButtonText}>
              {selectedCompleteCount}
            </RegularText>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <>
      <CommoneHeader
        title="Task"
        showLeftIcon={true}
        leftIcon={SvgIcon.MenuIcon}
        onLeftIconPress={() => openDrawer()}
        showRightIcons={true}
        rightIcons={[SvgIcon.ReloadIcon]}
        onRightIconPress={handleRefresh}
      />
      {isLoading ? (
        <LoadingScreen color={colors.green} />
      ) : (
        <View>
          <FlatList
            data={sectionData}
            renderItem={({item}) => <FlatListSection item={item} />}
            keyExtractor={(item, index) => item?.key + index}
            numColumns={2}
            ListHeaderComponent={
              <RegularText style={styles.taskHeaderTextStyle}>
                My Tasks
              </RegularText>
            }
          />
          <TouchableOpacity
            style={[
              styles.sectionContainer,
              {
                flex: 0,
                marginVertical: 0,
                backgroundColor:
                  theme === THEME_COLOR ? colors.grey100 : colors.white,
              },
            ]}
            onPress={() => openAssignedbymeBottomSheet.current.present()}>
            <RegularText style={[styles.sectionHeader]}>
              My Assigned Tasks
            </RegularText>
          </TouchableOpacity>
        </View>
      )}

      <CustomBottomSheetFlatList
        ref={pendingTaskBottomSheet}
        snapPoints={['35%', '70%', '90%']}
        data={pendingTaskData}
        keyExtractor={pendingTaskKeyExtractor}
        renderItem={pendingTaskRenderItem}
        contentContainerStyle={styles.pendingSheetContent}
        ListHeaderComponent={pendingTaskListHeaderComponent}
      />

      <CustomBottomSheet
        ref={selectTaskOptionBottomSheet}
        snapPoints={['25%']}
        enableDynamicSizing={false}
        >
        <TouchableOpacity
          style={styles.createOptionButton}
          onPress={() => {
            navigate(NavigationString.CreateTask);
            selectTaskOptionBottomSheet.current?.dismiss();
          }}>
          <RegularText style={styles.createButtonText}>
            Create New Task
          </RegularText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.createOptionButton,
            {marginVertical: spacing.MARGIN_10},
          ]}
          onPress={() => {
            navigate(NavigationString.RepeatTask);
            selectTaskOptionBottomSheet.current?.dismiss();
          }}>
          <RegularText style={styles.createButtonText}>
            Create Repeat Task
          </RegularText>
        </TouchableOpacity>
      </CustomBottomSheet>

      <CustomBottomSheet
        ref={openAssignedbymeBottomSheet}
        snapPoints={['35%', '40%']}
       >
        <TouchableOpacity
          style={[styles.pendingButton]}
          onPress={() => {
            navigate(NavigationString.TaskResponseScreen, {
              title: 'Pending Task Assigned by me',
              url: GET_PENDING_TASK_ASSIGNED_BY_ME,
            }),
              openAssignedbymeBottomSheet.current.dismiss();
          }}>
          <RegularText style={styles.buttonText}>Pending</RegularText>
          <RegularText style={styles.buttonText}>
            {assignedByMeCounts.pending}
          </RegularText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.overdueButton]}
          onPress={() => {
            navigate(NavigationString.TaskResponseScreen, {
              title: 'Overdue Task Assigned by me',
              url: GET_OVERDUE_TASK_ASSIGNED_BY_ME,
            }),
              openAssignedbymeBottomSheet.current.dismiss();
          }}>
          <RegularText style={styles.buttonText}>Overdue</RegularText>
          <RegularText style={styles.buttonText}>
            {assignedByMeCounts.overdue}
          </RegularText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.overdueButton]}
          onPress={() => {
            navigate(NavigationString.TaskResponseScreen, {
              title: 'Complete Task Assigned by me',
              url: GET_COMPLETED_TASK_ASSIGNED_BY_ME,
            }),
              openAssignedbymeBottomSheet.current.dismiss();
          }}>
          <RegularText style={styles.buttonText}>Completed</RegularText>
          <RegularText style={styles.buttonText}>
            {assignedByMeCounts.completed}
          </RegularText>
        </TouchableOpacity>
      </CustomBottomSheet>

      <TouchableOpacity
        activeOpacity={0.7}
        style={{
          paddingHorizontal: spacing.PADDING_12,
          paddingVertical: spacing.PADDING_14,
          backgroundColor: colors.green600,
          position: 'absolute',
          bottom: spacing.MARGIN_16,
          right: spacing.MARGIN_16,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: spacing.RADIUS_10,
          flexDirection: 'row',
          ...boxShadow(),
        }}
        onPress={() => selectTaskOptionBottomSheet.current?.present()}>
        <SvgIcon.AddICon
          color={colors.white}
          width={spacing.WIDTH_30}
          height={spacing.HEIGHT_30}
        />
        <RegularText
          style={{
            color: colors.white,
            marginLeft: spacing.MARGIN_4,
            fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
          }}>
          New Task
        </RegularText>
      </TouchableOpacity>
    </>
  );
};

export default TaskListComponent;

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    marginHorizontal: spacing.MARGIN_6,
    marginVertical: spacing.MARGIN_4,
    padding: spacing.PADDING_14,
    backgroundColor: colors.white,
  },
  sectionHeader: {
    fontSize: textScale(18),
    marginBottom: spacing.MARGIN_4,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
    color: colors.black,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.MARGIN_10,
  },
  pendingButton: {
    backgroundColor: colors.green600,
    paddingVertical: spacing.PADDING_12,
    borderRadius: spacing.RADIUS_8,
    alignItems: 'center',
    marginVertical: spacing.MARGIN_6,
    marginHorizontal: spacing.MARGIN_16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.PADDING_16,
  },
  overdueButton: {
    backgroundColor: colors.green600,
    paddingVertical: spacing.PADDING_12,
    paddingHorizontal: spacing.PADDING_16,
    borderRadius: spacing.RADIUS_8,
    alignItems: 'center',
    marginVertical: spacing.MARGIN_6,
    marginHorizontal: spacing.MARGIN_16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: colors.white,
    fontSize: textScale(16),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
    textTransform: 'capitalize',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingSheetContent: {
    padding: spacing.PADDING_16,
  },
  pendingHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.MARGIN_10,
  },
  pendingText: {
    fontSize: textScale(18),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
    color: colors.black,
  },
  pendingCount: {
    fontSize: textScale(18),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
    color: colors.black,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.MARGIN_6,
    backgroundColor: colors.green100,
    padding: spacing.PADDING_16,
    borderRadius: spacing.RADIUS_8,
  },
  statusText: {
    fontSize: textScale(14),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_MEDIUM,
    color: colors.black,
    textTransform: 'capitalize',
  },
  statusCount: {
    fontSize: textScale(16),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_MEDIUM,
    color: colors.black,
  },
  createOptionButton: {
    backgroundColor: colors.green600,
    paddingVertical: spacing.PADDING_12,
    borderRadius: spacing.RADIUS_8,
    alignItems: 'center',
    marginVertical: spacing.MARGIN_6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.PADDING_16,
    marginHorizontal: spacing.MARGIN_16,
  },
  createButtonText: {
    color: '#fff',
    fontSize: textScale(16),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_REGULAR,
    textTransform: 'capitalize',
  },
  taskHeaderTextStyle: {
    backgroundColor: colors.grey100,
    padding: spacing.PADDING_16,
    width: '100%',
    textAlign: 'center',
    fontSize: textScale(18),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
    color: colors.black,
  },
});
