import {
  View,
} from 'react-native';

import MIcon from 'react-native-vector-icons/MaterialIcons';

const StarNote = ({note}) => {
  return (
    <View>
      <View style={{flexDirection: 'row'}}>
        <View>
          <MIcon
            name={'star'}
            color={'rgb(120,120,120)'}
            size={16}
            accessible={false}
          />
          {note > 0 ? (
            <View
              style={{
                overflow: 'hidden',
                backgroundColor: 'transparent',
                width: note >= 1 ? 16 : 8,
                height: 16,
                position: 'absolute',
              }}>
              <MIcon
                name={'star'}
                color={'#FDCC0D'}
                size={16}
                accessible={false}
                style={{position: 'absolute'}}
              />
            </View>
          ) : null}
        </View>
        <View>
          <MIcon
            name={'star'}
            color={'rgb(120,120,120)'}
            size={16}
            accessible={false}
          />
          {note > 1 ? (
            <View
              style={{
                overflow: 'hidden',
                backgroundColor: 'transparent',
                width: note >= 2 ? 16 : 8,
                height: 16,
                position: 'absolute',
              }}>
              <MIcon
                name={'star'}
                color={'#FDCC0D'}
                size={16}
                accessible={false}
                style={{position: 'absolute'}}
              />
            </View>
          ) : null}
        </View>
        <View>
          <MIcon
            name={'star'}
            color={'rgb(120,120,120)'}
            size={16}
            accessible={false}
          />
          {note > 2 ? (
            <View
              style={{
                overflow: 'hidden',
                backgroundColor: 'transparent',
                width: note >= 3 ? 16 : 8,
                height: 16,
                position: 'absolute',
              }}>
              <MIcon
                name={'star'}
                color={'#FDCC0D'}
                size={16}
                accessible={false}
                style={{position: 'absolute'}}
              />
            </View>
          ) : null}
        </View>
        <View>
          <MIcon
            name={'star'}
            color={'rgb(120,120,120)'}
            size={16}
            accessible={false}
          />
          {note > 3 ? (
            <View
              style={{
                overflow: 'hidden',
                backgroundColor: 'transparent',
                width: note >= 4 ? 16 : 8,
                height: 16,
                position: 'absolute',
              }}>
              <MIcon
                name={'star'}
                color={'#FDCC0D'}
                size={16}
                accessible={false}
                style={{position: 'absolute'}}
              />
            </View>
          ) : null}
        </View>
        <View>
          <MIcon
            name={'star'}
            color={'rgb(120,120,120)'}
            size={16}
            accessible={false}
          />
          {note > 4 ? (
            <View
              style={{
                overflow: 'hidden',
                width: note === 5 ? 16 : 8,
                height: 16,
                position: 'absolute',
              }}>
              <MIcon
                name={'star'}
                color={'#FDCC0D'}
                size={16}
                accessible={false}
                style={{position: 'absolute'}}
              />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default StarNote;
