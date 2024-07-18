
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Platform,
  ScrollView,
  Text,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';


import TVEventHandler from '../tools/TVEventHandler';
import ItemEpisode from './ItemEpisode';

const EpisodeList = ({
  lastEpisode,
  appInfos,
  language,
  data,
  itemDimensions,
  partFocused,
  setPartFocused,
  isPlayerOpened,
  handleEpisodeClick,
  moving,
  currentSeason,
  serieDataKeys
}) => {
  const [focused, setFocused] = useState(-1);
  const focusedRef = useRef(-1);
  const scrollviewRef = useRef(null);
  const isCursorMoving = useRef(false);

  const _tvEventHandler = new TVEventHandler();
  const _enableTVEventHandler = () => {
    _tvEventHandler.enable(this, function (cmp, evt) {
      if (!evt || evt.eventKeyAction !== 0) return;
      if (evt.eventType === 'select') return _moveSelect();
      else if (evt.eventType === 'right') return;
      else if (evt.eventType === 'up') return _moveUp();
      else if (evt.eventType === 'left') return _moveLeft();
      else if (evt.eventType === 'down') return _moveDown();
    });
  };

  const _moveSelect = () => {
    handleEpisodeClick(focusedRef.current);
  };

  const _moveUp = useCallback(() => {
    if (isCursorMoving.current) return;
    if (focusedRef.current > 0) {
      isCursorMoving.current = true;
      setTimeout(() => {
        isCursorMoving.current = false;
      }, 5);
      _moveY(focusedRef.current - 1);
    } else setPartFocused('back');
  }, []);

  const _moveDown = useCallback(() => {
    if (isCursorMoving.current) return;
    if (partFocused === 'episode' && focusedRef.current !== data.length - 1) {
      isCursorMoving.current = true;
      setTimeout(() => {
        isCursorMoving.current = false;
      }, 5);
      _moveY(focusedRef.current + 1);
    } else if (partFocused === 'back') {
      setPartFocused('season');
    }
  }, [partFocused]);

  const _moveLeft = () => {
    setPartFocused('season');
  };

  const _moveY = nextFocus => {
    focusedRef.current = nextFocus;
    if (Platform.isTV)
      offsetYEpisode.value = nextFocus * (10 + itemDimensions.height);
    else if (scrollviewRef.current)
    setTimeout(() => {
      scrollviewRef.current.scrollTo({
        x: 0,
        y: nextFocus * (10 + itemDimensions.height),
        animated: true,
      });
    }, 10);
    setFocused(nextFocus);
  };

  const _disableTVEventHandler = () => {
    if (_tvEventHandler) {
      _tvEventHandler.disable();
    }
  };

  useEffect(() => {
    if (!isPlayerOpened && partFocused === 'episode' && Platform.isTV)
      _enableTVEventHandler();
    return () => _disableTVEventHandler();
  }, [partFocused, isPlayerOpened]);

  useEffect(() => {
    if (moving) _moveY(lastEpisode.episode - 1);
    else _moveY(0);
  }, [moving, lastEpisode, currentSeason]);

  const offsetYEpisode = useSharedValue(0);
  const animatedStyleScrollViewEpisode = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(-offsetYEpisode.value, {
            duration: 600,
            easing: Easing.bezier(0.3, 1, 0.3, 1),
            useNativeDriver: true,
          }),
        },
      ],
    };
  }, []);

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

  const capitalize = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <SupportView
      style={Platform.isTV ? animatedStyleScrollViewEpisode : null}
      ref={Platform.isTV ? null : scrollviewRef}>
      {!Platform.isTV ? (
        <View
          style={[
            {
              position: 'relative',
              zIndex: 999,
              marginTop: 45,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            },
          ]}>
          <Text
            style={[
              {
                marginLeft: 0,
                zIndex: 999,
                color: `rgb(${appInfos.colors.grey1})`,
                fontFamily: 'Inter-Bold',
                fontSize: 16,
              },
            ]}>
            {capitalize(appInfos.lang[language].data.details.season_label)}{' '}
            
            {serieDataKeys[currentSeason]}
          </Text>
        </View>
      ) : null}
      {data.map((item, index) => {
        return (
          <View
            key={index}
            style={{
              marginBottom:
                !Platform.isTV && index === data.length - 1
                  ? itemDimensions.height + 5
                  : 10,
            }}>
            <SupportElementView onPress={() => handleEpisodeClick(index)}>
              <View>
                <ItemEpisode
                  item={item}
                  position={
                    item.progress &&
                    item.progress.position &&
                    item.progress.position > 0
                      ? item.progress.position
                      : null
                  }
                  duration={
                    item.progress &&
                    item.progress.duration &&
                    item.progress.duration > 0
                      ? item.progress.duration
                      : null
                  }
                  isDark={index < focusedRef.current && Platform.isTV}
                  width={itemDimensions.width}
                  height={itemDimensions.height}
                  language={language}
                  appInfos={appInfos}
                  isImagesDisplay={true}
                />
              </View>
            </SupportElementView>
          </View>
        );
      })}
    </SupportView>
  );
};

export default memo(EpisodeList);
