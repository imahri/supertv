import LinearGradient from 'react-native-linear-gradient';
import React, {memo, useMemo} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import CustomFastImage from './utils/CustomFastImage';

const Item = ({
  item,
  is_favorite,
  width,
  height,
  isFocused,
  role,
  page,
  isHidingOnChangingLoop,
  colors,
  isImagesDisplay,
  itemEPGLenght,
  isLast
}) => {

  const starIcon = useMemo(() => {
    if (page === 'tv' && is_favorite) {
      return (
        <View
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            zIndex: 9999,
          }}>
          <MIcon name={'star'} color={'#FDCC0D'} size={20} accessible={false} />
        </View>
      );
    }
    return null;
  }, [page, is_favorite]);

  const bottomShadowAndBar = useMemo(() => {
    if (item.position && role !== 'resume_home') {
      return (
        <View
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'flex-end',
          }}>
          <LinearGradient
            style={{
              width: '100%',
              alignItems: 'center',
              bottom: -0.2,
              height: 23,
            }}
            end={{x: 0.5, y: 1}}
            start={{x: 0.5, y: 0}}
            colors={['rgba(0,0,0,.0)', 'rgba(0,0,0,.8)']}>
            <View
              style={{
                height: 3,
                width: '85%',
                backgroundColor: 'rgb(60,60,60)',
                position: 'absolute',
                bottom: 8,
              }}>
              <View
                style={{
                  backgroundColor: `rgb(${colors.main})`,
                  height: '100%',
                  width: `${
                    item && item.position && item.duration
                      ? (item.position / item.duration) * 100
                      : 0
                  }%`,
                }}></View>
            </View>
          </LinearGradient>
        </View>
      );
    }
    return null;
  }, [item, role, colors]);

  const tvText = useMemo(() => {
    if (page === 'tv' || role === 'tv') {
      return (
        <View style={{width: width}}>
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              {
                color: isFocused
                  ? `rgb(${colors.main})`
                  : `rgb(${colors.grey2})`,
              },
            ]}>
            {item.name}
          </Text>
          <Text
            numberOfLines={1}
            style={[
              styles.subTitle,
              {
                color: isFocused
                  ? `rgb(${colors.grey2})`
                  : `rgb(${colors.grey4})`,
              },
            ]}>
            {item.epg && item.epg[0] && item.epg[0].title}
          </Text>
        </View>
      );
    }
    return null;
  }, [page, role, width, isFocused, colors, item, itemEPGLenght]);

  return (
    <View style={{opacity: isHidingOnChangingLoop ? 0 : 1}}>
      <View
        style={[
          styles.bloc,
          {
            width: width,
            height: height,
            padding: item.logo ? 20 : 0,
            marginRight: !isLast ? 0 : 0,
            backgroundColor: `rgb(${colors.element})`,
          },
        ]}>
        {starIcon}
        <CustomFastImage
          isDisplayed={isImagesDisplay}
          style={{width: '100%', height: '100%'}}
          uri={item.cover_big || item.cover || item.logo || item.poster}
          page={page}
          role={role}>
          {bottomShadowAndBar}
        </CustomFastImage>
      </View>
      {tvText}
    </View>
  );
};

const styles = StyleSheet.create({
  bloc: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    paddingTop: 5,
    fontFamily: 'Inter-Bold',
    height: 22
  },
  subTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    height: 18,
  },
});

export default memo(Item);
