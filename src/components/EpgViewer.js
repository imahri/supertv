import {Text, View} from 'react-native';
import dayjs from 'dayjs';
import FastImage from 'react-native-fast-image';
import EPGSkeleton from './skeleton/EPGSkeleton';

const EpgViewer = ({
  epg,
  widthBar,
  elementsColor,
  language,
  colors,
  lang,
  onLayoutDescriptionEPG,
  descriptionEPGWidth,
}) => {
  return epg && epg.length > 0 ? (
    <View
      style={{
        position: 'relative',
        height: 130,
        width: 'auto',
        marginBottom: 15,
        marginTop: 5,
        flexDirection: 'row',
        zIndex: 999,
      }}>
      <View
        style={{
          position: 'relative',
          width: 220,
          height: 130,
          marginLeft: 0,
          marginTop: 0,
        }}>
        {epg && epg.length > 0 ? (
          <FastImage
            // fadeDuration={0}
            accessible={false}
            style={[
              {
                position: 'absolute',
                height: '100%',
                width: '100%',
                zIndex: 999,
                backgroundColor: `rgb(${elementsColor})`,
              },
            ]}
            source={{
              uri: epg[0].thumbnail,
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.cover}
          ></FastImage>
        ) : null}
      </View>

      {epg && epg.length > 0 ? (
        <View style={{flex: 1}}>
          <View
            style={{
              //   backgroundColor: '#20242a',
              marginLeft: 15,
              marginBottom: 10,
            }}>
            <View
              onLayout={onLayoutDescriptionEPG}
              style={{
                width: descriptionEPGWidth > 0 ? descriptionEPGWidth : 'auto',
              }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 14,
                  fontFamily: 'Inter-Bold',
                  color: `rgb(${colors.grey1})`,
                  marginBottom: 4.2,
                  lineHeight: 17,
                }}>
                {epg[0].title}
              </Text>
              <Text
                numberOfLines={4}
                style={{
                  fontSize: 12,
                  fontFamily: 'Inter-Medium',
                  marginRight: 5,
                  marginBottom: 4.2,
                  lineHeight: 17,
                  color: `rgb(${colors.grey2})`,
                }}>
                {epg[0].description}
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 12,
                    fontFamily: 'Inter-SemiBold',
                    color: `rgb(${colors.grey1})`,
                    lineHeight: 17,
                  }}>
                  {dayjs(epg[0].start * 1000).format(
                    lang[language].time_format === 12 ? 'h:mm A' : 'HH:mm',
                  )}
                </Text>

                <View
                  style={{
                    width: 120,
                    backgroundColor: 'grey',
                    height: 3,
                    marginTop: 1.5,
                    marginHorizontal: 7,
                    overflow: 'hidden',
                  }}>
                  <View
                    style={[
                      {
                        backgroundColor: `rgb(${colors.main})`,
                        height: '100%',
                        width: widthBar,
                      },
                    ]}></View>
                </View>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 12,
                    fontFamily: 'Inter-SemiBold',
                    marginRight: 5,
                    color: `rgb(${colors.grey1})`,
                    lineHeight: 15,
                  }}>
                  {dayjs(epg[0].stop * 1000).format(
                    lang[language].time_format === 12 ? 'h:mm A' : 'HH:mm',
                  )}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              width: descriptionEPGWidth > 0 ? descriptionEPGWidth : 'auto',
              flex: 1,
              marginLeft: 15,
              flexDirection: 'row',
              // width: '80%',
              position: 'absolute',
              bottom: 1,
              left: 0,
              alignItems: 'center',
            }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 13,
                fontFamily: 'Inter-SemiBold',
                color: `rgb(${colors.grey1})`,
                lineHeight: 15,
              }}>
              {lang[language].data.tv.next_epg_label} :{' '}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                fontSize: 12,
                fontFamily: 'Inter-Medium',
                color: `rgb(${colors.grey2})`,
                lineHeight: 15,
                bottom: -0.7,
              }}>
              {epg[1] && epg[1].title}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  ) : epg && epg.length === 0 ? (
    <View style={{height: 130, marginBottom: 15, marginTop: 5}}></View>
  ) : (
    <View
      style={[
        {
          height: 130,
          marginBottom: 15,
          marginTop: 5,
          flexDirection: 'row',
        },
      ]}>
      <EPGSkeleton elementsColor={colors.element} />
    </View>
  );
};

export default EpgViewer;
