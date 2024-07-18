import LinearGradient from 'react-native-linear-gradient';
import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
  Dimensions,
  TouchableNativeFeedback,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import TVEventHandler from '../tools/TVEventHandler';
// import YoutubePlayer from 'react-native-youtube-iframe';

import FAIcon from 'react-native-vector-icons/FontAwesome';
import DetailsNavBar from '../components/DetailsNavBar';
import VideoPlayer from '../components/VideoPlayer';
import {AuthContext} from '../global/context';
import StarNote from '../components/StarNote';
import EpisodeChoice from '../components/EpisodeChoice';

const Details = ({
  type,
  detailsId,
  componentFocused,
  handleBackFromDetails,
  setComponentFocused,
}) => {
  const {
    JWT_TOKEN,
    language,
    appInfos,
    globalDimensions,
    appStateVisible,
    setIsConnexionTroubles,
  } = useContext(AuthContext);
  // const PATH_API_withIDS = `${PATH_API}?username=${username}&password=${password}`;

  const [details, setDetails] = useState(null);
  const [focused, setFocused] = useState('play'); // back, play, favorite, expand, trailer, continue
  const [buttonsNeeded, setButtonsNeeded] = useState([
    'back',
    'play',
    'favorite',
  ]);

  const [lastEpisode, setLastEpisode] = useState({episode: 1, season: 1});

  const isControlsAvailableRef = useRef(false);

  const [isDescriptionDisplayed, setIdDescriptionDisplayed] = useState(false);
  const [isTrailerOpened, setIsTrailerOpened] = useState(false);
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);

  const [currentPlayerStatus, setCurrentPlayerStatus] = useState('');

  const [isFavorite, setIsFavorite] = useState(false);

  const sharedOpacityWhenDisplayDescription = useSharedValue(1);
  const sharedMargintopDescription = useSharedValue(7);
  const sharedMargintopLayer = useSharedValue(
    (Dimensions.get('window').height - 320) / 2,
  );
  const sharedOpacityNavBar = useSharedValue(0);
  const sharedBackgroundOpacity = useSharedValue(0);

  const playerRef = useRef(null);
  const trailerSeekTimout = useRef(false);
  const [currentTimePlayer, setCurrentTimePlayer] = useState(0);

  const marginTopFullDescRef = useRef(0);

  const isBackMooving = useRef(false);

  // const contentHeightRef = useRef();

  const handleBackMooving = () => {
    isBackMooving.current = true;
    setTimeout(() => {
      isBackMooving.current = false;
    }, 500);
  };

  useEffect(() => {
    sharedBackgroundOpacity.value = withTiming(1, {
      duration: 1500,
      easing: Easing.bezier(1, 1, 1, 1),
      useNativeDriver: true,
    });
  }, []);

  useEffect(() => {
    const backAction = () => {
      _backAction();
      return true;
    };

    const canInit = componentFocused === 'details';

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      canInit ? backAction : () => null,
    );

    return () => backHandler.remove();
  }, [componentFocused, isDescriptionDisplayed, isTrailerOpened]);

  const _backAction = () => {
    if (!isBackMooving.current && isDescriptionDisplayed) {
      handleBackMooving();
      setIdDescriptionDisplayed(false);
      setFocused('expand');
    } else if (!isBackMooving.current && isTrailerOpened) {
      handleBackMooving();
      setIsTrailerOpened(false);
      setFocused('trailer');
      isControlsAvailableRef.current = true;
    } else if (!isBackMooving.current) {
      handleBackMooving();
      sharedBackgroundOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.bezier(1, 1, 1, 1),
        useNativeDriver: true,
      });
      handleBackFromDetails();
    }
  };

  const backFromPlayer = useCallback(() => {
    setComponentFocused('details');
    isControlsAvailableRef.current = true;
  }, []);

  const backFromPlayer_appBackground = () => {
    setComponentFocused('details');
    sharedOpacityNavBar.value = 1;
  };

  const _tvEventHandler = new TVEventHandler();
  const _enableTVEventHandler = () => {
    if (componentFocused === 'details') {
      _tvEventHandler.enable(this, function (cmp, evt) {
        if (!evt || evt.eventKeyAction !== 0) return;
        if (evt.eventType === 'select') return _moveSelect();
        else if (evt.eventType === 'right') return _moveRight();
        else if (evt.eventType === 'up') return _moveUp();
        else if (evt.eventType === 'left') return _moveLeft();
        else if (evt.eventType === 'down') return _moveDown();
      });
    }
  };

  const _moveSelect = () => {
    if (focused === '') return;
    if (!isControlsAvailableRef.current) return;
    if (isDescriptionDisplayed === false && isTrailerOpened === false) {
      if (focused === 'back') {
        sharedBackgroundOpacity.value = withTiming(0, {
          duration: 200,
          easing: Easing.bezier(1, 1, 1, 1),
          useNativeDriver: true,
        });
        handleBackFromDetails();
      } else handleClick(focused);
    } else if (isDescriptionDisplayed) {
      setIdDescriptionDisplayed(false);
      setFocused('expand');
    } else if (isTrailerOpened) setIsTrailerPlaying(curr => !curr);
  };

  const _moveUp = () => {
    if (!isControlsAvailableRef.current) return;
    if (focused === 'back' || isTrailerOpened || isDescriptionDisplayed) return;
    setFocused('back');
  };

  const _moveDown = () => {
    if (!isControlsAvailableRef.current) return;
    if (focused !== 'back' || isTrailerOpened || isDescriptionDisplayed) return;
    if (currentTimePlayer > 0) setFocused('continue');
    else setFocused('play');
  };

  const _moveLeft = () => {
    if (!isControlsAvailableRef.current) return;
    if (isDescriptionDisplayed === false && isTrailerOpened === false) {
      if (focused === 'play' && isButtonExist('continue')) {
        setFocused('continue');
      } else if (focused === 'favorite') setFocused('play');
      else if (focused === 'expand') setFocused('favorite');
      else if (focused === 'trailer' && isButtonExist('expand'))
        setFocused('expand');
    } else if (isTrailerOpened) {
      clearTimeout(trailerSeekTimout.current);
      if (isTrailerPlaying) setIsTrailerPlaying(false);

      playerRef.current.getCurrentTime().then(time => {
        playerRef.current.seekTo(time - 2, true);
      });
      trailerSeekTimout.current = setTimeout(() => {
        setIsTrailerPlaying(true);
      }, 500);
    }
  };

  const _moveRight = () => {
    if (!isControlsAvailableRef.current) return;
    if (isDescriptionDisplayed === false && isTrailerOpened === false) {
      if (focused === 'continue') {
        setFocused('play');
      } else if (focused === 'play') setFocused('favorite');
      else if (focused === 'favorite' && isButtonExist('expand'))
        setFocused('expand');
      else if (focused === 'expand' && isButtonExist('trailer'))
        setFocused('trailer');
    } else if (isTrailerOpened) {
      clearTimeout(trailerSeekTimout.current);
      if (isTrailerPlaying) setIsTrailerPlaying(false);

      playerRef.current.getCurrentTime().then(time => {
        playerRef.current.seekTo(time + 2, true);
      });
      trailerSeekTimout.current = setTimeout(() => {
        setIsTrailerPlaying(true);
      }, 500);
    }
  };

  const isButtonExist = button => {
    const index = buttonsNeeded.findIndex(el => el === button);
    return index === -1 ? false : true;
  };

  const _disableTVEventHandler = () => {
    if (_tvEventHandler) _tvEventHandler.disable();
  };

  useEffect(() => {
    if (componentFocused === 'details' && Platform.isTV)
      _enableTVEventHandler();
    return () => _disableTVEventHandler();
  });

  const handleClick = typeButton => {
    if (typeButton === 'play') {
      if (type === 'movies') {
        setTimeout(() => {
          sharedOpacityNavBar.value = 0;
        }, 800);
        isControlsAvailableRef.current = false;
        setComponentFocused('player');
        setCurrentPlayerStatus('play');
      } else {
        isControlsAvailableRef.current = false;
        setComponentFocused('episodes');
        setTimeout(() => {
          sharedOpacityNavBar.value = 0;
        }, 800);
      }
    } else if (typeButton === 'continue') {
      setTimeout(() => {
        sharedOpacityNavBar.value = 0;
      }, 800);
      isControlsAvailableRef.current = false;
      setComponentFocused('player');
      setCurrentPlayerStatus('continue');
    } else if (typeButton === 'favorite') {
      isControlsAvailableRef.current = false;
      toogleFavorite();
    } else if (typeButton === 'expand') {
      setIdDescriptionDisplayed(true);
      if (Platform.isTV) setFocused('back');
    } else if (typeButton === 'trailer') {
      // isControlsAvailableRef.current = false;
      // setFocused("back");
      setIsTrailerOpened(true);
      setIsTrailerPlaying(true);
    }
  };

  const deleteDateFromTitle = title => {
    let numberPosition = title.search(new RegExp('[1-2][0-9][0-9][0-9]'));
    if (
      title[numberPosition - 1] === '(' &&
      title[numberPosition + 4] === ')'
    ) {
      const newTitle =
        title.slice(0, numberPosition - 2) + title.slice(numberPosition + 5);
      let newTest = newTitle.search(':');
      return newTitle.splice(newTest - 1, newTest + 2);
    } else if (title.search(':') !== -1) {
      let newTest = title.search(':');
      return (
        title.slice(0, newTest - 1) + title.slice(newTest + 1, title.length)
      );
    } else return title;
  };

  useEffect(() => {
    if (appStateVisible === 'background') sharedOpacityNavBar.value = 1;
  }, [appStateVisible]);

  useEffect(() => {
    if (componentFocused !== 'details') {
      // sharedOpacityNavBar.value = 0
      return;
    }
    let path = '';
    if (type === 'series')
      path = `${process.env.PATH_CUSTOM_API}/get_series_info?xc_id=${detailsId}&jwt_token=${JWT_TOKEN}&language=${language}`;
    else
      path = `${process.env.PATH_CUSTOM_API}/get_movie_info?xc_id=${detailsId}&jwt_token=${JWT_TOKEN}&language=${language}`;
    fetch(path, {
      headers: {'Content-Type': 'application/json'},
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === 403) {
          setIsConnexionTroubles(true);
        }
        if (res.status === 200) {
          let newDetails = {...res.data};

          if (type === 'movies')
            newDetails.name = deleteDateFromTitle(res.data.name);
          else {
            if (newDetails.default_season && newDetails.default_episode) {
              setLastEpisode({
                episode: parseInt(newDetails.default_episode),
                season: parseInt(newDetails.default_season),
              });
            }
          }
          newDetails.vote_average = parseFloat(res.data.vote_average).toFixed(
            1,
          );

          let newButtonsNeeded = ['back'];
          if (
            type === 'movies' &&
            newDetails &&
            newDetails.progress &&
            newDetails.progress.position &&
            newDetails.progress.position > 0
          ) {
            newButtonsNeeded.push('continue');
            setCurrentTimePlayer(newDetails.progress.position);
          }
          newButtonsNeeded.push('play');
          newButtonsNeeded.push('favorite');
          newButtonsNeeded.push('expand');
          // if (newDetails.youtube_trailer.length > 0)
          //   newButtonsNeeded.push('trailer');

          setButtonsNeeded(newButtonsNeeded);

          if (newDetails && newDetails.is_favorite) {
            setIsFavorite(newDetails.is_favorite);
          }

          if (
            type === 'movies' &&
            newDetails &&
            newDetails.progress &&
            newDetails.progress.position &&
            newDetails.progress.position > 0
          ) {
            setFocused('continue');
          } else setFocused('play');

          setDetails(newDetails);
        }
      })
      .catch(err => setIsConnexionTroubles(true));
  }, [detailsId, componentFocused]);

  useEffect(() => {
    if (isDescriptionDisplayed) {
      sharedOpacityWhenDisplayDescription.value = 0;
      sharedMargintopDescription.value = -90;

      sharedMargintopLayer.value =
        (Dimensions.get('window').height - (200 + 45)) / 2 - 18 - 5;
    } else {
      sharedOpacityWhenDisplayDescription.value = 1;
      sharedMargintopDescription.value = 7;

      height = Platform.isTV ? 320 : 290;
      if (Dimensions.get('window').height - height < 1) {
        margintop = 10;
      } else {
        margintop = (Dimensions.get('window').height - height) / 2;
      }
      sharedMargintopLayer.value = margintop;
    }
  }, [isDescriptionDisplayed]);

  useEffect(() => {
    if (componentFocused === 'episodes') {
      sharedOpacityEpisodeChoice.value = 1;
      isControlsAvailableRef.current = true;
      sharedZIndexOfBackButton.value = withDelay(
        1000,
        withTiming(1, {
          duration: 0,
          easing: Easing.bezier(1, 1, 1, 1),
          useNativeDriver: true,
        }),
      );
    } else {
      sharedOpacityEpisodeChoice.value = 0;
      sharedZIndexOfBackButton.value = 9999;
    }
  }, [componentFocused]);

  useEffect(() => {
    if (componentFocused !== 'details' || !details) return;
    sharedOpacityBackButton.value = 1;
    setTimeout(() => {
      isControlsAvailableRef.current = true;
      sharedOpacityNavBar.value = 1;
    }, 500);
  }, [componentFocused, details, appStateVisible]);

  const toogleFavorite = () => {
    let path = `${
      process.env.PATH_CUSTOM_API
    }/toggle_favorite?jwt_token=${JWT_TOKEN}&xc_id=${detailsId}&type=${
      type === 'series' ? 3 : 2
    }`; // type 2 = film
    fetch(path)
      .then(res => res.json())
      .then(res => {
        if (res.status === 200) {
          isControlsAvailableRef.current = true;
          setIsFavorite(res.data);
        } else {
          // setIsConnexionTroubles(true);
        }
      })
      .catch(() => {
        // setIsConnexionTroubles(true);
      });
  };

  const handleBackFromChoiceEpisode = useCallback(() => {
    if (isBackMooving.current || componentFocused !== 'episodes') return;
    sharedZIndexOfBackButton.value = 9999;
    handleBackMooving();
    sharedOpacityEpisodeChoice.value = 0;
    setTimeout(() => {
      setComponentFocused('details');
      setFocused('play');
    }, 200);
    isControlsAvailableRef.current = true;
  }, [componentFocused]);

  const animatedStyleOpacityWhenDescDisplayed = useAnimatedStyle(() => {
    return {
      opacity: withTiming(sharedOpacityWhenDisplayDescription.value, {
        duration: 600,
        easing: Easing.bezier(0.2, 1, 0.2, 1),
        useNativeDriver: true,
      }),
    };
  });

  const animatedStyleMarginTopDescription = useAnimatedStyle(() => {
    return {
      marginTop: withTiming(sharedMargintopDescription.value, {
        duration: 600,
        easing: Easing.bezier(0.2, 1, 0.2, 1),
        useNativeDriver: true,
      }),
    };
  });

  const animatedStyleMarginTopLayer = useAnimatedStyle(() => {
    return {
      marginTop: withTiming(sharedMargintopLayer.value, {
        duration: 600,
        easing: Easing.bezier(0.2, 1, 0.2, 1),
        useNativeDriver: true,
      }),
    };
  });

  const animatedStyleOpactityNavBarWhenLoaded = useAnimatedStyle(() => {
    return {
      opacity: withTiming(sharedOpacityNavBar.value, {
        duration: 600,
        easing: Easing.bezier(0.2, 1, 0.2, 1),
        useNativeDriver: true,
      }),
    };
  });

  const sharedOpacityEpisodeChoice = useSharedValue(0);
  const animatedOpacityEpisodeChoice = useAnimatedStyle(() => {
    return {
      opacity: withTiming(sharedOpacityEpisodeChoice.value, {
        duration: 400,
        easing: Easing.bezier(1, 1, 1, 1),
        useNativeDriver: true,
      }),
    };
  });

  const sharedZIndexOfBackButton = useSharedValue(9999);
  const sharedOpacityBackButton = useSharedValue(0);

  const animatedZIndexOfBackButton = useAnimatedStyle(() => {
    return {
      zIndex: sharedZIndexOfBackButton.value,
      opacity: sharedOpacityBackButton.value,
    };
  });

  const animatedBackgroundFade = useAnimatedStyle(() => {
    return {
      opacity: sharedBackgroundOpacity.value,
    };
  });

  const components = {
    mobile: ScrollView,
    tv: View,
  };
  const SupportView = components[Platform.isTV ? 'tv' : 'mobile'];

  const componentsElement = {
    mobile: TouchableNativeFeedback,
    tv: View,
  };
  const SupportElementView = componentsElement[Platform.isTV ? 'tv' : 'mobile'];

  const handleVideoEnd = () => {
    backFromPlayer();
  };

  function truncateText(text) {
    if (text.length <= 40) {
      return text;
    }

    return text.slice(0, 40 - 3) + '...';
  }

  return (
    <View
      style={{
        height:
          componentFocused !== 'player' && componentFocused !== 'episodes'
            ? globalDimensions.height
            : '100%',
        width:
          componentFocused !== 'player' && componentFocused !== 'episodes'
            ? globalDimensions.width
            : '100%',
        backgroundColor: `rgb(${appInfos.colors.background})`,
        zIndex: 999,
      }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: -200,
          width: 200,
          backgroundColor: 'black',
          zIndex: 1,
        }}></View>
      <View
        style={{
          position: 'absolute',
          right: 0,
          left: 0,
          bottom: -200,
          height: 200,
          backgroundColor: 'black',
          zIndex: 1,
        }}></View>

      <View
        style={[
          {
            position: 'absolute',
            width: '100%',
            height: '100%',
          },
        ]}>
        <LinearGradient
          accessible={false}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: 9999,
          }}
          locations={[0, 0.6, 0.7, 0.8, 1]}
          start={{x: 0.9, y: 1}}
          colors={[
            `rgba(0,0,0,.4)`,
            `rgba(0,0,0,.6)`,
            `rgba(0,0,0,.7)`,
            `rgba(0,0,0,.8)`,
            `rgba(0,0,0,.9)`,
          ]}></LinearGradient>
        <Animated.Image
          source={{
            uri: details ? details.backdrop : null,
          }}
          style={[
            {
              position: 'absolute',
              height: '140%',
              width: '140%',
              backgroundColor: `rgb(${appInfos.colors.background})`,
              resizeMode: 'contain',
              marginTop: -(Dimensions.get('window').height / 5),
              // zIndex: 9999,
            },
            animatedBackgroundFade,
          ]}
        />
      </View>

      {/* {details && isTrailerOpened ? (
          <View
            style={{
              width: '100%',
              height: '100%',
              zIndex: 9999,
              position: 'absolute',
            }}>
            <YoutubePlayer
              ref={playerRef}
              accessible={false}
              height={'100%'}
              play={isTrailerPlaying}
              // onReady={() => console.log('coucou')}
              videoId={details.youtube_trailer}
              // onChangeState={status => console.log(status)}
              initialPlayerParams={{
                preventFullScreen: false,
                modestbranding: 1,
                rel: 0,
                iv_load_policy: 3,
                controls: 3,
              }}
            />
          </View>
        ) : null} */}

      {componentFocused === 'player' && details.stream ? (
        <View
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            zIndex: 9999,
            left: 0,
            right: 0,
            bottom: 0,
          }}>
          <VideoPlayer
            path={`${details.stream}`}
            xc_id={details.xc_id}
            // duration={details.duration_secs}
            position={currentTimePlayer}
            isResume={currentPlayerStatus === 'continue'}
            title={details.name}
            ext={details.stream.slice(0, -3)}
            handleVideoEnd={handleVideoEnd}
            backFromPlayer={backFromPlayer}
            backFromPlayer_appBackground={backFromPlayer_appBackground}
          />
        </View>
      ) : null}

      {details ? (
        <SupportView style={{}}>
          <View style={{}}>
            <Animated.View
              // ref={contentHeightRef}
              style={[
                animatedStyleMarginTopLayer,
                {
                  marginLeft: 73,
                },
              ]}>
              <Animated.View
                style={[
                  {flexDirection: 'row', marginBottom: 5, height: 18},
                  animatedStyleOpacityWhenDescDisplayed,
                ]}>
                {details.genres.map((genre, i) => {
                  return (
                    <Text
                      key={i}
                      style={[
                        styles.categoryBadge,
                        {
                          color: `rgb(${appInfos.colors.grey2})`,
                          borderColor: `rgb(${appInfos.colors.grey2})`,
                        },
                      ]}>
                      {genre}
                    </Text>
                  );
                })}
              </Animated.View>
              <View
                style={{
                  height: 45,
                  width: '100%',
                  paddingRight: 70,
                }}>
                <Text
                  numberOfLines={1}
                  style={[
                    {
                      fontFamily: 'Inter-Bold',
                      fontSize: 35,
                      lineHeight: 45,
                      position: 'absolute',
                      flex: 1,
                      color: `rgb(${appInfos.colors.grey1})`,
                    },
                  ]}>
                  {truncateText(details.name)}
                </Text>
              </View>
              <Animated.View
                style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                  animatedStyleOpacityWhenDescDisplayed,
                ]}>
                <Text
                  style={[
                    styles.thirdColumnElement,
                    {color: `rgb(${appInfos.colors.grey1})`},
                  ]}>
                  {details.year}
                </Text>
                <View
                  style={[
                    styles.separator,
                    {backgroundColor: `rgb(${appInfos.colors.grey1})`},
                  ]}></View>
                <View style={{flexDirection: 'row'}}>
                  <Text
                    style={[
                      styles.thirdColumnElement,
                      {color: `rgb(${appInfos.colors.grey1})`},
                    ]}>
                    {details.runtime}
                  </Text>
                  <Text
                    style={{
                      fontSize: 9,
                      color: `rgb(${appInfos.colors.grey1})`,
                      marginLeft: 2,
                    }}>
                    {appInfos.lang[language].data.details.minutes_short_label}
                  </Text>
                </View>
                <View
                  style={[
                    styles.separator,
                    {backgroundColor: `rgb(${appInfos.colors.grey1})`},
                  ]}></View>
                <Text
                  style={[
                    styles.thirdColumnElement,
                    {color: `rgb(${appInfos.colors.grey1})`},
                  ]}>
                  {details.country}
                </Text>
              </Animated.View>

              {isButtonExist('continue') ? (
                <Animated.View style={animatedStyleOpactityNavBarWhenLoaded}>
                  <Animated.View
                    style={[
                      {
                        position: 'absolute',
                        marginTop: 5,
                        flexDirection: 'row',
                        alignItems: 'center',
                      },
                      animatedStyleOpacityWhenDescDisplayed,
                    ]}>
                    <View
                      style={{
                        width: 120,
                        backgroundColor: 'grey',
                        height: 3,
                        marginTop: 2,
                      }}>
                      <View
                        style={{
                          width: `${
                            (currentTimePlayer / details.progress.duration) *
                            100
                          }%`,
                          backgroundColor: `rgb(${appInfos.colors.main})`,
                          height: '100%',
                        }}></View>
                    </View>
                    <View style={{marginLeft: 20}}>
                      <Text
                        style={{
                          color: `rgb(${appInfos.colors.grey2})`,
                          fontSize: 13,
                        }}>
                        {
                          appInfos.lang[language].data.details
                            .timeleft_first_label
                        }{' '}
                        {Math.round(
                          (details.progress.duration - currentTimePlayer) / 60,
                        )}{' '}
                        {
                          appInfos.lang[language].data.details
                            .timeleft_last_label
                        }
                      </Text>
                    </View>
                  </Animated.View>
                </Animated.View>
              ) : null}

              {type === 'series' ? (
                <Animated.View>
                  <Animated.View
                    style={[
                      {
                        position: 'absolute',
                        marginTop: 5,
                        flexDirection: 'row',
                        alignItems: 'center',
                      },
                      animatedStyleOpacityWhenDescDisplayed,
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
                  </Animated.View>
                </Animated.View>
              ) : null}

              <Animated.View
                style={[
                  {
                    marginTop: 30,
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                  animatedStyleOpacityWhenDescDisplayed,
                ]}>
                <Text
                  style={[
                    styles.note,
                    {
                      color: `rgb(${appInfos.colors.grey2})`,
                      fontFamily: 'Inter-Medium',
                    },
                  ]}>
                  {details.vote_average}
                </Text>
                <View style={{marginTop: -1}}>
                  <StarNote note={details.vote_average} />
                </View>
                <Text
                  style={[
                    styles.note,
                    {
                      color: `rgb(${appInfos.colors.grey2})`,
                      fontFamily: 'Inter-Medium',
                      marginLeft: 3,
                    },
                  ]}>
                  ({details.vote_count})
                </Text>
              </Animated.View>
              <Animated.Text
                style={[
                  styles.actors,
                  animatedStyleOpacityWhenDescDisplayed,
                  {color: `rgb(${appInfos.colors.grey1})`},
                ]}>
                {details.cast}
              </Animated.Text>
              <Animated.Text
                numberOfLines={isDescriptionDisplayed ? 10 : 3}
                style={[
                  styles.desc,
                  animatedStyleMarginTopDescription,
                  {
                    lineHeight: 20,
                    height: isDescriptionDisplayed ? 'auto' : 60,
                    color: `rgb(${appInfos.colors.grey2})`,
                  },
                ]}>
                {details.overview}
              </Animated.Text>
              {!isDescriptionDisplayed ? (
                <Animated.View
                  style={[
                    {marginTop: 15},
                    animatedStyleOpactityNavBarWhenLoaded,
                  ]}>
                  <DetailsNavBar
                    focused={focused}
                    animatedStyleOpacityWhenDescDisplayed={
                      animatedStyleOpacityWhenDescDisplayed
                    }
                    buttonsNeeded={buttonsNeeded}
                    isFavorite={isFavorite}
                    type={type === 'movies' ? 'Movies' : 'Series'}
                    handleClick={type => handleClick(type)}
                  />
                </Animated.View>
              ) : null}
            </Animated.View>
          </View>
        </SupportView>
      ) : null}

      {/* </LinearGradient> */}
      {componentFocused === 'episodes' ? (
        <Animated.View
          style={[
            {width: '100%', height: '100%', position: 'absolute', zIndex: 9998},
            animatedOpacityEpisodeChoice,
          ]}>
          <View
            style={{
              backgroundColor: 'rgba(0,0,0,1)',
              width: '100%',
              height: '100%',
            }}>
            <EpisodeChoice
              serieData={details && details.seasons ? details.seasons : null}
              handleBackFromChoiceEpisode={handleBackFromChoiceEpisode}
              details={details}
              series_id={detailsId}
              lastEpisode={lastEpisode}
              setLastEpisode={setLastEpisode}
            />
          </View>
        </Animated.View>
      ) : null}
      {/* </ImageBackground>
      </ImageBackground> */}
      {!isTrailerOpened && componentFocused !== 'player' ? (
        <Animated.View
          style={[
            {
              position: 'absolute',
            },
            Platform.isTV ? animatedZIndexOfBackButton : null,
          ]}>
          <SupportElementView style={[]} onPress={() => _backAction()}>
            <View
              style={{
                flexDirection: 'row',
                paddingTop: Platform.isTV ? 30 : 20,
                paddingLeft: Platform.isTV ? 30 : 20,
                paddingBottom: 20,
                paddingRight: 15,
                alignItems: 'center',
              }}>
              <View style={styles.backContainer}>
                <FAIcon
                  name="undo"
                  color={
                    focused === 'back'
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
                      focused === 'back' ? 'Inter-ExtraBold' : 'Inter-SemiBold',
                    color:
                      focused === 'back'
                        ? `rgb(${appInfos.colors.main})`
                        : `rgb(${appInfos.colors.grey2})`,
                  },
                ]}>
                {appInfos.lang[language].data.global.back_button_label}
              </Text>
            </View>
          </SupportElementView>
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  categoryBadge: {
    borderWidth: 1,
    marginRight: 5,
    paddingLeft: 5,
    paddingRight: 3,
    paddingTop: 2,
    paddingBottom: 1,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  separator: {
    width: 1,
    backgroundColor: 'white',
    height: 5,
    marginHorizontal: 10,
  },
  thirdColumnElement: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
  },
  note: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    marginRight: 4,
  },
  actors: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginTop: 7,
  },
  desc: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    maxWidth: 400,
  },
  backContainer: {
    backgroundColor: 'rgba(80,80,80,.5)',
    borderRadius: 50,
    padding: 4,
    paddingLeft: 5,
    marginRight: 5,
  },
  back: {
    fontSize: 12,
  },
});

export default Details;
