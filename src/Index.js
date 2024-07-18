import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  StyleSheet,
  View,
  AppState,
  Platform,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Menu from './components/Menu';
import RightPageContainer from './components/RightPageContainer';
import Details from './screens/Details';
import {AuthContext} from './global/context';
import ExitPage from './screens/ExitPage';
import KeepAwake from 'react-native-keep-awake';
import VideoPlayerMobile from 'react-native-video-controls';

export default function Index() {
  const {
    appInfos,
    setIsControlsAvailable,
    isControlsAvailable,
    isConnexionTroubles,
    setIsConnexionTroubles,
    globalDimensions,
    appStateVisible,
  } = useContext(AuthContext);
  const [componentFocused, setComponentFocused] = useState(null); // list, menu
  const [activeComponent, setActiveComponent] = useState('Home'); // Home, Movies, Series, Tv, Settings, Search
  const [detailsInfos, setDetailsInfos] = useState({
    id: null,
    type: null,
  });
  const [isMenuSmall, setIsMenuSmall] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Home');
  const [playerData, setPlayerData] = useState(null);
  // const fakeTouchable = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const backAction = () => {
      if (!isControlsAvailable) return true;
      // setComponentFocused('exit');
      // BackHandler.exitApp();
      if (!Platform.isTV && isMenuSmall) setIsMenuSmall(false);
      else if (!Platform.isTV && !isMenuSmall) setComponentFocused('exit');
      return true;
    };

    const canInit =
      (Platform.isTV &&
        (componentFocused === null ||
          isControlsAvailable === false ||
          isConnexionTroubles) &&
        componentFocused !== 'exit' &&
        componentFocused !== 'menu' &&
        componentFocused !== 'player') ||
      (!Platform.isTV &&
        componentFocused !== 'list' &&
        componentFocused !== 'categories' &&
        componentFocused !== 'exit' &&
        componentFocused !== 'player' &&
        componentFocused !== 'episodes' &&
        componentFocused !== 'details' &&
        activeComponent !== 'Settings');

    const backHandler = canInit
      ? BackHandler.addEventListener('hardwareBackPress', backAction)
      : null;

    return () => (canInit ? backHandler.remove() : null);
  }, [componentFocused, isControlsAvailable, isMenuSmall, activeComponent]);

  const sharedOpacityComponent = useSharedValue(0);
  const sharedOpacityDetails = useSharedValue(0);

  useEffect(() => {
    sharedOpacityComponent.value = withTiming(1, {
      duration: 400,
      easing: Easing.bezier(0.3, 1, 0.3, 1),
      useNativeDriver: true,
    });
  }, []);

  const handleChangePage = useCallback(component => {
    setIsControlsAvailable(false);
    sharedOpacityComponent.value = withTiming(0, {
      duration: 400,
      easing: Easing.bezier(0.3, 1, 0.3, 1),
      useNativeDriver: true,
    });
    setActiveMenu(component);
    setIsConnexionTroubles(false);

    if (component === 'Gain') {
      setIsMenuSmall(false);
      setComponentFocused(null);
    } else if (component === 'Home' || component === 'Settings') {
      setIsMenuSmall(false);
      setComponentFocused(null);
    } else {
      setIsMenuSmall(true);
      setComponentFocused(null);
    }

    setTimeout(() => {
      setActiveComponent(component);
    }, 400);

    setTimeout(() => {
      sharedOpacityComponent.value = withTiming(1, {
        duration: 400,
        easing: Easing.bezier(0.3, 1, 0.3, 1),
        useNativeDriver: true,
      });
    }, 700);

    setTimeout(() => {
      setIsControlsAvailable(true);
    }, 1000);
  }, []);

  useEffect(() => {
    if (componentFocused === 'player') KeepAwake.activate();
    else KeepAwake.deactivate();
  }, [componentFocused]);

  // console.log('rendu Index');

  const animatedStyleOpacityComponent = useAnimatedStyle(() => {
    return {
      opacity: sharedOpacityComponent.value,
    };
  }, []);

  const animatedStyleOpacityDetails = useAnimatedStyle(() => {
    return {
      opacity: sharedOpacityDetails.value,
    };
  }, []);

  const handleOpenDetails = useCallback((id, type) => {
    setDetailsInfos({
      id: id,
      type: type,
    });
    sharedOpacityDetails.value = withTiming(1, {
      duration: 500,
      easing: Easing.bezier(1, 1, 1, 1),
      useNativeDriver: true,
    });
    setComponentFocused('details');
  }, []);

  const handleBackFromDetails = useCallback(() => {
    sharedOpacityDetails.value = withTiming(0, {
      duration: 400,
      easing: Easing.bezier(1, 1, 1, 1),
      useNativeDriver: true,
    });
    setTimeout(() => {
      setDetailsInfos({
        id: null,
        type: null,
      });
      setComponentFocused('list');
      // setIsControlsAvailable(true);
    }, 400);
  }, []);

  const handleOpenVideoPlayer = useCallback((name, stream) => {
    if (name === null && stream === null) return setPlayerData(null);
    setPlayerData({
      path: stream,
      name: name,
    });
    
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `rgb(${appInfos.colors.background})`,
          // backgroundColor:'red',
          height: '100%',
          width: '100%',
        },
      ]}
      accessible={false}>
      {playerData ? (
        <View
          style={{
            position: 'absolute',
            height:
              componentFocused !== 'player' ? globalDimensions.height : '100%',
            width:
              componentFocused !== 'player' ? globalDimensions.width : '100%',
            zIndex: 9999,
          }}>
          {Platform.isTV ? (
            <Video
              source={{
                uri: playerData.path,
              }}
              // ref={ref => (videoRef.current = ref)}
              //   onBuffer={e => setIsBuffering(e.isBuffering)}
              // onError={err => console.log(err)}
              //   onLoad={() => handleOnLoadVideo()}
              style={styles.backgroundVideo}
              //   onProgress={e => handleVideoStatus(e)}
              resizeMode="contain"
              useTextureView={false}
              paused={false}
              // onSeek={e => console.log(e)}
              // onReadyForDisplay={() => console.log('readyForDisplay')}
              bufferConfig={{
                minBufferMs: 15000,
                maxBufferMs: 50000,
                bufferForPlaybackMs: 2500,
                bufferForPlaybackAfterRebufferMs: 5000,
              }}
              progressUpdateInterval={250}
            />
          ) : (
            <VideoPlayerMobile
              disableFullscreen
              disablePlayPause
              disableSeekbar
              disableTimer
              source={{
                uri: playerData.path,
              }}
              // onBuffer={e => setIsBuffering(e.isBuffering)}
              // onError={err => console.log(err)}
              // onLoad={() => handleOnLoadVideo()}
              style={styles.backgroundVideo}
              // onProgress={e => handleVideoStatus(e)}
              resizeMode="contain"
              useTextureView={false}
              bufferConfig={{
                minBufferMs: 15000,
                maxBufferMs: 50000,
                bufferForPlaybackMs: 2500,
                bufferForPlaybackAfterRebufferMs: 5000,
              }}
              progressUpdateInterval={250}
              onEnd={() => {
                handleOpenVideoPlayer(null, null);
                setComponentFocused('list');
              }}
              fullscreen={true}
              // title={title + ' ' + (subTitle ? subTitle : '')}
              onBack={() => {
                handleOpenVideoPlayer(null, null);
                setComponentFocused('list');
              }}
            />
          )}
        </View>
      ) : null}

      <View
        style={{
          position: 'absolute',
          top: -100,
          bottom: -100,
          left: -100,
          right: -100,
          backgroundColor: `rgb(${appInfos.colors.background})`,

          // zIndex: 1,
        }}></View>

      {componentFocused === 'exit' ? (
        <ExitPage
          colors={appInfos.colors}
          componentFocused={componentFocused}
          setComponentFocused={setComponentFocused}
        />
      ) : null}
      {detailsInfos.id ? (
        <Animated.View
          style={[
            animatedStyleOpacityDetails,
            {
              backgroundColor: 'transparent',
              zIndex: 999,
              position: 'absolute',
              width: '100%',
              height: '100%',
            },
          ]}>
          {/* {detailsInfos.type === 'Movies' ? ( */}
          <Details
            detailsId={detailsInfos.id}
            componentFocused={componentFocused}
            handleBackFromDetails={handleBackFromDetails}
            setComponentFocused={setComponentFocused}
            handleOpenVideoPlayer={handleOpenVideoPlayer}
            type={detailsInfos.type === 'Movies' ? 'movies' : 'series'}
          />
        </Animated.View>
      ) : null}
      <View accessible={false} style={[styles.thirdContainer]}>
        <Menu
          setComponentFocused={setComponentFocused}
          componentFocused={componentFocused}
          activeComponent={activeComponent}
          activeMenu={activeMenu}
          handleChangePage={handleChangePage}
          isMenuSmall={isMenuSmall}
          setIsMenuSmall={setIsMenuSmall}
        />
        <Animated.View
          accessible={false}
          style={[
            {
              height: '100%',
              flex: 1,
              zIndex: componentFocused === 'player' ? 9999 : 1,
            },
            animatedStyleOpacityComponent,
          ]}>
          <RightPageContainer
            setComponentFocused={setComponentFocused}
            componentFocused={componentFocused}
            activeComponent={activeComponent}
            handleOpenDetails={handleOpenDetails}
            handleOpenVideoPlayer={handleOpenVideoPlayer}
            playerData={playerData}
            isConnexionTroubles={isConnexionTroubles}
            isMenuSmall={isMenuSmall}
            setIsMenuSmall={setIsMenuSmall}
          />
        </Animated.View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    // flex: 1,
  },
  image: {
    flex: 1,
  },
  secondContainer: {
    flex: 1,
  },
  thirdContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backgroundVideo: {
    zIndex: 9999,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
});
