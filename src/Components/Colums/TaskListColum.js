import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useApiURLs} from '../../Config/url';
import NavigationString from '../../Navigations/NavigationString';
import {apiPut} from '../../Utils/apiCalls';
import colors from '../../Utils/colors';
import {
  convertDateFormat,
  formatTimestamp,
  formatTimestampWithoutModifying,
  navigate,
} from '../../Utils/helperFunctions';
import {boxShadow} from '../../styles/Mixins';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import AnimatedComponentToggle from '../Common/AnimatedComponentToggale';
import BottonComp from '../Common/BottonComp';
import RegularText from '../Common/RegularText';
import THEME_COLOR from '../../Utils/Constant';
import {useTheme} from '../hooks';

const itemListColum = ({
  item,
  onUpdateStatus,
  handleChangeStatus,
  handleAttachDocument,
  hasAttachment,
  handleViewDocumentPress,
}) => {
  const {theme} = useTheme();
  const {UPDATE_TASK_STATUS} = useApiURLs();
  const [loading, setLoading] = useState(false);
  // Define the keys to exclude from rendering
  const excludedKeys = [
    'name', // Example: 2
    'creation', // Example: "2024-09-30 13:10:34.928797"
    'modified', // Example: "2024-10-04 18:41:56.036885"
    'modified_by', // Example: "ca.mohit.chechani@gmail.com"
    'owner', // Example: "ca.mohit.chechani@gmail.com"
    'docstatus', // Example: 0
    'idx', // Example: 0
    '_user_tags', // Example: null
    '_comments', // Example: null
    '_assign', // Example: null
    '_liked_by', // Example: null
    'naming_series', // Example: ".task_name.-.#####"
    'task_name', // Example: "Complete Project Report"
    'description', // Example: "Prepare and submit the project report for review"
    'assigned_by', // Example: "ca.mohit.chechani@gmail.com"
    'assigned_by_name', // Example: "Mohit Chechani"
    'assigned_by_phone_no', // Example: "918696490240"
    'assigned_to', // Example: "ca.mohit.chechani@gmail.com"
    'assigned_to_name', // Example: "Mohit Chechani"
    'assigned_to_phone_no', // Example: "918696490240"
    // 'start_date',              // Example: "2024-10-01"
    // 'end_date',                // Example: "2024-10-05"
    // 'priority',                // Example: "High"
    // 'importance',              // Example: "Low"
    'task_type', // Example: null
    // 'task_status',             // Example: "Completed"
    // 'is_completed',            // Example: 1
    '_seen', // Example: ["ca.mohit.chechani@gmail.com"]
    'ampm', // Example: "AM"
    'hour', // Example: "10"
    'minute', // Example: "30"
    // 'start_minutes_options',   // Example: "Expected Days"
    // 'expected_duration',       // Example: 20
    // 'category',                // Example: "marketing"
    // 'type',                    // Example: "One-Time Task"
    'repeat_task', // Example: null
    // 'title',                   // Example: "Complete Project Report-2"
    'status', // Example: "in_time"
    // 'status_category'          // Example: "completed"
  ];

  // Helper function to format date values and handle nulls
  const formatValue = (key, value) => {
    // Handle the `is_complete` field
    if (key === 'is_completed') {
      return value === 1 ? 'Yes' : 'No';
    }

    // Handle date formatting
    if (
      key.toLowerCase().includes('date') ||
      key.toLowerCase().includes('creation')
    ) {
      return convertDateFormat(value);
    }

    // Handle other values with a fallback
    return value !== null && value !== undefined
      ? value.toString()
      : 'No Data Available';
  };

  const handleUpdateitemStatusonPress = async () => {
    try {
      setLoading({state: true, button: 'Status'});
      const res = await apiPut(UPDATE_TASK_STATUS, {task_name: item?.name});
      console.log('res', res);
      await onUpdateStatus();
      setLoading({state: false, button: 'Status'});
    } catch (error) {
      setLoading({state: false, button: 'Status'});
      console.log('error', error);
    }
  };

  const handleAttachDocumentPress = async () => {
    setLoading({state: true, button: 'AttachDocument'});
    await handleAttachDocument(item.name);
    setLoading({state: false, button: 'AttachDocument'});
  };

  return (
    <>
      <View
        style={[
          styles.itemCard,
          {
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          },
        ]}>
        {/* Item Header */}
        <AnimatedComponentToggle
          tabName={`${item?.task_name || 'No Task Name'}`}
          isExtraText={true}
          extraText={item?.name}
          isLeftImg={false}
          tabNameStyle={[
            styles.itemTitle,
            {color: theme === THEME_COLOR ? colors.grey500 : colors.grey300},
          ]}
          defaultOpen={true}>
          {item?.status && (
            <RegularText
              style={[
                styles.sectionItem,
                {
                  paddingLeft: spacing.PADDING_16,
                  color:
                    theme === THEME_COLOR ? colors.grey800 : colors.grey400,
                },
              ]}>
              <RegularText
                style={[
                  styles.label,
                  {
                    color:
                      theme === THEME_COLOR ? colors.grey800 : colors.grey200,
                  },
                ]}>
                Item Status:
              </RegularText>{' '}
              {item?.task_status?.replace(/_/g, ' ') || 'No Data Available'}
            </RegularText>
          )}
          {item?.creation && (
            <RegularText
              style={[
                styles.sectionItem,
                {
                  paddingLeft: spacing.PADDING_16,
                  color:
                    theme === THEME_COLOR ? colors.grey800 : colors.grey200,
                },
              ]}>
              {`Create on: ${
                formatTimestampWithoutModifying(item.creation) ||
                'No Data Available'
              }`}
            </RegularText>
          )}

          {/* Item Description */}
          <View style={styles.section}>
            <RegularText
              style={[
                styles.sectionHeader,
                {
                  color:
                    theme === THEME_COLOR ? colors.grey800 : colors.grey200,
                },
              ]}>
              Description
            </RegularText>
            <RegularText
              style={[
                styles.sectionItem,
                {
                  color:
                    theme === THEME_COLOR ? colors.grey800 : colors.grey200,
                },
              ]}>
              {item?.description || 'No Data Available'}
            </RegularText>
          </View>

          {/* Assigned Information */}
          <AnimatedComponentToggle
            tabName="Assigned Information"
            tabNameStyle={styles.subSectionHeader}
            isLeftImg={false}
            defaultOpen={true}
            allowSingleOpen={false}>
            <View style={styles.subSection}>
              <RegularText
                style={[
                  styles.sectionItem,
                  {
                    color:
                      theme === THEME_COLOR ? colors.grey800 : colors.grey400,
                  },
                ]}>
                <RegularText
                  style={[
                    styles.label,
                    {
                      color:
                        theme === THEME_COLOR ? colors.grey800 : colors.grey200,
                    },
                  ]}>
                  Assigned By:
                </RegularText>{' '}
                {item?.assigned_by_name || 'No Data Available'}
              </RegularText>
              <RegularText
                style={[
                  styles.sectionItem,
                  {
                    color:
                      theme === THEME_COLOR ? colors.grey800 : colors.grey400,
                  },
                ]}>
                <RegularText
                  style={[
                    styles.label,
                    {
                      color:
                        theme === THEME_COLOR ? colors.grey800 : colors.grey200,
                    },
                  ]}>
                  Assigned To:
                </RegularText>{' '}
                {item?.assigned_to_name || 'No Data Available'}
              </RegularText>
            </View>
          </AnimatedComponentToggle>

          {/* Item Details */}
          <AnimatedComponentToggle
            tabName="Task Details"
            tabNameStyle={styles.subSectionHeader}
            isLeftImg={false}>
            <View style={styles.subSection}>
              {Object.entries(item || {})
                .filter(([key]) => !excludedKeys.includes(key)) // Exclude specified keys
                .map(([key, value]) => (
                  <RegularText
                    style={[
                      styles.sectionItem,
                      {
                        color:
                          theme === THEME_COLOR
                            ? colors.grey800
                            : colors.grey400,
                      },
                    ]}
                    key={key}>
                    <RegularText
                      style={[
                        styles.label,
                        {
                          color:
                            theme === THEME_COLOR
                              ? colors.black
                              : colors.grey200,
                        },
                      ]}>
                      {key.replace(/_/g, ' ')}:
                    </RegularText>{' '}
                    {formatValue(key, value)}
                  </RegularText>
                ))}
            </View>
          </AnimatedComponentToggle>

          {/* Item Timing Info */}
          <AnimatedComponentToggle
            tabName="Task Timing"
            tabNameStyle={styles.subSectionHeader}
            isLeftImg={false}>
            <View style={styles.subSection}>
              <RegularText
                style={[
                  styles.sectionItem,
                  {
                    color:
                      theme === THEME_COLOR ? colors.grey800 : colors.grey400,
                  },
                ]}>
                <RegularText
                  style={[
                    styles.label,
                    {
                      color:
                        theme === THEME_COLOR ? colors.black : colors.grey200,
                    },
                  ]}>
                  Time (Hour:Minute):
                </RegularText>{' '}
                {item?.hour || 'N/A'}:{item?.minute || 'N/A'}{' '}
                {item?.ampm || 'N/A'}
              </RegularText>
              <RegularText
                style={[
                  styles.sectionItem,
                  {
                    color:
                      theme === THEME_COLOR ? colors.grey800 : colors.grey400,
                  },
                ]}>
                <RegularText
                  style={[
                    styles.label,
                    {
                      color:
                        theme === THEME_COLOR ? colors.black : colors.grey200,
                    },
                  ]}>
                  Expected Duration:
                </RegularText>{' '}
                {item?.expected_duration || 'No Data Available'} Days
              </RegularText>
            </View>
          </AnimatedComponentToggle>

          <View style={styles.buttonRow}>
            {item?.is_completed !== 1 && (
              <BottonComp
                style={styles.createButton}
                text="Mark as Done"
                textStyle={styles.createButtontext}
                onPress={handleUpdateitemStatusonPress}
                isLoading={loading.state && loading.button === 'Status'}
              />
            )}
            <BottonComp
              style={styles.createButton}
              text="Change Status"
              textStyle={styles.createButtontext}
              onPress={() => handleChangeStatus(item?.name)}
            />
          </View>

          <View style={styles.buttonRow}>
            <BottonComp
              style={styles.createButton}
              text="Discussion"
              textStyle={styles.createButtontext}
              onPress={() =>
                navigate(NavigationString.TaskCommentComponent, {
                  task_name: item?.name,
                })
              }
            />
            <BottonComp
              style={styles.createButton}
              text={hasAttachment ? 'View Attachment' : 'Attach Document'}
              textStyle={styles.createButtontext}
              onPress={
                hasAttachment
                  ? handleViewDocumentPress
                  : handleAttachDocumentPress
              }
              isLoading={loading.state && loading.button === 'AttachDocument'}
            />
          </View>
        </AnimatedComponentToggle>
      </View>
    </>
  );
};

export default itemListColum;

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: colors.white,
    marginVertical: spacing.MARGIN_6,
    borderRadius: spacing.RADIUS_12,
    padding: spacing.PADDING_4,
    borderColor: colors.grey300,
    borderWidth: 1,
    ...boxShadow(),
  },
  itemTitle: {
    color: colors.black,
    fontSize: textScale(18),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_BOLD,
  },
  section: {
    padding: spacing.PADDING_10,
    borderRadius: spacing.RADIUS_8,
    marginVertical: spacing.MARGIN_8,
    paddingLeft: spacing.PADDING_16,
  },
  sectionHeader: {
    fontSize: textScale(16),
    color: colors.grey800,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
    marginBottom: spacing.MARGIN_4,
  },
  subSectionHeader: {
    fontSize: textScale(16),
    color: colors.grey900,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_SEMI_BOLD,
  },
  subSection: {
    marginTop: spacing.MARGIN_8,
    paddingLeft: spacing.PADDING_16,
  },
  sectionItem: {
    fontSize: textScale(14),
    color: colors.black,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
    marginVertical: spacing.MARGIN_4,
    textTransform: 'capitalize',
  },
  label: {
    color: colors.black,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_BOLD,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.MARGIN_8,
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
});
