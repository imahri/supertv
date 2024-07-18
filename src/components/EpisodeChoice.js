import LinearGradient from 'react-native-linear-gradient';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import FAIcon from 'react-native-vector-icons/FontAwesome';

import TVEventHandler from '../tools/TVEventHandler';
import VideoPlayer from './VideoPlayer';
import {AuthContext} from '../global/context';
import CategoryBarEpisode from './CategoryBarEpisode';
import EpisodeList from './EpisodeList';

const EpisodeChoice = ({
  serieData,
  handleBackFromChoiceEpisode,
  details,
  series_id,
  lastEpisode,
  setLastEpisode,
}) => {
  const {language, appInfos, globalDimensions} = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(-1);
  const [currentSeason, setCurrentSeason] = useState(-1);
  const [partFocused, setPartFocused] = useState('episode'); // season, episode
  const [itemDimensions, setItemDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isPlayerOpened, setIsPlayerOpened] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [isFullScreenLayer, setisFullScreenLayer] = useState(false);

  const scrollviewSeasonRef = useRef(null);

  useEffect(() => {
    const backAction = () => {
      if (partFocused === 'episode' && Platform.isTV) setPartFocused('season');
      else handleBackClick();
      return true;
    };

    const canInit = isPlayerOpened === false;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      canInit ? backAction : () => null,
    );

    return () => backHandler.remove();
  }, [isPlayerOpened, partFocused]);

  const backFromPlayer = (position, duration) => {
    setisFullScreenLayer(false);
    if (position && duration) {
      let newData = [...data];
      newData[currentEpisode].progress = {
        position: Math.round(position),
        duration: Math.round(duration),
      };
      setData(newData);
    }
    setLastEpisode({
      episode: currentEpisode + 1,
      season: currentSeason + 1,
    });
    setTimeout(() => {
      setIsPlayerOpened(false);
    }, 200);
    //   setTimeout(() => {
    //     setData(newData);
    //     setIsPlayerOpened(false);
    //     setLastEpisodeFocus({episode: focused + 1, season: currentSeason + 1});
    //   }, 200);
    // } else
    //   setTimeout(() => {
    //     setIsPlayerOpened(false);
    //     setLastEpisodeFocus({episode: focused + 1, season: currentSeason + 1});
    //   }, 200);
    // reloadCurrentTimeAfterBackFromPlayer();
  };

  const _tvEventHandler = new TVEventHandler();
  const _enableTVEventHandler = () => {
    _tvEventHandler.enable(this, function (cmp, evt) {
      if (!evt || evt.eventKeyAction !== 0) return;
      if (evt.eventType === 'select') return _moveSelect();
      else if (evt.eventType === 'right') return _moveRight();
      else if (evt.eventType === 'up') return;
      else if (evt.eventType === 'left') return;
      else if (evt.eventType === 'down') return _moveDown();
    });
  };

  const _moveRight = () => {
    if (data.length) setPartFocused('episode');
  };

  const _moveSelect = useCallback(() => {
    if (partFocused === 'back') handleBackClick();
  }, [partFocused]);

  const _moveDown = () => {
    if (partFocused === 'back') {
      setPartFocused('season');
    }
  };

  const _disableTVEventHandler = () => {
    if (_tvEventHandler) {
      _tvEventHandler.disable();
    }
  };

  useEffect(() => {
    if (!isPlayerOpened && Platform.isTV) _enableTVEventHandler();
    return () => _disableTVEventHandler();
  });

  const onLayoutRight = event => {
    const {x, y, height, width} = event.nativeEvent.layout;

    const portraitItem_width = width / 2.75;
    const portraitItem_height = portraitItem_width * 0.5833;
    const newDimensions = {
      width: portraitItem_width,
      height: portraitItem_height,
    };
    setItemDimensions(newDimensions);
  };

  useEffect(() => {
    if (Platform.isTV) setIsDataReady(false);
    if (serieData && currentSeason > -1) {
      if (data.length === 0)
        setData(Object.values(Object.values(serieData)[currentSeason]));
      if (Platform.isTV) setPartFocused('episode');
      if (categories.length === 0) setCategories(Object.keys(serieData));
    }

    if (Platform.isTV) setIsDataReady(true);
  }, [currentSeason, serieData]);

  useEffect(() => {
    if (itemDimensions.height === 0) return;
    if (lastEpisode.season === null) return;
    
    setCurrentSeason(lastEpisode.season - 1);
    // setFocusedSeason(lastEpisode.season - 1);
    setIsReady(true);
  }, [lastEpisode, itemDimensions]);

  const handleSeasonClick = useCallback(
    index => {
      if (currentSeason !== index) {
        setCurrentSeason(index);
        setData(Object.values(Object.values(serieData)[index]));
      } else setPartFocused('episode');
    },
    [currentSeason],
  );

  const handleEpisodeClick = useCallback(
    episode => {
      setCurrentEpisode(episode);
      setIsPlayerOpened(true);
      setisFullScreenLayer(true);
    },
    [data, currentSeason, currentEpisode],
  );

  const handleBackClick = () => {
    handleBackFromChoiceEpisode();
    // if (Platform.isTV) setPartFocused('episode');
  };

  // const handleScroll = (offset) => { // Mobile
  //   const val = offset.y / (10 + itemDimensions.height)
  //   if(val !== focused) setFocused(Math.ceil(val - 0.1))
  //   console.log(Math.ceil(val - 10))
  // }

  const sharedCategoryOpacity = useSharedValue(0);
  const sharedEpisodeOpacity = useSharedValue(0);
  const animatedOpcaityCategory = useAnimatedStyle(() => {
    return {
      opacity: withTiming(sharedCategoryOpacity.value, {
        duration: 400,
        easing: Easing.bezier(0.4, 1, 0.4, 1),
        useNativeDriver: true,
      }),
    };
  }, []);
  const animatedOpcaityEpisode = useAnimatedStyle(() => {
    return {
      opacity: withTiming(sharedEpisodeOpacity.value, {
        duration: 400,
        easing: Easing.bezier(0.4, 1, 0.4, 1),
        useNativeDriver: true,
      }),
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      sharedCategoryOpacity.value = 1;
    }, 400);
    if (isReady && itemDimensions.width > 0)
      setTimeout(() => {
        sharedEpisodeOpacity.value = 1;
      }, 800);
  }, [isReady, itemDimensions]);

  const capitalize = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleVideoEnd = useCallback(
    (position, duration) => {
      if (
        currentEpisode !==
        // Object.keys(serieData[currentSeason + 1]).length - 1
        Object.values(Object.values(serieData)[currentSeason]).length - 1
      ) {
        if (position && duration) {
          let newData = [...data];
          newData[currentEpisode].progress = {
            position: Math.round(position),
            duration: Math.round(duration),
          };
          // setData([]);
          setData(newData);
        }
        setCurrentEpisode(curr => curr + 1);
      }
    },
    [serieData, currentEpisode, currentSeason, data],
  );

  const componentsElement = {
    mobile: TouchableNativeFeedback,
    tv: Animated.View,
  };
  const SupportElementView = componentsElement[Platform.isTV ? 'tv' : 'mobile'];
  
  return (
    <View
      style={{
        backgroundColor: `rgb(${appInfos.colors.background})`,
        height: '100%',
        width: '100%',
      }}>
      <View
        style={{
          position: 'absolute',
          top: -100,
          bottom: -100,
          left: -100,
          right: -100,
          // backgroundColor: 'black',
          // zIndex: 1,
        }}></View>
      {isPlayerOpened && currentEpisode > -1 && currentSeason > -1 ? (
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: 9999,
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
          }}>
          <VideoPlayer
            path={`${data[currentEpisode].stream}`}
            xc_id={data[currentEpisode].xc_id}
            // duration={data[currentEpisode].runtime}
            position={
              data[currentEpisode].progress
                ? data[currentEpisode].progress.position
                : 0
            }
            duration={
              data[currentEpisode].progress
                ? data[currentEpisode].progress.duration
                : 0
            }
            isResume={true}
            title={details.name}
            subTitle={
              appInfos.lang[language].data.details.season_short_label +
              Object.keys(serieData)[currentSeason] +
              ' : ' +
              appInfos.lang[language].data.details.episode_short_label +
              data[currentEpisode].episode_number +
              ' - ' +
              data[currentEpisode].name
            }
            type="series"
            series_id={series_id}
            ext={
              data[currentEpisode].stream &&
              data[currentEpisode].stream.slice(-3)
            }
            handleVideoEnd={handleVideoEnd}
            backFromPlayer={backFromPlayer}
            nextEpisode={
              Object.values(Object.values(serieData)[currentSeason])[currentEpisode + 1]
            }
          />
        </View>
      ) : null}
      <SupportElementView onPress={() => handleBackClick()}>
        <View
          style={{
            flexDirection: 'row',
            paddingTop: Platform.isTV ? 30 : 20,
            paddingLeft: Platform.isTV ? 30 : 20,
            paddingBottom: 20,
            paddingRight: 15,
            alignItems: 'center',
            position: 'absolute',
            zIndex: 999,
          }}>
          <View style={[styles.backContainer]}>
            <FAIcon
              name="undo"
              color={
                partFocused === 'back'
                  ? `rgb(${appInfos.colors.main})`
                  : `rgb(${appInfos.colors.grey2})`
              }
              size={12}
              accessible={false}
              style={{
                transform: [{rotate: '-45deg'}],
              }}
            />
          </View>
          <Text
            style={[
              styles.back,
              {
                fontFamily:
                  partFocused === 'back' ? 'Inter-ExtraBold' : 'Inter-SemiBold',
                color:
                  partFocused === 'back'
                    ? `rgb(${appInfos.colors.main})`
                    : `rgb(${appInfos.colors.grey2})`,
              },
            ]}>
            {appInfos.lang[language].data.global.back_button_label}
          </Text>
        </View>
      </SupportElementView>
      <View
        style={{
          // marginTop: 78,
          paddingLeft: Platform.isTV ? 60 : 40,
          height: globalDimensions.height,
          width: globalDimensions.width,
          marginRight: 0,
          flexDirection: 'row',
          height: '100%',
        }}>
        <Animated.View
          style={[
            {
              width: Platform.isTV ? 280 : 270,
              overflow: 'hidden',
              // justifyContent:
              //   (serieData && Object.keys(serieData).length > 8) ||
              //   !Platform.isTV
              //     ? 'flex-start'
              //     : 'center',
              paddingTop: Platform.isTV ? 140 : 140,
            },
            animatedOpcaityCategory,
          ]}>
          <View
            style={{
              position: 'absolute',
              top: Platform.isTV ? 70 : 70,
              width: '100%',
            }}>
            <View style={{flexDirection: 'row'}}>
              <Text
                style={{
                  color: `rgb(${appInfos.colors.grey1})`,
                  fontSize: 30,
                  fontFamily: 'Inter-Bold',
                  position: 'absolute',
                }}>
                {details && details.name}
              </Text>
              {details.name.length > 14 ? (
                <View
                  style={{
                    position: 'absolute',
                    right: 0,
                    width: 80,
                    height: 50,
                  }}>
                  <LinearGradient
                    accessible={false}
                    style={{
                      width: '100%',
                      position: 'relative',
                      height: '100%',
                      // backgroundColor: "rgba(0,0,0,.1)",
                    }}
                    end={{x: 1, y: 0.5}}
                    start={{x: 0, y: 0.5}}
                    colors={[
                      'rgba(21, 25, 28, 0)',
                      `rgb(${appInfos.colors.background})`,
                    ]}></LinearGradient>
                </View>
              ) : null}
            </View>

            <View
              style={[
                {
                  // marginTop: 25,
                  top: 45,
                  flexDirection: 'row',
                  alignItems: 'center',
                  // alignContent:"center"
                },
              ]}>
              <Text
                style={{
                  color: `rgb(${appInfos.colors.grey2})`,
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 13,
                }}>
                {details.number_of_seasons}{' '}
                {details.number_of_seasons > 1
                  ? appInfos.lang[language].data.details.seasons_label
                  : appInfos.lang[language].data.details.season_label}
              </Text>
              <View
                style={[
                  styles.separator,
                  {backgroundColor: `rgb(${appInfos.colors.grey2})`},
                ]}></View>
              <Text
                style={{
                  color: `rgb(${appInfos.colors.grey2})`,
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 13,
                }}>
                {details.number_of_episodes}{' '}
                {details.number_of_episodes > 1
                  ? appInfos.lang[language].data.details.episodes_label
                  : appInfos.lang[language].data.details.episode_label}
              </Text>
            </View>
          </View>
          <View style={{paddingRight: Platform.isTV ? 0 : 40}}>
            <CategoryBarEpisode
              serieData={serieData}
              categories={categories}
              currentSeason={currentSeason}
              partFocused={partFocused}
              setPartFocused={setPartFocused}
              appInfos={appInfos}
              language={language}
              handleSeasonClick={handleSeasonClick}
              isPlayerOpened={isPlayerOpened}
            />
          </View>
        </Animated.View>
        <Animated.View
          style={[
            {flex: 1, marginTop: Platform.isTV ? 81 : 0},
            animatedOpcaityEpisode,
          ]}
          onLayout={onLayoutRight}>
          {partFocused === 'episode' &&
          Platform.isTV &&
          data &&
          data.length &&
          isReady &&
          isDataReady ? (
            <View
              accessible={false}
              style={[
                styles.selectedWhite,
                {
                  width: itemDimensions.width + 3,
                  height: itemDimensions.height + 3,
                },
              ]}></View>
          ) : null}

          {isReady && data.length ? (
            <>
              {Platform.isTV ? (
                <View
                  style={[
                    {
                      position: 'absolute',
                      zIndex: 999,
                      marginTop: -34,
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 12,
                    },
                  ]}>
                  <Text
                    style={[
                      {
                        marginLeft: 0,
                        zIndex: 999,
                        color: `rgb(${appInfos.colors.grey1})`,
                        fontFamily: 'Inter-Bold',
                        fontSize: 16,
                      },
                    ]}>
                    {capitalize(
                      appInfos.lang[language].data.details.season_label,
                    )}{' '}
                    {Object.keys(serieData)[currentSeason]}
                  </Text>
                </View>
              ) : null}
              <EpisodeList
                appInfos={appInfos}
                language={language}
                data={data}
                itemDimensions={itemDimensions}
                partFocused={partFocused}
                setPartFocused={setPartFocused}
                isPlayerOpened={isPlayerOpened}
                moving={lastEpisode.season - 1 == currentSeason}
                lastEpisode={lastEpisode}
                handleEpisodeClick={handleEpisodeClick}
                currentSeason={currentSeason}
                serieDataKeys={Object.keys(serieData)}
              />
            </>
          ) : null}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: 'rgb(85,85,85)',
    fontSize: 14,
    marginBottom: 14,
  },
  inputContainer: {
    borderWidth: 1.5,

    marginBottom: 14,
  },
  selectedWhite: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 999,
    top: -1.5,
    left: -1.5,
  },
  backContainer: {
    backgroundColor: 'rgba(80,80,80,.5)',
    borderRadius: 50,
    padding: 4,
    paddingLeft: 5,
    marginRight: 5,
  },
  back: {
    // fontFamily: 'Inter-Bold',
    fontSize: 12,
  },
  separator: {
    width: 1,
    backgroundColor: 'white',
    height: 5,
    marginHorizontal: 10,
    marginTop: 2.5,
  },
});

export default memo(EpisodeChoice);
