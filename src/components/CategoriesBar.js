import {
  memo,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableNativeFeedback,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import SearchSVG from '../assets/icons/search.svg';
import CategoriesBarElement from './CategoriesBarElement';
import {AuthContext} from '../global/context';
import TVEventHandler from '../tools/TVEventHandler';
import CustomTextInput from './utils/CustomTextInput';

const CategoriesBar = ({
  componentFocused,
  setComponentFocused,
  currentCategory,
  focusedCategory, // Pour recevoir la focused par default
  categories,
  isKeyboardOpened,
  setIsKeyboardOpened,
  handleChangeTextSearch,
  searchText,
  setSearchText,
  type, // Movies, Series
  canMoveRight,
  handleCategoryClicked,
}) => {
  const {language, appInfos} = useContext(AuthContext);
  const inputRef = useRef(null);
  const offsetY = useSharedValue(0);
  const sharedOpacityColors = useSharedValue(appInfos.colors.opacity);
  const sharedOpacityComponent = useSharedValue(appInfos.colors.opacity);
  const [focused, setFocused] = useState(-2);
  const isCursorMoving = useRef(false);


  const _tvEventHandler = new TVEventHandler();
  const _enableTVEventHandler = () => {
    _tvEventHandler.enable(this, function (cmp, evt) {
      if (!evt || evt.eventKeyAction !== 0) return;
      if (evt.eventType === 'select') return _moveSelect();
      else if (evt.eventType === 'right') return _moveRight();
      else if (evt.eventType === 'up') return _moveUp();
      else if (evt.eventType === 'left') return _moveLeft();
      else if (evt.eventType === 'down') return _moveDown();
    });
  };

  const _moveSelect = () => {
    if (componentFocused === 'categories') {
      if (focused !== -1) {
        handleCategoryClicked(focused);
      } else setIsKeyboardOpened(true);
    }
  };

  const _moveUp = () => {
    if (isCursorMoving.current === true) return;
    if (componentFocused === 'categories') {
      if (focused > -1) {
        isCursorMoving.current = true;
        setFocused(curr => curr - 1);
        setTimeout(() => {
          isCursorMoving.current = false;
        }, 20);
      } else if (focused === -1) {
        setIsKeyboardOpened(false);
      }
    }
  };

  const _moveDown = () => {
    if (isCursorMoving.current === true) return;
    if (componentFocused === 'categories') {
      if (focused === -1) setIsKeyboardOpened(false);

      if (focused < categories.length - 1) {
        isCursorMoving.current = true;
        setFocused(curr => curr + 1);
        setTimeout(() => {
          isCursorMoving.current = false;
        }, 20);
      }
    }
  };

  const _moveLeft = () => {
    if (isCursorMoving.current === true) return;
    if (componentFocused === 'categories') {
      if (focused === -1) setIsKeyboardOpened(false);

      setComponentFocused('menu');
      setFocused(currentCategory);
    }
  };

  const _moveRight = () => {
    if (isCursorMoving.current === true) return;
    if (componentFocused === 'categories') {
      if (focused === -1) setIsKeyboardOpened(false);

      if (canMoveRight) {
        setComponentFocused('list');
        setFocused(currentCategory);
      }
    }
  };

  const _disableTVEventHandler = () => {
    if (_tvEventHandler) {
      _tvEventHandler.disable();
    }
  };

  useEffect(() => {
    if (componentFocused === 'categories' && Platform.isTV) {
      _enableTVEventHandler();
    }
    return () => _disableTVEventHandler();
  });

  useEffect(() => {
    setFocused(currentCategory);
  }, [focusedCategory, type, currentCategory]);

  useEffect(() => {
    if (!categories.length) return;
    if (isKeyboardOpened) {
      inputRef.current.focus();
    } else {
      inputRef.current.blur();
    }
  }, [isKeyboardOpened]);

  useEffect(() => {
    // const categorie =
    //   focused <= 5
    //     ? 0
    //     : focused >=
    //       (type === 'Channels' ? categories.length - 5 : categories.length - 6)
    //     ? type === 'Channels'
    //       ? categories.length - 11
    //       : categories.length - 12
    //     : focused - 6;
    // offsetY.value = categorie * 31;
    const categorie =
      focused <= 5 || categories.length < 12
        ? 0
        : focused >= categories.length - 6
        ? categories.length - 12
        : focused - 6;
    offsetY.value = categorie * 31;
  }, [focused]);

  useEffect(() => {
    if (currentCategory !== -1) setSearchText('');
  }, [currentCategory]);

  const animatedStyleScrollView = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(-offsetY.value, {
            duration: 400,
            easing: Easing.bezier(0.4, 1, 0.4, 1),
            useNativeDriver: true,
          }),
        },
      ],
    };
  }, []);

  useEffect(() => {
    const value =
      componentFocused !== 'categories' ? appInfos.colors.opacity : 1;

    sharedOpacityColors.value = value;
    sharedOpacityComponent.value =
      componentFocused === 'categories' || currentCategory === -1
        ? 1
        : appInfos.colors.opacity;
  }, [componentFocused]);

  const animatedText = useAnimatedStyle(() => {
    return {
      opacity: withTiming(
        componentFocused !== 'categories' ? sharedOpacityColors.value : 1,
        {
          duration: 400,
          easing: Easing.bezier(0.3, 1, 0.3, 1),
          useNativeDriver: true,
        },
      ),
    };
  }, [componentFocused, focused]);

  const animatedComponent = useAnimatedStyle(() => {
    return {
      opacity: withTiming(sharedOpacityComponent.value, {
        duration: 400,
        easing: Easing.bezier(0.3, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    };
  }, [componentFocused]);

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

  return categories.length ? (
    <View style={{marginTop: 5, flex: 1, paddingLeft: 8, marginRight: 8 + 18}}>
      <Animated.View style={Platform.isTV ? animatedComponent : null}>
        <CustomTextInput
          containerStyle={[
            styles.inputContainer,

            {
              // marginLeft: 1,
              borderColor:
                (componentFocused !== 'categories' &&
                  currentCategory === -1 &&
                  Platform.isTV) ||
                (!Platform.isTV && currentCategory !== -1)
                  ? `rgb(${appInfos.colors.grey3})`
                  : (focused === -1 &&
                      componentFocused === 'categories' &&
                      Platform.isTV) ||
                    (!Platform.isTV && currentCategory === -1)
                  ? `rgb(${appInfos.colors.main})`
                  : `rgb(${appInfos.colors.grey3})`,
              width: Platform.isTV ? 250 - 18 - 8 : 225 - 18 - 8,
              flexDirection: 'row',
              alignItems: 'center',
              borderRadius: 3,
              overflow: 'hidden',
              height: 38,
            },
          ]}
          parentRef={inputRef}
          secureTextEntry={false}
          inputStyle={{
            width: '100%',
            color:
              componentFocused !== 'categories' && currentCategory === -1
                ? `rgb(${appInfos.colors.grey3})`
                : focused === -1 && componentFocused === 'categories'
                ? `rgb(${appInfos.colors.grey1})`
                : `rgb(${appInfos.colors.grey3})`,
            padding: 5,
            paddingLeft: 10,
            flexWrap: 'nowrap',
            position: 'absolute',
            left: 20,
          }}
          value={searchText}
          // label={appInfos.lang[language].data.login.password_label}
          label="Rechercher"
          placeholder={
            type === 'Movies'
              ? appInfos.lang[language].data.movies.search_placeholder
              : type === 'Series'
              ? appInfos.lang[language].data.series.search_placeholder
              : appInfos.lang[language].data.tv.search_placeholder
          }
          placeholderTextColor={
            currentCategory === -1 && focused === -1
              ? 'rgba(0,0,0,0)'
              : componentFocused !== 'categories' && currentCategory === -1
              ? `rgb(${appInfos.colors.grey3})`
              : focused === -1 && componentFocused === 'categories'
              ? `rgb(${appInfos.colors.grey3})`
              : `rgb(${appInfos.colors.grey3})`
          }
          cursorColor={`transparent`}
          onSubmitEditing={() => setIsKeyboardOpened(false)}
          onChangeText={text => {
            text.length < 26
              ? (setSearchText(text), handleChangeTextSearch(text))
              : null;
          }}
          icon={
            <SearchSVG
              name="search"
              color={
                (componentFocused !== 'categories' &&
                  currentCategory === -1 &&
                  Platform.isTV) ||
                (!Platform.isTV && currentCategory !== -1)
                  ? `rgb(${appInfos.colors.grey3})`
                  : (focused === -1 &&
                      componentFocused === 'categories' &&
                      Platform.isTV) ||
                    (!Platform.isTV && currentCategory === -1)
                  ? `rgb(${appInfos.colors.main})`
                  : `rgb(${appInfos.colors.grey3})`
              }
              width={13}
              height={13}
              style={{
                marginLeft: 10,
                marginTop: 1,
              }}
            />
          }
        />
      </Animated.View>

      {/* <Animated.View
        style={[
          styles.inputContainer,
          Platform.isTV ? animatedComponent : null,

          {
            // marginLeft: 1,
            borderColor:
              (componentFocused !== 'categories' &&
                currentCategory === -1 &&
                Platform.isTV) ||
              (!Platform.isTV && currentCategory !== -1)
                ? `rgb(${appInfos.colors.grey3})`
                : (focused === -1 &&
                    componentFocused === 'categories' &&
                    Platform.isTV) ||
                  (!Platform.isTV && currentCategory === -1)
                ? `rgb(${appInfos.colors.main})`
                : `rgb(${appInfos.colors.grey3})`,
            width: 250 - 18 - 8,
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 3,
            overflow: 'hidden',
          },
        ]}>
        <SearchSVG
          name="search"
          color={
            (componentFocused !== 'categories' &&
              currentCategory === -1 &&
              Platform.isTV) ||
            (!Platform.isTV && currentCategory !== -1)
              ? `rgb(${appInfos.colors.grey3})`
              : (focused === -1 &&
                  componentFocused === 'categories' &&
                  Platform.isTV) ||
                (!Platform.isTV && currentCategory === -1)
              ? `rgb(${appInfos.colors.main})`
              : `rgb(${appInfos.colors.grey3})`
          }
          width={13}
          height={13}
          style={{
            marginLeft: 10,
            marginTop: 1,
          }}
        />
        <TextInput
          ref={inputRef}
          style={{
            width: 350 - 18 - 8 - 13 - 10,
            color:
              componentFocused !== 'categories' && currentCategory === -1
                ? `rgb(${appInfos.colors.grey3})`
                : focused === -1 && componentFocused === 'categories'
                ? `rgb(${appInfos.colors.grey1})`
                : `rgb(${appInfos.colors.grey3})`,
            padding: 5,
            paddingLeft: 10,
            flexWrap: 'nowrap',
          }}
          value={searchText}
          label="Rechercher"
          placeholder={
            type === 'Movies'
              ? appInfos.lang[language].data.movies.search_placeholder
              : type === 'Series'
              ? appInfos.lang[language].data.series.search_placeholder
              : appInfos.lang[language].data.tv.search_placeholder
          }
          placeholderTextColor={
            currentCategory === -1 && focused === -1
              ? 'rgba(0,0,0,0)'
              : componentFocused !== 'categories' && currentCategory === -1
              ? `rgb(${appInfos.colors.grey3})`
              : focused === -1 && componentFocused === 'categories'
              ? `rgb(${appInfos.colors.grey3})`
              : `rgb(${appInfos.colors.grey3})`
          }
          cursorColor="transparent"
          onFocus={() => console.log('focus Input')}
          onBlur={() => console.log('blur Input')}
          onSubmitEditing={() => setIsKeyboardOpened(false)}
          onChangeText={text => {
            text.length < 26
              ? (setSearchText(text), handleChangeTextSearch(text))
              : null;
          }}
        />
      </Animated.View> */}
      <View
        style={{
          marginLeft: 17,
          overflow: 'hidden',
          marginTop: 0,
          width: 225 - 18 - 8,
        }}>
        <SupportView
          style={
            Platform.isTV ? animatedStyleScrollView : {marginBottom: 2 * 38}
          }>
          {categories.map((item, index) => {
            return (
              <SupportElementView
                onPress={() => {
                  setFocused(index);
                  handleCategoryClicked(index);
                }}
                key={index}
                style={[
                  Platform.isTV && focused !== index ? animatedText : null,
                ]}>
                <View
                  style={
                    !Platform.isTV
                      ? {
                          marginBottom:
                            index === categories.length - 1 ? 35 : 0,
                        }
                      : null
                  }>
                  <CategoriesBarElement
                    item={item}
                    isFocused={
                      focused === index &&
                      componentFocused === 'categories' &&
                      Platform.isTV
                    }
                    isCurrent={
                      (currentCategory === index &&
                        componentFocused !== 'categories' &&
                        Platform.isTV) ||
                      (currentCategory === index && !Platform.isTV)
                    }
                    colors={appInfos.colors}
                  />
                </View>
              </SupportElementView>
            );
          })}
        </SupportView>
      </View>
    </View>
  ) : (
    <View></View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginBottom: 14,
  },
  inputContainer: {
    borderWidth: 1.5,
    marginLeft: 18,
    marginBottom: 13,
  },
});

export default memo(CategoriesBar);
