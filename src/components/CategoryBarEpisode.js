import {memo, useEffect, useState, useCallback, useRef} from 'react';
import {
  Platform,
  ScrollView,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import CategoryItemEpisode from './CategoryItemEpisode';
import TVEventHandler from '../tools/TVEventHandler';

const CategoryBarEpisode = ({
  serieData,
  categories,
  partFocused,
  currentSeason,
  appInfos,
  language,
  handleSeasonClick,
  isPlayerOpened,
  setPartFocused,
}) => {
  // console.log('Render CategoryBarEpisode');
  const [focusedSeason, setFocusedSeason] = useState(-1);
  const isCursorMoving = useRef(false);

  const _tvEventHandler = new TVEventHandler();
  const _enableTVEventHandler = () => {
    _tvEventHandler.enable(this, function (cmp, evt) {
      if (!evt || evt.eventKeyAction !== 0) return;
      if (evt.eventType === 'select') return _moveSelect();
      else if (evt.eventType === 'right') return _moveRight();
      else if (evt.eventType === 'up') return _moveUp();
      else if (evt.eventType === 'left') return;
      else if (evt.eventType === 'down') return _moveDown();
    });
  };

  const _moveSelect = useCallback(() => {
    handleSeasonClick(focusedSeason);
  }, [focusedSeason]);

  const _moveRight = () => {
    setPartFocused('episode');
  };
  const _moveUp = useCallback(() => {
    if (isCursorMoving.current) return;
    if (focusedSeason > 0) {
      isCursorMoving.current = true;
      setTimeout(() => {
        isCursorMoving.current = false;
      }, 5);
      setFocusedSeason(curr => curr - 1);
    } else setPartFocused('back');
  }, [focusedSeason]);

  const _moveDown = useCallback(() => {
    if (isCursorMoving.current) return;
    if (focusedSeason !== categories.length - 1) {
      isCursorMoving.current = true;
      setTimeout(() => {
        isCursorMoving.current = false;
      }, 5);
      setFocusedSeason(curr => curr + 1);
    }
  }, [focusedSeason, categories]);

  const _disableTVEventHandler = () => {
    if (_tvEventHandler) {
      _tvEventHandler.disable();
    }
  };

  useEffect(() => {
    if (!isPlayerOpened && partFocused === 'season' && Platform.isTV)
      _enableTVEventHandler();
    return () => _disableTVEventHandler();
  });

  useEffect(() => {
    setFocusedSeason(currentSeason);
  }, [partFocused]);

  useEffect(() => {
    setFocusedSeason(currentSeason);
  }, [currentSeason]);

  useEffect(() => {
    const categorie =
      focusedSeason <= 4 || categories.length < 11
        ? 0
        : focusedSeason >= categories.length - 6
        ? categories.length - 11
        : focusedSeason - 5;
    offsetYSeason.value = categorie * 31;
  }, [focusedSeason]);

  const components = {
    mobile: ScrollView,
    tv: Animated.View,
  };
  const SupportView = components[Platform.isTV ? 'tv' : 'mobile'];

  const componentsElement = {
    mobile: TouchableNativeFeedback,
    tv: Animated.View,
  };
  const SupportElementView = componentsElement[Platform.isTV ? 'tv' : 'mobile'];

  const offsetYSeason = useSharedValue(0);
  const animatedStyleScrollViewSeason = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(-offsetYSeason.value, {
            duration: 600,
            easing: Easing.bezier(0.3, 1, 0.3, 1),
            useNativeDriver: true,
          }),
        },
      ],
    };
  }, []);

  return (
    <View style={{}}>
      <View
        style={{
          marginTop: 5,
          position: Platform.isTV ? 'absolute' : 'relative',
          overflow: 'hidden',
          width: '100%',
        }}>
        <SupportView
          // ref={!Platform.isTV ? scrollviewSeasonRef : null}
          style={[
            Platform.isTV ? animatedStyleScrollViewSeason : null,
            {width: '100%'},
          ]}>
          {categories.map((item, index) => {
            return (
              <SupportElementView
                key={index}
                onPress={() => handleSeasonClick(index)}>
                <View
                  style={{
                    marginBottom:
                      categories.length - 1 === index && !Platform.isTV
                        ? 22
                        : 0,
                  }}>
                  <CategoryItemEpisode
                    season={item}
                    isSelected={
                      partFocused !== 'season' && currentSeason === index
                    }
                    isFocused={
                      (partFocused === 'season' && focusedSeason === index) ||
                      (!Platform.isTV && currentSeason === index)
                    }
                    isDark={partFocused !== 'season' && focusedSeason !== index}
                    appInfos={appInfos}
                    language={language}
                    dataLength={
                      (focusedSeason === index && partFocused === 'season') ||
                      (currentSeason === index && partFocused !== 'season')
                        ? Object.values(Object.values(serieData)[
                            currentSeason === index && partFocused !== 'season'
                              ? currentSeason
                              : focusedSeason === index &&
                                partFocused === 'season'
                              ? focusedSeason
                              : null
                          ]).length
                        : 0
                    }
                    handleSeasonClick={() => handleSeasonClick(index)}
                  />
                </View>
              </SupportElementView>
            );
          })}
        </SupportView>
      </View>
    </View>
  );
};

export default memo(CategoryBarEpisode);
