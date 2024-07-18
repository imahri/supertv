import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  BackHandler,
  Platform,
  Text,
} from 'react-native';
import TVEventHandler from '../tools/TVEventHandler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Header from '../components/Header';
import List from '../components/List';
import {AuthContext} from '../global/context';

export default function Home({
  componentFocused,
  setComponentFocused,
  handleOpenDetails,
  detailsId,
  handleOpenVideoPlayer,
  playerData,
}) {
  const {
    JWT_TOKEN,
    language,
    setIsControlsAvailable,
    isControlsAvailable,
    homeListHeight,
    setHomeListHeight,
    appInfos,
    setIsConnexionTroubles,
    appStateVisible,
    expDate,
    setIsSelfConnexionTroubles,
  } = useContext(AuthContext);
  const [focused, setFocused] = useState(0);
  const maxList = useRef(4);
  const isCursorMoving = useRef(false);

  const lastOffsetYValueRef = useRef(null);
  const lastFocusedRef = useRef(0);

  const [data, setData] = useState(null); // progress, favorite_channels, favorite_movies, favorite_series, history_channels

  // const portraitItemDimensions = useRef({width: 0, height: 0});
  // const thumbnailItemDimensions = useRef({width: 0, height: 0});

  // const [canDetailBeOpened, setCanDetailBeOpened] = useState(true);

  const [LIST, setLIST] = useState([
    {
      title: appInfos.lang[language].data.home.section1,
      itemType: 'thumbnail',
      dataType: 'section1',
      role: 'tv',
      withText: true,
      type: 1,
    },
    {
      title: appInfos.lang[language].data.home.section2,
      itemType: 'portrait',
      dataType: 'section2',
      role: '',
      withText: false,
      type: 2,
    },
    {
      title: appInfos.lang[language].data.home.section3,
      itemType: 'portrait',
      dataType: 'section3',
      role: '',
      withText: false,
      type: 3,
    },
    {
      title: appInfos.lang[language].data.home.channels_history_title,
      itemType: 'thumbnail',
      dataType: 'channels_history',
      role: 'tv',
      withText: true,
      type: 1,
    },
    {
      title: appInfos.lang[language].data.home.resume_title,
      itemType: 'portrait',
      dataType: 'movie_progress',
      role: 'resume_home',
      withText: false,
      type: 2,
    },
    {
      title: appInfos.lang[language].data.home.channels_favorite_title,
      itemType: 'thumbnail',
      dataType: 'channels_favorite',
      role: 'tv',
      withText: true,
      type: 1,
    },
    {
      title: appInfos.lang[language].data.home.movies_favorite_title,
      itemType: 'portrait',
      dataType: 'movie_favorite',
      role: '',
      withText: false,
      type: 2,
    },
    {
      title: appInfos.lang[language].data.home.series_favorite_title,
      itemType: 'portrait',
      dataType: 'series_favorite',
      role: '',
      withText: false,
      type: 3,
    },
  ]);

  const intervalRef = useRef(null);
  useEffect(() => {
    if (componentFocused !== 'player' && componentFocused !== 'episodes')
      intervalRef.current = setInterval(() => {
        handleIntervalEPG();
        return;
      }, 10000);
    else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [componentFocused, data, focused]);

  const handleIntervalEPG = () => {
    if (!data || !data.history_channels || !data.history_channels.length)
      return;
    let newData = {...data};
    let newHistoryChannels = [...data.history_channels];
    let newFavoriteChannels = [...data.favorite_channels];
    let newSection1 = [...data.section1];
    let isChanged = false;
    data.history_channels.forEach((item, index) => {
      if (
        newHistoryChannels[index].epg &&
        newHistoryChannels[index].epg[0] &&
        Date.now() / 1000 > newHistoryChannels[index].epg[0].stop
      ) {
        const firstElement = newHistoryChannels[index].epg.shift();
        isChanged = true;
      }
    });
    data.favorite_channels.forEach((item, index) => {
      if (
        newFavoriteChannels[index].epg &&
        newFavoriteChannels[index].epg[0] &&
        Date.now() / 1000 > newFavoriteChannels[index].epg[0].stop
      ) {
        const firstElement = newFavoriteChannels[index].epg.shift();
        isChanged = true;
      }
    });
    data.section1.forEach((item, index) => {
      if (
        newSection1[index].epg &&
        newSection1[index].epg[0] &&
        Date.now() / 1000 > newSection1[index].epg[0].stop
      ) {
        const firstElement = newSection1[index].epg.shift();
        isChanged = true;
      }
    });
    if (isChanged) {
      newData.history_channels = newHistoryChannels;
      newData.favorite_channels = newFavoriteChannels;
      newData.section1 = newSection1;
      setData(newData);
    }
    return;
  };

  useEffect(() => {
    if (appStateVisible === 'background') {
      setComponentFocused('list');
      handleOpenVideoPlayer(null, null);
    }
  }, [appStateVisible]);

  useEffect(() => {
    const backAction = () => {
      if (componentFocused === 'player' && playerData) {
        setComponentFocused('list');
        handleOpenVideoPlayer(null, null);
        handleIntervalEPG();
      } else if (!Platform.isTV && componentFocused !== 'player')
        setComponentFocused('exit');
      else if (componentFocused !== 'player') setComponentFocused('menu');
      // setFocused(0);
      return true;
    };

    const canInit =
      (componentFocused === 'player' && playerData) ||
      componentFocused === 'list';
    // componentFocused !== 'menu' &&
    // componentFocused !== 'details' &&
    // componentFocused !== 'episodes' &&
    // componentFocused !== 'exit' && (componentFocused !== "list" && playerData)

    const backHandler = canInit
      ? BackHandler.addEventListener('hardwareBackPress', backAction)
      : null;

    return () => (canInit ? backHandler.remove() : {});
  }, [componentFocused]);

  const _tvEventHandler = new TVEventHandler();
  const _enableTVEventHandler = () => {
    _tvEventHandler.enable(this, function (cmp, evt) {
      if (evt && evt.eventKeyAction === 0) {
        if (evt.eventType === 'select') {
        } else if (evt.eventType === 'right') {
        } else if (evt.eventType === 'up') {
          if (focused !== 0) {
            lastFocusedRef.current = focused;
            setFocused(curr => curr - 1);
          }
        } else if (evt.eventType === 'left') {
        } else if (evt.eventType === 'down') {
          if (focused !== maxList.current) {
            lastFocusedRef.current = focused;
            setFocused(curr => curr + 1);
          }
        }
      }
    });
  };

  const _disableTVEventHandler = () => {
    if (_tvEventHandler) {
      _tvEventHandler.disable();
    }
  };

  const onLayoutList = event => {
    if (
      homeListHeight &&
      homeListHeight.thumbnail > 0 &&
      homeListHeight.portrait > 0
    )
      return;

    // console.log('onLayoutList');
    const {x, y, height, width} = event.nativeEvent.layout;

    const portraitItem_width = (width - 80) / 7 - 4.2;
    const portraitItem_height = portraitItem_width * 1.5;

    const thumbnailItem_width = (width - 80) / 5 - 4;
    const thumbnailItem_height = thumbnailItem_width / 1.5;

    const newListHeight = (portraitItem_height + 24 + 10).toFixed(2);

    const newListHeightThumbnail = (
      thumbnailItem_height +
      24 +
      10 +
      40
    ).toFixed(2);

    const newHomeListHeight = {
      thumbnail: parseInt(newListHeightThumbnail),
      portrait: parseInt(newListHeight),
      item_thumbnail: {
        height: thumbnailItem_height,
        width: thumbnailItem_width,
      },
      item_portrait: {
        height: portraitItem_height,
        width: portraitItem_width,
      },
    };
    setHomeListHeight(newHomeListHeight);
  };

  useEffect(() => {
    if (componentFocused === 'list' && isControlsAvailable && Platform.isTV) {
      _enableTVEventHandler();
    }
    return () => _disableTVEventHandler();
  });

  useEffect(() => {
    if (appInfos.logo === null || appInfos === undefined) return;
    let newData = {};
    _fetchChannelsHistory().then(res => {
      newData.history_channels = res;
    });
    _fetchFavoriteSeries().then(res => {
      newData.favorite_series = res;
    });
    _fetchFavoriteMovies().then(res => {
      newData.favorite_movies = res;
    });
    _fetchFavoriteChannels().then(res => {
      newData.favorite_channels = res;
    });
    _fetchProgressContent().then(res => {
      newData.progress = res;
    });
    _fetchSection1().then(res => {
      newData.section1 = res;
    });
    _fetchSection2().then(res => {
      newData.section2 = res;
    });
    _fetchSection3().then(res => {
      newData.section3 = res;
    });

    let myTimeout = setTimeout(() => {
      if (!newData.progress || newData.progress === undefined) {
        setLIST([]);
        setData([]);
        setIsControlsAvailable(true);
        setComponentFocused('menu');
        setIsConnexionTroubles(true);
      }
    }, appInfos.timeoutRequest * 1000);

    let myinterval = setInterval(() => {
      if (
        newData.progress &&
        newData.favorite_channels &&
        newData.favorite_movies &&
        newData.favorite_series &&
        newData.history_channels &&
        newData.section1 &&
        newData.section2 &&
        newData.section3
      ) {
        handleData(newData);
        clearInterval(myinterval);
        clearTimeout(myTimeout);
      }
    }, 200);
    return () => {
      clearInterval(myinterval);
      clearTimeout(myTimeout);
    };
  }, [appInfos]);

  const handleData = newData => {
    let newList = [];

    if (newData.section1.length > 0) {
      const index = LIST.findIndex((el, i) => el.dataType === 'section1');
      if (index !== -1) newList.push(LIST[index]);
    }

    if (newData.section2.length > 0) {
      const index = LIST.findIndex((el, i) => el.dataType === 'section2');
      if (index !== -1) newList.push(LIST[index]);
    }

    if (newData.section3.length > 0) {
      const index = LIST.findIndex((el, i) => el.dataType === 'section3');
      if (index !== -1) newList.push(LIST[index]);
    }

    if (newData.history_channels.length > 0) {
      const index = LIST.findIndex(
        (el, i) => el.dataType === 'channels_history',
      );
      if (index !== -1) newList.push(LIST[index]);
    }

    if (newData.progress.length) {
      const index = LIST.findIndex((el, i) => el.dataType === 'movie_progress');
      if (index !== -1) newList.push(LIST[index]);
    }

    if (newData.favorite_channels.length) {
      const index = LIST.findIndex(
        (el, i) => el.dataType === 'channels_favorite',
      );
      if (index !== -1) newList.push(LIST[index]);
    }

    if (newData.favorite_movies.length) {
      const index = LIST.findIndex((el, i) => el.dataType === 'movie_favorite');
      if (index !== -1) newList.push(LIST[index]);
    }

    if (newData.favorite_series.length) {
      const index = LIST.findIndex(
        (el, i) => el.dataType === 'series_favorite',
      );
      if (index !== -1) newList.push(LIST[index]);
    }

    maxList.current = newList.length - 1;
    setLIST(newList);
    setData(newData);
    setIsControlsAvailable(true);
    setComponentFocused('list');
  };

  const _fetchSection1 = async () => {
    return fetch(
      `${process.env.PATH_CUSTOM_API}/get_section_1?jwt_token=${JWT_TOKEN}&limit=40`,
    )
      .then(res => res.json())
      .then(res => {
        if (res.status === 200) {
          return res.data;
        } else if (res.status === 403) {
          return setIsConnexionTroubles(true);
        }
      })
      .catch(err => setIsConnexionTroubles(true));
  };

  const _fetchSection2 = async () => {
    return fetch(
      `${process.env.PATH_CUSTOM_API}/get_section_2?jwt_token=${JWT_TOKEN}&limit=40`,
    )
      .then(res => res.json())
      .then(res => {
        if (res.status === 200) {
          return res.data;
        } else if (res.status === 403) {
          return setIsConnexionTroubles(true);
        }
      })
      .catch(err => setIsConnexionTroubles(true));
  };

  const _fetchSection3 = async () => {
    return fetch(
      `${process.env.PATH_CUSTOM_API}/get_section_3?jwt_token=${JWT_TOKEN}&limit=40`,
    )
      .then(res => res.json())
      .then(res => {
        if (res.status === 200) {
          return res.data;
        } else if (res.status === 403) {
          return setIsConnexionTroubles(true);
        }
      })
      .catch(err => setIsConnexionTroubles(true));
  };

  const _fetchProgressContent = async () => {
    return fetch(
      `${process.env.PATH_CUSTOM_API}/get_content_in_progress?jwt_token=${JWT_TOKEN}&limit=40`,
    )
      .then(res => res.json())
      .then(res => {
        if (res.status === 200) {
          return res.data;
        } else if (res.status === 403) {
          return setIsConnexionTroubles(true);
        }
      })
      .catch(err => setIsConnexionTroubles(true));
  };

  const _fetchFavoriteChannels = async () => {
    return fetch(
      `${process.env.PATH_CUSTOM_API}/get_favorites?jwt_token=${JWT_TOKEN}&type=1&limit=40`,
    )
      .then(res => res.json())
      .then(res => {
        if (res.status === 200) {
          return res.data;
        } else if (res.status === 403) {
          return setIsConnexionTroubles(true);
        }
      })
      .catch(err => setIsConnexionTroubles(true));
  };

  const _fetchFavoriteMovies = async () => {
    return fetch(
      `${process.env.PATH_CUSTOM_API}/get_favorites?jwt_token=${JWT_TOKEN}&type=2&limit=40`,
    )
      .then(res => res.json())
      .then(res => {
        if (res.status === 200) {
          return res.data;
        } else if (res.status === 403) {
          return setIsConnexionTroubles(true);
        }
      })
      .catch(err => setIsConnexionTroubles(true));
  };

  const _fetchFavoriteSeries = async () => {
    return fetch(
      `${process.env.PATH_CUSTOM_API}/get_favorites?jwt_token=${JWT_TOKEN}&type=3&limit=40`,
    )
      .then(res => res.json())
      .then(res => {
        if (res.status === 200) {
          return res.data;
        } else if (res.status === 403) {
          return setIsConnexionTroubles(true);
        }
      })
      .catch(err => setIsConnexionTroubles(true));
  };

  const _fetchChannelsHistory = async () => {
    return fetch(
      `${process.env.PATH_CUSTOM_API}/get_channel_history?jwt_token=${JWT_TOKEN}&limit=40`,
    )
      .then(res => res.json())
      .then(res => {
        if (res.status === 200) {
          return res.data;
        } else if (res.status === 403) {
          return setIsConnexionTroubles(true);
        }
      })
      .catch(err => setIsConnexionTroubles(true));
  };

  useEffect(() => {
    setFocused(0);
  }, []);

  useEffect(() => {
    // if (displayElements.current < 5 + 1 * focused) {
    //   displayElements.current = 5 + 1 * focused;
    // }
    let valueToScroll = 0;

    if (focused === 0) valueToScroll = 0;
    else if (lastFocusedRef.current < focused) {
      let jumpValue =
        LIST[lastFocusedRef.current] &&
        LIST[lastFocusedRef.current].itemType === 'thumbnail'
          ? homeListHeight.thumbnail + 40
          : homeListHeight.portrait + 40;
      valueToScroll = lastOffsetYValueRef.current + jumpValue;
    } else if (lastFocusedRef.current > focused) {
      let jumpValue =
        LIST[focused] && LIST[focused].itemType === 'thumbnail'
          ? homeListHeight.thumbnail + 40
          : homeListHeight.portrait + 40;
      valueToScroll = lastOffsetYValueRef.current - jumpValue;
    } else valueToScroll = lastOffsetYValueRef.current;

    lastOffsetYValueRef.current = valueToScroll;
    offsetY.value = valueToScroll;
  }, [focused]);

  useEffect(() => {
    if (componentFocused === 'list' && !data) setComponentFocused('menu');
  }, [componentFocused]);

  const offsetY = useSharedValue(0);
  const animatedoffsetY = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(-offsetY.value, {
            duration: 600,
            easing: Easing.bezier(0.3, 1, 0.3, 1),
            useNativeDriver: true,
          }),
        },
      ],
    };
  });

  // console.log('render Home');

  const handleAddChannelToHistory = useCallback(xc_id => {
    let path = `${process.env.PATH_CUSTOM_API}/add_channel_to_history?jwt_token=${JWT_TOKEN}&xc_id=${xc_id}`;
    fetch(path)
      .then(res => res.json())
      .then(res => {
        if (res.status === 200) return;
        else setIsConnexionTroubles(true);

        setIsControlsAvailable(true);
      })
      .catch(() => setIsConnexionTroubles(true));
  }, []);

  return (
    <View style={{marginLeft: 0, zIndex: 9}}>
      {componentFocused === 'list' &&
      homeListHeight.item_thumbnail.height !== 0 &&
      data &&
      Platform.isTV ? (
        <Animated.View
          accessible={false}
          style={[
            styles.selectedWhite,
            {
              width:
                LIST[focused] && LIST[focused].itemType === 'thumbnail'
                  ? homeListHeight.item_thumbnail.width + 3
                  : homeListHeight.item_portrait.width + 3,
              height:
                LIST[focused] && LIST[focused].itemType === 'thumbnail'
                  ? homeListHeight.item_thumbnail.height + 3
                  : homeListHeight.item_portrait.height + 3,
              left: 0 + 40 - 1.5,
              top:
                105 +
                24 +
                10 -
                1.5 +
                (expDate < 14 ||
                (appInfos.lang[language].data.global.announcement &&
                  appInfos.lang[language].data.global.announcement.length > 0)
                  ? 35
                  : 0) -
                5,
            },
          ]}></Animated.View>
      ) : null}

      {Platform.isTV ? (
        <View>
          <Animated.View style={animatedoffsetY}>
            <Header />
          </Animated.View>
          <View style={{marginRight: 0}} onLayout={onLayoutList}>
            {homeListHeight.portrait !== 0 && homeListHeight.thumbnail !== 0 ? (
              <Animated.View
                style={[
                  animatedoffsetY,
                  {position: 'absolute', overflow: 'hidden'},
                ]}>
                {LIST.map((list, index) => {
                  return (
                    <View
                      key={index}
                      accessible={false}
                      style={{
                        // marginRight: 40,
                        marginBottom: 40,
                        // marginLeft: 40,
                      }}>
                      <List
                        type={list.type} // 1 chaines, 2 films, 3 séries
                        isCurrentList={focused === index}
                        isVisibleList={
                          index >= focused - 2 && index <= focused + 2
                        }
                        isFirstList={index === 0}
                        componentFocused={componentFocused}
                        title={list.title}
                        itemType={list.itemType} // thumbnail or protrait
                        setComponentFocused={setComponentFocused}
                        withText={list.withText}
                        role={list.role}
                        listHeight={homeListHeight.portrait}
                        listHeightThumbnail={homeListHeight.thumbnail}
                        handleOpenDetails={handleOpenDetails}
                        data={
                          data
                            ? list.dataType === 'movie_progress'
                              ? data.progress
                              : list.dataType === 'movie_favorite'
                              ? data.favorite_movies
                              : list.dataType === 'series_favorite'
                              ? data.favorite_series
                              : list.dataType === 'channels_favorite'
                              ? data.favorite_channels
                              : list.dataType === 'channels_history'
                              ? data.history_channels
                              : list.dataType === 'section1'
                              ? data.section1
                              : list.dataType === 'section2'
                              ? data.section2
                              : list.dataType === 'section3'
                              ? data.section3
                              : null
                            : null
                        }
                        handleOpenVideoPlayer={handleOpenVideoPlayer}
                        handleAddChannelToHistory={handleAddChannelToHistory}
                        colors={appInfos.colors}
                        homeListHeight={homeListHeight}
                      />
                    </View>
                  );
                })}
              </Animated.View>
            ) : null}
          </View>
        </View>
      ) : (
        <ScrollView
          style={[]}
          // accessible={false}
          // focusable={false}
        >
          <View>
            <Header />
            <View
              style={
                {
                  // backgroundColor: 'red',
                }
              }
              onLayout={onLayoutList}>
              <View style={{paddingRight: 0}}>
                {homeListHeight.portrait !== 0 && homeListHeight.thumbnail !== 0
                  ? LIST.map((list, index) => {
                      // console.log("index: " + index);
                      return (
                        <View
                          key={index}
                          accessible={false}
                          style={{
                            marginBottom: 30,
                          }}>
                          <List
                            type={list.type} // 1 chaines, 2 films, 3 séries
                            isCurrentList={focused === index}
                            isVisibleList={
                              index >= focused - 2 && index <= focused + 2
                            }
                            isFirstList={index === 0}
                            componentFocused={componentFocused}
                            title={list.title}
                            itemType={list.itemType} // thumbnail or protrait
                            setComponentFocused={setComponentFocused}
                            withText={list.withText}
                            role={list.role}
                            listHeight={homeListHeight.portrait}
                            listHeightThumbnail={homeListHeight.thumbnail}
                            handleOpenDetails={handleOpenDetails}
                            data={
                              data
                                ? list.dataType === 'movie_progress'
                                  ? data.progress
                                  : list.dataType === 'movie_favorite'
                                  ? data.favorite_movies
                                  : list.dataType === 'series_favorite'
                                  ? data.favorite_series
                                  : list.dataType === 'channels_favorite'
                                  ? data.favorite_channels
                                  : list.dataType === 'channels_history'
                                  ? data.history_channels
                                  : list.dataType === 'section1'
                                  ? data.section1
                                  : list.dataType === 'section2'
                                  ? data.section2
                                  : list.dataType === 'section3'
                                  ? data.section3
                                  : null
                                : null
                            }
                            handleOpenVideoPlayer={handleOpenVideoPlayer}
                            handleAddChannelToHistory={
                              handleAddChannelToHistory
                            }
                            colors={appInfos.colors}
                            homeListHeight={homeListHeight}
                          />
                        </View>
                      );
                    })
                  : null}
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  selectedWhite: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(250,250,250,1)',
    zIndex: 999,
  },
});
