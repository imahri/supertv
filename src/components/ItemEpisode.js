import {memo, useEffect} from 'react';
import {Platform, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import CustomFastImage from './utils/CustomFastImage';

const ItemEpisode = ({
  item,
  isDark,
  width,
  height,
  language,
  appInfos,
  position,
  duration,
  isImagesDisplay,
}) => {
  const itemOpacity = useSharedValue(1);

  useEffect(() => {
    if (isDark) {
      itemOpacity.value = appInfos.colors.opacity;
    } else itemOpacity.value = 1;
  }, [isDark]);

  const animatedItemOpacity = useAnimatedStyle(() => {
    return {
      opacity: withTiming(itemOpacity.value, {
        duration: 300,
        easing: Easing.bezier(1, 1, 1, 1),
        useNativeDriver: true,
      }),
    };
  }, []);
  
  return (
    <Animated.View
      style={[
        animatedItemOpacity,
        {
          flexDirection: 'row',
          marginBottom: 0,
          width: '100%',
        },
      ]}>
      <CustomFastImage
        isDisplayed={isImagesDisplay}
        style={{
          width: width,
          height: height,
          position: 'relative',
          backgroundColor: `rgb(${appInfos.colors.element})`,
        }}
        uri={item.thumbnail}
        page={'episode'}
        role={null}>
        <View
          style={{
            width: '100%',
            position: 'absolute',
            bottom: -1,
            height: position ? 70 : 50,
          }}>
          <LinearGradient
            accessible={false}
            style={{
              width: '100%',
              position: 'relative',
              height: '100%',
              // backgroundColor: "rgba(0,0,0,.1)",
            }}
            end={{x: 0.5, y: 1}}
            start={{x: 0.5, y: 0}}
            colors={[`rgba(0,0,0, 0)`, `rgba(0,0,0, .9)`]}>
            <Text
              style={{
                color: `rgb(${appInfos.colors.grey2})`,
                fontFamily: 'Inter-SemiBold',
                fontSize: 13,
                position: 'absolute',
                bottom: position ? 15 : 7,
                // paddingLeft: 10,
                  width: '92%', 
                alignSelf: 'center',
              }}>
              {appInfos.lang[language].data.details.season_short_label}
              {/* {Object.keys(serieData)[currentSeason]} :{' '} */}
              {item.season_number} :{' '}
              {appInfos.lang[language].data.details.episode_short_label}
              {item.episode_number}{' '}
            </Text>

            {position ? (
              <View
                style={{
                  height: 3,
                  width: '92%', 
                  backgroundColor: 'rgb(60,60,60)',
                  position: 'absolute',
                  bottom: 8,
                  alignSelf: 'center',
                  overflow: 'hidden',
                }}>
                <View
                  style={{
                    backgroundColor: `rgb(${appInfos.colors.main})`,
                    height: '100%',
                    width: `${
                      item && position && duration
                        ? (position / duration) * 100
                        : 0
                    }%`,
                  }}></View>
              </View>
            ) : null}
          </LinearGradient>
        </View>
      </CustomFastImage>
      <View
        style={{
          paddingLeft: 15,
          paddingRight: 35,
          flex: 1,
          // paddingTop: 13,
        }}>
        <Text
          numberOfLines={1}
          style={{
            color: `rgb(${appInfos.colors.grey1})`,
            fontFamily: 'Inter-SemiBold',
            marginBottom: 5,
          }}>
          {item.name ? item.name : 'Episode ' + item[0]}
        </Text>
        {item.overview && item.overview.length > 0 ? (
          <Text
            numberOfLines={Platform.isTV ? 4 : 2}
            style={{
              color: `rgb(${appInfos.colors.grey2})`,
              fontFamily: 'Inter-Medium',
              fontSize: 12,
              lineHeight: 17,
              marginBottom: 5,
            }}>
            {item.overview}
          </Text>
        ) : null}
        <Text
          style={{
            color: `rgb(${appInfos.colors.grey4})`,
            fontFamily: 'Inter-Medium',
            fontSize: 13,
          }}>
          ({Math.ceil(item.runtime)} {appInfos.lang[language].data.details.minutes_short_label})
        </Text>
      </View>
    </Animated.View>
  );
};

export default memo(ItemEpisode);
