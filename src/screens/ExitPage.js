import React, {useEffect, useState, useContext} from 'react';
import {
  Text,
  View,
  BackHandler,
  TouchableNativeFeedback,
  Platform,
} from 'react-native';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import TVEventHandler from '../tools/TVEventHandler';
import {AuthContext} from '../global/context';

const ExitPage = ({colors, componentFocused, setComponentFocused}) => {
  const [focused, setFocused] = useState(0);
  const {language, appInfos} = useContext(AuthContext);

  useEffect(() => {
    const backAction = () => {
      setComponentFocused('menu');
      // BackHandler.exitApp();
      return true;
    };

    const canInit = componentFocused === 'exit';

    const backHandler = canInit
      ? BackHandler.addEventListener('hardwareBackPress', backAction)
      : null;

    return () => (canInit ? backHandler.remove() : null);
  }, [componentFocused]);

  const _tvEventHandler = new TVEventHandler();
  const _enableTVEventHandler = () => {
    _tvEventHandler.enable(this, function (cmp, evt) {
      if (!evt || evt.eventKeyAction !== 0) return;
      if (evt.eventType === 'select') return _moveSelect();
      else if (evt.eventType === 'right') return;
      else if (evt.eventType === 'up') return _moveUp();
      else if (evt.eventType === 'left') return;
      else if (evt.eventType === 'down') return _moveDown();
    });
  };
  const _disableTVEventHandler = () => {
    if (_tvEventHandler) {
      _tvEventHandler.disable();
    }
  };

  useEffect(() => {
    if (componentFocused === 'exit' && Platform.isTV) {
      _enableTVEventHandler();
    }
    return () => _disableTVEventHandler();
  });

  const _moveSelect = () => {
    if (focused === 0) {
      setComponentFocused('menu');
    } else {
      BackHandler.exitApp();
    }
  };

  const _moveUp = () => {
    if (focused === 0) return;
    setFocused(curr => curr - 1);
  };

  const _moveDown = () => {
    if (focused > 0) return;
    setFocused(curr => curr + 1);
  };

  const componentsElement = {
    mobile: TouchableNativeFeedback,
    tv: View,
  };
  const SupportElementView = componentsElement[Platform.isTV ? 'tv' : 'mobile'];

  return (
    <View
      style={{
        backgroundColor: `rgb(${colors.background})`,
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 9999,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
      <View style={{width: 400, height: 224, alignItems: 'center'}}>
        <MCIcon
          name="exit-run"
          color={`rgb(${colors.grey2})`}
          size={75}
          accessible={false}
        />
        <Text
          style={{
            fontSize: 25,
            fontFamily: 'Inter-ExtraBold',
            color: `rgb(${colors.grey2})`,
            marginTop: 10,
            marginBottom: 20,
          }}>
          {appInfos.lang[language].data.exit.title}
        </Text>

        <SupportElementView onPress={() => setComponentFocused('menu')}>
          <View
            style={{
              backgroundColor: `rgb(${colors.element})`,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8,
              paddingHorizontal: 8,
              borderRadius: 3,
              width: 300,
              marginBottom: 10,
            }}>
            <Text
              style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 12,
                color:
                  focused === 0 && Platform.isTV
                    ? `rgb(${colors.main})`
                    : `rgb(${colors.grey2})`,
              }}>
              {appInfos.lang[language].data.exit.back_label}
            </Text>
          </View>
        </SupportElementView>
        <SupportElementView
          onPress={() => BackHandler.exitApp()}>
          <View
            style={{
              backgroundColor: `rgb(${colors.element})`,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8,
              paddingHorizontal: 8,
              borderRadius: 3,
              width: 300,
              marginBottom: 10,
            }}>
            <Text
              style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 12,
                color:
                  focused === 1
                    ? `rgb(${colors.main})`
                    : `rgb(${colors.grey2})`,
              }}>
              {appInfos.lang[language].data.exit.confirm_label}
            </Text>
          </View>
        </SupportElementView>
      </View>
    </View>
  );
};

export default ExitPage;
