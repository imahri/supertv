import React, {useRef, useState, useEffect, useCallback, useContext} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Dimensions,
  Image,

} from 'react-native';

import * as Progress from 'react-native-progress';


import bg from '../../android/app/src/main/res/drawable/logo.png';
import DeviceInfo from 'react-native-device-info';


const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const Login = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const getUniqueIdSync = DeviceInfo.getUniqueIdSync();
  const getDeviceId = DeviceInfo.getDeviceId();
  const getDeviceType = DeviceInfo.getDeviceType();
  const getSystemName = DeviceInfo.getSystemName();
  const getBrand = DeviceInfo.getBrand();
  const getModel = DeviceInfo.getModel();
  const getApiLevelSync = DeviceInfo.getApiLevelSync();
  const getMacAddressSync = DeviceInfo.getMacAddressSync();
  const getVersion = DeviceInfo.getSystemVersion();

  

  const deviceInfo = [
    { label: "Device Type", value: getDeviceType },
    { label: "Device ID", value: getDeviceId },
    { label: "Brand", value: getBrand },

    { label: "System Name", value: getSystemName },
    { label: "Unique ID", value: getUniqueIdSync },
    { label: "Model", value: getModel },
    { label: "API Level", value: getApiLevelSync },
    { label: "MAC Address", value: getMacAddressSync },
    { label: "Android Version", value: getVersion },
  ];


  console.log('****************************************');
  console.log("Device Type",{getDeviceType});
  console.log("Device ID",{getDeviceId});
  console.log("Brand",{getBrand});
  console.log("Model",{getSystemName});
  console.log("Unique ID",{getUniqueIdSync});
  console.log("Device Type",{getModel});
  console.log("API Level",{getApiLevelSync});
  console.log("MAC Address",{getMacAddressSync});
  console.log("Android Version", {getVersion});
  console.log('****************************************');


  return (
    <SafeAreaView style={[styles.container]}>
      <View style={styles.loadingContainer}>
      <Image
          source={bg}
          style={styles.logo}
          resizeMode="contain"
        />
        <Progress.Circle
          indeterminate={true}
          endAngle={0.7}
          color='#eeeee4'
          borderWidth={4}
          size={40}

        />
        {/* <Text style={styles.loadingText}>Loading ...</Text> */}
      </View>

      {/* Icon button */}
      <View style={styles.centeredContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.icon}>i</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Device Information</Text>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              {deviceInfo.map((info, index) => (
                <View key={index} style={styles.deviceInfoContainer}>
                  <Text style={styles.deviceInfoLabel}>{info.label}</Text>
                  <Text style={styles.deviceInfoValue}>{info.value}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setModalVisible(!modalVisible)} style={styles.buttonClose}>
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 100,  // Adjust width and height as needed
    height: 100,
  },
  centeredContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 20,
    color: 'white',
  },
  iconButton: {
    backgroundColor: '#1e81b0',
    height: 30,
    width: 30,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  icon: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 5,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: windowHeight * 0.75,
    maxWidth: windowWidth * 0.5,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: 'black',
  },
  deviceInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap:5,
    
    width: '100%',
    marginBottom: 10,
  },
  deviceInfoLabel: {
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
    width: '40%',
  },
  deviceInfoValue: {
    fontSize: 16,
    color: 'black',
    width: '60%',
  },
});

export default Login;
