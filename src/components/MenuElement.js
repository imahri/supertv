import React, {
  memo,
  useEffect,
} from 'react';
import {View, StyleSheet, Platform, Text, PixelRatio} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const MenuElement = ({
  item,
  isFirst,
  setItemHeight,
  status,colors
}) => {

  const sharedOpacityColors = useSharedValue(colors.opacity);

  useEffect(() => {
    const value =
      status === "dark"
        ? colors.opacity
        : 1;

    sharedOpacityColors.value = value
  }, [status]);

  const onLayout = event => {
    if (isFirst) {
      const {x, y, height, width} = event.nativeEvent.layout;
      setItemHeight(height);
    }
  };

  // const onLayoutText = (event) => {
  //   const { x, y, height, width } = event.nativeEvent.layout;
  //   setTextWidth(width);
  // };

  const animatedText = useAnimatedStyle(() => {
    return {
      opacity: withTiming(status === "dark" ? sharedOpacityColors.value : 1, {
        duration: 400,
        easing: Easing.bezier(0.3, 1, 0.3, 1),
        useNativeDriver: true,
      })
    };
  },[status]);

  return (
    <View accessible={false} onLayout={onLayout}>
      <View accessible={false} style={[styles.item]}>
        <Animated.View style={Platform.isTV ? animatedText : null}>
          {React.cloneElement(item.icon, {
            color:
              status === 'focus' && item.id === 'Gain'
              ? `rgb(${colors.secondary})`
                : status === 'focus'
                ? `rgb(${colors.main})`
                : status === 'selected' && !Platform.isTV
                ? `rgb(${colors.main})`
                : `rgb(${colors.grey3})`,
            // position: "absolute",
            width: item.id === 'Gain' ? 19 : 16,
            height: item.id === 'Gain' ? 19 : 16,
            marginLeft: item.id === "Gain" ? -1.8 : 0
          })}
        </Animated.View>

        <Animated.Text
          // onLayout={onLayoutText}
          accessible={false}
          style={[
            styles.title,
            
            Platform.isTV ? animatedText : null,
            {
              fontSize:Platform.isTV ? 25 : 20,
              color:
                status === 'focus' && item.id === 'Gain'
                  ? `rgb(${colors.secondary})`
                  : status === 'focus'
                  ? `rgb(${colors.main})`
                  : status === 'selected' && !Platform.isTV
                  ? `rgb(${colors.main})`
                  : `rgb(${colors.grey3})`,
              textAlign: 'left',
              fontFamily:
                status === 'focus' || status === 'selected'
                  ? 'Inter-ExtraBold'
                  : 'Inter-Medium',
              marginLeft: item.id === 'Gain' ? -0.2 : 1,
              fontWeight: "800"
            },
          ]}>
          {item.name}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    paddingVertical: 7.5,
    paddingLeft: 0,
    paddingRight: 0,
    width: 250,
    marginLeft: 23,
    marginVertical: 1,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
  },
  itemFocused: {
    borderLeftWidth: 2,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    // fontSize: 15,
    //   color: "rgb(165,165,165)",
    paddingLeft: 24,
  },
  titleFocus: {
    fontFamily: 'Inter-SemiBold',
    //   color: "rgba(28,241,255, 1)",
    fontSize: 14,
  },
});

export default memo(MenuElement);

