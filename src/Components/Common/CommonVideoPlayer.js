import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Video from 'react-native-video';
import * as SvgIcon from '../../assets';
import { setLocalHttpsInDomain } from '../../Config/url';
import { spacing } from '../../styles/spacing';
import colors from '../../Utils/colors';
import LoadingScreen from './Loader';

const CommonVideoPlayer = ({
  paused = true,
  repeat = false,
  onPressPlayPause,
  source,
  mainViewStyle = {},
}) => {
  const [isBuffering, setIsBuffering] = useState(false);

  const handleBuffer = useCallback(
    ({isBuffering: buffering}) => setIsBuffering(buffering),
    [],
  );

  const handleError = useCallback(error => {
    console.error('Video playback error:', error);
  }, []);

  return (
    <View style={[styles.mainView, mainViewStyle]}>
      <Video
        source={source}
        onBuffer={handleBuffer}
        onError={handleError}
        style={styles.videoStyle}
        paused={paused}
        repeat={repeat}
        resizeMode="contain"
        controls={false}
      />
      {isBuffering && (
        <View style={styles.bufferStyle}>
          <LoadingScreen color="#fff" />
        </View>
      )}
      <TouchableOpacity
        style={styles.playPauseButtonView}
        onPress={onPressPlayPause}
        activeOpacity={0.8}>
        <View style={styles.playPauseButtonContainer}>
          {paused ? (
            <SvgIcon.PlayIcon color={colors.white} />
          ) : (
            <SvgIcon.PauseIcon color={colors.white} />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

CommonVideoPlayer.propTypes = {
  paused: PropTypes.bool,
  repeat: PropTypes.bool,
  onPressPlayPause: PropTypes.func.isRequired,
  source: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,
  mainViewStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

const styles = StyleSheet.create({
  mainView: {
    width: '80%',
    aspectRatio: 2 / 3.5,
    backgroundColor: '#000',
    borderRadius: spacing.RADIUS_16,
    overflow: 'hidden',
  },
  videoStyle: {
    ...StyleSheet.absoluteFillObject,
  },
  bufferStyle: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButtonView: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButtonContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: spacing.WIDTH_50,
    height: spacing.WIDTH_50,
    borderRadius: spacing.WIDTH_50 / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    width: spacing.WIDTH_30,
    height: spacing.WIDTH_30,
    tintColor: '#fff',
    resizeMode: 'contain',
  },
});

export default React.memo(CommonVideoPlayer);
