import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Text,
  View,
  ScrollView,
  BackHandler,
  Platform,
  TouchableNativeFeedback,
} from 'react-native';
import {AuthContext} from '../global/context';
import TVEventHandler from '../tools/TVEventHandler';

import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import FA5Icon from 'react-native-vector-icons/FontAwesome5';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const Settings = ({componentFocused, setComponentFocused}) => {
  const maxitem = 5;
  const [focused, setFocused] = useState(0);
  const [focusedLang, setFocusedLang] = useState(-1);
  const [currentConfirmation, setCurrentConfirmation] = useState(-1);
  const [focusedConfirmationChoice, setFocusedConfirmationChoice] = useState(1);
  const [lastConfirmationDone, setLastConfirmationDone] = useState(-1);
  const [buttonsWidth, setButtonsWidth] = useState(0);
  const [canDisplayButtons, setCanDisplayButtons] = useState(false);
  const [buttonsHeight, setButtonsHeight] = useState(0);
  const [expDate, setExpDate] = useState('');

  const {
    language,
    handleChangeLang,
    userInfos,
    JWT_TOKEN,
    handleLogout,
    isControlsAvailable,
    _getStoredIds,
    appInfos,
    setIsConnexionTroubles
  } = useContext(AuthContext);

  useEffect(() => {
    const backAction = () => {
      if (focusedLang !== -1) setFocusedLang(-1);
      else if (currentConfirmation !== -1) {
        setCurrentConfirmation(-1);
        setFocusedConfirmationChoice(1);
      } else {
        if (Platform.isTV) setComponentFocused('menu');
        else setComponentFocused('exit');
      }
      return true;
    };

    const canInit =
      (Platform.isTV && componentFocused === 'list') ||
      (!Platform.isTV && componentFocused === 'list');

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      canInit ? backAction : () => null,
    );

    return () => backHandler.remove();
  }, [componentFocused, focusedLang, currentConfirmation]);

  const _tvEventHandler = new TVEventHandler();
  const _enableTVEventHandler = () => {
    _tvEventHandler.enable(this, function (cmp, evt) {
      if (evt && evt.eventKeyAction === 0) {
        if (evt.eventType === 'select') {
          if (focused === 0 && focusedLang === -1) {
            const index = Object.keys(appInfos.lang).findIndex(
              (el, i) => el === language,
            );
            if (index !== -1) setFocusedLang(index);
            else setFocusedLang(0);
          } else if (focusedLang !== -1) {
            handleLangSelect(focusedLang);
          } else if (focused > 0 && focused < 5) {
            handleButtonsClick(focused);
          } else if (focused === 5) {
            handleLogout();
          }
        } else if (evt.eventType === 'right') {
          if (currentConfirmation !== -1) {
            if (focusedConfirmationChoice === 0)
              setFocusedConfirmationChoice(1);
          }
        } else if (evt.eventType === 'up') {
          if (currentConfirmation !== -1) {
            setCurrentConfirmation(-1);
            setFocusedConfirmationChoice(1);
          }
          if (focusedLang !== -1) {
            if (focusedLang - 1 > -1) {
              setFocusedLang(curr => curr - 1);
            }
          } else {
            if (focused > 0) setFocused(curr => curr - 1);
          }
        } else if (evt.eventType === 'left') {
          if (focusedLang === -1 && currentConfirmation === -1) {
            setComponentFocused('menu');
          } else if (currentConfirmation !== -1) {
            if (focusedConfirmationChoice === 1)
              setFocusedConfirmationChoice(0);
          }
        } else if (evt.eventType === 'down') {
          if (currentConfirmation !== -1) {
            setCurrentConfirmation(-1);
            setFocusedConfirmationChoice(1);
          }
          if (focusedLang !== -1) {
            if (focusedLang + 1 < Object.keys(appInfos.lang).length) {
              setFocusedLang(curr => curr + 1);
            }
          } else {
            if (focused < maxitem) setFocused(curr => curr + 1);
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
    if (componentFocused === 'list' && isControlsAvailable && Platform.isTV) {
      _enableTVEventHandler();
    }
    return () => _disableTVEventHandler();
  });

  const timeoutConfirmOpacity = useRef(null);

  const handleDelete = () => {
    if (currentConfirmation === -1) return;

    let type =
      currentConfirmation === 1
        ? 'channel_history'
        : currentConfirmation === 2
        ? 'movie_progress'
        : currentConfirmation === 3
        ? 'series_progress'
        : currentConfirmation === 4
        ? 'favorites'
        : 'favorites';

    fetch(`${process.env.PATH_CUSTOM_API}/delete?content=${type}&jwt_token=${JWT_TOKEN}`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 200) {
          clearTimeout(timeoutConfirmOpacity.current);

          setLastConfirmationDone(currentConfirmation);
          setCurrentConfirmation(-1);
          setFocusedConfirmationChoice(1);

          confirmOpacity.value = 0;
          confirmOpacity.value = 0.8;
          timeoutConfirmOpacity.current = setTimeout(() => {
            confirmOpacity.value = 0;
            setTimeout(() => {
              setLastConfirmationDone(-1);
            }, 300);
          }, 3000);
        } else {
          setIsConnexionTroubles(true)
        }
      }).catch(() => {
        setIsConnexionTroubles(true)
      });
  };

  const buttonsDidLayoutCountRef = useRef(0);
  const onLayoutButtons = event => {
    const {x, y, height, width} = event.nativeEvent.layout;
    if (width > buttonsWidth) {
      setButtonsWidth(width);
    }
    if (buttonsHeight === 0) {
      setButtonsHeight(height);
    }

    if (buttonsDidLayoutCountRef.current === 4) {
      buttonsDidLayoutCountRef.current = 0;
      setCanDisplayButtons(true);
    } else {
      // setCanDisplayButtons(false);
      buttonsDidLayoutCountRef.current += 1;
    }
  };

  useEffect(() => {
    _getStoredIds();
  }, []);

  const confirmOpacity = useSharedValue(0);
  const animatedConfirmationOpacity = useAnimatedStyle(() => {
    return {
      opacity: withTiming(confirmOpacity.value, {
        duration: 300,
        easing: Easing.bezier(1, 1, 1, 1),
        useNativeDriver: true,
      }),
    };
  });

  useEffect(() => {
    if (!userInfos.exp_date) return;
    const timeLeft = userInfos.exp_date * 1000 - Date.now();
    const days = Math.floor(timeLeft / 1000 / 60 / 60 / 24);
    const hours = Math.floor(timeLeft / 1000 / 60 / 60 - days * 24);
    const minutes = Math.floor(
      timeLeft / 1000 / 60 - days * 24 * 60 - hours * 60,
    );
    setExpDate(
      `${days} ${
        days > 1
          ? appInfos.lang[language].data.settings.days_label
          : appInfos.lang[language].data.settings.day_label
      }, ${hours} ${
        hours > 1
          ? appInfos.lang[language].data.settings.hours_label
          : appInfos.lang[language].data.settings.hour_label
      } et ${minutes} ${
        minutes > 1
          ? appInfos.lang[language].data.settings.minutes_label
          : appInfos.lang[language].data.settings.minute_label
      }`,
    );
    setComponentFocused('list');
  }, [userInfos, language]);

  const handleLangSelect = selectedLang => {
    setFocusedLang(-1);
    const newLang = Object.keys(appInfos.lang)[selectedLang];
    if (newLang && newLang !== language) {
      setCanDisplayButtons(false);
      setButtonsWidth(0);
      handleChangeLang(newLang);
    }
  };

  const handleButtonsClick = selected => {
    if (currentConfirmation === -1) setCurrentConfirmation(selected);
    else {
      if (focusedConfirmationChoice === 1) setCurrentConfirmation(-1);
      else handleDelete();
    }
  };

  const handleButtonsClickMobile = selected => {
    setComponentFocused('list');
    if (currentConfirmation === selected) setCurrentConfirmation(-1);
    else setCurrentConfirmation(selected);
  };

  const handleChoiceConfirmationMobile = res => {
    if (res === 1) setCurrentConfirmation(-1);
    else handleDelete();
  };

  const components = {
    mobile: ScrollView,
    tv: View,
  };
  const SupportView = components[Platform.isTV ? 'tv' : 'mobile'];

  const componentsElement = {
    mobile: TouchableNativeFeedback,
    tv: View,
  };
  const SupportElementView = componentsElement[Platform.isTV ? 'tv' : 'mobile'];

  const ConfirmElement = ({handleResponse}) => {
    return (
      <View style={{flexDirection: 'row'}}>
        <Text
          style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 12,
            color: `rgb(${appInfos.colors.grey2})`,
          }}>
          {appInfos.lang[language].data.settings.confirm_label}
        </Text>
        <View style={{flexDirection: 'row', marginLeft: 2.5}}>
          <SupportElementView onPress={() => handleResponse(0)}>
            <View style={{paddingHorizontal: 2.5}}>
              <Text
                style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 12,
                  opacity:
                    (focusedConfirmationChoice === 0 && Platform.isTV) ||
                    !Platform.isTV
                      ? 1
                      : appInfos.colors.opacity,
                  color:
                    focusedConfirmationChoice === 0 && Platform.isTV
                      ? `rgb(${appInfos.colors.main})`
                      : !Platform.isTV
                      ? `rgb(${appInfos.colors.grey1})`
                      : `rgb(${appInfos.colors.grey3})`,
                }}>
                {appInfos.lang[language].data.settings.yes_label}
              </Text>
            </View>
          </SupportElementView>
          <SupportElementView onPress={() => handleResponse(1)}>
            <View style={{paddingHorizontal: 2.5}}>
              <Text
                style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 12,
                  opacity:
                    (focusedConfirmationChoice === 1 && Platform.isTV) ||
                    !Platform.isTV
                      ? 1
                      : appInfos.colors.opacity,
                  color:
                    focusedConfirmationChoice === 1 && Platform.isTV
                      ? `rgb(${appInfos.colors.main})`
                      : !Platform.isTV
                      ? `rgb(${appInfos.colors.grey1})`
                      : `rgb(${appInfos.colors.grey3})`,
                }}>
                {appInfos.lang[language].data.settings.no_label}
              </Text>
            </View>
          </SupportElementView>
        </View>
      </View>
    );
  };

  return (
    <View style={{height: '100%'}}>
      <SupportView
        contentContainerStyle={{
          flexGrow: 1,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        style={{height: '100%'}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: '100%',
            paddingVertical: Platform.isTV ? 0 : 35,
            flex: 1,
          }}>
          <View style={{marginLeft: 40}}>
            <View
              style={
                {
                  // marginTop: 20,
                }
              }>
              <Text
                style={{
                  fontFamily: 'Inter-Bold',
                  fontSize: 16,
                  color: `rgb(${appInfos.colors.grey1})`,
                  marginBottom: 13,
                }}>
                {appInfos.lang[language].data.settings.first_title}
              </Text>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 12,
                    color: `rgb(${appInfos.colors.grey3})`,
                    opacity: appInfos.colors.opacity,
                    marginBottom: 3,
                    marginRight: 3,
                  }}>
                  {appInfos.lang[language].data.settings.username_label} :
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Bold',
                    fontSize: 12,
                    color: `rgb(${appInfos.colors.grey2})`,
                    marginBottom: 3,
                  }}>
                  {userInfos.username}
                </Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 12,
                    color: `rgb(${appInfos.colors.grey3})`,
                    opacity: appInfos.colors.opacity,
                    marginBottom: 3,
                    marginRight: 3,
                  }}>
                  {appInfos.lang[language].data.settings.exp_label} :
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Bold',
                    fontSize: 12,
                    color: `rgb(${appInfos.colors.grey2})`,
                    marginBottom: 3,
                  }}>
                  {expDate}
                </Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 12,
                    color: `rgb(${appInfos.colors.grey3})`,
                    opacity: appInfos.colors.opacity,
                    marginBottom: 3,
                    marginRight: 3,
                  }}>
                  {appInfos.lang[language].data.settings.max_con_label} :
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Bold',
                    fontSize: 12,
                    color: `rgb(${appInfos.colors.grey2})`,
                    marginBottom: 3,
                  }}>
                  {userInfos.max_connections}
                </Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 12,
                    color: `rgb(${appInfos.colors.grey3})`,
                    opacity: appInfos.colors.opacity,
                    marginRight: 3,
                  }}>
                  {appInfos.lang[language].data.settings.nbr_con_label} :
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter-Bold',
                    fontSize: 12,
                    color: `rgb(${appInfos.colors.grey2})`,
                  }}>
                  {userInfos.active_cons}
                </Text>
              </View>
            </View>
            <View style={{marginTop: 20, zIndex: 9999}}>
              <Text
                style={{
                  fontFamily: 'Inter-Bold',
                  fontSize: 16,
                  color: `rgb(${appInfos.colors.grey1})`,
                  marginBottom: 13,
                }}>
                {appInfos.lang[language].data.settings.second_title}
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 12,
                    color: `rgb(${appInfos.colors.grey3})`,
                    opacity: appInfos.colors.opacity,
                    marginRight: 10,
                  }}>
                  {appInfos.lang[language].data.settings.lang_label} :
                </Text>
                <SupportElementView
                  onPress={() =>
                    focusedLang === -1
                      ? (setFocusedLang(0), setComponentFocused('list'))
                      : setFocusedLang(-1)
                  }>
                  <View style={{width: 150}}>
                    <View
                      style={{
                        //   width: 200,
                        backgroundColor: `rgb(${appInfos.colors.element})`,
                        flexDirection: 'row',
                        alignItems: 'center',
                        //   justifyContent: 'center',
                        paddingVertical: 8,
                        borderRadius: focusedLang === -1 ? 3 : 0,

                        paddingRight: 30,
                        paddingLeft: 10,
                        height: 35,
                      }}>
                      <FA5Icon
                        name="chevron-down"
                        color={
                          focused === 0 &&
                          focusedLang === -1 &&
                          componentFocused === 'list' &&
                          Platform.isTV
                            ? `rgb(${appInfos.colors.main})`
                            : `rgb(${appInfos.colors.grey2})`
                        }
                        accessible={false}
                        size={15}
                        style={{
                          position: 'absolute',
                          right: 10,
                          // marginLeft: focused === "continue" ? -2 : 0
                        }}
                      />
                      <Text
                        style={{
                          fontFamily: 'Inter-SemiBold',
                          fontSize: 12,
                          color:
                            focused === 0 &&
                            focusedLang === -1 &&
                            componentFocused === 'list' &&
                            Platform.isTV
                              ? `rgb(${appInfos.colors.main})`
                              : `rgb(${appInfos.colors.grey2})`,
                          transform: [{scale: 1}],
                        }}>
                        {appInfos.lang[language].title}
                      </Text>
                    </View>
                    {focusedLang !== -1 ? (
                      <View
                        style={{
                          backgroundColor: `rgb(${appInfos.colors.element})`,
                          position: 'absolute',
                          top: 35,
                          width: 150,
                          shadowColor: '#000',
                          shadowOffset: {
                            width: 0,
                            height: 5,
                          },
                          shadowOpacity: 0.34,
                          shadowRadius: 6.27,

                          elevation: 10,
                        }}>
                        {Object.keys(appInfos.lang).map((el, i) => {
                          return (
                            <React.Fragment key={i}>
                              <SupportElementView
                                onPress={() => handleLangSelect(i)}>
                                <Text
                                  key={i}
                                  style={{
                                    fontFamily: 'Inter-SemiBold',
                                    fontSize: 12,
                                    padding: 10,
                                    opacity:
                                      focusedLang !== i &&
                                      el !== language &&
                                      Platform.isTV
                                        ? appInfos.colors.opacity
                                        : 1,
                                    color:
                                      (focusedLang === i && Platform.isTV) ||
                                      (el === language && !Platform.isTV)
                                        ? `rgb(${appInfos.colors.main})`
                                        : el === language
                                        ? `rgb(${appInfos.colors.grey2})`
                                        : `rgb(${appInfos.colors.grey3})`,
                                  }}>
                                  {appInfos.lang[el].title}
                                </Text>
                              </SupportElementView>
                            </React.Fragment>
                          );
                        })}
                      </View>
                    ) : null}
                  </View>
                </SupportElementView>
              </View>
            </View>
            <View style={{marginTop: 20}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 13,
                }}>
                <Text
                  style={{
                    fontFamily: 'Inter-Bold',
                    fontSize: 16,
                    color: `rgb(${appInfos.colors.grey1})`,
                    marginRight: 15,
                  }}>
                  {appInfos.lang[language].data.settings.third_title}
                </Text>
              </View>
              {true ? (
                <View
                  style={{
                    alignSelf: 'flex-start',
                    // marginBottom: 70,
                  }}>
                  <View
                    style={{
                      marginBottom: 5,
                    }}>
                    <SupportElementView
                      onPress={() => handleButtonsClickMobile(1)}>
                      <View>
                        <View
                          onLayout={onLayoutButtons}
                          style={{
                            paddingHorizontal: 25,
                            backgroundColor: `rgb(${appInfos.colors.element})`,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 8,
                            borderRadius: 3,
                            width:
                              buttonsWidth > 0 && canDisplayButtons
                                ? buttonsWidth
                                : 'auto',
                          }}>
                          {currentConfirmation !== 1 ? (
                            <Text
                              style={{
                                fontFamily: 'Inter-SemiBold',
                                fontSize: 12,
                                color:
                                  focused === 1 &&
                                  componentFocused === 'list' &&
                                  Platform.isTV
                                    ? `rgb(${appInfos.colors.main})`
                                    : `rgb(${appInfos.colors.grey2})`,
                              }}>
                              {
                                appInfos.lang[language].data.settings
                                  .history_button
                              }
                            </Text>
                          ) : (
                            <ConfirmElement
                              handleResponse={handleChoiceConfirmationMobile}
                            />
                          )}

                          <Animated.View
                            style={[
                              {
                                position: 'absolute',
                                left: buttonsWidth + 10,
                              },
                              animatedConfirmationOpacity,
                            ]}>
                            {lastConfirmationDone === 1 && canDisplayButtons ? (
                              <FAIcon
                                name="check"
                                color={'#b9ff1c'}
                                accessible={false}
                                size={15}
                                style={{}}
                              />
                            ) : null}
                          </Animated.View>
                        </View>
                      </View>
                    </SupportElementView>
                  </View>

                  <View
                    style={{
                      marginBottom: 5,
                    }}>
                    <SupportElementView
                      onPress={() => handleButtonsClickMobile(2)}>
                      <View>
                        <View
                          onLayout={onLayoutButtons}
                          style={{
                            paddingHorizontal: 25,
                            backgroundColor: `rgb(${appInfos.colors.element})`,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 8,
                            borderRadius: 3,
                            width:
                              buttonsWidth > 0 && canDisplayButtons
                                ? buttonsWidth
                                : 'auto',
                          }}>
                          {currentConfirmation !== 2 ? (
                            <Text
                              style={{
                                fontFamily: 'Inter-SemiBold',
                                fontSize: 12,
                                color:
                                  focused === 2 &&
                                  componentFocused === 'list' &&
                                  Platform.isTV
                                    ? `rgb(${appInfos.colors.main})`
                                    : `rgb(${appInfos.colors.grey2})`,
                              }}>
                              {
                                appInfos.lang[language].data.settings
                                  .movies_button
                              }
                            </Text>
                          ) : (
                            <ConfirmElement
                              handleResponse={handleChoiceConfirmationMobile}
                            />
                          )}

                          <Animated.View
                            style={[
                              {
                                position: 'absolute',
                                left: buttonsWidth + 10,
                              },
                              animatedConfirmationOpacity,
                            ]}>
                            {lastConfirmationDone === 2 && canDisplayButtons ? (
                              <FAIcon
                                name="check"
                                color={'#b9ff1c'}
                                accessible={false}
                                size={15}
                                style={{}}
                              />
                            ) : null}
                          </Animated.View>
                        </View>
                      </View>
                    </SupportElementView>
                  </View>

                  <View
                    style={{
                      marginBottom: 5,
                    }}>
                    <SupportElementView
                      onPress={() => handleButtonsClickMobile(3)}>
                      <View>
                        <View
                          onLayout={onLayoutButtons}
                          style={{
                            paddingHorizontal: 25,
                            backgroundColor: `rgb(${appInfos.colors.element})`,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 8,
                            borderRadius: 3,
                            width:
                              buttonsWidth > 0 && canDisplayButtons
                                ? buttonsWidth
                                : 'auto',
                          }}>
                          {currentConfirmation !== 3 ? (
                            <Text
                              style={{
                                fontFamily: 'Inter-SemiBold',
                                fontSize: 12,
                                color:
                                  focused === 3 &&
                                  componentFocused === 'list' &&
                                  Platform.isTV
                                    ? `rgb(${appInfos.colors.main})`
                                    : `rgb(${appInfos.colors.grey2})`,
                              }}>
                              {
                                appInfos.lang[language].data.settings
                                  .series_button
                              }
                            </Text>
                          ) : (
                            <ConfirmElement
                              handleResponse={handleChoiceConfirmationMobile}
                            />
                          )}
                          <Animated.View
                            style={[
                              {
                                position: 'absolute',
                                left: buttonsWidth + 10,
                              },
                              animatedConfirmationOpacity,
                            ]}>
                            {lastConfirmationDone === 3 && canDisplayButtons ? (
                              <FAIcon
                                name="check"
                                color={'#b9ff1c'}
                                accessible={false}
                                size={15}
                                style={{}}
                              />
                            ) : null}
                          </Animated.View>
                        </View>
                      </View>
                    </SupportElementView>
                  </View>

                  <View
                    style={{
                      marginBottom: 5,
                    }}>
                    <SupportElementView
                      onPress={() => handleButtonsClickMobile(4)}>
                      <View>
                        <View
                          onLayout={onLayoutButtons}
                          style={{
                            paddingHorizontal: 25,
                            backgroundColor: `rgb(${appInfos.colors.element})`,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 8,
                            borderRadius: 3,
                            width:
                              buttonsWidth > 0 && canDisplayButtons
                                ? buttonsWidth
                                : 'auto',
                          }}>
                          {currentConfirmation !== 4 ? (
                            <Text
                              style={{
                                fontFamily: 'Inter-SemiBold',
                                fontSize: 12,
                                color:
                                  focused === 4 &&
                                  componentFocused === 'list' &&
                                  Platform.isTV
                                    ? `rgb(${appInfos.colors.main})`
                                    : `rgb(${appInfos.colors.grey2})`,
                              }}>
                              {
                                appInfos.lang[language].data.settings
                                  .favorites_button
                              }
                            </Text>
                          ) : (
                            <ConfirmElement
                              handleResponse={handleChoiceConfirmationMobile}
                            />
                          )}

                          <Animated.View
                            style={[
                              {
                                position: 'absolute',
                                left: buttonsWidth + 10,
                              },
                              animatedConfirmationOpacity,
                            ]}>
                            {lastConfirmationDone === 4 && canDisplayButtons ? (
                              <FAIcon
                                name="check"
                                color={'#b9ff1c'}
                                accessible={false}
                                size={15}
                                style={{}}
                              />
                            ) : null}
                          </Animated.View>
                        </View>
                      </View>
                    </SupportElementView>
                  </View>

                  <View
                    style={{
                      marginTop: 13,
                    }}>
                    <SupportElementView onPress={() => handleLogout()}>
                      <View>
                        <View
                          onLayout={onLayoutButtons}
                          style={{
                            paddingHorizontal: 25,
                            backgroundColor: `rgb(${appInfos.colors.element})`,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingVertical: 8,
                            borderRadius: 3,
                            width:
                              buttonsWidth > 0 && canDisplayButtons
                                ? buttonsWidth
                                : 'auto',
                          }}>
                          <MCIcon
                            name="logout"
                            color={
                              focused === 5 &&
                              componentFocused === 'list' &&
                              Platform.isTV
                                ? `rgb(${appInfos.colors.main})`
                                : `rgb(${appInfos.colors.tertiary})`
                            }
                            accessible={false}
                            size={15}
                            style={{
                              //   position: 'absolute',
                              //   left: 10,
                              // marginLeft: focused === "continue" ? -2 : 0
                              marginRight: 5,
                            }}
                          />
                          <Text
                            style={{
                              fontFamily: 'Inter-SemiBold',
                              fontSize: 12,
                              color:
                                focused === 5 &&
                                componentFocused === 'list' &&
                                Platform.isTV
                                  ? `rgb(${appInfos.colors.main})`
                                  : `rgb(${appInfos.colors.tertiary})`,
                            }}>
                            {
                              appInfos.lang[language].data.settings
                                .logout_button
                            }
                          </Text>
                        </View>
                      </View>
                    </SupportElementView>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </SupportView>
    </View>
  );
};

export default Settings;
