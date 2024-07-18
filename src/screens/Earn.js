import {useContext, useEffect} from 'react';
import {Text, View, Platform, Dimensions} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {AuthContext} from '../global/context';
import FastImage from 'react-native-fast-image';

const Earn = ({componentFocused, setComponentFocused}) => {
  const {language, userInfos, appInfos} = useContext(AuthContext);

  useEffect(() => {
    setComponentFocused('menu');
  }, []);

  const sharedMarginTopPage = useSharedValue(0);

  const components = {
    mobile: Animated.ScrollView,
    tv: Animated.View,
  };
  const SupportView = components[Platform.isTV ? 'tv' : 'mobile'];

  const onLayout = event => {
    const {x, y, height, width} = event.nativeEvent.layout;
    if (Dimensions.get('window').height - height - 15 > 0) {
      sharedMarginTopPage.value =
        (Dimensions.get('window').height - height - 5) / 2;
    } else sharedMarginTopPage.value = 70;
  };

  const animatedContainer = useAnimatedStyle(() => {
    return {
      marginTop: sharedMarginTopPage.value,
    };
  });

  return (
    <SupportView style={animatedContainer}>
      <Animated.View
        onLayout={onLayout}
        style={[
          {
            marginLeft: 0,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}>
        <Text
          style={{
            fontFamily: 'Inter-Bold',
            fontSize: 18,
            color: `rgb(${appInfos.colors.grey1})`,
          }}>
          {appInfos.lang[language].data.earn.title}
        </Text>
        <Text
          style={{
            fontFamily: 'Inter-Bold',
            fontSize: 14,
            color: `rgb(${appInfos.colors.secondary})`,
          }}>
          {appInfos.lang[language].data.earn.subtitle}
        </Text>
        <Text
          style={{
            marginTop: 30,
            fontFamily: 'Inter-Bold',
            fontSize: 14,
            color: `rgb(${appInfos.colors.grey2})`,
            marginBottom: 10,
          }}>
          {appInfos.lang[language].data.earn.share_label} :
        </Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{alignItems: 'center'}}>
            <View
              style={{
                width: 140,
                height: 140,
                marginRight: 15,
                backgroundColor: `rgb(${appInfos.colors.element})`,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{fontSize: 20, fontFamily:'Inter-Bold', color: `rgb(${appInfos.colors.grey1})`}}>{userInfos.code}</Text>
            </View>
            <Text
              numberOfLines={1}
              style={{
                alignSelf: 'center',
                marginRight: 15,
                fontFamily: 'Inter-Bold',
                fontSize: 13,
                color: `rgb(${appInfos.colors.grey2})`,
                marginTop: 6,
              }}>
              {appInfos.lang[language].data.earn.code_label}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: 'Inter-Bold',
              color: `rgb(${appInfos.colors.grey2})`,
              marginTop: -25,
            }}>
            {appInfos.lang[language].data.earn.or_label}
          </Text>
          <View style={{alignItems: 'center'}}>
            <View
              style={{
                width: 140,
                height: 140,
                marginLeft: 15,
                backgroundColor: 'rgb(40,40,40)',
              }}>
              <FastImage
                source={{
                  uri: userInfos.qr_code,
                  priority: FastImage.priority.normal,
                }}
                style={{width: '100%', height: '100%'}}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
            <Text
              numberOfLines={1}
              style={{
                alignSelf: 'center',
                marginLeft: 15,
                fontFamily: 'Inter-Bold',
                fontSize: 13,
                color: `rgb(${appInfos.colors.grey2})`,
                marginTop: 6,
              }}>
              {appInfos.lang[language].data.earn.qrcode_label}
            </Text>
          </View>
        </View>
        <View style={{marginTop: 30}}>
          <Text
            style={{
              fontFamily: 'Inter-Medium',
              fontSize: 13,
              color: `rgb(${appInfos.colors.grey4})`,
            }}>
            {appInfos.lang[language].data.earn.link_rewards}
          </Text>
        </View>
      </Animated.View>
    </SupportView>
  );
};

export default Earn;
