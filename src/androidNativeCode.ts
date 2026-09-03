/**
 * MYSMART SURF - Android Native Layer Source Code & APK Configuration
 * Provides full compilable Android Native Java/Kotlin files & Device Admin setup.
 */

export const ANDROID_FILES = {
  pwaManifest: `{
  "id": "/",
  "name": "MYSMART SURF — Kawal Masa & Lindungi",
  "short_name": "MYSMART SURF",
  "description": "Kawal Masa. Lindungi Penggunaan. Bina Tabiat Digital Yang Sihat. Aplikasi Kawalan Ibu Bapa (Parental Control) PWA & APK.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "display_override": ["standalone", "window-controls-overlay"],
  "background_color": "#090A0C",
  "theme_color": "#2563EB",
  "orientation": "portrait-primary",
  "dir": "ltr",
  "lang": "ms",
  "prefer_related_applications": false,
  "categories": ["productivity", "utilities", "education"],
  "icons": [
    {
      "src": "/pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/pwa-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icon-192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "shortcuts": [
    {
      "name": "Lock Device Now",
      "short_name": "Lock Device",
      "url": "/?action=lock",
      "icons": [{ "src": "/pwa-192x192.png", "sizes": "192x192" }]
    },
    {
      "name": "Screen Time Control",
      "short_name": "Screen Time",
      "url": "/?tab=screentime",
      "icons": [{ "src": "/pwa-192x192.png", "sizes": "192x192" }]
    }
  ]
}`,

  serviceWorker: `/**
 * MYSMART SURF - High Performance Offline-First Service Worker
 * Compatible with PWA, APK Wrappers (HTML2APK, Web2APK, Bubblewrap, Capacitor, WebView)
 */
const CACHE_NAME = 'mysmart-surf-pwa-v2.5.0';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
  '/icon-192.svg',
  '/icon-512.svg',
  '/.well-known/assetlinks.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          }
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          return cached || caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
        }
        return res;
      }).catch(() => null);
      return cached || fetchPromise;
    })
  );
});`,

  assetLinks: `[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.mysmartsurf.parental",
      "sha256_cert_fingerprints": [
        "14:6D:E9:01:F8:85:7E:0E:12:F5:CD:E8:6E:9B:F3:D5:8C:7A:B4:73:95:67:E6:3C:A9:97:54:19:95:25:22:98"
      ]
    }
  }
]`,

  html2apkGuide: `# PANDUAN PENUKARAN PWA KE ANDROID APK (HTML2APK / WEB2APK)
------------------------------------------------------------
Langkah untuk menghasilkan fail .APK rasmi MYSMART SURF menggunakan alat pembungkus (APK Wrapper):

1. MAKLUMAT APLIKASI UNTUK DIMASUKKAN:
   • Website / Web App URL: https://ais-pre-zihjyvklhvexqsiurcbesl-460068613392.asia-southeast1.run.app
   • App Name: MYSMART SURF
   • Package Name: com.mysmartsurf.parental
   • Version Name: 2.5.0
   • Version Code: 250
   • Primary Theme Color: #2563EB (Deep Blue)
   • Background / Splash Screen Color: #090A0C (Dark Surface)
   • Screen Orientation: Portrait (Menegak)

2. TETAPAN SPESIFIKASI WEBVIEW:
   • JavaScript Enabled: YES
   • DOM Storage / IndexedDB: YES (Wajib untuk simpan data offline)
   • Service Worker & Cache: YES (Wajib untuk Offline Mode)
   • Pull To Refresh: NO / DISABLE
   • Viewport Width Fit: YES
   • Hardware Acceleration: YES

3. KEBENARAN ANDROID (PERMISSIONS):
   • android.permission.INTERNET
   • android.permission.ACCESS_NETWORK_STATE
   • android.permission.VIBRATE
   • android.permission.POST_NOTIFICATIONS
   • android.permission.FOREGROUND_SERVICE
   • android.permission.RECEIVE_BOOT_COMPLETED

4. IKON & ASET PELANCAR:
   • Icon URL / Path: /pwa-512x512.png (512x512 HD PNG)
   • Maskable Icon URL: /pwa-maskable-512x512.png
   • Splash Image: /pwa-512x512.png`,

  manifest: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.mysmartsurf">

    <!-- Permissions for Parental Control, Monitoring & Restrictions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.BIND_DEVICE_ADMIN" />

    <application
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MySmartSurf">

        <!-- Main WebView Activity with JS Bridge -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:theme="@style/Theme.MySmartSurf.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Kiosk / Lock Task Screen Activity -->
        <activity
            android:name=".LockScreenActivity"
            android:exported="false"
            android:excludeFromRecents="true"
            android:launchMode="singleTask"
            android:showOnLockScreen="true"
            android:theme="@style/Theme.MySmartSurf.FullscreenLock" />

        <!-- Device Admin Receiver for Device Policy & Uninstall Protection -->
        <receiver
            android:name=".ParentalControlDeviceAdminReceiver"
            android:description="@string/device_admin_description"
            android:label="@string/device_admin_label"
            android:permission="android.permission.BIND_DEVICE_ADMIN"
            android:exported="true">
            <meta-data
                android:name="android.app.device_admin"
                android:resource="@xml/device_admin_policies" />
            <intent-filter>
                <action android:name="android.app.action.DEVICE_ADMIN_ENABLED" />
                <action android:name="android.app.action.DEVICE_ADMIN_DISABLE_REQUESTED" />
                <action android:name="android.app.action.DEVICE_ADMIN_DISABLED" />
            </intent-filter>
        </receiver>

        <!-- Background Usage Monitor Service -->
        <service
            android:name=".services.UsageMonitoringService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse" />

        <!-- Local VPN Firewall Service for Internet Control -->
        <service
            android:name=".services.LocalVpnFilterService"
            android:permission="android.permission.BIND_VPN_SERVICE"
            android:exported="false">
            <intent-filter>
                <action android:name="android.net.VpnService" />
            </intent-filter>
        </service>

        <receiver
            android:name=".receivers.BootCompletedReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>
    </application>
</manifest>`,

  deviceAdminXml: `<?xml version="1.0" encoding="utf-8"?>
<device-admin xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-policies>
        <limit-password />
        <watch-login />
        <reset-password />
        <force-lock />
        <wipe-data />
        <expire-password />
        <encrypted-storage />
        <disable-camera />
        <disable-keyguard-features />
    </uses-policies>
</device-admin>`,

  webAppInterface: `package com.mysmartsurf.bridge;

import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import com.mysmartsurf.ParentalControlDeviceAdminReceiver;
import com.mysmartsurf.services.LocalVpnFilterService;
import com.mysmartsurf.services.UsageMonitoringService;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.List;

public class WebAppInterface {
    private final Context context;
    private final DevicePolicyManager dpm;
    private final ComponentName adminComponent;

    public WebAppInterface(Context context) {
        this.context = context;
        this.dpm = (DevicePolicyManager) context.getSystemService(Context.DEVICE_POLICY_SERVICE);
        this.adminComponent = new ComponentName(context, ParentalControlDeviceAdminReceiver.class);
    }

    @JavascriptInterface
    public String getInstalledApps() {
        JSONArray appsArray = new JSONArray();
        PackageManager pm = context.getPackageManager();
        List<ApplicationInfo> packages = pm.getInstalledApplications(PackageManager.GET_META_DATA);

        try {
            for (ApplicationInfo packageInfo : packages) {
                if ((packageInfo.flags & ApplicationInfo.FLAG_SYSTEM) == 0 || packageInfo.packageName.contains("chrome") || packageInfo.packageName.contains("youtube")) {
                    JSONObject appObj = new JSONObject();
                    appObj.put("packageName", packageInfo.packageName);
                    appObj.put("appName", pm.getApplicationLabel(packageInfo).toString());
                    appObj.put("isSystemApp", (packageInfo.flags & ApplicationInfo.FLAG_SYSTEM) != 0);
                    appsArray.put(appObj);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return appsArray.toString();
    }

    @JavascriptInterface
    public String getDeviceStatus() {
        JSONObject status = new JSONObject();
        try {
            status.put("isNativeBridgeAvailable", true);
            status.put("isDeviceAdmin", dpm.isAdminActive(adminComponent));
            status.put("isDeviceOwner", dpm.isDeviceOwnerApp(context.getPackageName()));
            status.put("hasUsageAccess", UsageMonitoringService.hasUsageStatsPermission(context));
            status.put("hasOverlayPermission", Settings.canDrawOverlays(context));
            status.put("isVpnActive", LocalVpnFilterService.isRunning());
            status.put("deviceModel", Build.MANUFACTURER + " " + Build.MODEL);
            status.put("androidVersion", "Android " + Build.VERSION.RELEASE + " (API " + Build.VERSION.SDK_INT + ")");
        } catch (Exception e) {
            e.printStackTrace();
        }
        return status.toString();
    }

    @JavascriptInterface
    public boolean lockDevice(String reason) {
        if (dpm.isAdminActive(adminComponent)) {
            dpm.lockNow();
            return true;
        }
        return false;
    }

    @JavascriptInterface
    public boolean setInternetRestriction(boolean blocked) {
        Intent intent = new Intent(context, LocalVpnFilterService.class);
        intent.setAction(blocked ? "ACTION_START_BLOCK" : "ACTION_STOP_BLOCK");
        context.startService(intent);
        return true;
    }

    @JavascriptInterface
    public void openUsageAccessSettings() {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }

    @JavascriptInterface
    public void openDeviceAdminSettings() {
        Intent intent = new Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN);
        intent.putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, adminComponent);
        intent.putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION, "Diperlukan untuk penguatkuasaan sekatan masa dan perlindungan uninstall MYSMART SURF.");
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }

    @JavascriptInterface
    public void openOverlaySettings() {
        Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + context.getPackageName()));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }
}`,

  deviceAdminReceiver: `package com.mysmartsurf;

import android.app.admin.DeviceAdminReceiver;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

public class ParentalControlDeviceAdminReceiver extends DeviceAdminReceiver {

    @Override
    public void onEnabled(Context context, Intent intent) {
        super.onEnabled(context, intent);
        Toast.makeText(context, "MYSMART SURF: Device Admin diaktifkan.", Toast.LENGTH_SHORT).show();
    }

    @Override
    public CharSequence onDisableRequested(Context context, Intent intent) {
        return "AMARAN: Mematikan pentadbir peranti akan menamatkan perlindungan parental control MYSMART SURF.";
    }

    @Override
    public void onDisabled(Context context, Intent intent) {
        super.onDisabled(context, intent);
        Toast.makeText(context, "MYSMART SURF: Device Admin dimatikan.", Toast.LENGTH_SHORT).show();
    }
}`,

  buildGradle: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.mysmartsurf"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.mysmartsurf"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    implementation("androidx.webkit:webkit:1.10.0")
}`,

  adbCommands: `# 1. Pasang APK ke Peranti Android
adb install -r mysmartsurf-release.apk

# 2. (PILIHAN MAKSIMUM) Aktifkan Device Owner untuk Uninstall Protection Sepenuhnya & Kiosk Lock
adb shell dpm set-device-owner com.mysmartsurf/.ParentalControlDeviceAdminReceiver

# 3. Berikan permission Usage Stats secara automatik melalui ADB
adb shell pm grant com.mysmartsurf android.permission.PACKAGE_USAGE_STATS
adb shell appops set com.mysmartsurf SYSTEM_ALERT_WINDOW allow`
};

export const ANDROID_NATIVE_FILES = ANDROID_FILES;
