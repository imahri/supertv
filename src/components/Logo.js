import {useEffect, useState} from 'react';
import {SvgUri} from 'react-native-svg';

const Logo = ({uri, width, height, maxWidth, maxHeight}) => {
  const [dims, setDims] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const newDims = logoSize(width, height);
    setDims(newDims);
  }, []);

  logoSize = (width, height) => {
    var max_Width = maxWidth;
    var max_Height = maxHeight;

    if (width >= height) {
      var ratio = max_Width / width;
      var h = Math.ceil(ratio * height);

      if (h > max_Height) {
        // Too tall, resize
        var ratio = max_Height / height;
        var w = Math.ceil(ratio * width);
        var ret = {
          width: w,
          height: max_Height,
        };
      } else {
        var ret = {
          width: max_Width,
          height: h,
        };
      }
    } else {
      var ratio = max_Height / height;
      var w = Math.ceil(ratio * width);

      if (w > max_Width) {
        var ratio = max_Width / width;
        var h = Math.ceil(ratio * height);
        var ret = {
          width: max_Width,
          height: h,
        };
      } else {
        var ret = {
          width: w,
          height: max_Height,
        };
      }
    }

    return ret;
  };
  return (
    <SvgUri width={dims.width} height={dims.height} uri={uri} />
  );
};

export default Logo;
