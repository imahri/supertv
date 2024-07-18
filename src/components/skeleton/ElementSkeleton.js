import React, {memo} from 'react';
import {View} from 'react-native';
const ElementSkeleton = ({
  elementsColor,
  width,
  height,
  role,
}) => {
  return (
    <React.Fragment>
      <View
        style={{
          width: width,
          height: height,
          backgroundColor: `rgb(${elementsColor})`,
        }}></View>
      {role === 'tv' ? (
        <>
          <View
            style={{
              width: width * 0.75,
              height: 12,
              backgroundColor: `rgb(${elementsColor})`,
              marginTop: 7,
            }}></View>
          <View
            style={{
              width: width * 0.5,
              height: 12,
              backgroundColor: `rgb(${elementsColor})`,
              marginTop: 7,
            }}></View>
        </>
      ) : null}
    </React.Fragment>
  );
};

export default ElementSkeleton;
