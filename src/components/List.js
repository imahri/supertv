import React, {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Text,
  StyleSheet,
  View,
  Platform,
  ScrollView,
  TouchableNativeFeedback,
} from 'react-native';

import TVEventHandler from '../tools/TVEventHandler';

import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedStyle,
} from 'react-native-reanimated';
import ElementSkeleton from './skeleton/ElementSkeleton';
import RenderItem from './RenderItem';

const List = ({
  type,
  title,
  isCurrentList,
  isVisibleList,
  componentFocused,
  itemType,
  setComponentFocused,
  role,
  listHeight,
  listHeightThumbnail,
  data,
  handleOpenDetails,
  handleOpenVideoPlayer,
  handleAddChannelToHistory,
  homeListHeight,
  colors,
}) => {
  const dataRef = useRef([]);
  const offsetX = useSharedValue(0);
  const sharedOpacityList = useSharedValue(0.4);
  const isInfiniteLoopRef = useRef(false);
  const isDataReady = useRef(false);

  const [stt, setstt] = useState(false);
  const [focused, setFocused] = useState(0);

  const itemWidth = useMemo(
    () =>
      itemType === 'portrait'
        ? homeListHeight.item_portrait.width
        : homeListHeight.item_thumbnail.width,
    [homeListHeight, itemType],
  );

  const itemHeight = useMemo(
    () =>
      itemType === 'portrait'
        ? homeListHeight.item_portrait.height
        : homeListHeight.item_thumbnail.height,
    [homeListHeight, itemType],
  );


  const originalData = useRef([]);

  const LIMIT_ELEMENTS = 50;
  const MARGIN_RIGHT_ITEM = 5;

  const isCursorMoving = useRef(false);
  const maxItem = useRef(50);
  const isControlsAvailable = useRef(true);

  const _tvEventHandler = new TVEventHandler();
  const _enableTVEventHandler = () => {
    _tvEventHandler.enable(this, function (cmp, evt) {
      if (evt && evt.eventKeyAction === 0) {
        if (isCursorMoving.current === true) return;
        if (!isControlsAvailable.current) return;
        if (evt.eventType === 'select') _moveSelect();
        else if (evt.eventType === 'right') _moveRight();
        else if (evt.eventType === 'up') return;
        else if (evt.eventType === 'left') _moveLeft();
        else if (evt.eventType === 'down') return;
      }
    });
  };

  const _moveSelect = () => {
    if (dataRef.current.length === 0) return;
    handleOpenPlayer();
  };

  const _moveRight = () => {
    if (
      (focused === maxItem.current && !isInfiniteLoopRef.current) ||
      (isInfiniteLoopRef.current && focused === maxItem.current * 100)
    )
      return;

    isCursorMoving.current = true;
    setTimeout(() => (isCursorMoving.current = false), 30);
    setFocused(curr => curr + 1);
  };

  const _moveLeft = () => {
    if (
      (focused !== 0 && !isInfiniteLoopRef.current) ||
      (isInfiniteLoopRef.current &&
        !Number.isInteger(focused / originalData.current.length) &&
        data.length >= 12)
    ) {
      isCursorMoving.current = true;
      setTimeout(() => (isCursorMoving.current = false), 30);
      setFocused(curr => curr - 1);
    } else if (
      isInfiniteLoopRef.current &&
      !Number.isInteger(focused / (originalData.current.length / 2)) &&
      data.length < 12
    ) {
      isCursorMoving.current = true;
      setTimeout(() => (isCursorMoving.current = false), 30);
      setFocused(curr => curr - 1);
    } else {
      setComponentFocused('menu');
    }
  };

  const _disableTVEventHandler = () => {
    if (_tvEventHandler) {
      _tvEventHandler.disable();
    }
  };

  useEffect(() => {
    if (componentFocused === 'list' && isCurrentList && Platform.isTV)
      _enableTVEventHandler();

    return () => _disableTVEventHandler();
  });

  useEffect(() => {
    if (data && data.length) {
      if (data.length < 7 && itemType === 'thumbnail') {
        maxItem.current = data.length - 1;
      } else if (data.length < 9 && itemType === 'portrait') {
        maxItem.current = data.length - 1;
      } else {
        maxItem.current = data.length;
      }

      let newData = [...data.slice(0, LIMIT_ELEMENTS)];
      originalData.current = [...data.slice(0, LIMIT_ELEMENTS)];
      if (
        ((data.length >= 7 && itemType === 'thumbnail') ||
        (data.length >= 9 && itemType === 'portrait')) && Platform.isTV
      ) {
        isInfiniteLoopRef.current = true;
        if (data.length < 12) {
          newData = [...originalData.current, ...originalData.current];
          originalData.current = [
            ...originalData.current,
            ...originalData.current,
          ];
        }
      }
      dataRef.current = newData;
      setstt(curr => !curr);
    } else {
      originalData.current = [{}];
    }
    isDataReady.current = true;
  }, [data]);

  const listLoopIndex = useMemo(() => {
    const list = Number.isInteger(focused / originalData.current.length) // Donc premier element focused
      ? Math.ceil(focused / originalData.current.length) + 1
      : Math.ceil(focused / originalData.current.length);
    return list;
  }, [focused, data]);

  const current = useMemo(() => {
    const current =
      focused +
      originalData.current.length -
      originalData.current.length * listLoopIndex;

    return current;
  }, [focused, data]);

  useEffect(() => {
    offsetX.value = withTiming(focused * (itemWidth + MARGIN_RIGHT_ITEM), {
      duration: 600,
      easing: Easing.bezier(0.3, 1, 0.3, 1),
      useNativeDriver: true,
    });
  }, [focused, data]);

  useEffect(() => {
    sharedOpacityList.value =
      (isCurrentList && componentFocused === 'list' && isDataReady.current) ||
      !isDataReady.current ||
      !Platform.isTV
        ? 1
        : 0.4;
  }, [isCurrentList, componentFocused]);

  const handleOpenPlayer = index => {
    const value = Platform.isTV ? current : index;
    if (type !== 1) {
      let detailsType =
        type === 3 || dataRef.current[value].type === 3 ? 'Series' : 'Movies';
      handleOpenDetails(dataRef.current[value].xc_id, detailsType);
    } else {
      handleOpenVideoPlayer(
        dataRef.current[value].title,
        dataRef.current[value].stream,
      );
      handleAddChannelToHistory(dataRef.current[value].xc_id);
      setComponentFocused('player');
      // setFocused(0);
    }
  };

  const animatedFlatList = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: -offsetX.value,
        },
      ],
    };
  }, []);

  const sharedOpacity = useAnimatedStyle(() => {
    return {
      opacity: withTiming(sharedOpacityList.value, {
        duration: 600,
        easing: Easing.bezier(0.3, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    };
  }, []);

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
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: itemType === 'thumbnail' ? listHeightThumbnail : listHeight,
          marginRight: 0,
        },
        Platform.isTV ? sharedOpacity : null,
      ]}>
      <Text
        accessible={false}
        style={[
          styles.title,
          {
            color: `rgb(${colors.grey1})`,
            height: 24,
            paddingLeft: 40,
            // opacity: isCurrentList && componentFocused === 'list' ? 1 : 0.4,
          },
        ]}>
        {title}
      </Text>
      <SupportView
        horizontal
        style={[
          Platform.isTV
            ? {
                flexDirection: 'row',
                paddingLeft: 40,
              }
            : {
                paddingLeft: 40,
                flexDirection: 'row',
                flex: 1,
                marginBottom: -30,
              },
          Platform.isTV ? animatedFlatList : null,
        ]}>
        {(data && data.length
          ? dataRef.current
          : itemType === 'thumbnail'
          ? [{}, {}, {}, {}, {}, {}]
          : [{}, {}, {}, {}, {}, {}, {}, {}]
        ).map((item, index) => {
          if (item.name) {
            return (
              <View key={index} style={{
                marginRight:
                  originalData.current.length === index + 1 &&
                  !Platform.isTV
                    ? 80
                    : MARGIN_RIGHT_ITEM,}}> 
                <SupportElementView
                  onPress={item.xc_id ? () => handleOpenPlayer(index) : null}
                  style={[
                    {
                      transform:
                        isInfiniteLoopRef.current && Platform.isTV
                          ? [
                              {
                                translateX:
                                  index < current - 5
                                    ? originalData.current.length *
                                      listLoopIndex *
                                      (itemWidth + MARGIN_RIGHT_ITEM)
                                    : originalData.current.length *
                                      (listLoopIndex - 1) *
                                      (itemWidth + MARGIN_RIGHT_ITEM),
                              },
                            ]
                          : [],
                    },
                  ]}
                  >
                  <View>
                    <RenderItem
                      item={item}
                      isDark={
                        (index < current ||
                          (isInfiniteLoopRef.current &&
                            data.length < 12 &&
                            index >= data.length &&
                            current < data.length)) &&
                        Platform.isTV
                      }
                      itemWidth={itemWidth}
                      MARGIN_RIGHT_ITEM={MARGIN_RIGHT_ITEM}
                      itemHeight={itemHeight}
                      role={role}
                      colors={colors}
                      isFocused={
                        role === 'tv' &&
                        isCurrentList &&
                        componentFocused === 'list' &&
                        current === index &&
                        Platform.isTV
                      }
                      isHidingOnChangingLoop={
                        (index === data.length - 1 ||
                          index === data.length - 2) &&
                        (current === data.length ||
                          current === data.length + 1) &&
                        isInfiniteLoopRef.current &&
                        data.length <= 12 &&
                        Platform.isTV
                      }
                      isImagesDisplay={
                        true
                        // (componentFocused !== 'player' &&
                        //   ((index > current - 6 &&
                        //     index < current + 11 &&
                        //     itemType === 'portrait') ||
                        //     (index > current - 4 &&
                        //       index < current + 8 &&
                        //       itemType === 'thumbnail') ||
                        //     (index < 11 &&
                        //       index < 11 - (data.length - current) &&
                        //       itemType === 'portrait') ||
                        //     (index < 8 &&
                        //       index < 8 - (data.length - current) &&
                        //       itemType === 'thumbnail')) &&
                        //   isVisibleList) ||
                        // !Platform.isTV
                      }
                      itemEPGLenght={item.epg ? item.epg.length : 0}
                      isLast={
                        originalData.current.length === index + 1 &&
                        !Platform.isTV
                      }
                    />
                  </View>
                </SupportElementView>
              </View>
            );
          } else {
            return (
              <View
                key={index}
                style={{
                  flexDirection: 'column',
                  marginRight: MARGIN_RIGHT_ITEM,
                }}>
                <ElementSkeleton
                  elementsColor={colors.element}
                  width={itemWidth}
                  height={itemHeight}
                  role={role}
                />
              </View>
            );
          }
        })}
      </SupportView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    color: 'rgb(200,200,200)',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 10,
  },
  carousel: {
    flex: 1,
  },
});

export default memo(List);
