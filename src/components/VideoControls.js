import {StyleSheet, View, Text, BackHandler} from 'react-native';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import TVEventHandler from '../tools/TVEventHandler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import EIcon from 'react-native-vector-icons/Entypo';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';

const VideoControls = ({
  isControlsVisible,
  isPlayerPlaying,
  title,
  isError,
  currentVideoStatus,
  appInfos,
  language,
  setIsPlayerPlaying,
  setIsControlsVisible,
  currentTimeRef,
  handleSeek,
  handleUpdateCurrentTime,
  subTitle,
  isNextButtonVisible,
  _handleNextEpisode,
  wasPlayerPlaying,
  isPlayerPlayingRef,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSecondeBeforeNext, setCurrentSecondeBeforeNext] = useState(5);
  const canMoveRef = useRef(true);
  const multiplierSeekRef = useRef(10000);
  const timeSinceLastSeekRef = useRef(false);
  const timeSinceLastSeekTimoutRef = useRef(null);
  const timeoutSeekMoovingRef = useRef(null);

  const sharedOpacityControls = useSharedValue(0);
  const sharedWidthBlueProgress = useSharedValue(0);

  const _tvEventHandler = new TVEventHandler();
  const _enableTVEventHandler = () => {
    _tvEventHandler.enable(this, function (cmp, evt) {
      if (evt && evt.eventKeyAction === 0) {
        if (!canMoveRef.current) return;
        if (evt.eventType === 'select') _moveSelect();
        else if (evt.eventType === 'right') _moveRight();
        else if (evt.eventType === 'up') _moveUp();
        else if (evt.eventType === 'left') _moveLeft();
        else if (evt.eventType === 'down') _moveDown();
      }
    });
  };

  const _dontMoveAndMove = () => {
    canMoveRef.current = false;
    setTimeout(() => {
      canMoveRef.current = true;
    }, 200);
  };
  const _moveSelect = () => {
    handleAppearAndDissapearControls(isPlayerPlaying);
    if (currentVideoStatus === null) return;
    handleUpdateCurrentTime();
    if (isControlsVisible) {
      setIsPlayerPlaying(curr => !curr);
      isPlayerPlayingRef.current = !isPlayerPlayingRef.current;
    }
  };
  const _moveUp = () => handleAppearAndDissapearControls(isPlayerPlaying);
  const _moveDown = () => handleAppearAndDissapearControls(isPlayerPlaying);
  const _moveLeft = () => {
    handleAppearAndDissapearControls(isPlayerPlaying);
    if (!currentVideoStatus || currentTimeRef.current <= 0) return;
    _dontMoveAndMove();
    if (isControlsVisible) seekTo('left');
  };
  const _moveRight = () => {
    handleAppearAndDissapearControls(isPlayerPlaying);
    if (
      !currentVideoStatus ||
      currentTimeRef.current >= currentVideoStatus.seekableDuration - 1
    )
      return;
    _dontMoveAndMove();
    if (isControlsVisible) seekTo('right');
  };

  const _disableTVEventHandler = () => {
    if (_tvEventHandler) {
      _tvEventHandler.disable();
    }
  };

  useEffect(() => {
    if (isNextButtonVisible) return;
    _enableTVEventHandler();
    return () => _disableTVEventHandler();
  });

  useEffect(() => {
    if (!currentVideoStatus) return;
    // if (isPlayerPlaying) return;
    handleAppearAndDissapearControls(isPlayerPlaying);
    handleMoveProgressBar(currentTimeRef.current);
  }, [isPlayerPlaying]);

  useEffect(() => {
    if (currentVideoStatus) {
      setCurrentTime(currentVideoStatus.currentTime);
      handleMoveProgressBar(currentVideoStatus.currentTime);
    } else {
      setCurrentTime(0);
      handleMoveProgressBar(0);
    }
  }, [currentVideoStatus]);

  const intervalNextEpisodeSeconds = useRef(null);
  useEffect(() => {
    if (isNextButtonVisible) {
      setTimeout(() => {
        sharedWidthBlueProgress.value = 0;
        setCurrentTime(0);
        intervalNextEpisodeSeconds.current = setInterval(() => {
          if (currentSecondeBeforeNext === 0) {
            clearInterval(intervalNextEpisodeSeconds.current);
          }
          setCurrentSecondeBeforeNext(curr => curr - 1);
        }, 1000);
      }, 600);
    } else setCurrentSecondeBeforeNext(5);
    return () => clearInterval(intervalNextEpisodeSeconds.current);
  }, [isNextButtonVisible]);

  const animatedOpacityControls = useAnimatedStyle(() => {
    return {
      opacity: withTiming(sharedOpacityControls.value, {
        duration: 800,
        easing: Easing.bezier(0.1, 1, 0.1, 1),
        useNativeDriver: true,
      }),
    };
  }, []);

  const animatedWidthBlueProgress = useAnimatedStyle(() => {
    return {
      width: withTiming(`${sharedWidthBlueProgress.value}%`, {
        duration: 800,
        easing: Easing.bezier(0.1, 1, 0.1, 1),
        useNativeDriver: true,
      }),
    };
  }, []);

  useEffect(() => {
    if (isControlsVisible && !isNextButtonVisible)
      sharedOpacityControls.value = 1;
    else {
      sharedOpacityControls.value = 0;
    }
  }, [isControlsVisible, isNextButtonVisible]);

  useEffect(() => {
    handleAppearAndDissapearControls(isPlayerPlaying);
    return () => clearTimeout(timeoutControlsRef.current);
  }, [isPlayerPlaying]);

  const timeoutControlsRef = useRef(null);
  const handleAppearAndDissapearControls = useCallback(
    isPlaying => {
      clearTimeout(timeoutControlsRef.current);
      setIsControlsVisible(true);
      if (!isPlaying) return;
      timeoutControlsRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 5000);
    },
    [currentVideoStatus],
  );

  const handleMoveProgressBar = useCallback(
    currentime => {
      if (!currentime) return;
      const currentSeconds = currentime;

      if (!isControlsVisible && isPlayerPlaying) return;
      //   setCurrentVideoStatus(status);
      const width = currentSeconds / currentVideoStatus.seekableDuration;
      sharedWidthBlueProgress.value = (width * 100).toFixed(2);
    },
    [isControlsVisible, isPlayerPlaying, currentVideoStatus],
  );

  const seekTo = useCallback(
    async direction => {
      clearTimeout(timeoutSeekMoovingRef.current);

      clearTimeout(timeSinceLastSeekTimoutRef.current);
      wasPlayerPlaying.current = isPlayerPlayingRef.current;
      setIsPlayerPlaying(false);
      if (timeSinceLastSeekRef.current) {
        multiplierSeekRef.current += 10000;
      } else {
        timeSinceLastSeekRef.current = true;
        multiplierSeekRef.current = 10000;
      }
      timeSinceLastSeekTimoutRef.current = setTimeout(() => {
        timeSinceLastSeekRef.current = false;
        handleSeek(currentTimeRef.current);
      }, 300);

      if (
        direction === 'right' &&
        currentTimeRef.current >= currentVideoStatus.seekableDuration - 1
      )
        return _handleNextEpisode();
      if (direction === 'left' && currentTimeRef.current === 0) return;

      if (
        direction === 'right' &&
        currentTimeRef.current * 1000 + multiplierSeekRef.current >
          currentVideoStatus.seekableDuration * 1000
      ) {
        handleMoveProgressBar(currentVideoStatus.seekableDuration);
        currentTimeRef.current = currentVideoStatus.seekableDuration;
        return handleSeek(currentVideoStatus.seekableDuration);
      } else if (
        direction === 'left' &&
        currentTimeRef.current * 1000 - multiplierSeekRef.current < 0
      ) {
        handleMoveProgressBar(0);
        currentTimeRef.current = 0;
        return handleSeek(0);
      }

      handleAppearAndDissapearControls(isPlayerPlayingRef.current);
      const milis =
        direction === 'right'
          ? currentTimeRef.current * 1000 + multiplierSeekRef.current
          : currentTimeRef.current * 1000 - multiplierSeekRef.current;

      handleMoveProgressBar(milis / 1000);
      currentTimeRef.current = milis / 1000;
      setCurrentTime(milis / 1000);
    },
    [currentVideoStatus],
  );

  useEffect(() => {
    if (isNextButtonVisible)
      setTimeout(() => {
        sharedButtonOpacity.value = 1;
      }, 600);
    else sharedButtonOpacity.value = 0;
  }, [isNextButtonVisible]);

  const sharedButtonWidth = useSharedValue(0);
  const sharedButtonOpacity = useSharedValue(0);
  const animatedWidthButton = useAnimatedStyle(() => {
    return {
      width: sharedButtonWidth.value,
      opacity: sharedButtonOpacity.value,
    };
  });

  const layoutButton = event => {
    const {x, y, height, width} = event.nativeEvent.layout;
    sharedButtonWidth.value = width + 50;
  };

  return (
    <View
      style={{
        backgroundColor: isNextButtonVisible ? 'black' : 'transparent',
        height: '100%',
      }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: '100%',
            height: subTitle ? 110 : 80,
            zIndex: 9999,
            // paddingTop: 10
          },
          animatedOpacityControls,
        ]}>
        <LinearGradient
          accessible={false}
          style={{
            width: '100%',
            height: '100%',
            paddingLeft: 25,
            paddingTop: 16,
            // backgroundColor: "red",
          }}
          end={{x: 0.5, y: 0}}
          start={{x: 0.5, y: 1}}
          colors={['rgba(0,0,0,.0)', 'rgba(0,0,0,.9)']}>
          <Text
            style={{
              color: 'white',
              fontSize: 24,
              fontFamily: 'Inter-Bold',
            }}>
            {title}
          </Text>
          {subTitle ? (
            <Text
              style={{
                color: `rgb(${appInfos.colors.grey2})`,
                fontFamily: 'Inter-SemiBold',
                fontSize: 13,
              }}>
              {subTitle}
            </Text>
          ) : null}
        </LinearGradient>
      </Animated.View>
      <View
        style={[
          {
            position: 'absolute',
            bottom: 25,
            right: 25,
            // opacity: isNextButtonVisible ? 1 : 0,
          },
        ]}>
        <Animated.View
          // onLayout={layoutButton}
          style={[
            {
              paddingLeft: 25,
              paddingRight: 25,
              backgroundColor: `rgb(${appInfos.colors.element})`,
              flexDirection: 'row',
              // alignItems: 'center',
              // justifyContent: 'center',
              paddingVertical: 8,
              // borderRadius: 3,
              // marginBottom: 5,
              // width: 'auto',
            },
            animatedWidthButton,
          ]}>
          <Text
            style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 12,
              color: `rgb(${appInfos.colors.grey2})`,
            }}>
            {appInfos.lang[language].data.global.time_next_episode_label}{' '}
            {currentSecondeBeforeNext}
          </Text>
        </Animated.View>
      </View>
      <View
        style={{
          position: 'absolute',
        }}
        onLayout={layoutButton}>
        <Text
          style={{
            zIndex: 1,
            opacity: 0,
            fontFamily: 'Inter-SemiBold',
            fontSize: 12,
            color: `rgb(${appInfos.colors.grey2})`,
          }}>
          {appInfos.lang[language].data.global.time_next_episode_label} 4
        </Text>
      </View>
      <Animated.View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: 120,
            zIndex: 9999,
          },
          animatedOpacityControls,
        ]}>
        <LinearGradient
          accessible={false}
          style={{
            width: '100%',
            position: 'absolute',
            bottom: 0,
            height: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            // backgroundColor: "rgba(0,0,0,.1)",
          }}
          end={{x: 0.5, y: 1}}
          start={{x: 0.5, y: 0}}
          colors={['rgba(0,0,0,.0)', 'rgba(0,0,0,.9)']}>
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              position: 'absolute',
              top: 30,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                justifyContent: 'space-between',
                width: 200,
                height: 30,
                alignItems: 'center',
              }}>
              <View>
                <MIcon
                  name="replay-10"
                  color={'white'}
                  size={27}
                  accessible={false}
                />
              </View>
              <View style={{}}>
                {isPlayerPlaying || !currentVideoStatus ? (
                  <EIcon
                    name={'controller-paus'}
                    color={'white'}
                    size={32}
                    accessible={false}
                    style={{top: -2}}
                  />
                ) : (
                  <FAIcon
                    name="play"
                    color={'white'}
                    accessible={false}
                    size={26}
                    style={{top: -1, left: 0.5}}
                  />
                )}
              </View>
              <View>
                <MIcon
                  name="forward-10"
                  color={'white'}
                  size={27}
                  accessible={false}
                />
              </View>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              position: 'absolute',
              bottom: 21,
              width: '100%',
              paddingLeft: 25,
              paddingRight: 25,
            }}>
            <View>
              {!isError && currentVideoStatus ? (
                <Text style={{color: 'white', marginRight: 25, fontSize: 14}}>
                  {currentTime >= 3600 * 10
                    ? new Date(currentTime * 1000)
                        .toISOString()
                        .substring(11, 19)
                    : currentTime >= 3600
                    ? new Date(currentTime * 1000)
                        .toISOString()
                        .substring(12, 19)
                    : currentTime >= 600
                    ? new Date(currentTime * 1000)
                        .toISOString()
                        .substring(14, 19)
                    : new Date(currentTime * 1000)
                        .toISOString()
                        .substring(15, 19)}
                </Text>
              ) : (
                <Text style={{color: 'white', marginRight: 25, fontSize: 14}}>
                  0:00
                </Text>
              )}
            </View>
            <View
              style={{flex: 1, backgroundColor: 'rgb(50,50,50)', height: 3}}>
              <Animated.View
                style={[
                  {
                    height: 3,
                    backgroundColor: `rgb(${appInfos.colors.main})`,
                  },
                  animatedWidthBlueProgress,
                ]}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 50,
                    backgroundColor: `rgb(${appInfos.colors.main})`,
                    position: 'absolute',
                    right: -5.5,
                    top: -3.5,
                  }}></View>
              </Animated.View>
            </View>
            <View>
              {!isError && currentVideoStatus ? (
                <Text style={{color: 'white', marginLeft: 25}}>
                  {currentVideoStatus.seekableDuration >= 3600 * 10
                    ? new Date(currentVideoStatus.seekableDuration * 1000)
                        .toISOString()
                        .substring(11, 19)
                    : currentVideoStatus.seekableDuration >= 3600
                    ? new Date(currentVideoStatus.seekableDuration * 1000)
                        .toISOString()
                        .substring(12, 19)
                    : currentVideoStatus.seekableDuration >= 600
                    ? new Date(currentVideoStatus.seekableDuration * 1000)
                        .toISOString()
                        .substring(14, 19)
                    : new Date(currentVideoStatus.seekableDuration * 1000)
                        .toISOString()
                        .substring(15, 19)}
                </Text>
              ) : (
                <Text style={{color: 'white', marginLeft: 25}}>0:00</Text>
              )}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

export default memo(VideoControls);
