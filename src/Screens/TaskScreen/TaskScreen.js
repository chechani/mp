import React from 'react';
import {StyleSheet, View} from 'react-native';
import TaskListComponent from '../../Components/module/TaskListComponent';
import THEME_COLOR from '../../Utils/Constant';
import {useTheme} from '../../Components/hooks';
import colors from '../../Utils/colors';

const TaskScreen = () => {
  const {theme} = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme === THEME_COLOR ? colors.white : colors.black,
      }}>
      <TaskListComponent />
    </View>
  );
};

export default TaskScreen;

const styles = StyleSheet.create({});
