import React, { memo } from 'react';
import {
  View,
} from 'react-native';

const EPGSkeleton = ({elementsColor}) => {
  return (
    <React.Fragment>
      <View
        style={{
          height: '100%',
          width: 220,
          backgroundColor: `rgb(${elementsColor})`,
        }}></View>
      <View style={{flex: 1, marginLeft: 15, marginBottom: 0}}>
        <View
          style={{
            width: '75%',
            backgroundColor: `rgb(${elementsColor})`,
            marginBottom: 10,
            height: 12,
          }}></View>
        <View
          style={{
            width: '100%',
            backgroundColor: `rgb(${elementsColor})`,
            marginBottom: 10,
            height: 46,
          }}></View>
        <View
          style={{
            width: '50%',
            backgroundColor: `rgb(${elementsColor})`,
            marginBottom: 7,
            height: 12,
          }}></View>
        <View
          style={{
            width: '75%',
            backgroundColor: `rgb(${elementsColor})`,
            height: 12,
            position: 'absolute',
            bottom: 0,
          }}></View>
      </View>
    </React.Fragment>
  );
};

export default EPGSkeleton