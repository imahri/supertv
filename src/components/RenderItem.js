import {memo, useEffect} from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Item from './Item';

const RenderItem = ({
  item,
  isDark,
  itemWidth,
  MARGIN_RIGHT_ITEM,
  itemHeight,
  role,
  colors,
  isDarkBackground,
  isFocused,
  isHidingOnChangingLoop,
  isImagesDisplay,
  itemEPGLenght,
  isLast
}) => {
  const sharedItemOpacity = useSharedValue(1);
  useEffect(() => {
    if (isDark) sharedItemOpacity.value = 0.5;
    else sharedItemOpacity.value = 1;
  }, [isDark]);

  const animatedItemOpacity = useAnimatedStyle(() => {
    return {
      opacity: withTiming(sharedItemOpacity.value, {
        duration: 600,
        easing: Easing.bezier(0.3, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    };
  }, [sharedItemOpacity.value]);
  
  return (
    <Animated.View style={[animatedItemOpacity]}>
      <Item
        width={itemWidth}
        height={itemHeight}
        item={item}
        isFocused={isFocused}
        isDarkBackground={isDarkBackground}
        isNotDarkBackground={true}
        MARGIN_RIGHT_ITEM={MARGIN_RIGHT_ITEM}
        role={role}
        isHidingOnChangingLoop={isHidingOnChangingLoop}
        itemEPGLength={item.epg && item.epg.length}
        colors={colors}
        isImagesDisplay={isImagesDisplay}
        itemEPGLenght={itemEPGLenght}
        isLast={isLast}
      />
    </Animated.View>
  );
};

export default memo(RenderItem);
