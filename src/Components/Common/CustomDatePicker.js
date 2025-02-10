import DateTimePicker from '@react-native-community/datetimepicker';
import React, {useEffect, useState} from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import THEME_COLOR from '../../Utils/Constant';
import * as SvgIcon from '../../assets';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import Colors from '../../theme/colors';
import {useTheme} from '../hooks';
import TextComponent from './TextComponent';

const CustomDatePicker = ({
  label = 'Select Date/Time',
  initialDate = null, // The date/time when the component first renders
  onChange, // Called initially AND whenever the user selects a new date/time
  minimumDate,
  maximumDate,
  locale = 'en-US',
  mode = 'date', // 'date' or 'time'
  display = 'default',
  buttonStyle,
  buttonTextStyle,
  required = false,
  placeholder = 'Select Date/Time',
  selectedDate = null, // The current date/time from parent (can be a Date object or string)
  hour12 = true, // 12-hour (AM/PM) or 24-hour format in time mode
}) => {
  /**
   * Safely convert various date/time inputs (Date or string) into a valid Date object.
   * - If `mode === 'time'` and a string like "11:51" or "11:51:11" is passed, convert to today's date with that time.
   * - If a string can be parsed as a date, we parse it via `new Date(...)`.
   * - Round minutes to the nearest 5 if `mode === 'time'`.
   * - Clamp date between `minimumDate` and `maximumDate` if provided.
   */
  function ensureValidDate(input) {
    let dateObj = input;

    // Fallback to now if empty/undefined
    if (!dateObj) {
      dateObj = new Date();
    }

    // If it's a Date but invalid (NaN time), fallback
    if (dateObj instanceof Date && isNaN(dateObj.getTime())) {
      dateObj = new Date();
    }

    // If it's a string, parse it
    if (typeof dateObj === 'string') {
      // If in time mode and matches a pattern like "HH:mm" or "HH:mm:ss"
      if (mode === 'time' && /^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(dateObj)) {
        const now = new Date();
        const [hours, minutes, seconds] = dateObj.split(':').map(Number);
        dateObj = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours || 0,
          minutes || 0,
          seconds || 0,
        );
      } else {
        // Otherwise, parse as a general date/time string
        dateObj = new Date(dateObj);
        if (isNaN(dateObj.getTime())) {
          dateObj = new Date();
        }
      }
    }

    // Final check: still a valid date?
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      dateObj = new Date();
    }

    // If time mode, round minutes to nearest 5
    if (mode === 'time') {
      const minutes = dateObj.getMinutes();
      const roundedMinutes = Math.round(minutes / 5) * 5;
      dateObj.setMinutes(roundedMinutes);
    }

    // Enforce min/max if given
    if (minimumDate && dateObj < minimumDate) {
      dateObj = new Date(minimumDate);
    }
    if (maximumDate && dateObj > maximumDate) {
      dateObj = new Date(maximumDate);
    }

    return dateObj;
  }

  // Create the date/time for the first render
  function createInitialDate() {
    return ensureValidDate(initialDate || new Date());
  }

  // Store the date/time when the component first renders
  const [componentRenderedAt] = useState(createInitialDate());

  // Immediately call onChange on mount with the initial date/time
  useEffect(() => {
    // If the parent gave us an onChange prop, call it with the "first render" date
    onChange?.(componentRenderedAt);
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showPicker, setShowPicker] = useState(false);
  const {theme} = useTheme();
  const isDarkMode = theme === THEME_COLOR;

  /**
   * Handle user selection in the DateTimePicker.
   */
  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'dismissed') {
        return;
      }
    }
    if (date && date instanceof Date) {
      const validDate = ensureValidDate(date);
      onChange?.(validDate); // <-- single callback for user-chosen date
    } else {
      console.error('Invalid date selected:', date);
    }
  };

  /**
   * Format the displayed date/time for the button text.
   * Fallback to the first render date/time if 'selectedDate' is empty.
   */
  const formatSelectedDate = () => {
    let dateToDisplay = selectedDate || componentRenderedAt;
    dateToDisplay = ensureValidDate(dateToDisplay);

    if (mode === 'date') {
      return dateToDisplay.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else if (mode === 'time') {
      return dateToDisplay.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: hour12,
      });
    } else {
      // fallback or other modes
      return dateToDisplay.toLocaleString(locale);
    }
  };

  /**
   * Render the DateTimePicker if needed.
   * Value uses valid Date object from 'selectedDate' or fallback to 'componentRenderedAt'.
   */
  const renderPicker = () => {
    const pickerValue = ensureValidDate(selectedDate || componentRenderedAt);
    return (
      <DateTimePicker
        value={pickerValue}
        mode={mode}
        display={display}
        onChange={handleDateChange}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        locale={locale}
        minuteInterval={5}
      />
    );
  };

  return (
    <View>
      {label && (
        <View style={styles.labelContainer}>
          <TextComponent
            text={label}
            size={textScale(14)}
            fontWeight="500"
            style={{
              marginBottom: 5,
              color: isDarkMode ? Colors.dark.black : Colors.light.white,
            }}
          />
          {required && (
            <TextComponent text="*" size={textScale(18)} color="red" />
          )}
        </View>
      )}

      {/* Button to open DateTimePicker */}
      <Pressable
        style={[
          styles.button,
          buttonStyle,
          {
            backgroundColor: isDarkMode
              ? Colors.light.grey
              : Colors.light.greyTransparent,
          },
        ]}
        onPress={() => setShowPicker(true)}>
        <Text
          style={[
            styles.buttonText,
            buttonTextStyle,
            {color: isDarkMode ? Colors.dark.black : Colors.light.white},
          ]}>
          {/* If 'selectedDate' or 'componentRenderedAt' is set, show formatted text;
              otherwise show the placeholder. */}
          {selectedDate || componentRenderedAt
            ? formatSelectedDate()
            : placeholder}
        </Text>

        {mode === 'time' ? <SvgIcon.ClockIcon /> : <SvgIcon.CalendarIcon />}
      </Pressable>

      {/* Show the DateTimePicker when 'showPicker' is true */}
      {showPicker && renderPicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.PADDING_6,
    paddingHorizontal: spacing.PADDING_12,
    borderRadius: spacing.RADIUS_12,
    borderWidth: 1,
    height: spacing.HEIGHT_46,
    borderColor: Colors.default.grey,
    marginBottom: spacing.MARGIN_8,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: textScale(16),
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: spacing.MARGIN_4,
  },
});

export default CustomDatePicker;
