import {View, StyleSheet, Text, Platform} from 'react-native';
import {AuthContext} from '../global/context';
import Timer from './Timer';

import FAIcon from 'react-native-vector-icons/FontAwesome5';
import {useContext, useEffect, useState} from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

export default function Header() {
  const {userInfos, language, colors, appInfos, expDate} =
    useContext(AuthContext);

  const sharedOpacity = useSharedValue(0);
  const animatedOpcatity = useAnimatedStyle(() => {
    return {
      opacity: withTiming(sharedOpacity.value, {
        duration: 400,
        easing: Easing.bezier(0.4, 1, 0.4, 1),
        useNativeDriver: true,
      }),
    };
  });

  useEffect(() => {
    if (userInfos) sharedOpacity.value = 1;
  }, [userInfos]);

  return (
    <>
      {appInfos.lang[language].data.global.announcement &&
      appInfos.lang[language].data.global.announcement.length > 0 ? (
        <View
          style={{
            width: '100%',
            height: 35,
            backgroundColor: `rgb(${appInfos.colors.element})`,
            position: 'relative',
            top: 0,
            right: 0,
            left: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <LinearGradient
            accessible={false}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              // zIndex: 9999,
            }}
            locations={[0, 0.65, 1]}
            end={{x: 1, y: 0}}
            start={{x: 0, y: 1}}
            colors={[
              `rgb(${appInfos.colors.announcementGradientColor1})`,
              `rgb(${appInfos.colors.announcementGradientColor2})`,
              // `rgb(${appInfos.colors.announcementGradientColor3})`,
            ]}></LinearGradient>
          <Text
            numberOfLines={1}
            style={{
              color: `rgb(${appInfos.colors.grey1})`,
              fontFamily: 'Inter-SemiBold',
              fontSize: 13,
              lineHeight: 35,
            }}>
            {appInfos.lang[language].data.global.announcement}
          </Text>
        </View>
      ) : expDate < 14 ? (
        <View
          style={{
            width: '100%',
            height: 35,
            backgroundColor: `rgb(${appInfos.colors.element})`,
            position: 'relative',
            top: 0,
            right: 0,
            left: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            numberOfLines={1}
            style={{
              color: `rgb(${appInfos.colors.tertiary})`,
              fontFamily: 'Inter-SemiBold',
              fontSize: 13,
              lineHeight: 35,
            }}>
            {appInfos.lang[language].data.global.plan_expire_before}
            {expDate}{' '}
            {expDate > 1
              ? appInfos.lang[language].data.settings.days_label
              : appInfos.lang[language].data.settings.day_label}
            {appInfos.lang[language].data.global.plan_expire_after}
          </Text>
        </View>
      ) : null}
      <View accessible={false} style={styles.container}>
        <View accessible={false} style={[styles.userBox]}>
          <Animated.View style={[animatedOpcatity]}>
            <FAIcon
              name="user-alt"
              color={`rgb(${appInfos.colors.grey1})`}
              size={14}
              accessible={false}
            />
          </Animated.View>
          <Animated.View
            accessible={false}
            style={[styles.infos, animatedOpcatity]}>
            <Text
              accessible={false}
              style={[
                styles.idLabel,
                {color: `rgb(${appInfos.colors.grey1})`},
              ]}>
              {userInfos && userInfos.username}
            </Text>
          </Animated.View>
        </View>
        <Animated.View
          style={[
            animatedOpcatity,
            {
              height: 20,
              marginBottom: 40,
            },
          ]}>
          <Timer
            language={language}
            grey1={appInfos.colors.grey1}
            lang={appInfos.lang}
          />
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    paddingTop: Platform.isTV ? 40 : 35,
    // paddingBottom: 50,
    paddingLeft: 40,
    paddingRight: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
    // height: 115,
  },
  userBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    lineHeight: 25,
    marginBottom: Platform.isTV ? 40 : 35,
  },
  infos: {
    // marginLeft: 10,
    // flex: 1,
    // alignItems:"center"
  },
  idLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 13,
    marginLeft: 7,
  },
});
