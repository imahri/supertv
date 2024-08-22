import React, {
  useState,
  useCallback,
  useEffect,
  memo,
  useMemo,
  useContext,
} from 'react';
import {
  StyleSheet,
  View,
  TouchableNativeFeedback,
  ScrollView,
  BackHandler,
  Platform,
  Image,
} from 'react-native';

import TVEventHandler from '../tools/TVEventHandler';
import bg from '../../android/app/src/main/res/drawable/logo.png';
import HomeSVG from '../assets/icons/home.svg';
import MoviesSVG from '../assets/icons/movies.svg';
import TvSVG from '../assets/icons/tv.svg';
import SettingsSVG from '../assets/icons/settings.svg';
import SeriesSVG from '../assets/icons/series.svg';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import MenuElement from './MenuElement';
import {AuthContext} from '../global/context';
import Logo from './Logo';

const Menu = ({
  componentFocused,
  activeComponent,
  setComponentFocused,
  handleChangePage,
  isMenuSmall,
  activeMenu,
  setIsMenuSmall,
}) => {
  const [itemHeight, setItemHeight] = useState(0);
  const [focused, setFocused] = useState(0);

  const [maxMenuItem, setMaxMenuItem] = useState(5);
  const {language, isControlsAvailable, appInfos, isConnexionTroubles} =
    useContext(AuthContext);

  const menu_elements = useCallback(
    [
      {
        id: 'Home',
        name: appInfos.lang[language].data.menu.home,
        icon: (
          <HomeSVG
            name="search"
            color="rgb(185,185,185)"
            width={16}
            height={16}
          />
        ),
      },
      {
        id: 'Tv',
        name: appInfos.lang[language].data.menu.tv,
        icon: (
          <TvSVG
            name="search"
            color="rgb(185,185,185)"
            width={16}
            height={16}
          />
        ),
      },
      {
        id: 'Movies',
        name: appInfos.lang[language].data.menu.movies,
        icon: (
          <MoviesSVG
            name="search"
            color="rgb(185,185,185)"
            width={16}
            height={16}
          />
        ),
      },
      {
        id: 'Series',
        name: appInfos.lang[language].data.menu.series,
        icon: (
          <SeriesSVG
            name="search"
            color="rgb(185,185,185)"
            width={16}
            height={16}
          />
        ),
      },
      {
        id: 'Settings',
        name: appInfos.lang[language].data.menu.settings,
        icon: (
          <SettingsSVG
            name="search"
            color="rgb(185,185,185)"
            width={16}
            height={16}
          />
        ),
      },
     /* {
        id: 'Gain',
        name: appInfos.lang[language].data.menu.affiliate,
        icon: (
          <MCIcon
            name="piggy-bank-outline"
            color="rgb(185,185,185)"
            accessible={false}
            size={19}
          />
        ),
      },*/
    ],
    [language],
  );

  useEffect(() => {
    const backAction = () => {
      setComponentFocused('exit');
      // BackHandler.exitApp();
      return true;
    };
    const canInit = componentFocused === 'menu';

    const backHandler = canInit
      ? BackHandler.addEventListener('hardwareBackPress', backAction)
      : null;

    return () => (canInit ? backHandler.remove() : null);
  }, [componentFocused]);

  const _tvEventHandler = useMemo(() => new TVEventHandler());
  const _enableTVEventHandler = () => {
    _tvEventHandler.enable(this, function (cmp, evt) {
      if (evt && evt.eventKeyAction === 0) {
        if (evt.eventType === 'select') {
          handleItemClick(focused);
        } else if (evt.eventType === 'right') {
          if (isConnexionTroubles) return;
          if (activeComponent === 'Gain') return;
          else if (
            activeComponent === 'Movies' ||
            activeComponent === 'Series' ||
            activeComponent === 'Tv'
          )
            setComponentFocused('categories');
          else {
            setComponentFocused('list');
          }
        } else if (evt.eventType === 'up') {
          if (focused !== 0) {
            setFocused(curr => curr - 1);
          }
        } else if (evt.eventType === 'left') {
          return;
        } else if (evt.eventType === 'down') {
          if (focused !== maxMenuItem) {
            setFocused(curr => curr + 1);
          }
        }
      }
    });
  };

  const _disableTVEventHandler = () => {
    if (_tvEventHandler) {
      _tvEventHandler.disable();
    }
  };

  useEffect(() => {
    if (componentFocused === 'menu' && _tvEventHandler && isControlsAvailable) {
      _enableTVEventHandler();
    }
    return () => _disableTVEventHandler();
  });

  const leftBorderTop = useSharedValue(0);
  const widthContainer = useSharedValue(175);
  const opacityContainer = useSharedValue(1);


  useEffect(() => {
    leftBorderTop.value = withTiming(focused * itemHeight, {
      duration: 500,
      easing: Easing.bezier(0.2, 1, 0.2, 1),
      useNativeDriver: true,
    });
  }, [focused]);

  useEffect(() => {
    if (
      isMenuSmall &&
      (componentFocused !== 'menu' || !Platform.isTV) &&
      componentFocused !== 'exit'
    ) {
      widthContainer.value = withTiming(66, {
        duration: 600,
        easing: Easing.bezier(0.2, 1, 0.2, 1),
        useNativeDriver: true,
      });
    } else if (
      !isMenuSmall ||
      componentFocused === 'menu' ||
      componentFocused === 'exit'
    ) {
      widthContainer.value = withTiming(175, {
        duration: 600,
        easing: Easing.bezier(0.2, 1, 0.2, 1),
        useNativeDriver: true,
      });
    }
  }, [isMenuSmall, componentFocused]);

  useEffect(() => {
    if (componentFocused !== 'menu') {
      const index = menu_elements.findIndex(el => el.id === activeMenu);
      if (index !== -1) setFocused(index);
    } else {
      if (!Platform.isTV) setIsMenuSmall(false);
    }
  }, [componentFocused]);

  useEffect(() => {
    let value = 0;
    if (
      (activeComponent === 'Movies' ||
        activeComponent === 'Series' ||
        activeComponent === 'Tv') &&
      componentFocused === 'menu'
    ) {
      value = 1;
    }

    opacityContainer.value = withTiming(value, {
      duration: 500,
      easing: Easing.bezier(0.3, 1, 0.3, 1),
      useNativeDriver: true,
    });
  }, [activeComponent, componentFocused]);

  const animatedStyleLeftBorder = useAnimatedStyle(() => {
    return {
      top: leftBorderTop.value,
    };
  });

  const animatedStyleWidth = useAnimatedStyle(() => {
    return {
      width: widthContainer.value,
    };
  });

  const animatedStyleOpacity = useAnimatedStyle(() => {
    return {
      opacity: opacityContainer.value,
    };
  });

  const components = {
    mobile: TouchableNativeFeedback,
    tv: View,
  };
  const SupportView = components[Platform.isTV ? 'tv' : 'mobile'];

  const handleItemClick = element => {
    if (!isControlsAvailable) return;
    if (isMenuSmall && !Platform.isTV) return setIsMenuSmall(false);
    if (menu_elements[element].id !== activeComponent)
      handleChangePage(menu_elements[element].id);
    else if (activeComponent === 'Gain') return;
    else {
      if (isConnexionTroubles) return;
      else {
        if (Platform.isTV) setComponentFocused('list');
        else if(activeComponent !== "Home" && activeComponent !== "Settings" && activeComponent !== "Gain") setIsMenuSmall(true);
      }
    }
  };

  const handleClosedMenuClickedMobile = () => {
    if (isMenuSmall) return setIsMenuSmall(false);
  };

  return (
    <Animated.View
      accessible={false}
      style={[
        styles.container,
        animatedStyleWidth,
        {borderRightColor: `rgb(${appInfos.colors.border})`},
      ]}>
      {/* <View
        style={[
          {
            width: '100%',
            height: '100%',
            zIndex: 1,
            position: 'absolute',
            backgroundColor: `transparent`,
          },
        ]}></View> */}
      <SupportView
      onPress={() => handleClosedMenuClickedMobile()}
        style={{
          zIndex: 999,
          height: '100%',
          overflow: 'hidden',
          // backgroundColor: 'red',
        }}>
        <View style={{flex:1}}>
        <Image
            source={bg}
            style={styles.logo}
            resizeMode="contain"
          />

          {(activeMenu === 'Home' ||
            activeMenu === 'Settings' ||
            activeMenu === 'Gain' ||
            componentFocused === 'menu') &&
          Platform.isTV ? (
            <View
              style={{
                width: '100%',
                height: 80,
                position: 'absolute',
                top: 47,
                flexDirection: 'row',
              }}>
              <View
                style={{
                  width: 'auto',
                  height: 'auto',
                  flex: 1,
                  paddingHorizontal: 24,
                }}>
                <Logo
                  uri={appInfos.fadedLogo}
                  width={appInfos.logoWidth}
                  height={appInfos.logoHeight}
                  maxWidth={175 - 48}
                  maxHeight={30}
                />
              </View>
            </View>
          ) : null}
          <View accessible={false} style={styles.menu}>
            {Platform.isTV ? (
              <View
                accessible={false}
                style={{width: 4, height: itemHeight * menu_elements.length}}>
                <Animated.View
                  accessible={false}
                  style={[
                    {
                      width: componentFocused === 'menu' ? 4 : 0,
                      height: itemHeight,
                      paddingVertical: 10,
                      // position: "relative",
                      zIndex: 999,
                      borderRadius: 20,
                    },
                    animatedStyleLeftBorder,
                  ]}>
                  <View
                    accessible={false}
                    style={{
                      backgroundColor:
                        menu_elements[focused].id === 'Gain'
                          ? `rgb(${appInfos.colors.secondary})`
                          : `rgb(${appInfos.colors.main})`,
                      height: '100%',
                      width:
                        componentFocused === 'menu' || activeMenu === 'Gain'
                          ? 4
                          : 0,
                    }}></View>
                </Animated.View>
              </View>
            ) : null}
            <ScrollView
              style={{position: 'absolute', overflow: 'hidden'}}
              accessible={false}
              focusable={false}
              scrollEnabled={false}>
              {menu_elements.map((item, index) => {
                return (
                  <SupportView
                  disabled={isMenuSmall && !Platform.isTV}
                    key={index}
                    onPress={() => handleItemClick(index)}>
                    <View style={{}}>
                      <MenuElement
                        item={item}
                        isFirst={index === 0}
                        setItemHeight={setItemHeight}
                        colors={appInfos.colors}
                        status={
                          activeMenu === 'Gain' && focused === index
                            ? 'focus'
                            : componentFocused === 'menu' && focused === index
                            ? 'focus'
                            : activeMenu === item.id &&
                              componentFocused !== 'menu'
                            ? 'selected'
                            : componentFocused !== 'menu' ||
                              (componentFocused === 'menu' &&
                                activeMenu === 'Gain' &&
                                menu_elements[focused].id === 'Gain')
                            ? 'dark'
                            : 'normal'
                        }
                      />
                    </View>
                  </SupportView>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </SupportView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRightWidth: 1,
    height: '100%',
    zIndex: 999,
    position: 'relative',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
    // backgroundColor:'rgba(0,0,0,0.9)'
    // width: "19%",
  },
  logoContainer: {
    // paddingLeft: 24,
    //   marginTop: 20,
    //   marginBottom: 37,
  },
  logo: {
    position: 'absolute',
    alignSelf:'center',
    width:80,
    height:100,
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  menu: {
    flex: 1,
    flexDirection: 'row',
    // marginTop: 135,
    alignItems: 'center',
  },
});

export default memo(Menu);
