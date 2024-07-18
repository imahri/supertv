import {memo, useEffect} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const CategoryItemEpisode = ({
  season,
  isFocused,
  isSelected,
  dataLength,
  isDark,
  appInfos,
  language,
}) => {
  const sharedOpacityColors = useSharedValue(appInfos.colors.opacity);

  useEffect(() => {
    const value = isDark ? appInfos.colors.opacity : 1;

    sharedOpacityColors.value = value;
  }, [isDark]);

  const animatedText = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isDark ? sharedOpacityColors.value : 1, {
        duration: 400,
        easing: Easing.bezier(0.3, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    };
  }, [isDark]);

  const capitalize = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const componentsElement = {
    mobile: TouchableNativeFeedback,
    tv: View,
  };
  const SupportElementView = componentsElement[Platform.isTV ? 'tv' : 'mobile'];

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
      }}>
      {/* <SupportElementView onPress={() => handleSeasonClick()}> */}
        <View>
          <Animated.Text
            style={[
              Platform.isTV ? animatedText : null,
              styles.title,
              {
                fontFamily:
                  isFocused || isSelected ? 'Inter-ExtraBold' : 'Inter-Medium',
                color:
                  (isFocused && Platform.isTV) || (isSelected && !Platform.isTV)
                    ? `rgb(${appInfos.colors.main})`
                    : `rgb(${appInfos.colors.grey3})`,
              },
            ]}>
            {capitalize(appInfos.lang[language].data.details.season_label)}{' '}
            {season}
          </Animated.Text>
        </View>
      {/* </SupportElementView> */}
      {isFocused || (isSelected && Platform.isTV) ? (
        <Text
          style={[
            {
              color: `rgb(${appInfos.colors.grey3})`,
              marginLeft: 15,
              fontFamily: 'Inter-Medium',
              fontSize: 14,
              marginTop: 5,
              marginRight: Platform.isTV ? 60 : 0,
              // opacity: appInfos.colors.opacity
            },
          ]}>
          {dataLength}{' '}
          {dataLength > 1
            ? appInfos.lang[language].data.details.episodes_label
            : appInfos.lang[language].data.details.episode_label}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    marginVertical: 5,
  },
});

export default memo(CategoryItemEpisode);
