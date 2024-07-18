import React, {memo, useEffect, useMemo} from 'react';
import {Platform, TouchableNativeFeedback, View} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Item from './Item';

const ListMovies = ({
  indexRow,
  list,
  MARGIN_RIGHT_ITEM,
  width,
  height,
  isDark,
  listHeight,
  focusedX,
  focusedY,
  role,
  handleItemClicked,
  page,
  toogleFavorite,
  colors,
  isImagesDisplay,
}) => {

  const sharedOpacityList = useSharedValue(1);

  const animatedList = useAnimatedStyle(() => {
    return {
      opacity: withTiming(sharedOpacityList.value, {
        duration: 400,
        easing: Easing.bezier(0.4, 1, 0.4, 1),
        useNativeDriver: true,
      }),
    };
  }, []);

  useEffect(() => {
    if (isDark === undefined) return;
    sharedOpacityList.value = isDark ? 0.3 : 1;
    return;
  }, [isDark]);

  const componentsElement = {
    mobile: TouchableNativeFeedback,
    tv: View,
  };

  const SupportElementView = useMemo(() => {
    return componentsElement[Platform.isTV ? 'tv' : 'mobile'];
  }, []);

  return (
    <Animated.View
      style={[
        {
          height: listHeight,
          flex: 1,
          flexDirection: 'row',
          marginBottom: MARGIN_RIGHT_ITEM,
        },
        page !== 'tv' ? animatedList : null,
      ]}>
      {list.map((item, index) => {
        return (
          <SupportElementView
            key={index}
            onPress={() =>
              handleItemClicked(
                list[index].xc_id,
                role === 'tv' ? index : null,
                role === 'tv' ? indexRow : null,
              )
            }
            onLongPress={() =>
              page === 'tv' && !Platform.isTV
                ? toogleFavorite(list[index].xc_id, index, indexRow)
                : null
            }>
            <View style={{marginRight: MARGIN_RIGHT_ITEM}}>
              <Item
                width={width}
                height={height}
                item={item}
                is_favorite={item.is_favorite}
                itemEPGLenght={item.epg ? item.epg.length : 0}
                isNotDarkBackground={true}
                backgroundIntensity={'strong'}
                isFocused={
                  role === 'tv' && focusedX === index && focusedY === indexRow
                }
                page={page}
                mainColor={colors.main}
                elementsColor={colors.element}
                colors={colors}
                isImagesDisplay={isImagesDisplay}
              />
            </View>
          </SupportElementView>
        );
      })}
    </Animated.View>
  );
};

export default memo(ListMovies);
