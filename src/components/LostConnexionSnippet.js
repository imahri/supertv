import React, {useContext} from 'react';
import {Text, View} from 'react-native';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AuthContext} from '../global/context';

const LostConnexionSnippet = () => {
  const {appInfos, language} = useContext(AuthContext);

  return (
    <View style={{alignItems: 'center'}}>
      <MCIcon
        name="wifi-alert"
        color={`rgb(${appInfos.colors.grey3})`}
        size={30}
        accessible={false}
      />
      <Text
        style={{
          fontFamily: 'Inter-Bold',
          color: `rgb(${appInfos.colors.grey3})`,
          fontSize: 13,
        }}>
        {appInfos.lang[language].data.global.lost_connexion}
      </Text>
    </View>
  );
};

export default LostConnexionSnippet;
