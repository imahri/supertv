import {
  Platform,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import Earn from '../screens/Earn';
import Home from '../screens/Home';
import Settings from '../screens/Settings';
import TV from '../screens/TV2';
import MCIcon from 'react-native-vector-icons/MaterialIcons';
import LostConnexionSnippet from './LostConnexionSnippet';
import SearchPage from '../screens/SearchPage';

const RightPageContainer = ({
  componentFocused,
  setComponentFocused,
  activeComponent,
  handleOpenDetails,
  handleOpenVideoPlayer,
  playerData,
  isConnexionTroubles,
  isMenuSmall,
  setIsMenuSmall,
}) => {
  return (
    <View style={styles.containerRight}>
      {!isMenuSmall &&
      !Platform.isTV &&
      activeComponent !== 'Home' &&
      activeComponent !== 'Settings' &&
      activeComponent !== 'Gain' ? (
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: 9999,
          }}>
          <TouchableNativeFeedback onPress={() => setIsMenuSmall(true)}>
            <View style={{width: '100%', height: '100%'}}></View>
          </TouchableNativeFeedback>
        </View>
      ) : null}
      {isConnexionTroubles ? (
        <View
          style={{
            width: '100%',
            height: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <LostConnexionSnippet />
        </View>
      ) : activeComponent === 'Home' ? (
        <Home
          componentFocused={componentFocused}
          setComponentFocused={setComponentFocused}
          handleOpenDetails={handleOpenDetails}
          handleOpenVideoPlayer={handleOpenVideoPlayer}
          playerData={playerData}
        />
      ) : activeComponent === 'Movies' ? (
        <SearchPage
          componentFocused={componentFocused}
          setComponentFocused={setComponentFocused}
          handleOpenDetails={handleOpenDetails}
          type={'movie'}
        />
      ) : activeComponent === 'Series' ? (
        <SearchPage
          componentFocused={componentFocused}
          setComponentFocused={setComponentFocused}
          handleOpenDetails={handleOpenDetails}
          type={'series'}
        />
      ) : activeComponent === 'Tv' ? (
        <TV
          componentFocused={componentFocused}
          setComponentFocused={setComponentFocused}
          handleOpenDetails={handleOpenDetails}
          handleOpenVideoPlayer={handleOpenVideoPlayer}
        />
      ) : activeComponent === 'Gain' ? (
        <Earn
          componentFocused={componentFocused}
          setComponentFocused={setComponentFocused}
        />
      ) : activeComponent === 'Settings' ? (
        <Settings
          componentFocused={componentFocused}
          setComponentFocused={setComponentFocused}
          handleOpenDetails={handleOpenDetails}
          handleOpenVideoPlayer={handleOpenVideoPlayer}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  containerRight: {
    flex: 1,
  },
});

export default RightPageContainer;
