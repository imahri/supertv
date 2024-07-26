package com.myapp;

import android.util.Log;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import java.net.NetworkInterface;
import java.util.Collections;
import java.util.List;

public class NetworkModule extends ReactContextBaseJavaModule {

    private static final String TAG = "NetworkModule";

    public NetworkModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "NetworkModule";
    }

    @ReactMethod
    public void getEthernetMacAddress(Promise promise) {
        String macAddress = "Not able to read";
        try {
            List<NetworkInterface> allNetworkInterfaces = Collections.list(NetworkInterface.getNetworkInterfaces());
            for (NetworkInterface nif : allNetworkInterfaces) {
                if (!nif.getName().equalsIgnoreCase("eth0"))
                    continue;

                byte[] macBytes = nif.getHardwareAddress();
                if (macBytes == null) {
                    promise.resolve(macAddress);
                    return;
                }

                StringBuilder res1 = new StringBuilder();
                for (byte b : macBytes) {
                    res1.append(String.format("%02X:", b));
                }

                if (res1.length() > 0) {
                    res1.deleteCharAt(res1.length() - 1);
                }
                macAddress = res1.toString();
            }
            promise.resolve(macAddress);
        } catch (Exception ex) {
            Log.e(TAG, "getEthernetMacAddress: ", ex);
            promise.reject("Error", ex);
        }
    }
}
