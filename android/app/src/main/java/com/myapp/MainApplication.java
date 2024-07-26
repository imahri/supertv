package com.myapp;

import android.app.Application;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG; // Returns true if in debug mode
        }

        @Override
        protected List<ReactPackage> getPackages() {
          // Automatically add all packages from the "PackageList" generated from react-native.
          List<ReactPackage> packages = new PackageList(this).getPackages();
          packages.add(new NetworkPackage());
          // You can manually add non-autolinked packages here if needed.
          // Example: packages.add(new KCKeepAwakePackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index"; // Specifies the entry point of your JavaScript bundle
        }

        @Override
        protected boolean isNewArchEnabled() {
          return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED; // Indicates if new architecture is enabled
        }

        @Override
        protected Boolean isHermesEnabled() {
          return BuildConfig.IS_HERMES_ENABLED; // Indicates if Hermes (JavaScript engine) is enabled
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false); // Initializes SoLoader for native libraries
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // Loads native entry point for the new architecture if enabled
      DefaultNewArchitectureEntryPoint.load();
    }
    ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
    // Initialize Flipper for debugging purposes
  }
}


// package com.myapp;

// import android.app.Application;
// import com.facebook.react.PackageList;
// import com.facebook.react.ReactApplication;
// import com.facebook.react.ReactNativeHost;
// import com.facebook.react.ReactPackage;
// import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
// import com.facebook.react.defaults.DefaultReactNativeHost;
// import com.facebook.soloader.SoLoader;
// import java.util.List;

// public class MainApplication extends Application implements ReactApplication {

//   private final ReactNativeHost mReactNativeHost =
//       new DefaultReactNativeHost(this) {
//         @Override
//         public boolean getUseDeveloperSupport() {
//           return BuildConfig.DEBUG; // Returns true if in debug mode
//         }

//         @Override
//         protected List<ReactPackage> getPackages() {
//           List<ReactPackage> packages = new PackageList(this).getPackages();
//           packages.add(new NetworkPackage()); // Add this line to include your package
//           return packages;
//         }

//         @Override
//         protected String getJSMainModuleName() {
//           return "index"; // Specifies the entry point of your JavaScript bundle
//         }

//         @Override
//         protected boolean isNewArchEnabled() {
//           return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED; // Indicates if new architecture is enabled
//         }

//         @Override
//         protected Boolean isHermesEnabled() {
//           return BuildConfig.IS_HERMES_ENABLED; // Indicates if Hermes (JavaScript engine) is enabled
//         }
//       };

//   @Override
//   public ReactNativeHost getReactNativeHost() {
//     return mReactNativeHost;
//   }

//   @Override
//   public void onCreate() {
//     super.onCreate();
//     SoLoader.init(this, /* native exopackage */ false); // Initializes SoLoader for native libraries
//     if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
//       // Loads native entry point for the new architecture if enabled
//       DefaultNewArchitectureEntryPoint.load();
//     }
//     ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
//     // Initialize Flipper for debugging purposes
//   }
// }
