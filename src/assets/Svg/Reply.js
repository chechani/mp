import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import {memo} from 'react';
const Reply = ({width = 24, height = 24, color = '#000', ...props}) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 1920 1920"
    {...props}>
    <Path
      fill={color}
      fillRule="evenodd"
      d="m1030.975 188 81.249 81.249-429.228 429.228h300.747c516.223 0 936.257 420.034 936.257 936.257v98.028h-114.92v-98.028c0-452.901-368.436-821.337-821.337-821.337H682.996l429.228 429.229-81.25 81.248-567.936-567.937L1030.975 188Zm-463.038.011 81.249 81.25-486.688 486.688 486.688 486.688-81.249 81.249L0 755.949 567.937 188.01Z"
    />
  </Svg>
);
const Memo = memo(Reply);
export default Memo;
