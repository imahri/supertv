import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ToastMessage = ({ message, visible, onHide }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, 1000); // 1 second

      return () => clearTimeout(timer); // Clean up the timer on component unmount
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.toast_in}>
      <Text style={styles.icon}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  toast_in: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '#fff',
    fontSize: 14,
  },
});

export default ToastMessage;
