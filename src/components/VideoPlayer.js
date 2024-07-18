import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  BackHandler,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import KeepAwake from 'react-native-keep-awake';
import {AuthContext} from '../global/context';
import VideoControls from './VideoControls';
import VideoPlayerMobile from 'react-native-video-controls';

const VideoPlayer = ({
  path,
  xc_id,
  position,
  isResume,
  title,
  type,
  series_id,
  backFromPlayer,
  ext,
  handleVideoEnd,
  subTitle,
  nextEpisode,
  duration,
  backFromPlayer_appBackground,
}) => {
  const {JWT_TOKEN, language, appInfos, appStateVisible} =
    useContext(AuthContext);
  const videoRef = useRef(null);
  const isNextVideo = useRef(null);
  const [isPlayerPlaying, setIsPlayerPlaying] = useState(false);
  const wasPlayerPlaying = useRef(true);
  const isPlayerPlayingRef = useRef(false);
  const [currentVideoStatus, setCurrentVideoStatus] = useState(null);
  const statusRef = useRef(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(
    Platform.isTV ? true : false,
  );
  const [isNextButtonVisible, setIsNextButtonVisible] = useState(false);
  const currentTimeRef = useRef(0);
  const lastSaveAPIPosition = useRef(null);

  const sharedOpacityBackground = useSharedValue(0);

  const [isError, setIsError] = useState(false);
  const [currentSecondeBeforeNext, setCurrentSecondeBeforeNext] = useState(5);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (appStateVisible !== 'active')
      if (statusRef.current) {
        backFromPlayer(
          lastSaveAPIPosition.current,
          statusRef.current.seekableDuration,
        );
      } else backFromPlayer(null, null);
  }, [appStateVisible]);

  useEffect(() => {
    lastSaveAPIPosition.current = null;
  }, [path]);

  useEffect(() => {
    const backAction = () => {
      if (isControlsVisible && !isNextButtonVisible && Platform.isTV)
        setIsControlsVisible(false);
      else if (statusRef.current)
        backFromPlayer(
          lastSaveAPIPosition.current,
          statusRef.current.seekableDuration,
        );
      else backFromPlayer(null, null);
      return true;
    };

    const canInit = true;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      canInit ? backAction : () => null,
    );

    return () => backHandler.remove();
  }, [isControlsVisible, isNextButtonVisible]);

  useEffect(() => {
    sharedOpacityBackground.value = 1;
  }, []);

  const intervalRef = useRef(null);
  useEffect(() => {
    // console.log('useefect interval');
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(
      () => {
        if (
          currentTimeRef.current < appInfos.progressSpacing - 0.5 ||
          !isPlayerPlaying ||
          isNextButtonVisible
        )
          return;
        let path = '';
        if (type === 'series')
          path = `${process.env.PATH_CUSTOM_API}/set_episode_progress?jwt_token=${JWT_TOKEN}&series_id=${series_id}&xc_id=${xc_id}&position=${currentTimeRef.current}&duration=${statusRef.current.seekableDuration}`;
        else
          path = `${process.env.PATH_CUSTOM_API}/set_movie_progress?jwt_token=${JWT_TOKEN}&xc_id=${xc_id}&position=${currentTimeRef.current}&duration=${statusRef.current.seekableDuration}`;
        fetch(path).then(res =>
          res
            .json()
            .then(res => {
              if (res.status === 200) {
                lastSaveAPIPosition.current = res.data.position;
                console.log('saved');
              } 
              // else setIsConnexionTroubles(true);
            })
            .catch(() => {
              // setIsConnexionTroubles(true);
            }),
        );
      },
      appInfos ? appInfos.progressSpacing * 1000 : 30000,
    );

    return () => clearInterval(intervalRef.current);
  }, [
    videoRef.current,
    appInfos,
    isNextButtonVisible,
    isPlayerPlaying,
    isBuffering,
  ]);

  const animatedOpacityBackground = useAnimatedStyle(() => {
    return {
      opacity: withTiming(sharedOpacityBackground.value, {
        duration: 800,
        easing: Easing.bezier(0.1, 1, 0.1, 1),
        useNativeDriver: true,
      }),
    };
  }, []);

  useEffect(() => {
    if (isNextButtonVisible) {
      setCurrentVideoStatus(null);
      setIsPlayerPlaying(false);
      isPlayerPlayingRef.current = false;
    } else {
      setIsPlayerPlaying(true);
      isPlayerPlayingRef.current = true;
    }
  }, [isNextButtonVisible]);

  const handleVideoStatus = useCallback(
    status => {
      if (!status || status.error) {
        setIsError(true);
        return;
      }
      if (status.currentTime >= status.seekableDuration - 1) {
        // Si fin de vidéo
        _handleNextEpisode();
        return;
      }
      currentTimeRef.current = status.currentTime;
      statusRef.current = status;
      if (!isControlsVisible && isPlayerPlaying && currentVideoStatus) return;
      setCurrentVideoStatus(status);
    },
    [isControlsVisible, isPlayerPlaying, currentVideoStatus, nextEpisode, type],
  );

  const timeoutNextEpisode = useRef(null);
  const _handleNextEpisode = () => {
    if (type === 'series' && nextEpisode !== undefined && Platform.isTV) {
      isNextVideo.current = true;
      setIsNextButtonVisible(true);
      timeoutNextEpisode.current = setTimeout(() => {
        handleSeek(0);
        handleVideoEnd(
          lastSaveAPIPosition.current,
          statusRef.current.seekableDuration,
        );
        currentTimeRef.current = 0;
        setIsNextButtonVisible(false);
      }, 5000);
    } else
      backFromPlayer(
        lastSaveAPIPosition.current,
        statusRef.current.seekableDuration,
      );
  };

  useEffect(() => {
    return () => clearTimeout(timeoutNextEpisode.current);
  }, []);

  // console.log('render player');

  const handleOnLoadVideo = () => {
    if (position < 1 || !isResume) return;
    if (type === 'series' && position + 60 > duration) return;
    if (isNextVideo.current) return;
    handleSeek(position);

    setIsPlayerPlaying(false);
    setIsPlayerPlaying(true);

    isPlayerPlayingRef.current = true;
  };

  const handleSeek = value => {
    if (Platform.isTV) videoRef.current.seek(value);
    else videoRef.current.player.ref.seek(value);
    if (wasPlayerPlaying.current) setIsPlayerPlaying(true);
  };

  const handleUpdateCurrentTime = () => {
    setCurrentVideoStatus(statusRef.current);
  };

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

  const intervalNextEpisodeSeconds = useRef(null);

  useEffect(() => {
    if (Platform.isTV) return;
    if (isNextButtonVisible) {
      videoRef.current._hideControls();
      setTimeout(() => {
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

  useEffect(() => {
    if (Platform.isTV) return;
    setTimeout(() => {
      setIsFullScreen(true);
    }, 100);
  }, []);
  
  return (
    <Animated.View
      style={[
        {
          width: '100%',
          height: '100%',
          backgroundColor: 'black',
        },
        animatedOpacityBackground,
      ]}>
      <KeepAwake />
      <View
        style={{
          width: '100%',
          height: '100%',
        }}>
        {!isError ? (
          <View
            style={{
              opacity: isBuffering && !isNextButtonVisible ? 1 : 0,
              zIndex: 9999,
              width: '100%',
              height: '100%',
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ActivityIndicator size="large" color={`white`} />
          </View>
        ) : null}
        {Platform.isTV ? (
          <Video
            source={{
              uri: path,
              type: ext,
            }}
            ref={ref => (videoRef.current = ref)}
            onBuffer={e => setIsBuffering(e.isBuffering)}
            onError={err => console.log(err)}
            onLoad={() => handleOnLoadVideo()}
            style={styles.backgroundVideo}
            onProgress={e => handleVideoStatus(e)}
            controls={Platform.isTV ? false : true}
            resizeMode="contain"
            useTextureView={false}
            paused={!isPlayerPlaying}
            onSeek={e => console.log(e)}
            onReadyForDisplay={() => console.log('Ready')}
            bufferConfig={{
              minBufferMs: 15000,
              maxBufferMs: 50000,
              bufferForPlaybackMs: 2500,
              bufferForPlaybackAfterRebufferMs: 5000,
            }}
            progressUpdateInterval={250}
            onEnd={() => (isNextButtonVisible ? null : _handleNextEpisode())}
          />
        ) : (
          <VideoPlayerMobile
            disableFullscreen
            source={{
              uri: path,
              type: ext,
            }}
            ref={ref => (videoRef.current = ref)}
            onBuffer={e => setIsBuffering(e.isBuffering)}
            onError={err => console.log(err)}
            onLoad={() => handleOnLoadVideo()}
            style={styles.backgroundVideo}
            onProgress={e => handleVideoStatus(e)}
            resizeMode="contain"
            useTextureView={false}
            paused={!isPlayerPlaying}
            onSeek={e => console.log(e)}
            onReadyForDisplay={() => console.log('Ready')}
            bufferConfig={{
              minBufferMs: 15000,
              maxBufferMs: 50000,
              bufferForPlaybackMs: 2500,
              bufferForPlaybackAfterRebufferMs: 5000,
            }}
            progressUpdateInterval={250}
            onEnd={() => (isNextButtonVisible ? null : _handleNextEpisode())}
            fullscreen={true}
            title={title + ' ' + (subTitle ? subTitle : '')}
            showHours={true}
            onBack={() =>
              statusRef.current
                ? backFromPlayer(
                    lastSaveAPIPosition.current,
                    statusRef.current.seekableDuration,
                  )
                : backFromPlayer(null, null)
            }
          />
        )}

        {isError ? (
          <View
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{color: 'white'}}>
              {appInfos.lang[language].data.global.error_message}
            </Text>
          </View>
        ) : null}
        {Platform.isTV ? (
          <View
            style={{
              zIndex: 9999,
              width: '100%',
              height: '100%',
              position: 'absolute',
            }}>
            <VideoControls
              isControlsVisible={isControlsVisible}
              isPlayerPlaying={isPlayerPlaying}
              title={title}
              subTitle={subTitle}
              isError={isError}
              currentVideoStatus={currentVideoStatus}
              setCurrentVideoStatus={setCurrentVideoStatus}
              appInfos={appInfos}
              language={language}
              setIsPlayerPlaying={setIsPlayerPlaying}
              wasPlayerPlaying={wasPlayerPlaying}
              isPlayerPlayingRef={isPlayerPlayingRef}
              setIsControlsVisible={setIsControlsVisible}
              currentTimeRef={currentTimeRef}
              handleSeek={handleSeek}
              handleUpdateCurrentTime={handleUpdateCurrentTime}
              isNextButtonVisible={isNextButtonVisible}
              _handleNextEpisode={_handleNextEpisode}
            />
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
};

var styles = StyleSheet.create({
  backgroundVideo: {
    position: 'relative',
    zIndex: Platform.isTV ? null : 9999,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
});

export default VideoPlayer;
