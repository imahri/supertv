import {useRef, useState, useEffect, useCallback, useContext} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View,
  Platform,
  findNodeHandle,
  BackHandler,
  Dimensions,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import {AuthContext} from '../global/context';
import TVEventHandler from '../tools/TVEventHandler';
import {SvgUri} from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Logo from '../components/Logo';
import CustomTextInput from '../components/utils/CustomTextInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import * as Progress from 'react-native-progress';

import bg from '../../android/app/src/main/res/drawable/logo.png';


const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const Login = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const userRef = useRef(null);
  const passwordRef = useRef(null);

  const getUniqueIdSync = DeviceInfo.getUniqueIdSync();
  const getDeviceId = DeviceInfo.getDeviceId();
  const getDeviceType = DeviceInfo.getDeviceType();
  const getSystemName = DeviceInfo.getSystemName();
  const getBrand = DeviceInfo.getBrand();
  const getModel = DeviceInfo.getModel();
  const getApiLevelSync = DeviceInfo.getApiLevelSync();
  const getMacAddressSync = DeviceInfo.getMacAddressSync();
  const getVersion = DeviceInfo.getSystemVersion();

  const deviceInfo = [
    { label: "Device Type", value: getDeviceType },
    { label: "Device ID", value: getDeviceId },
    { label: "Brand", value: getBrand },

    { label: "System Name", value: getSystemName },
    { label: "Unique ID", value: getUniqueIdSync },
    { label: "Model", value: getModel },
    { label: "API Level", value: getApiLevelSync },
    { label: "MAC Address", value: getMacAddressSync },
    { label: "Android Version", value: getVersion },
  ];



  const deviceInfos = {
    deviceType: getDeviceType,
    deviceId: getDeviceId,
    brand: getBrand,
    systemName: getSystemName,
    uniqueId: getUniqueIdSync,
    model: getModel,
    apiLevel: getApiLevelSync,
    macAddress: getMacAddressSync,
    systemVersion: getVersion,
  };


  useEffect(() => {
    const sendDeviceInfo = async () => {
      try {
        // const response = await fetch('https://mac.nejmatv.xyz/', {
          const response = await fetch(process.env.REACT_APP_PATH_LOGIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(deviceInfos),
        });
        const data = await response.json();
        console.log('Server response:', data);
      } catch (error) {
        console.error('Error sending device info:', error.message);
      }
    };
  
    sendDeviceInfo();
  }, []);
  

  const {handleLogin, language, appInfos, isSendingRequest} =
    useContext(AuthContext);

    const [passwordValue, setPasswordValue] = useState('');
    const [userValue, setUserValue] = useState('');
    // const [passwordValue, setPasswordValue] = useState('B5MyVzD1as');
    // const [userValue, setUserValue] = useState('canyk0Q6JR');

  const [focused, setFocused] = useState(0);
  const [isKeyboardOpened, setIsKeyboardOpened] = useState(false);
  const fakeTouchable = useRef(null);
  const onRef = useCallback(ref => {
    if (ref) {
      fakeTouchable.current = ref;
    }
  }, []);

  useEffect(() => {
    // getLastIDs();
    getDeviceInfoAndLogin(); // Call the function to get device info and login
  }, []);

  const getLastIDs = async () => {
    const values = await AsyncStorage.getItem('lastIds');
    const parseValue = JSON.parse(values);
    console.log(parseValue)
    if (parseValue !== null && parseValue.username.length > 0) {
      setUserValue(parseValue.username);
      setPasswordValue(parseValue.password);
    } else {
      setUserValue("");
      setPasswordValue("");
    }
  };

  const getDeviceInfoAndLogin = async () => {
    const macAddress = getMacAddressSync;
    const uniqueId = getUniqueIdSync;
    setUserValue(macAddress);
    setPasswordValue(uniqueId);
    handleLogin(macAddress, uniqueId);
  };

  const timeoutErrorMessagePoping = useRef(null);
  useEffect(() => {
    clearTimeout(timeoutErrorMessagePoping.current);
    if (isSendingRequest === false) sharedErrorMessageOpacity.value = 1;
    timeoutErrorMessagePoping.current = setTimeout(() => {
      sharedErrorMessageOpacity.value = 0;
    }, 6000);
    return () => clearTimeout(timeoutErrorMessagePoping);
  }, [isSendingRequest]);

  const sharedErrorMessageOpacity = useSharedValue(0);
  const animatedErrorMessage = useAnimatedStyle(() => {
    return {
      opacity: withTiming(sharedErrorMessageOpacity.value, {
        duration: 400,
        easing: Easing.bezier(0.3, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    };
  });

  useEffect(() => {
    const backAction = () => {
      if (isKeyboardOpened) {
        setTimeout(() => {
          userRef.current.blur();
          passwordRef.current.blur();
        }, 0);
      } else BackHandler.exitApp();
      return true;
    };

    const canInit = true;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      canInit ? backAction : () => null,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (!isKeyboardOpened) {
      setTimeout(() => {
        userRef.current.blur();
        passwordRef.current.blur();
      }, 0);
    }
  }, [isKeyboardOpened]);

  const _tvEventHandler = new TVEventHandler();
  const _enableTVEventHandler = () => {
    _tvEventHandler.enable(this, function (cmp, evt) {
      if (evt && evt.eventKeyAction === 0) {
        if (evt.eventType === 'select') {
          if (focused === 0 && !isKeyboardOpened) {
            setIsKeyboardOpened(true);
            userRef.current.focus();
          } else if (focused === 1 && !isKeyboardOpened) {
            setIsKeyboardOpened(true);
            passwordRef.current.focus();
          } else if (focused === 2 && !isKeyboardOpened) {
            handleLogin(userValue, passwordValue);
          }
        } else if (evt.eventType === 'right') return;
        else if (evt.eventType === 'up') {
          if (focused > 0) setFocused(curr => curr - 1);
          setIsKeyboardOpened(false);
        } else if (evt.eventType === 'left') return;
        else if (evt.eventType === 'down') {
          if (focused < 2) setFocused(curr => curr + 1);
          setIsKeyboardOpened(false);
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
    if (Platform.isTV) _enableTVEventHandler();

    return () => _disableTVEventHandler();
  });

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          bottom: 0,
        }}>
        {Platform.isTV ? (
          <View accessible={false} style={{ position: 'absolute', zIndex: 1 }}>
            <View accessible={false} style={{ width: 15, height: 15 }}>
              <TouchableNativeFeedback
                importantForAccessibility={'yes'}
                onFocus={() => console.log('focused fake')}
                onBlur={() => console.log('blured fake')}
                ref={onRef}
                hasTVPreferredFocus={true}
                nextFocusRight={
                  fakeTouchable.current
                    ? findNodeHandle(fakeTouchable.current)
                    : null
                }
                nextFocusLeft={
                  fakeTouchable.current
                    ? findNodeHandle(fakeTouchable.current)
                    : null
                }
                nextFocusDown={
                  fakeTouchable.current
                    ? findNodeHandle(fakeTouchable.current)
                    : null
                }
                nextFocusUp={
                  fakeTouchable.current
                    ? findNodeHandle(fakeTouchable.current)
                    : null
                }>
                <View style={{ width: '100%', height: '100%' }}></View>
              </TouchableNativeFeedback>
            </View>
          </View>
        ) : null}
        {Platform.isTV ? (
          <View
            style={{
              width: 15,
              height: 15,
              backgroundColor: `rgb(${appInfos.colors.background})`,
              position: 'absolute',
              zIndex: 9,
            }}></View>
        ) : null}

        <View
          style={[
            {
              flexDirection: 'row',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              bottom: 0,
              backgroundColor: `rgb(${appInfos.colors.background})`,
            },
          ]}
          // blurRadius={0}
          accessible={false}>
          <View
            style={{
              height: Dimensions.get('window').height,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              width: 600,
            }}>
            <View style={{ width: 200 }}>
              <View style={{ position: 'absolute', top: -64 }}>
                <Logo
                  uri={appInfos.logo}
                  width={appInfos.logoWidth}
                  height={appInfos.logoHeight}
                  maxWidth={200}
                  maxHeight={50}
                />
              </View>
            </View>
            <CustomTextInput
              containerStyle={[
                styles.inputContainer,
                {
                  borderColor:
                    focused === 0 && Platform.isTV
                      ? `rgb(${appInfos.colors.main})`
                      : `rgb(${appInfos.colors.grey3})`,
                  height: 38,
                  opacity:
                    focused === 0 || !Platform.isTV ? 1 : appInfos.colors.opacity,
                },
              ]}
              parentRef={userRef}
              inputStyle={{
                color:
                  focused === 0
                    ? `rgb(${appInfos.colors.grey3})`
                    : `rgb(${appInfos.colors.grey3})`,
                padding: 5,
                paddingLeft: 10,
                width: '100%',
                position: 'absolute',
              }}
              value={userValue}
              label={appInfos.lang[language].data.login.id_label}
              placeholder={appInfos.lang[language].data.login.id_label}
              placeholderTextColor={`rgba(${appInfos.colors.grey3}, ${
                focused === 0 && Platform.isTV ? appInfos.colors.opacity : 1
              })`}
              cursorColor={`rgb(${appInfos.colors.main})`}
              onSubmitEditing={() => setIsKeyboardOpened(false)}
              onChangeText={text => {
                setUserValue(text);
              }}
            />

            <CustomTextInput
              containerStyle={[
                styles.inputContainer,
                {
                  borderColor:
                    focused === 1 && Platform.isTV
                      ? `rgb(${appInfos.colors.main})`
                      : `rgb(${appInfos.colors.grey3})`,
                  height: 38,
                  opacity:
                    focused === 1 || !Platform.isTV ? 1 : appInfos.colors.opacity,
                },
              ]}
              parentRef={passwordRef}
              secureTextEntry={true}
              inputStyle={{
                // opacity: focused !== 1 ? appInfos.colors.opacity : 1,
                color:
                  focused === 1
                    ? `rgb(${appInfos.colors.grey3})`
                    : `rgb(${appInfos.colors.grey3})`,
                padding: 5,
                paddingLeft: 10,
                width: '100%',
                position: 'absolute',
              }}
              value={passwordValue}
              label={appInfos.lang[language].data.login.password_label}
              placeholder={appInfos.lang[language].data.login.password_label}
              placeholderTextColor={`rgba(${appInfos.colors.grey3}, ${
                focused === 1 ? appInfos.colors.opacity : 1
              })`}
              cursorColor={`rgb(${appInfos.colors.main})`}
              onSubmitEditing={() => setIsKeyboardOpened(false)}
              onChangeText={text => {
                setPasswordValue(text);
              }}
            />

            {Platform.isTV ? (
              <View
                style={{
                  width: 200,
                  backgroundColor: `rgb(${appInfos.colors.element})`,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 8,
                  borderRadius: 3,
                  height: 35,
                }}>
                <Text
                  style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 12,
                    color:
                      focused === 2
                        ? `rgb(${appInfos.colors.main})`
                        : `rgb(${appInfos.colors.grey2})`,
                    // transform: [{ scale: focused === 2 ? 1.05 : 1 }],
                  }}>
                  {isSendingRequest ? (
                    <ActivityIndicator
                      size="small"
                      color={`rgb(${appInfos.colors.grey4})`}
                    />
                  ) : (
                    appInfos.lang[language].data.login.confirm_button
                  )}
                </Text>
              </View>
            ) : (
              <TouchableNativeFeedback
                onPress={() => handleLogin(userValue, passwordValue)}>
                <View
                  style={{
                    width: 200,
                    backgroundColor: `rgb(${appInfos.colors.element})`,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 7,
                    borderRadius: 3,
                    height: 35,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Inter-SemiBold',
                      fontSize: Platform.isTV ? 14 : 13,
                      color:
                        focused === 2
                          ? `rgb(${appInfos.colors.main})`
                          : `rgb(${appInfos.colors.grey2})`,
                    }}>
                    {isSendingRequest ? (
                      <ActivityIndicator
                        size="small"
                        color={`rgb(${appInfos.colors.grey4})`}
                      />
                    ) : (
                      appInfos.lang[language].data.login.confirm_button
                    )}
                  </Text>
                </View>
              </TouchableNativeFeedback>
            )}
            <View
              style={{
                position: 'relative',
                width: 600,
              }}>
              <View
                style={{
                  width: 600,
                  alignItems: 'center',
                  bottom: -27,
                  position: 'absolute',
                  left: 0,
                }}>
                <Animated.Text
                  style={[
                    animatedErrorMessage,
                    {
                      fontFamily: 'Inter-SemiBold',
                      color: `rgb(${appInfos.colors.tertiary})`,
                      fontSize: 13,
                    },
                  ]}>
                  {appInfos.lang[language].data.login.error_message}
                </Animated.Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Black View to hide the existing front */}
      <View
        style={{
          flex: 1,
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: 'black',
          zIndex: 10,
          justifyContent: 'center',
        }}
      >
        <SafeAreaView style={[styles.container]}>
          <View style={styles.loadingContainer}>
            <Image
              source={bg}
              style={styles.logo}
              resizeMode="contain"
            />
            <Progress.Circle
              indeterminate={true}
              endAngle={0.7}
              color='#eeeee4'
              borderWidth={4}
              size={40}
            />
            {/* <Text style={styles.loadingText}>Loading ...</Text> */}
          </View>

          {/* Icon button */}
          <View style={styles.rightBottomContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.icon}>i</Text>
            </TouchableOpacity>
          </View>

          {/* Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(!modalVisible)}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Device Information</Text>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                  {deviceInfo.map((info, index) => (
                    <View key={index} style={styles.deviceInfoContainer}>
                      <Text style={styles.deviceInfoLabel}>{info.label}</Text>
                      <Text style={styles.deviceInfoValue}>{info.value}</Text>
                    </View>
                  ))}
                </ScrollView>
                <TouchableOpacity onPress={() => setModalVisible(!modalVisible)} style={styles.buttonClose}>
                  <Text style={styles.textStyle}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 100, // Adjust width and height as needed
    height: 100,
  },
  centeredContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },

  rightBottomContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 20,
    color: 'white',
  },
  iconButton: {
    backgroundColor: '#1e81b0',
    height: 30,
    width: 30,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  icon: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: windowHeight * 0.75,
    maxWidth: windowWidth * 0.5,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'black',
  },
  deviceInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5,
    width: '100%',
    marginBottom: 10,
  },
  deviceInfoLabel: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
    width: '40%',
  },
  deviceInfoValue: {
    fontSize: 16,
    color: 'black',
    width: '60%',
  },
});

export default Login;