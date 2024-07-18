import FastImage from 'react-native-fast-image';

const CustomFastImage = ({uri, style, children, isDisplayed, page, role}) => {
  return (
    <FastImage
      style={style}
      source={{
        uri: isDisplayed ? uri : null,
        priority: FastImage.priority.low,
        // cache: FastImage.cacheControl.web
      }}
      resizeMode={
        page === 'tv' || role === 'tv' || page === "episodes"
          ? FastImage.resizeMode.contain
          : FastImage.resizeMode.cover
      }>
      {children}
    </FastImage>
  );
};
export default CustomFastImage
