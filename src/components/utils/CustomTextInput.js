import {useRef, useState, useEffect, useCallback, useContext} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  View,
  Platform,
  findNodeHandle,
  BackHandler,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

const CustomTextInput = ({
  parentRef,
  label,
  value,
  placeholder,
  placeholderTextColor,
  cursorColor,
  onSubmitEditing,
  onChangeText,
  inputStyle,
  containerStyle,
  secureTextEntry,
  icon
}) => {
  return (
    <View style={[...containerStyle, {overflow: 'hidden'}]}>
      {icon ? icon : null}
      {value && value.length > 0 ? null : (
        <View style={[inputStyle, {width: 800}]}>
          <Text style={{color: placeholderTextColor}}>{placeholder}</Text>
        </View>
      )}
      <TextInput
        ref={parentRef}
        style={[inputStyle]}
        value={value}
        label={label}
        placeholder={''}
        cursorColor={cursorColor}
        onFocus={() => console.log('focus Input')}
        onBlur={() => console.log('blur Input')}
        onSubmitEditing={onSubmitEditing}
        onChangeText={onChangeText}
        accessible={false}
        blurOnSubmit={true}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
};

export default CustomTextInput;
