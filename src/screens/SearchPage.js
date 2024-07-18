import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Text,
  StyleSheet,
  View,
  BackHandler,
  ScrollView,
  TouchableNativeFeedback,
  Platform,
  ActivityIndicator,
  Dimensions,
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
import ElementSkeleton from '../components/skeleton/ElementSkeleton';
import LostConnexionSnippet from '../components/LostConnexionSnippet';

const SearchPage = ({
  componentFocused,
  setComponentFocused,
  handleOpenDetails,
  type,
}) => {
  const {
    JWT_TOKEN,
    language,
    appInfos,
    setIsConnexionTroubles,
    searchListItemWidth,
  } = useContext(AuthContext);

  const MARGIN_RIGHT_ITEM = 5;
  const isControlsAvailableRef = useRef(true);
  const isCursorMoving = useRef(false);
  const maxItem = useRef(3);
  const originalDataLength = useRef(0);
  const isDataLoading = useRef(false);

  const leftMarginWhiteSelectedMovies = useSharedValue(0);
  const offsetY = useSharedValue(1);


  const [categories, setCategories] = useState([]);
  const [focusedCategory, setFocusedCategory] = useState(-2);
  const [currentCategory, setCurrentCategory] = useState(-2);
  const [isKeyboardOpened, setIsKeyboardOpened] = useState(false);
  const [data, setData] = useState([]);
  const [focusedX, setFocusedX] = useState(0);
  const [focusedY, setFocusedY] = useState(0);
  const [searchText, setSearchText] = useState('');

  const [isSelfConnexionTroubles, setIsSelfConnexionTroubles] = useState(false);

  const [isDataReady, setIsDataReady] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const searchTextRef = useRef(null);
  const canRetryToLoadDataRef = useRef(true);

  // console.log('rendu movies');

  useEffect(() => {
    const backAction = () => {
      if (!Platform.isTV) setComponentFocused('menu');
      else if (componentFocused === 'list') setComponentFocused('categories');
      else {
        setComponentFocused('menu');
        setFocusedX(0);
      }
      return true;
    };

    const canInit =
      componentFocused !== 'menu' &&
      componentFocused !== 'details' &&
      componentFocused !== 'player' &&
      componentFocused !== 'episodes' &&
      componentFocused !== 'exit' &&
      (componentFocused !== null || !Platform.isTV);

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      canInit ? backAction : () => null,
    );

    return () => backHandler.remove();
  }, [componentFocused]);

  const _tvEventHandler = new TVEventHandler();
  const _enableTVEventHandler = () => {
    _tvEventHandler.enable(this, function (cmp, evt) {
      if (!evt || evt.eventKeyAction !== 0) return;
      if (!isControlsAvailableRef.current) return;
      if (isCursorMoving.current) return;
      if (evt.eventType === 'select') return _moveSelect();
      else if (evt.eventType === 'right') return _moveRight();
      else if (evt.eventType === 'up') return _moveUp();
      else if (evt.eventType === 'left') return _moveLeft();
      else if (evt.eventType === 'down') return _moveDown();
    });
  };

  const _moveSelect = () => {
    handleItemClicked(data[focusedY][focusedX].xc_id);
  };

  const _moveUp = () => {
    if (focusedY === 0) return;
    isCursorMoving.current = true;
    setTimeout(() => {
      isCursorMoving.current = false;
    }, 30);
    moveFocusY(focusedY - 1);
  };

  const _moveDown = () => {
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
  };

  const _moveLeft = () => {
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

  const _moveRight = () => {
    if (
      focusedX === maxItem.current ||
      (focusedY + 1) * 4 - maxItem.current + focusedX ===
        originalDataLength.current
    )
      return;
    isCursorMoving.current = true;
    setTimeout(() => {
      isCursorMoving.current = false;
    }, 5);
    setFocusedX(curr => curr + 1);
  };

  const moveFocusY = newY => {
    let valueToScroll = (searchListItemWidth * 1.5 + 5) * newY;

    offsetY.value = withTiming(valueToScroll, {
      duration: 600,
      easing: Easing.bezier(0.3, 1, 0.3, 1),
      useNativeDriver: true,
    });
    setFocusedY(newY);
  };

  const _disableTVEventHandler = () => {
    if (_tvEventHandler) {
      _tvEventHandler.disable();
    }
  };

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
    setData([]);
    setCategories([]);
    setFocusedCategory(-2);
    setCurrentCategory(-2);
    setIsKeyboardOpened(false);
    const controller = new AbortController();
    const signal = controller.signal;

    timeoutAbordCategoriesRef.current = setTimeout(() => {
      if (!signal.aborted) {
        controller.abort();
        setComponentFocused('menu');
        setIsConnexionTroubles(true);
      }
    }, appInfos.timeoutRequest * 1000);

    path = `${process.env.PATH_CUSTOM_API}/${type}/get_categories?jwt_token=${JWT_TOKEN}&language=${language}`; // type = movie ou series
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
        } else setIsConnexionTroubles(true);
      })
      .catch(e => {
        controller.abort();
        setComponentFocused('menu');
        clearTimeout(timeoutAbordCategoriesRef.current);
        setIsConnexionTroubles(true);
      });
    return () => clearTimeout(timeoutAbordCategoriesRef.current);
  }, [type]);

  useEffect(() => {
    if (categories.length) sharedOpacity.value = 1;
  }, [categories]);

  useEffect(() => {
    if (currentCategory < 0) return;
    if (categories.length === 0) return;
    canRetryToLoadDataRef.current = true;
    searchTextRef.current = null;
    setIsSelfConnexionTroubles(false);
    isControlsAvailableRef.current = false;
    setComponentFocused(null);
    setIsReady(false);
    let path = `${process.env.PATH_CUSTOM_API}/${type}/category?id=${
      categories[currentCategory] ? categories[currentCategory].id : '992'
    }&jwt_token=${JWT_TOKEN}&language=${language}&limit=${
      appInfos.maxElements
    }`;
    loadData(path, 'category');
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
      // setTimeout(() => {
        handleScrollDynamic();
      // }, 300);
    }
  }, [focusedY]);

  const handleScrollDynamic = () => {
    let path = '';
    if (searchTextRef.current && currentCategory === -1) {
      path = `${process.env.PATH_CUSTOM_API}/${type}/search?q=${searchTextRef.current}&jwt_token=${JWT_TOKEN}&language=${language}&limit=${appInfos.maxElements}&offset=${originalDataLength.current}`;
    } else
      path = `${process.env.PATH_CUSTOM_API}/${type}/category?id=${
        categories[currentCategory] ? categories[currentCategory].id : '992'
      }&offset=${
        originalDataLength.current
      }&jwt_token=${JWT_TOKEN}&language=${language}&limit=${
        appInfos.maxElements
      }`;
    loadData(path, 'dynamic');
  };

  const onScroll_mobile = e => {
    var remainder = originalDataLength.current % appInfos.maxElements; // Est ce un multiple de appInfos.maxElements, si 0 alors oui
    const val = e.nativeEvent.contentOffset.y / (searchListItemWidth * 1.5 + 5);
    if (
      isDataLoading.current === false &&
      val > 2 &&
      (val + 1) * 4 > originalDataLength.current - 4 &&
      originalDataLength.current >= appInfos.maxElements &&
      remainder === 0 &&
      canRetryToLoadDataRef.current
    )
      handleScrollDynamic();
  };

  useEffect(() => {
    if (!isReady) {
      setTimeout(() => {
        offsetY.value = 0;
        setFocusedY(0);
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

          if (type === 'dynamic') setData([...data, ...rows]);
          else setData(rows);

          if (type === 'category' && searchTextRef.current === null) {
            if (res.data.length) setComponentFocused('list');
            else setComponentFocused('categories');
          }

          if (type === 'dynamic') setIsDataReady(true);
          else setIsReady(true);

          isDataLoading.current = false;
          setTimeout(() => {
            isControlsAvailableRef.current = true;
          }, 200);
        } else if (res.status === 403) return setIsConnexionTroubles(true);
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
      setData([]);
      setIsReady(true);
      setComponentFocused('categories');
      setIsKeyboardOpened(false);
    }
    setIsSelfConnexionTroubles(true);
  };

  const handleChangeTextSearch = (text, focused) => {
    isDataLoading.current = true;
    searchTextRef.current = text;
    setCurrentCategory(-1);
    let path = `${process.env.PATH_CUSTOM_API}/${type}/search?q=${text}&jwt_token=${JWT_TOKEN}&language=${language}&limit=${appInfos.maxElements}`;
    setIsReady(false);
    loadData(path, 'category');
  };

  //   const onLayoutMovies = event => {
  //     if (isReady) return;
  //     const {x, y, height, width} = event.nativeEvent.layout;

  //     const portraitItem_width = width / 4.38;
  //     const portraitItem_height = portraitItem_width * 1.5;
  //     const newDimensions = {
  //       width: portraitItem_width,
  //       height: portraitItem_height,
  //     };
  //     setPortraitMoviesDimensions(newDimensions);
  //     setListHeight(parseInt(portraitItem_height));
  //   };

  const handleCategoryClicked = useCallback(
    index => {
      if (currentCategory !== index) setCurrentCategory(index);
      else if (data.length) setComponentFocused('list');
    },
    [currentCategory, data],
  );

  useEffect(() => {
    if (componentFocused === 'list') isControlsAvailableRef.current = true;
  }, [componentFocused]);

  const handleItemClicked = useCallback(
    xc_id => {
      if (Platform.isTV) isControlsAvailableRef.current = false;
      handleOpenDetails(xc_id, type === 'movie' ? 'Movies' : 'Series');
    },
    [type],
  );

  const animatedStyleWhiteSelected = useAnimatedStyle(() => {
    return {
      marginLeft: leftMarginWhiteSelectedMovies.value,
    };
  });

  const animatedStyleOffsetY = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: -offsetY.value,
        },
      ],
    };
  });

  const components = {
    mobile: ScrollView,
    tv: Animated.View,
  };

  const SupportView = components[Platform.isTV ? 'tv' : 'mobile'];

  const componentsElement = {
    mobile: TouchableNativeFeedback,
    tv: View,
  };
  const SupportElementView = componentsElement[Platform.isTV ? 'tv' : 'mobile'];

  const sharedOpacity = useSharedValue(0);
  const animatedOpacity = useAnimatedStyle(() => {
    return {
      opacity: withTiming(sharedOpacity.value, {
        duration: 100,
        easing: Easing.bezier(1, 1, 1, 1),
        useNativeDriver: true,
      }),
    };
  });

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = searchListItemWidth * 1.5;
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  const Title = () => {
    return (
      <View style={{position: 'absolute', zIndex: 999}}>
        {categories.length ? (
          <Text
            style={[
              styles.title,
              {
                opacity: isSelfConnexionTroubles && data.length === 0 ? 0 : 1,
                marginLeft: 40,
                zIndex: 999,
                color: `rgb(${appInfos.colors.grey1})`,
                height: 24,
              },
            ]}>
            {categories[currentCategory]
              ? categories[currentCategory].name
              : !categories.length
              ? ''
              : `${appInfos.lang[language].data.tv.search_results_title} "${searchText}" `}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <View
      style={{
        marginRight: 40,
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
          // setCurrentCategory={setCurrentCategory}
          isKeyboardOpened={isKeyboardOpened}
          setIsKeyboardOpened={setIsKeyboardOpened}
          handleChangeTextSearch={handleChangeTextSearch}
          searchText={searchText}
          setSearchText={setSearchText}
          type={type === 'movie' ? 'Movies' : 'Series'}
          canMoveRight={data.length > 0}
          handleCategoryClicked={handleCategoryClicked}
        />
      </Animated.View>
      <View style={{flex: 1}}>
        {componentFocused === 'list' && data.length && Platform.isTV ? (
          <Animated.View
            style={[
              styles.selectedWhite,
              animatedStyleWhiteSelected,
              {
                width: searchListItemWidth + 2,
                height: searchListItemWidth * 1.5 + 2,
              },
            ]}></Animated.View>
        ) : null}
        {Platform.isTV ? (
          <View
            style={{
              marginLeft: -40,
              zIndex: 999,
              // marginTop: 34,
              // position: 'absolute',
              // width: '100%',
            }}>
            <Title />
          </View>
        ) : null}
        <View
          style={[
            {
              position: Platform.isTV ? 'absolute' : 'relative',
              marginTop: Platform.isTV ? 35 : -35,
              // paddingTop: Platform.isTV ? 98 : 0,
              zIndex: 998,
            },
          ]}>
          {isSelfConnexionTroubles &&
          !isDataLoading.current &&
          data.length === 0 ? (
            <View
              style={{
                width:
                  Dimensions.get('window').width -
                  (Platform.isTV ? 250 : 225) -
                  70,
                height: Dimensions.get('window').height,
                top: 71 - 36,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
              }}>
              <LostConnexionSnippet />
            </View>
          ) : null}
          <View
            style={
              {
                //   paddingLeft: 40,
              }
            }>
            {isReady ? (
              <SupportView
                overScrollMode="never"
                scrollEnabled={isDataReady}
                style={
                  Platform.isTV
                    ? animatedStyleOffsetY
                    : {
                        marginRight: -40,
                        // paddingTop: Platform.isTV ? 0 : 98,
                      }
                }
                onScroll={({nativeEvent}) => {
                  if (isCloseToBottom(nativeEvent) && !isDataLoading.current) {
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
                      // setTimeout(() => {
                        handleScrollDynamic();
                      // }, 300);
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
                {!Platform.isTV ? (
                  <View
                    style={{
                      marginLeft: -40,
                      marginTop: 34,
                      position: 'absolute',
                      width: '100%',
                    }}>
                    <Title />
                  </View>
                ) : null}
                <View
                  style={{
                    paddingTop: Platform.isTV ? 0 : 70,
                  }}>
                  {data.map((item, index) => {
                    return (
                      <View key={index}>
                        <View>
                          <ListMovies
                            list={item}
                            indexRow={index}
                            isLastList={
                              Platform.isTV && data.length - 1 === index
                            }
                            MARGIN_RIGHT_ITEM={MARGIN_RIGHT_ITEM}
                            width={searchListItemWidth}
                            height={searchListItemWidth * 1.5}
                            isDark={index < focusedY}
                            listHeight={searchListItemWidth * 1.5}
                            handleItemClicked={handleItemClicked}
                            colors={appInfos.colors}
                            isImagesDisplay={
                              (componentFocused !== 'player' &&
                                index < focusedY + 5 &&
                                index > focusedY - 4) ||
                              !Platform.isTV
                            }
                          />
                        </View>
                      </View>
                    );
                  })}
                  <View
                    style={{
                      width: 4 * (searchListItemWidth + MARGIN_RIGHT_ITEM) - 5,
                      height: searchListItemWidth * 1.5 + 40,
                      position: 'relative',
                      zIndex: 9999,
                    }}>
                    <View
                      style={{
                        zIndex: 9999,
                        width: '100%',
                        height:
                          searchListItemWidth * 1.5 + (Platform.isTV ? 40 : 0),

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
                  {paddingTop: Platform.isTV ? 0 : 70},
                ]}>
                {!Platform.isTV ? (
                  <View
                    style={{
                      marginLeft: -40,
                      marginTop: 34,
                      position: 'absolute',
                      width: '100%',
                    }}>
                    <Title />
                  </View>
                ) : null}
                {[{}, {}, {}].map((el, index) => {
                  return (
                    <View
                      key={index}
                      style={{
                        flexDirection: 'row',
                        height: searchListItemWidth * 1.5,
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
                              height={searchListItemWidth * 1.5}
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
  );
};

const styles = StyleSheet.create({
  selectedWhite: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 999,
    top: 34,
    left: -0.8,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 0,
  },
});

export default SearchPage;
