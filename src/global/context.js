import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  AppState,
  Dimensions,
  Platform,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';

export const AuthContext = React.createContext();

export const AuthProvider = ({children}) => {
  const [isControlsAvailable, setIsControlsAvailable] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(null); // bolean
  const [loading, setLoading] = useState(true);
  const [isConnexionTroubles, setIsConnexionTroubles] = useState(false);

  const [isAuth, setIsAuth] = useState(false);
  const [JWT_TOKEN, setJWT_TOKEN] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userInfos, setUserInfos] = useState(null);
  const [expDate, setExpDate] = useState(30);

  const [language, setLanguage] = useState(null);
  const [appInfos, setAppInfos] = useState({
    logo: '',
    fadedLogo: '',
    colors: null,
    lang: null,
    timeoutRequest: 0,
    logoWidth: 0,
    logoHeight: 0,
  });

  const [searchListItemWidth, setSearchListItemWidth] = useState(0);

  const [homeListHeight, setHomeListHeight] = useState({
    thumbnail: 0,
    portrait: 0,
    item_thumbnail: {
      height: 0,
      width: 0,
    },
    item_portrait: {
      height: 0,
      width: 0,
    },
  });

  const [tvListHeight, setTvListHeight] = useState({
    thumbnail: 0,
    item_thumbnail: {
      height: 0,
      width: 0,
    },
  });

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  const [globalDimensions, setGlobalDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    setGlobalDimensions({
      height: Dimensions.get('window').height,
      width: Dimensions.get('window').width,
    });
  }, [Dimensions]);

  useEffect(() => {
    if (searchListItemWidth > 0) return;
    const itemWidth =
      (Dimensions.get('window').width -
        (Platform.isTV ? 250 : 225) -
        66 -
        26 -
        20) /
        4 -
      5;
    setSearchListItemWidth(itemWidth);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // if (
      //   appState.current.match(/inactive|background/) &&
      //   nextAppState === 'active'
      // ) {
      //   console.log('App has come to the foreground!');
      // }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    fetch(`${process.env.PATH_CUSTOM_API}/get_app_info`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 200) {
          const Bcolor = res.data.style.background_color;
          const newBColor = `${Bcolor[0]}, ${Bcolor[1]}, ${Bcolor[2]}`;

          const Ecolor = res.data.style.card_color;
          const newEColor = `${Ecolor[0]}, ${Ecolor[1]}, ${Ecolor[2]}`;

          const Bordercolor = res.data.style.border_color;
          const newBordercolor = `${Bordercolor[0]}, ${Bordercolor[1]}, ${Bordercolor[2]}`;

          const MColor = res.data.style.main_color;
          const newMColor = `${MColor[0]}, ${MColor[1]}, ${MColor[2]}`;

          const G1Color = res.data.style.grey1;
          const newG1Color = `${G1Color[0]}, ${G1Color[1]}, ${G1Color[2]}`;

          const G2Color = res.data.style.grey2;
          const newG2Color = `${G2Color[0]}, ${G2Color[1]}, ${G2Color[2]}`;

          const G3Color = res.data.style.grey3;
          const newG3Color = `${G3Color[0]}, ${G3Color[1]}, ${G3Color[2]}`;

          const G4Color = res.data.style.grey4;
          const newG4Color = `${G4Color[0]}, ${G4Color[1]}, ${G4Color[2]}`;

          const announcementColor1 = res.data.style.announcement_gradient[0];
          const newAnnouncementColor1 = `${announcementColor1[0]}, ${announcementColor1[1]}, ${announcementColor1[2]}`;

          const announcementColor2 = res.data.style.announcement_gradient[1];
          const newAnnouncementColor2 = `${announcementColor2[0]}, ${announcementColor2[1]}, ${announcementColor2[2]}`;

          // const announcementColor3 = res.data.style.announcement_gradient[2];
          // const newAnnouncementColor3 = `${announcementColor3[0]}, ${announcementColor3[1]}, ${announcementColor3[2]}`;

          const newColors = {
            main: newMColor,
            secondary: res.data.style.secondary_color,
            tertiary: res.data.style.tertiary_color,
            element: newEColor,
            background: newBColor,
            border: newBordercolor,
            grey1: newG1Color,
            grey2: newG2Color,
            grey3: newG3Color,
            grey4: newG4Color,
            opacity: res.data.style.opacity,
            announcementGradientColor1: newAnnouncementColor1,
            announcementGradientColor2: newAnnouncementColor2,
            // announcementGradientColor3: newAnnouncementColor3,
          };

          const newLang = JSON.parse(res.data.languages);
          _getStoredIds();
          _getDeviceLang(newLang);
          setAppInfos({
            logo: res.data.logo,
            fadedLogo: res.data.faded_logo,
            logoWidth: res.data.logo_width,
            logoHeight: res.data.logo_height,
            colors: newColors,
            lang: newLang,
            timeoutRequest: res.data.timeout,
            progressSpacing: res.data.progress_spacing,
            maxElements: res.data.number_to_load,
          });
        }
      });
  }, []);

  useEffect(() => {
    if (isConnexionTroubles) _getStoredIds();
  }, [isConnexionTroubles]);

  useEffect(() => {
    if (!userInfos || !userInfos.exp_date) return;
    const timeLeft = userInfos.exp_date * 1000 - Date.now();
    const days = Math.floor(timeLeft / 1000 / 60 / 60 / 24);
    setExpDate(days);
  }, [userInfos]);

  const _getDeviceLang = async newLang => {
    const values = await AsyncStorage.getItem('lang');
    const parseValue = JSON.parse(values);
    if (parseValue !== null) {
      setLanguage(parseValue);
    } else {
      const data = RNLocalize.getLocales();
      if (
        data &&
        data[0] &&
        data[0].languageCode &&
        newLang[data[0].languageCode] !== undefined
      )
        setLanguage(data[0].languageCode);
      // setLanguage('fr');
      else {
        setLanguage('fr');
      }
    }
  };

  const _storeIds = async (username, password) => {
    const val = JSON.stringify({
      username: username,
      password: password,
    });
    try {
      await AsyncStorage.setItem('authIds', val);
      if (username.length > 0) await AsyncStorage.setItem('lastIds', val);
    } catch (error) {
      // Error saving data
    }
  };

  const _getStoredIds = async () => {
    try {
      const values = await AsyncStorage.getItem('authIds');
      const parseValue = JSON.parse(values);
      if (parseValue !== null) {
        fetch(
          `${process.env.PATH_CUSTOM_API}/get_jwt_token?username=${parseValue.username}&password=${parseValue.password}`,
        )
          .then(res => res.json())
          .then(res => {
            if (res.status === 200) {
              setUsername(parseValue.username);
              setPassword(parseValue.password);
              setJWT_TOKEN(res.jwt_token);
              setIsAuth(true);
              setLoading(false);
              setUserInfos(res.data);
            } else {
              setLoading(false);
              setIsAuth(false);
            }
            setIsConnexionTroubles(false);
          });
      } else {
        setLoading(false);
      }
    } catch (error) {
      // setIsAuth(false);
      setLoading(false);
      setIsConnexionTroubles(true);
      // setIsConnexionTroubles(false)
    }
  };

  const handleLogin = (username, password) => {
    setIsSendingRequest(true);
    // setLoading(true);

    fetch(
      `${process.env.PATH_CUSTOM_API}/get_jwt_token?username=${username}&password=${password}`,
    )
      .then(res => res.json())
      .then(res => {
        if (res.status === 200) {
          _storeIds(username, password);
          setUsername(username);
          setPassword(password);
          setJWT_TOKEN(res.jwt_token);
          setIsAuth(true);
          setUserInfos(res.data);
          setIsSendingRequest(null);
        } else {
          setIsAuth(false);
          setIsSendingRequest(false);
        }
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {});
  };

  const handleLogout = () => {
    setLoading(true);
    _storeIds('', '');
    setUsername('');
    setPassword('');
    setJWT_TOKEN(null);
    setIsAuth(false);
    setLoading(false);
  };

  const handleChangeLang = async lang => {
    setLanguage(lang);

    const val = JSON.stringify(lang);
    try {
      await AsyncStorage.setItem('lang', val);
    } catch (error) {
      // Error saving data
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuth,
        handleLogin,
        JWT_TOKEN,
        username,
        password,
        handleLogout,
        language,
        handleChangeLang,
        userInfos,
        isControlsAvailable,
        setIsControlsAvailable,
        homeListHeight,
        setHomeListHeight,
        tvListHeight,
        setTvListHeight,
        setIsSendingRequest,
        isSendingRequest,
        _getStoredIds,
        appInfos,
        setIsConnexionTroubles,
        isConnexionTroubles,
        appStateVisible,
        searchListItemWidth,
        globalDimensions,
        expDate,
      }}>
      {!loading && language && appInfos.colors ? (
        <View style={{width: '100%', height: '100%'}}>{children}</View>
      ) : (
        <View
          style={{
            zIndex: 9999,
            width: '100%',
            height: '100%',
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `rgb(${
              appInfos.colors ? appInfos.colors.background : ' 15,15,15'
            })`,
          }}>
          <ActivityIndicator
            size="large"
            color={
              appInfos.colors
                ? `rgb(${appInfos.colors.grey4})`
                : 'rgb(150,150,150)'
            }
            // opacity={colors ? colors.opacity : 1}
          />
        </View>
      )}
    </AuthContext.Provider>
  );
};
