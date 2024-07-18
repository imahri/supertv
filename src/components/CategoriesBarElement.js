import {memo, useEffect} from 'react';
import {Text, View, StyleSheet, Platform} from 'react-native';

const CategoriesBarElement = ({item, isFocused, isCurrent, colors}) => {
  return (
    <View>
      <Text
        style={[
          // animatedText,
          styles.title,
          {
            fontFamily: isFocused || isCurrent  ? 'Inter-ExtraBold' :'Inter-Medium',
            color: isCurrent && Platform.isTV
              ? `rgb(${colors.grey3})` :
              isCurrent && !Platform.isTV 
              ? `rgb(${colors.main})`
              : isFocused && Platform.isTV 
              ? `rgb(${colors.main})`
              : `rgb(${colors.grey3})`,
          },
        ]}>
        {item.name || item.category_name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
    title: {
      // color: 'rgb(85,85,85)',
      
      fontSize: 14,
      marginVertical: 5,
    },
  });

export default memo(CategoriesBarElement);
