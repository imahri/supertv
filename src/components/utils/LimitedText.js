import {useContext, useEffect} from 'react';
import {Text, View, Platform, Dimensions} from 'react-native';

const LimitedText = ({text, maxLines, style}) => {
  return <Text numberOfLines={maxLines} style={style}>{text}</Text>;
};

export default LimitedText;
