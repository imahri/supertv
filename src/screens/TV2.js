import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Text,
  StyleSheet,
  View,
  BackHandler,
  Dimensions,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import CategoriesBar from '../components/CategoriesBar';
import ListMovies from '../components/ListMovies';

import TVEventHandler from '../tools/TVEventHandler';

import {AuthContext} from '../global/context';
import EpgViewer from '../components/EpgViewer';
import ElementSkeleton from '../components/skeleton/ElementSkeleton';
import LostConnexionSnippet from '../components/LostConnexionSnippet';

export default function TV({
  componentFocused,
  setComponentFocused,
  handleOpenVideoPlayer,
}) {
  const MARGIN_RIGHT_ITEM = 5;

  const {
    JWT_TOKEN,
    language,
    appInfos,
    setIsConnexionTroubles,
    appStateVisible,
    searchListItemWidth,
  } = useContext(AuthContext);

  const isControlsAvailableRef = useRef(false);
  const isCursorMoving = useRef(false);
  const maxItem = useRef(3);
  const originalDataLength = useRef(0);
  const isDataLoading = useRef(false);
  const longPressRef = useRef(0);
  const intervalRef = useRef(null);
  const canDetailBeOpened = useRef(true);

  const leftMarginWhiteSelectedMovies = useSharedValue(0);
  const offsetY = useSharedValue(1);

  const [categories, setCategories] = useState([]);
  const [focusedCategory, setFocusedCategory] = useState(-1);
  const [currentCategory, setCurrentCategory] = useState(-2);
  const [isKeyboardOpened, setIsKeyboardOpened] = useState(false);

  const [isSelfConnexionTroubles, setIsSelfConnexionTroubles] = useState(false);

  const [isDataReady, setIsDataReady] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const searchTextRef = useRef(null);
  const canRetryToLoadDataRef = useRef(true);


  const [data, setData] = useState([]);
  const dataRef = useRef([]);
  const [focusedX, setFocusedX] = useState(0);
  const [focusedY, setFocusedY] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [descriptionEPGWidth, setDescriptionEPGWidth] = useState(0);
  const [_reload, _setReload] = useState(false);

  const widthBarDerived = useMemo(() => {
    if (
      data === undefined ||
      data.length === 0 ||
      data[focusedY] === undefined ||
      data[focusedY][focusedX] === undefined ||
      data[focusedY][focusedX].epg === undefined ||
      data[focusedY][focusedX].epg[0] === undefined
    )
      return 0;
    let calcul =
      ((Date.now() / 1000 - data[focusedY][focusedX].epg[0].start) /
        (data[focusedY][focusedX].epg[0].stop -
          data[focusedY][focusedX].epg[0].start)) *
      100;

    return calcul;
  }, [focusedX, focusedY, data, _reload]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (
        componentFocused !== 'player' &&
        !isDataLoading.current &&
        isReady &&
        isDataReady
      )
        return handleIntervalEPG();
      return;
    }, 10000);
    return () => clearInterval(intervalRef.current);
  }, [componentFocused, data, isReady, isDataReady, focusedY]);

  const handleIntervalEPG = () => {
    let newData = [...dataRef.current];
    let isChanged = false;
    dataRef.current.forEach((row, rowIndex) => {
      if ((rowIndex < focusedY - 10 || rowIndex > focusedY + 10) && Platform.isTV) return;
      row.forEach((item, index) => {
        if (
          newData[rowIndex][index].epg &&
          newData[rowIndex][index].epg[0] &&
          Date.now() / 1000 > newData[rowIndex][index].epg[0].stop
        ) {
          const firstElement = newData[rowIndex][index].epg.shift();
          isChanged = true;
        }
      });
    });
    if (isChanged) {
      dataRef.current = newData;
      setData(newData);
    } else _setReload(curr => !curr);
    return;
  };

  useEffect(() => {
    const backAction = () => {
      if (!Platform.isTV && componentFocused !== 'player')
        setComponentFocused('menu');
      else if (componentFocused === 'list') setComponentFocused('categories');
      else if (componentFocused === 'categories') setComponentFocused('menu');
      else if (componentFocused === 'player') {
        handleOpenVideoPlayer(null, null);
        handleIntervalEPG();
        setComponentFocused('list');
      }
      return true;
    };

    const canInit =
      componentFocused !== 'menu' &&
      componentFocused !== 'details' &&
      componentFocused !== 'episodes' &&
      componentFocused !== 'exit' &&
      (componentFocused !== null || !Platform.isTV);

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      canInit ? backAction : () => null,
    );

    return () => backHandler.remove();
  }, [componentFocused]);

  useEffect(() => {
    if (appStateVisible === 'background') {
      setComponentFocused('list');
      handleOpenVideoPlayer(null, null);
    }
  }, [appStateVisible]);

  const _tvEventHandler = new TVEventHandler();
  const _enableTVEventHandler = () => {
    _tvEventHandler.enable(this, function (cmp, evt) {
      // if (isDataLoading.current) return;
      if (evt && evt.eventKeyAction === 1) {
        if (evt.eventType === 'select') {
          if (
            componentFocused === 'list' &&
            canDetailBeOpened.current &&
            longPressRef.current < 4 &&
            longPressRef.current > 0
          ) {
            handleItemClicked(
              data[focusedY][focusedX].xc_id,
              focusedX,
              focusedY,
            );
          }
          longPressRef.current = 0;
        }
      } else if (evt && evt.eventKeyAction === 0) {
        if (!isControlsAvailableRef.current) return;
        if (evt.eventType === 'select') {
          if (longPressRef.current === 4) {
            toogleFavorite(data[focusedY][focusedX].xc_id, focusedX, focusedY);
            longPressRef.current = 5;
          } else longPressRef.current += 1;
        } else if (evt.eventType === 'right') _moveRight();
        else if (evt.eventType === 'up') _moveUp();
        else if (evt.eventType === 'left') _moveLeft();
        else if (evt.eventType === 'down') _moveDown();
      }
    });
  };

  const _moveRight = () => {
    if (!isControlsAvailableRef.current) return;
    if (isCursorMoving.current === true) return;
    if (
      // Je calcul si l'element selectionné n'est pas au dessus du max en faisant un calcul sur focusedY et focusedX
      focusedX !== maxItem.current &&
      (focusedY + 1) * 4 - maxItem.current + focusedX !==
        originalDataLength.current
    ) {
      isCursorMoving.current = true;
      setTimeout(() => {
        isCursorMoving.current = false;
      }, 5);
      setFocusedX(focusedX + 1);
    }
  };

  const _moveUp = () => {
    if (isCursorMoving.current === true) return;
    if (componentFocused === 'list') {
      if (focusedY === 0) return;
      isCursorMoving.current = true;
      setTimeout(() => {
        isCursorMoving.current = false;
      }, 30);
      moveFocusY(focusedY - 1);
    }
  };

  const _moveLeft = () => {
    if (isCursorMoving.current === true) return;
    if (focusedX !== 0) {
      isCursorMoving.current = true;
      setTimeout(() => {
        isCursorMoving.current = false;
      }, 5);
      setFocusedX(curr => curr - 1);
    } else {
      setFocusedX(0);
      setComponentFocused('categories');
    }
  };

  const _moveDown = () => {
    if (isCursorMoving.current === true) return;
    if (componentFocused === 'list') {
      if (focusedY === data.length - 1) return;
      isCursorMoving.current = true;
      setTimeout(() => {
        isCursorMoving.current = false;
      }, 30);
      moveFocusY(focusedY + 1);
      if (
        (focusedY + 1) * 4 - maxItem.current + focusedX + 4 >
        originalDataLength.current
      ) {
        setFocusedX(
          // Ici on calcul pour que au down sur la liste a la fin, le focusedX se place sur le dernier element
          focusedX -
            maxItem.current +
            (originalDataLength.current -
              ((focusedY + 1) * 4 - maxItem.current + focusedX) -
              1),
        );
      }
    }
  };

  const moveFocusY = newY => {
    // if (isDataLoading.current) return;
    let valueToScroll = (searchListItemWidth / 1.5 + 50 + 5) * newY;

    offsetY.value = withTiming(valueToScroll, {
      duration: 600,
      easing: Easing.bezier(0.3, 1, 0.3, 1),
      useNativeDriver: true,
    });
    setFocusedY(newY);
    return;
  };

  const _disableTVEventHandler = useCallback(() => {
    if (_tvEventHandler) {
      _tvEventHandler.disable();
    }
  }, [_tvEventHandler]);

  useEffect(() => {
    if (componentFocused === 'list' && Platform.isTV) {
      _enableTVEventHandler();
    }
    return () => _disableTVEventHandler();
  });

  useEffect(() => {
    if (componentFocused === 'list' && data.length === 0)
      setComponentFocused('categories');
  }, [componentFocused]);

  useEffect(() => {
    leftMarginWhiteSelectedMovies.value = focusedX * (searchListItemWidth + 5);
  }, [focusedX]);

  const timeoutAbordCategoriesRef = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    timeoutAbordCategoriesRef.current = setTimeout(() => {
      if (!signal.aborted) {
        controller.abort();
        setComponentFocused('menu');
        setIsConnexionTroubles(true);
      }
    }, appInfos.timeoutRequest * 1000);

    path = `${process.env.PATH_CUSTOM_API}/channel/get_categories?jwt_token=${JWT_TOKEN}&language=${language}`;
    fetch(path, {signal})
      .then(res => res.json())
      .then(res => {
        if (res.data.length) {
          res.data.forEach((el, i) => {
            if (el.default) {
              setCurrentCategory(i);
              setFocusedCategory(i);
            }
          });
          setCategories(res.data);
          controller.abort();
          clearTimeout(timeoutAbordCategoriesRef.current);
        } else {
          setIsConnexionTroubles(true);
        }
        return;
      })
      .catch(e => {
        controller.abort();
        setComponentFocused('menu');
        clearTimeout(timeoutAbordCategoriesRef.current);
        setIsConnexionTroubles(true);
      });
    return () => clearTimeout(timeoutAbordCategoriesRef.current);
  }, []);

  useEffect(() => {
    if (categories.length) sharedOpacity.value = 1;
    return;
  }, [categories]);

  useEffect(() => {
    if (currentCategory === -1) return;
    if (categories.length === 0) return;
    canRetryToLoadDataRef.current = true;
    searchTextRef.current = null;
    setIsSelfConnexionTroubles(false);
    isControlsAvailableRef.current = false;
    setComponentFocused(null);
    setIsReady(false);
    let path = `${process.env.PATH_CUSTOM_API}/channel/category?id=${
      categories[currentCategory] ? categories[currentCategory].id : '1'
    }&jwt_token=${JWT_TOKEN}&language=${language}&limit=${
      appInfos.maxElements
    }`;
    loadData(path, 'category');
    return;
  }, [currentCategory, categories]);

  useEffect(() => {
    var remainder = originalDataLength.current % appInfos.maxElements; // Est ce un multiple de appInfos.maxElements, si 0 alors oui
    if (
      isDataLoading.current === false &&
      focusedY > 1 &&
      (focusedY + 1) * 4 > originalDataLength.current - 4 &&
      originalDataLength.current >= appInfos.maxElements &&
      remainder === 0 &&
      canRetryToLoadDataRef.current
    ) {
      setTimeout(() => {
        handleScrollDynamic();
        return;
      }, 300);
    }
  }, [focusedY]);

  const handleScrollDynamic = () => {
    let path = '';
    if (searchTextRef.current && currentCategory === -1) {
      path = `${process.env.PATH_CUSTOM_API}/channel/search?q=${searchTextRef.current}&jwt_token=${JWT_TOKEN}&language=${language}&limit=${appInfos.maxElements}&offset=${originalDataLength.current}`;
    } else
      path = `${process.env.PATH_CUSTOM_API}/channel/category?id=${
        categories[currentCategory] ? categories[currentCategory].id : '1'
      }&offset=${
        originalDataLength.current
      }&jwt_token=${JWT_TOKEN}&language=${language}&limit=${
        appInfos.maxElements
      }`;
    loadData(path, 'dynamic');
    return;
  };

  const onScroll_mobile = useCallback(
    e => {
      var remainder = originalDataLength.current % appInfos.maxElements; // Est ce un multiple de appInfos.maxElements, si 0 alors oui
      const val =
        e.nativeEvent.contentOffset.y / (searchListItemWidth / 1.5 + 50 + 5);
      if (
        isDataLoading.current === false &&
        val > 2 &&
        (val + 1) * 4 > originalDataLength.current - 10 &&
        originalDataLength.current >= appInfos.maxElements &&
        remainder === 0 &&
        canRetryToLoadDataRef.current
      )
        handleScrollDynamic();
      return;
    },
    [searchListItemWidth],
  );

  useEffect(() => {
    if (!isReady) {
      setTimeout(() => {
        offsetY.value = 0;
        setFocusedY(0);
        return;
      }, 0);
    }
  }, [isReady]);

  useEffect(() => {
    return () => clearTimeout(timeoutAbordRef.current);
  }, []);

  const timeoutAbordRef = useRef(null);
  const loadData = (path, type) => {
    const controller = new AbortController();
    const signal = controller.signal;

    timeoutAbordRef.current = setTimeout(() => {
      if (!signal.aborted) {
        controller.abort();
        abortRequest(type);
      }
    }, appInfos.timeoutRequest * 1000);

    isDataLoading.current = true;

    if (type === 'dynamic') setIsDataReady(false);
    fetch(path, {signal})
      .then(res => res.json())
      .then(res => {
        if (res.status === 200) {
          isControlsAvailableRef.current = false;
          const newData = [...res.data];
          const elementPerRow = maxItem.current + 1;
          const rowsCount = Math.ceil(newData.length / elementPerRow);

          if (newData.length < appInfos.maxElements)
            canRetryToLoadDataRef.current = false;

          if (type !== 'dynamic') originalDataLength.current = newData.length;
          else
            originalDataLength.current =
              originalDataLength.current + newData.length;

          var rows = [];
          for (var i = 1; i <= rowsCount; i++) {
            const row = [
              ...newData.slice((i - 1) * elementPerRow, i * elementPerRow),
            ];
            rows.push(row);
          }

          if (type === 'dynamic') {
            dataRef.current = [...data, ...rows];
            setData([...data, ...rows]);
          } else {
            dataRef.current = rows;
            setData(rows);
          }

          if (type === 'category' && searchTextRef.current === null) {
            if (res.data.length) setComponentFocused('list');
            else setComponentFocused('categories');
          }

          isDataLoading.current = false;
          if (type === 'dynamic') setIsDataReady(true);
          else setIsReady(true);

          setTimeout(() => {
            isControlsAvailableRef.current = true;
          }, 200);
        } else if (res.status === 403) setIsConnexionTroubles(true);
        controller.abort();
      })
      .catch(e => {
        controller.abort();
        abortRequest(type);
      });
  };

  const abortRequest = type => {
    isControlsAvailableRef.current = true;
    isDataLoading.current = false;
    if (type === 'dynamic') setIsDataReady(true);
    else {
      dataRef.current = [];
      setData([]);
      setIsReady(true);
      setComponentFocused('categories');
      setIsKeyboardOpened(false);
    }

    setIsSelfConnexionTroubles(true);
  };

  const handleChangeTextSearch = useCallback(
    (text, focused) => {
      isDataLoading.current = true;
      searchTextRef.current = text;

      setCurrentCategory(-1);
      let path = `${process.env.PATH_CUSTOM_API}/channel/search?q=${text}&jwt_token=${JWT_TOKEN}&language=${language}&limit=${appInfos.maxElements}`;
      setIsReady(false);
      loadData(path, 'category');
    },
    [focusedCategory],
  );

  const onLayoutDescriptionEPG = event => {
    if (descriptionEPGWidth > 0) return;
    const {x, y, height, width} = event.nativeEvent.layout;
    setDescriptionEPGWidth(width);
  };

  const handleCategoryClicked = useCallback(
    index => {
      if (currentCategory !== index) {
        setCurrentCategory(index);
        dataRef.current = [];
        setData([]);
      } else if (data.length) setComponentFocused('list');
    },
    [currentCategory, data],
  );

  useEffect(() => {
    if (componentFocused === 'list')
      // setTimeout(() => {
      //   isControlsAvailableRef.current = true;
      //   return;
      // }, 200);
      isControlsAvailableRef.current = true;
  }, [componentFocused]);

  const handleItemClicked = useCallback(
    (xc_id, indexX, indexY) => {
      setComponentFocused('player');
      handleOpenVideoPlayer(
        data[indexY][indexX].name,
        data[indexY][indexX].stream,
      );
      handleAddChannelToHistory(xc_id);
    },
    [data],
  );

  const animatedStyleWhiteSelected = useAnimatedStyle(() => {
    return {
      marginLeft: leftMarginWhiteSelectedMovies.value,
    };
  }, []);

  const animatedStyleOffsetY = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: -offsetY.value,
        },
      ],
    };
  }, []);

  const sharedOpacity = useSharedValue(0);
  const animatedOpacity = useAnimatedStyle(() => {
    return {
      opacity: withTiming(sharedOpacity.value, {
        duration: 600,
        easing: Easing.bezier(0.4, 1, 0.4, 1),
        useNativeDriver: true,
      }),
    };
  }, []);

  const handleAddChannelToHistory = useCallback(xc_id => {
    let path = `${process.env.PATH_CUSTOM_API}/add_channel_to_history?jwt_token=${JWT_TOKEN}&xc_id=${xc_id}`;
    fetch(path)
      .then(res => res.json())
      .then(res => {
        if (res.status === 200) {
          return;
        } else setIsConnexionTroubles(true);
        isControlsAvailableRef.current = true;
      })
      .catch(() => setIsConnexionTroubles(true));
  }, []);

  const toogleFavorite = useCallback(
    (xc_id, indexX, indexY) => {
      let path = `${process.env.PATH_CUSTOM_API}/toggle_favorite?jwt_token=${JWT_TOKEN}&xc_id=${xc_id}&type=1`;
      fetch(path)
        .then(res => res.json())
        .then(res => {
          if (res.status === 200) {
            isControlsAvailableRef.current = true;
            let newData = [...data];
            newData[indexY][indexX].is_favorite = res.data;
            dataRef.current = newData;
            setData(newData);
          }
          else
          setIsConnexionTroubles(true);
        })
        .catch(() => {
          setIsConnexionTroubles(true);
        });
    },
    [data],
  );

  const components = {
    mobile: ScrollView,
    tv: Animated.View,
  };

  const SupportView = components[Platform.isTV ? 'tv' : 'mobile'];

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = searchListItemWidth / 1.5 + 50;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const Title = () => {
    return (
      <View
        style={{
          position: 'absolute',
          zIndex: 9999,
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          top: -0,
          width: (searchListItemWidth + 5) * 4,
          overflow: 'hidden',
          paddingRight: 5,
        }}>
        {categories.length ? (
          <Text
            style={[
              styles.title,
              {
                opacity: isSelfConnexionTroubles && data.length === 0 ? 0 : 1,
                // marginLeft: 40,
                zIndex: 999,
                color: `rgb(${appInfos.colors.grey1})`,
              },
            ]}>
            {categories[currentCategory]
              ? categories[currentCategory].name
              : !categories.length
              ? ''
              : `${appInfos.lang[language].data.tv.search_results_title} "${searchText}" `}
          </Text>
        ) : null}
        {(componentFocused === 'list' || !Platform.isTV) &&
        !isSelfConnexionTroubles ? (
          <View style={{flex: 1, marginLeft: 10, alignItems: 'flex-end'}}>
            <Text
              numberOfLines={1}
              style={[
                {
                  zIndex: 999,
                  fontFamily: 'Inter-Medium',
                  fontSize: 11,
                  color: `rgb(${appInfos.colors.grey4})`,
                  marginBottom: 1.5,
                },
              ]}>
              {data &&
              data[focusedY] &&
              data[focusedY][focusedX] &&
              data[focusedY][focusedX].is_favorite &&
              Platform.isTV
                ? appInfos.lang[language].data.tv.help_remove_favorite
                : !Platform.isTV
                ? appInfos.lang[language].data.tv.help_favorite_mobile
                : appInfos.lang[language].data.tv.help_add_favorite}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View
      style={{
        // paddingLeft: Platform.isTV ? 8 : 8,
        marginTop: 35,
        flexDirection: 'row',
        height: '100%',
      }}>
      <Animated.View
        style={[
          {
            width: Platform.isTV ? 250 : 225,
            height: '100%',
            marginRight: 18 + 8,
          },
          animatedOpacity,
        ]}>
        <CategoriesBar
          currentCategory={currentCategory}
          setComponentFocused={setComponentFocused}
          componentFocused={componentFocused}
          categories={categories}
          focusedCategory={focusedCategory}
          isKeyboardOpened={isKeyboardOpened}
          setIsKeyboardOpened={setIsKeyboardOpened}
          handleChangeTextSearch={handleChangeTextSearch}
          searchText={searchText}
          setSearchText={setSearchText}
          type="Channels"
          canMoveRight={data.length > 0}
          handleCategoryClicked={handleCategoryClicked}
        />
      </Animated.View>
      <View
        // onLayout={onLayoutMovies}
        style={{flex: 1, marginRight: Platform.isTV ? 0 : 0}}>
        {isSelfConnexionTroubles &&
        !isDataLoading.current &&
        data.length === 0 ? (
          <View
            style={{
              width: '100%',
              height: Dimensions.get('window').height,
              top: -36,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
            }}>
            <LostConnexionSnippet />
          </View>
        ) : null}
        {Platform.isTV ? (
          <Animated.View style={[animatedOpacity]}>
            <EpgViewer
              epg={
                data &&
                data[focusedY] &&
                data[focusedY][focusedX] &&
                data[focusedY][focusedX].epg &&
                data[focusedY][focusedX].epg[0]
                  ? data[focusedY][focusedX].epg
                  : categories.length && !isReady
                  ? null
                  : []
              }
              widthBar={`${widthBarDerived}%`}
              elementsColor={appInfos.colors.element}
              colors={appInfos.colors}
              language={language}
              lang={appInfos.lang}
              onLayoutDescriptionEPG={onLayoutDescriptionEPG}
              descriptionEPGWidth={descriptionEPGWidth}
            />
          </Animated.View>
        ) : null}
        <View
          style={{
            flex: 1,
            overflow: 'visible',
          }}>
          {componentFocused === 'list' &&
          data &&
          data.length > 0 &&
          Platform.isTV ? (
            <Animated.View
              accessible={false}
              style={[
                styles.selectedWhite,
                animatedStyleWhiteSelected,
                {
                  width: searchListItemWidth + 2,
                  height: searchListItemWidth / 1.5 + 2,
                },
              ]}></Animated.View>
          ) : null}

          {Platform.isTV ? (
            <View
              style={{
                width: (searchListItemWidth + 5) * 4,
              }}>
              <Title />
            </View>
          ) : null}

          <View
            accessible={false}
            style={[
              {
                marginTop: Platform.isTV ? 35 : -35,
                height: '100%',
                overflow: Platform.isTV ? 'hidden' : 'visible',
              },
            ]}>
            <View
              style={[
                {
                  position: Platform.isTV ? 'absolute' : 'relative',
                  flex: 1,
                  // marginBottom: !Platform.isTV ? 55 : 0,
                },
              ]}>
              {searchListItemWidth > 0 && isReady ? (
                <SupportView
                  overScrollMode="never"
                  scrollEnabled={isDataReady}
                  style={
                    Platform.isTV
                      ? animatedStyleOffsetY
                      : {
                          // marginRight: -40,
                          // paddingTop: 70,
                        }
                  }
                  onScroll={({nativeEvent}) => {
                    if (isCloseToBottom(nativeEvent)) {
                      var remainder =
                        originalDataLength.current % appInfos.maxElements; // Est ce un multiple de appInfos.maxElements, si 0 alors oui
                      if (
                        isDataLoading.current === false &&
                        originalDataLength.current >= appInfos.maxElements &&
                        remainder === 0 &&
                        canRetryToLoadDataRef.current &&
                        !isSelfConnexionTroubles
                      ) {
                        isDataLoading.current = true;
                        setTimeout(() => {
                          handleScrollDynamic();
                        }, 300);
                      }
                    }
                  }}
                  scrollEventThrottle={400}>
                  {!isDataReady && !Platform.isTV ? (
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 9999,
                        width: '100%',
                        height: '100%',
                      }}></View>
                  ) : null}
                  {!Platform.isTV && !isSelfConnexionTroubles ? (
                    <View
                      style={{
                        marginTop: 34,
                        position: 'absolute',
                        width: (searchListItemWidth + 5) * 4,
                        height: 30,
                      }}>
                      <Title />
                    </View>
                  ) : null}

                  <View
                    style={{
                      paddingTop: !Platform.isTV ? 70 : 0,
                    }}>
                    {data.map((item, index) => {
                      return (
                        <View key={index}>
                          <ListMovies
                            list={item}
                            indexRow={index}
                            MARGIN_RIGHT_ITEM={MARGIN_RIGHT_ITEM}
                            width={searchListItemWidth}
                            height={searchListItemWidth / 1.5}
                            listHeight={searchListItemWidth / 1.5 + 50}
                            role={'tv'}
                            focusedX={
                              Platform.isTV &&
                              componentFocused === 'list' &&
                              index === focusedY
                                ? focusedX
                                : -1
                            }
                            focusedY={
                              Platform.isTV &&
                              componentFocused === 'list' &&
                              index === focusedY
                                ? focusedY
                                : -1
                            }
                            handleItemClicked={handleItemClicked}
                            page={'tv'}
                            toogleFavorite={toogleFavorite}
                            colors={appInfos.colors}
                            isImagesDisplay={
                              componentFocused !== 'player'
                              //  && index < focusedY + 2 &&
                              // index > focusedY - 1
                            }
                          />
                        </View>
                      );
                    })}
                    <View
                      style={{
                        width:
                          4 * (searchListItemWidth + MARGIN_RIGHT_ITEM) - 5,
                        height: searchListItemWidth / 1.5 + 40,
                        position: 'relative',
                        // top: 98 + portraitMoviesDimensions.height + 15,
                        zIndex: 9999,
                      }}>
                      <View
                        style={{
                          zIndex: 9999,
                          width: '100%',
                          height:
                            searchListItemWidth / 1.5 +
                            (Platform.isTV ? 55 : 0),
                          position: 'relative',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        {!isDataReady ? (
                          <ActivityIndicator
                            size="large"
                            color={`rgb(${appInfos.colors.grey4})`}
                          />
                        ) : null}
                        {isSelfConnexionTroubles &&
                        !isDataLoading.current &&
                        isDataReady &&
                        data.length > 0 ? (
                          <LostConnexionSnippet />
                        ) : null}
                      </View>
                    </View>
                  </View>
                </SupportView>
              ) : categories.length && !isReady ? (
                <Animated.View
                  style={[
                    animatedOpacity,
                    animatedStyleOffsetY,
                    {
                      paddingTop: Platform.isTV ? 0 : 70,
                    },
                  ]}>
                  {!Platform.isTV ? (
                    <View
                      style={{
                        // marginLeft: -40,
                        // marginRight: 40,
                        marginTop: 34,
                        position: 'absolute',
                        width: (searchListItemWidth + 5) * 4,
                        height: 30,
                      }}>
                      <Title />
                    </View>
                  ) : null}
                  {[{}, {}, {}, {}].map((el, i) => {
                    return (
                      <View
                        key={i}
                        style={{
                          flexDirection: 'row',
                          height: searchListItemWidth / 1.5 + 50,
                          marginBottom: MARGIN_RIGHT_ITEM,
                        }}>
                        {[{}, {}, {}, {}].map((item, index) => {
                          return (
                            <View
                              key={index}
                              style={{marginRight: MARGIN_RIGHT_ITEM}}>
                              <ElementSkeleton
                                elementsColor={appInfos.colors.element}
                                width={searchListItemWidth}
                                height={searchListItemWidth / 1.5}
                                role={'tv'}
                              />
                            </View>
                          );
                        })}
                      </View>
                    );
                  })}
                </Animated.View>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  selectedWhite: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 9999,
    top: 34,
    left: -1,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
});
