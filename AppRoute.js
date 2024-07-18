/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {
  useCallback,
  useContext,
  useRef,
} from 'react';
import {
  findNodeHandle,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Index from './src/Index';
import Login from './src/screens/Login';
import {AuthContext} from './src/global/context';

const Stack = createNativeStackNavigator();

function AppRoute() {
  const {isAuth} = useContext(AuthContext);

  const fakeTouchable = useRef(null);

  const onRef = useCallback(ref => {
    if (ref) {
      fakeTouchable.current = ref;
    }
  }, []);

  return (
    <SafeAreaProvider>
      {Platform.isTV ? (
        <View accessible={false} style={{position: 'absolute', zIndex: 1}}>
          <View accessible={false} style={{width: 15, height: 15}}>
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
              <View style={{width: '100%', height: '100%'}}></View>
            </TouchableNativeFeedback>
          </View>
        </View>
      ) : null}
      <StatusBar hidden={true} />
      <View style={{zIndex: 9999, height: '100%'}}>
          {isAuth ? <Index /> : <Login />}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default AppRoute;
