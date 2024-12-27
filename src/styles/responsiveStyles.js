import { Dimensions } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Custom Scaling Functions
const scale = size => wp((size / guidelineBaseWidth) * 100);
const verticalScale = size => hp((size / guidelineBaseHeight) * 100);

const moderateScale = (size, factor = 0.5) => 
  size + (scale(size) - size) * factor;

const moderateScaleVertical = (size, factor = 0.5) => 
  size + (verticalScale(size) - size) * factor;

const textScale = (fontSize) => {
  const widthRatio = width / guidelineBaseWidth;
  const heightRatio = height / guidelineBaseHeight;
  const scaleRatio = Math.min(widthRatio, heightRatio);
  return Math.round(fontSize * scaleRatio);
};

// Export Functions
export { scale, verticalScale, textScale, moderateScale, moderateScaleVertical, width, height };
