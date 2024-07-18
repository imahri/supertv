import {memo, useContext, useEffect, useState} from 'react';
import {Platform, TouchableNativeFeedback, View} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {AuthContext} from '../global/context';

import {BlurView} from '@react-native-community/blur';

import FAIcon from 'react-native-vector-icons/FontAwesome';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';

import BackPlaySVG from '../assets/icons/backPlay.svg';
import EpisodesSVG from '../assets/icons/episodes.svg';

const DetailsNavBar = ({
  focused,
  animatedStyleOpacityWhenDescDisplayed,
  buttonsNeeded,
  isFavorite,
  type,
  handleClick,
}) => {
  const {language, appInfos} = useContext(AuthContext);
  const sharedLeftMarginBorder = useSharedValue(0);
  const sharedOpacityLabelNavBar = useSharedValue(0);
  const [widthNavBar, setWidthNavBar] = useState(0);

  useEffect(() => {
    sharedOpacityLabelNavBar.value = 0;
    if (focused === 'back') return;

    let valueToScroll =
      (buttonsNeeded.findIndex(el => el === focused) - 1) * 50;

    if (isButtonExist('continue'))
      valueToScroll = valueToScroll + (focused !== 'continue' ? 0 : 3.35);
    else {
      if (focused !== 'play')
        valueToScroll = valueToScroll + (type === 'Movies' ? 0 : 4);
      else valueToScroll = valueToScroll + 3.35;
    }
    sharedLeftMarginBorder.value = withTiming(valueToScroll, {
      duration: 500,
      easing: Easing.bezier(0.2, 1, 0.2, 1),
      useNativeDriver: true,
    });

    sharedOpacityLabelNavBar.value = withTiming(1, {
      duration: 500,
      easing: Easing.bezier(0.2, 1, 0.2, 1),
      useNativeDriver: true,
    });
  }, [focused]);

  const isButtonExist = button => {
    const index = buttonsNeeded.findIndex(el => el === button);
    return index === -1 ? false : true;
  };

  const animatedStyleTopBorder = useAnimatedStyle(() => {
    return {
      left: sharedLeftMarginBorder.value,
    };
  });

  const animatedStyleOpacityLabelNavBar = useAnimatedStyle(() => {
    return {
      opacity: sharedOpacityLabelNavBar.value,
    };
  });

  const onLayoutNavBar = event => {
    const {x, y, height, width} = event.nativeEvent.layout;
    setWidthNavBar(width);
  };

  const componentsElement = {
    mobile: TouchableNativeFeedback,
    tv: View,
  };
  const SupportElementView = componentsElement[Platform.isTV ? 'tv' : 'mobile'];

  return (
    <View style={{height: 60}}>
      <Animated.View
        onLayout={onLayoutNavBar}
        style={[
          {
            alignSelf: 'flex-start',
            paddingVertical: 0,
            paddingLeft:15,
            paddingRight: 15,
            borderRadius: 2,
            overflow: 'hidden',
            marginBottom: 0,
          },
          animatedStyleOpacityWhenDescDisplayed,
        ]}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            zIndex: 2,
          }}>
          {isButtonExist('continue') ? (
            <View style={{marginRight: 0}}>
              <SupportElementView
                style={{}}
                onPress={() => handleClick('continue')}>
                <View
                  style={{
                    paddingVertical: 15,
                    paddingHorizontal: 15,
                  }}>
                <FAIcon
                  name="play"
                  color={
                    focused === 'continue' && Platform.isTV
                      ? `rgb(${appInfos.colors.main})`
                      : `rgb(${appInfos.colors.grey2})`
                  }
                  accessible={false}
                  size={18}
                  style={{
                    // transform: [{scale: focused === 'play' ? 1.3 : 1}],
                    marginLeft: !Platform.isTV ? 1 : 0,
                    // top: -0.5
                  }}
                />
                </View>
              </SupportElementView>
            </View>
          ) : null}
          <View style={{marginRight: 0}}>
            {isButtonExist('continue') ? (
              <SupportElementView onPress={() => handleClick('play')}>
              <View
                style={{
                  paddingVertical: 15,
                  paddingHorizontal: 15,
                }}>
                <BackPlaySVG
                  color={
                    focused === 'play' && Platform.isTV
                      ? `rgb(${appInfos.colors.main})`
                      : `rgb(${appInfos.colors.grey2})`
                  }
                  style={{
                  }}
                  width={20}
                  height={20}
                  accessible={false}
                />
                </View>
              </SupportElementView>
            ) : type === 'Movies' ? (
              <SupportElementView
                style={{overflow: 'visible'}}
                onPress={() => handleClick('play')}>
                <View
                  style={{
                    paddingVertical: 15,
                    paddingHorizontal: 15,
                  }}>
                <FAIcon
                  name="play"
                  color={
                    focused === 'play' && Platform.isTV
                      ? `rgb(${appInfos.colors.main})`
                      : `rgb(${appInfos.colors.grey2})`
                  }
                  accessible={false}
                  size={18}
                  style={{
                    // marginLeft: Platform.isTV ? 7 : 6,
                  }}
                />
                </View>
              </SupportElementView>
            ) : (
              <SupportElementView onPress={() => handleClick('play')}>
                <View
                  style={{
                    paddingVertical: 15,
                    paddingHorizontal: 15,
                  }}>
                  <EpisodesSVG
                    color={
                      focused === 'play' && Platform.isTV
                        ? `rgb(${appInfos.colors.main})`
                        : `rgb(${appInfos.colors.grey2})`
                    }
                    style={{}}
                    width={20}
                    height={20}
                    accessible={false}
                  />
                </View>
              </SupportElementView>
            )}
          </View>
          <View
            style={{
              marginRight:
                buttonsNeeded.findIndex(el => el === 'favorite') !==
                buttonsNeeded.length - 1
                  ? 0
                  : 0,
            }}>
            <SupportElementView onPress={() => handleClick('favorite')}>
              <View
                style={{
                  paddingVertical: 15,
                  paddingHorizontal: 15,
                }}>
                <MIcon
                  name={isFavorite ? 'star' : 'star-border'}
                  color={
                    focused === 'favorite' && Platform.isTV
                      ? `rgb(${appInfos.colors.main})`
                      : isFavorite && focused !== 'favorite'
                      ? '#FDCC0D'
                      : `rgb(${appInfos.colors.grey2})`
                  }
                  size={20}
                  accessible={false}
                  style={{}}
                />
              </View>
            </SupportElementView>
          </View>
          {isButtonExist('expand') ? (
            <View
              style={{
                marginRight:
                  buttonsNeeded.findIndex(el => el === 'expand') !==
                  buttonsNeeded.length - 1
                    ? 0
                    : 0,

              }}>
              <SupportElementView onPress={() => handleClick('expand')}>
              <View
                style={{
                  paddingVertical: 15,
                  paddingHorizontal: 15,
                }}>
                <MCIcon
                  name="arrow-expand-vertical"
                  color={
                    focused === 'expand' && Platform.isTV
                      ? `rgb(${appInfos.colors.main})`
                      : `rgb(${appInfos.colors.grey2})`
                  }
                  style={{
                    // transform: [{scale: focused === 'expand' ? 1.3 : 1}],
                  }}
                  size={20}
                  accessible={false}
                />
                </View>
              </SupportElementView>
            </View>
          ) : null}
          {isButtonExist('trailer') ? (
            <View style={{}}>
              <SupportElementView onPress={() => handleClick('trailer')}>
                <MCIcon
                  name="video"
                  color={
                    focused === 'trailer' && Platform.isTV
                      ? `rgb(${appInfos.colors.main})`
                      : `rgb(${appInfos.colors.grey2})`
                  }
                  style={{
                    paddingVertical: 15,
                    // transform: [{scale: focused === 'trailer' ? 1.3 : 1}],
                  }}
                  size={20}
                  accessible={false}
                />
              </SupportElementView>
            </View>
          ) : null}
        </View>

        {Platform.isTV ? (
          <View
            accessible={false}
            style={{
              position: 'absolute',
              height: 4,
              width: widthNavBar - 60,
              marginLeft: 21,
              marginTop: 10,
              bottom: 0,
              zIndex: 2,
            }}>
            <Animated.View
              accessible={false}
              style={[
                {
                  backgroundColor: `rgb(${appInfos.colors.main})`,
                  height: focused !== 'back' ? 4 : 0,
                  width: 28,
                  // position: "relative",
                  zIndex: 9999,
                  borderRadius: 0,
                },
                animatedStyleTopBorder,
              ]}></Animated.View>
          </View>
        ) : null}
        <BlurView
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 1,
          }}
          blurType="light"
          blurAmount={20}
        />
      </Animated.View>
      {focused !== 'back' && Platform.isTV ? (
        <View
          style={{
            position: 'absolute',
            bottom: -18,
            width: widthNavBar,
            paddingRight: 0,
          }}>
          <Animated.Text
            numberOfLines={1}
            style={[
              {
                marginRight: buttonsNeeded.length > 3 ? 0 : -100,
                marginLeft: buttonsNeeded.length > 3 ? 0 : 0,
                color: `rgb(${appInfos.colors.main})`,
                // width: 190,
                fontFamily: 'Inter-ExtraBold',
                textAlign: buttonsNeeded.length > 3 ? 'center' : 'left',
                // marginLeft: 30,
              },
              animatedStyleOpacityLabelNavBar,
            ]}>
            {focused === 'play' && isButtonExist('continue')
              ? appInfos.lang[language].data.details.play_back_label
              : focused === 'play' &&
                !isButtonExist('continue') &&
                type === 'Movies'
              ? appInfos.lang[language].data.details.play_label
              : focused === 'play' &&
                !isButtonExist('continue') &&
                type === 'Series'
              ? appInfos.lang[language].data.details.display_episodes_label
              : focused === 'continue'
              ? appInfos.lang[language].data.details.play_resume_label
              : focused === 'favorite' && !isFavorite
              ? appInfos.lang[language].data.details.favorite_label
              : focused === 'favorite' && isFavorite
              ? appInfos.lang[language].data.details.delete_favorite_label
              : focused === 'expand'
              ? appInfos.lang[language].data.details.expand_description_label
              : focused === 'trailer'
              ? appInfos.lang[language].data.details.trailer_label
              : ''}
          </Animated.Text>
        </View>
      ) : null}
    </View>
  );
};

export default memo(DetailsNavBar);
