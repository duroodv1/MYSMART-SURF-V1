import JSZip from 'jszip';
import { ANDROID_FILES } from '../androidNativeCode';

export interface PwaPackageOptions {
  appUrl?: string;
  appName?: string;
  packageName?: string;
  versionName?: string;
}

/**
 * Generate Pure PWA Bundle ZIP (Self-contained standalone build)
 * Bundles the actual compiled React app (HTML, CSS, JS, manifest, SW, icons)
 * so that opening index.html directly or running a local server will work 100% offline!
 */
export async function generatePurePwaZip(options: PwaPackageOptions = {}): Promise<Blob> {
  const zip = new JSZip();
  const appName = options.appName || 'MYSMART SURF';

  // 1. Fetch the actual built index.html from the running applet
  let indexHtmlContent = '';
  try {
    const res = await fetch('/');
    if (res.ok) {
      indexHtmlContent = await res.text();
    }
  } catch (e) {
    console.warn('Could not fetch root index.html, using fallback template:', e);
  }

  // 2. Fetch all built assets from /dist/assets if available
  const assetsFolder = zip.folder('assets');
  const knownAssets = [
    { url: '/assets/index-DX1mBumE.js', filename: 'index-DX1mBumE.js', isText: true },
    { url: '/assets/index-BzyPDxRo.css', filename: 'index-BzyPDxRo.css', isText: true }
  ];

  // Try to parse asset links from indexHtmlContent dynamically if possible
  if (indexHtmlContent) {
    const scriptMatches = indexHtmlContent.matchAll(/src="\/assets\/([^"]+)"/g);
    for (const match of scriptMatches) {
      const assetPath = `/assets/${match[1]}`;
      const assetFile = match[1];
      try {
        const aRes = await fetch(assetPath);
        if (aRes.ok) {
          const aBlob = await aRes.blob();
          if (assetsFolder) assetsFolder.file(assetFile, aBlob);
        }
      } catch (err) {
        console.warn(`Failed to fetch asset ${assetPath}:`, err);
      }
    }

    const cssMatches = indexHtmlContent.matchAll(/href="\/assets\/([^"]+)"/g);
    for (const match of cssMatches) {
      const assetPath = `/assets/${match[1]}`;
      const assetFile = match[1];
      try {
        const aRes = await fetch(assetPath);
        if (aRes.ok) {
          const aBlob = await aRes.blob();
          if (assetsFolder) assetsFolder.file(assetFile, aBlob);
        }
      } catch (err) {
        console.warn(`Failed to fetch asset ${assetPath}:`, err);
      }
    }

    // Convert absolute asset paths /assets/ to relative ./assets/ for standalone file:// or offline opening
    let localizedHtml = indexHtmlContent
      .replaceAll('src="/assets/', 'src="./assets/')
      .replaceAll('href="/assets/', 'href="./assets/')
      .replaceAll('href="/manifest.json"', 'href="./manifest.json"')
      .replaceAll('src="/sw.js"', 'src="./sw.js"')
      .replaceAll('href="/', 'href="./');

    zip.file('index.html', localizedHtml);
  } else {
    // Fallback index.html with self-contained bundle
    zip.file('index.html', `<!doctype html>
<html lang="ms">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${appName} — Standalone</title>
  <link rel="manifest" href="./manifest.json" />
  <link rel="stylesheet" href="./assets/index-BzyPDxRo.css" />
</head>
<body class="bg-slate-950 text-slate-100">
  <div id="root"></div>
  <script type="module" src="./assets/index-DX1mBumE.js"></script>
</body>
</html>`);
  }

  // 3. Web App Manifest & Service Worker
  zip.file('manifest.json', ANDROID_FILES.pwaManifest);
  zip.file('sw.js', ANDROID_FILES.serviceWorker);

  // 4. Netlify & GitHub Pages Configuration Files
  zip.file('.nojekyll', '');
  zip.file('404.html', `<!doctype html>
<html lang="ms">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MYSMART SURF — Memuatkan Semula...</title>
    <script>
      const pathname = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;
      const pathSegments = pathname.split('/').filter(Boolean);
      const repoBase = pathSegments.length > 0 ? '/' + pathSegments[0] + '/' : '/';
      window.location.replace(repoBase + (search || '') + (hash || ''));
    </script>
  </head>
  <body style="background:#090A0C;color:#94A3B8;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
    <p>Menghubungkan ke MYSMART SURF...</p>
  </body>
</html>`);

  // GitHub Actions Pages Deployment Workflow
  const githubWorkflowsFolder = zip.folder('.github')?.folder('workflows');
  if (githubWorkflowsFolder) {
    githubWorkflowsFolder.file('deploy.yml', `name: Deploy to GitHub Pages

on:
  push:
    branches: ["main", "master"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci || npm install
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - id: deployment
        uses: actions/deploy-pages@v4
`);
  }

  zip.file('_redirects', '/*    /index.html   200\n');
  zip.file('_headers', `/sw.js
  Cache-Control: no-cache, no-store, must-revalidate
  Service-Worker-Allowed: /

/manifest.json
  Content-Type: application/manifest+json; charset=utf-8
  Cache-Control: no-cache

/.well-known/assetlinks.json
  Content-Type: application/json
  Access-Control-Allow-Origin: *

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`);
  zip.file('netlify.toml', `[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
    Service-Worker-Allowed = "/"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json; charset=utf-8"
    Cache-Control = "no-cache"

[[headers]]
  for = "/.well-known/assetlinks.json"
  [headers.values]
    Content-Type = "application/json"
    Access-Control-Allow-Origin = "*"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
`);

  // 5. Instructions in Malay for PWA & Netlify Deployment
  const pwaGuide = `=====================================================
PANDUAN LENGKAP PENGGUNAAN PAKEJ PWA & NETLIFY DEPLOYMENT
APLIKASI: ${appName}
=====================================================

Pakej ini mengandungi KESELURUHAN KOD SUMBER BINAAN APLIKASI (Full Standalone Offline App):

1. index.html
   - Fail utama aplikasi dengan sokongan modul Javascript React.

2. Folder assets/
   - Mengandungi fail Javascript kompilasi React dan stylesheet Tailwind CSS yang lengkap.

3. manifest.json & sw.js
   - Fail PWA Web App Manifest dan Service Worker offline cache.

4. Fail Konfigurasi Netlify:
   - _redirects : Memastikan Single Page App (SPA) routing tidak 404 pada Netlify.
   - _headers   : Caching pantas untuk Service Worker, manifest, dan aset statik.
   - netlify.toml : Tetapan build rasmi Netlify (Publish: dist, Node 20).

-----------------------------------------------------
CARA DEPLOY KE NETLIFY DALAM 1 MINIT (NETLIFY DROP):
-----------------------------------------------------
1. Buka laman sesawang: https://app.netlify.com/drop
2. Tarik (drag & drop) keseluruhan folder hasil ekstrak ZIP ini ke dalam kotak Netlify.
3. Netlify akan segera memberikan pautan URL HTTPS percuma (cth: https://mysmart-surf.netlify.app).
4. Aplikasi boleh terus dipasang sebagai PWA dari pautan Netlify tersebut!

-----------------------------------------------------
CARA MEMBUKA SECARA TEMPATAN (LOCAL):
-----------------------------------------------------
- Buka terminal/command prompt di dalam folder hasil ekstrak ZIP ini.
- Jalankan arahan: npx serve (atau 'python -m http.server 8080')
- Buka di pelayar: http://localhost:3000 atau http://localhost:8080
`;
  zip.file('PWA_PANDUAN_PEMASANGAN.txt', pwaGuide);

  // 6. .well-known/assetlinks.json
  const wellKnownFolder = zip.folder('.well-known');
  if (wellKnownFolder) {
    wellKnownFolder.file('assetlinks.json', ANDROID_FILES.assetLinks);
  }

  // 7. Icons folder (Fetch existing PNG and SVG icons from public)
  const iconsFolder = zip.folder('icons');
  const iconFiles = [
    'pwa-192x192.png',
    'pwa-512x512.png',
    'pwa-maskable-512x512.png',
    'apple-touch-icon.png',
    'favicon.png',
    'icon-192.svg',
    'icon-512.svg'
  ];

  for (const iconFile of iconFiles) {
    try {
      const res = await fetch(`/${iconFile}`);
      if (res.ok) {
        const blob = await res.blob();
        if (iconsFolder) iconsFolder.file(iconFile, blob);
        // Also place at root for manifest relative paths
        zip.file(iconFile, blob);
      }
    } catch (err) {
      console.warn(`Could not bundle icon ${iconFile}:`, err);
    }
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

/**
 * Generate Full HTML2APK / Native Wrapper Bundle ZIP (includes Android Native Java & Gradle files)
 */
export async function generateHtml2ApkZip(options: PwaPackageOptions = {}): Promise<Blob> {
  const zip = new JSZip();
  const origin = options.appUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-zihjyvklhvexqsiurcbesl-460068613392.asia-southeast1.run.app');
  const appName = options.appName || 'MYSMART SURF';
  const packageName = options.packageName || 'com.mysmartsurf.parental';
  const versionName = options.versionName || '2.5.0';

  // 1. Root PWA Configuration Files
  zip.file('manifest.json', ANDROID_FILES.pwaManifest);
  zip.file('sw.js', ANDROID_FILES.serviceWorker);

  // Netlify & GitHub Pages Configuration Files
  zip.file('.nojekyll', '');
  zip.file('404.html', `<!doctype html>
<html lang="ms">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MYSMART SURF — Memuatkan Semula...</title>
    <script>
      const pathname = window.location.pathname;
      const search = window.location.search;
      const hash = window.location.hash;
      const pathSegments = pathname.split('/').filter(Boolean);
      const repoBase = pathSegments.length > 0 ? '/' + pathSegments[0] + '/' : '/';
      window.location.replace(repoBase + (search || '') + (hash || ''));
    </script>
  </head>
  <body style="background:#090A0C;color:#94A3B8;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
    <p>Menghubungkan ke MYSMART SURF...</p>
  </body>
</html>`);

  const apkGithubWorkflows = zip.folder('.github')?.folder('workflows');
  if (apkGithubWorkflows) {
    apkGithubWorkflows.file('deploy.yml', `name: Deploy to GitHub Pages

on:
  push:
    branches: ["main", "master"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci || npm install
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - id: deployment
        uses: actions/deploy-pages@v4
`);
  }

  zip.file('_redirects', '/*    /index.html   200\n');
  zip.file('_headers', `/sw.js
  Cache-Control: no-cache, no-store, must-revalidate
  Service-Worker-Allowed: /

/manifest.json
  Content-Type: application/manifest+json; charset=utf-8
  Cache-Control: no-cache

/.well-known/assetlinks.json
  Content-Type: application/json
  Access-Control-Allow-Origin: *

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`);
  zip.file('netlify.toml', `[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
    Service-Worker-Allowed = "/"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Content-Type = "application/manifest+json; charset=utf-8"
    Cache-Control = "no-cache"

[[headers]]
  for = "/.well-known/assetlinks.json"
  [headers.values]
    Content-Type = "application/json"
    Access-Control-Allow-Origin = "*"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
`);

  // 2. HTML2APK & Web2APK Configuration XML & JSON
  const configXml = `<?xml version="1.0" encoding="utf-8"?>
<widget id="${packageName}" version="${versionName}" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <name>${appName}</name>
    <description>Aplikasi Kawalan Masa Skrin & Perlindungan Kanak-kanak Android</description>
    <author email="support@mysmartsurf.local" href="${origin}">MYSMART SURF Team</author>
    <content src="${origin}" />
    <access origin="*" />
    <allow-intent href="http://*/*" />
    <allow-intent href="https://*/*" />
    <preference name="Orientation" value="portrait" />
    <preference name="Fullscreen" value="false" />
    <preference name="BackgroundColor" value="#090A0C" />
    <preference name="StatusBarBackgroundColor" value="#090A0C" />
    <preference name="StatusBarStyle" value="lightcontent" />
    <preference name="KeepRunning" value="true" />
    <preference name="DisallowOverscroll" value="true" />
    <preference name="AllowInlineMediaPlayback" value="true" />
    <preference name="ScrollEnabled" value="true" />
    <preference name="LoadUrlTimeoutValue" value="60000" />
    <preference name="OverrideUserAgent" value="Mozilla/5.0 (Linux; Android 14; MYSMART_SURF_APK) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36" />
</widget>`;
  zip.file('config.xml', configXml);

  const appConfigJson = {
    appName,
    packageName,
    versionName,
    versionCode: 250,
    webUrl: origin,
    offlineCacheEnabled: true,
    serviceWorkerEnabled: true,
    domStorageEnabled: true,
    hardwareAcceleration: true,
    themeColor: '#2563EB',
    backgroundColor: '#090A0C',
    orientation: 'portrait',
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.VIBRATE',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.PACKAGE_USAGE_STATS'
    ]
  };
  zip.file('app-config.json', JSON.stringify(appConfigJson, null, 2));

  // 3. Web Entry Point index.html
  let indexHtmlContent = '';
  try {
    const res = await fetch('/');
    if (res.ok) {
      indexHtmlContent = await res.text();
    }
  } catch (e) {
    console.warn('Could not fetch index.html:', e);
  }

  if (indexHtmlContent) {
    zip.file('index.html', indexHtmlContent);
  }

  // 4. Instructions in Malay for HTML2APK
  zip.file('HTML2APK_PANDUAN_LENGKAP.txt', ANDROID_FILES.html2apkGuide);

  // 5. Well-known Digital Asset Links
  const wellKnownFolder = zip.folder('.well-known');
  if (wellKnownFolder) {
    wellKnownFolder.file('assetlinks.json', ANDROID_FILES.assetLinks);
  }

  // 6. Icons folder (Fetch existing PNG and SVG icons from public)
  const iconsFolder = zip.folder('icons');
  if (iconsFolder) {
    const iconFiles = [
      'pwa-192x192.png',
      'pwa-512x512.png',
      'pwa-maskable-512x512.png',
      'apple-touch-icon.png',
      'favicon.png',
      'icon-192.svg',
      'icon-512.svg'
    ];

    for (const iconFile of iconFiles) {
      try {
        const res = await fetch(`/${iconFile}`);
        if (res.ok) {
          const blob = await res.blob();
          iconsFolder.file(iconFile, blob);
          zip.file(iconFile, blob);
        }
      } catch (err) {
        console.warn(`Could not bundle icon ${iconFile}:`, err);
      }
    }
  }

  // 7. Native Android Studio / Gradle Project Source Code
  const nativeFolder = zip.folder('android_native_source');
  if (nativeFolder) {
    nativeFolder.file('AndroidManifest.xml', ANDROID_FILES.manifest);
    nativeFolder.file('WebAppInterface.java', ANDROID_FILES.webAppInterface);
    nativeFolder.file('ParentalControlDeviceAdminReceiver.java', ANDROID_FILES.deviceAdminReceiver);
    nativeFolder.file('device_admin_policies.xml', ANDROID_FILES.deviceAdminXml);
    nativeFolder.file('build.gradle.kts', ANDROID_FILES.buildGradle);
    nativeFolder.file('adb_device_owner_setup.sh', ANDROID_FILES.adbCommands);
  }

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

/**
 * Generate Standalone Android APK Package (HTML2APK / Web2APK / Cordova builder)
 * Contains the essential wrapper assets, config.xml, app-config.json, icons, and instructions
 */
export async function generateApkPackageZip(options: PwaPackageOptions = {}): Promise<Blob> {
  return generateHtml2ApkZip(options);
}

/**
 * Generate Android Native Bridge & Source Code Package (ZIP)
 * Dedicated for developers to integrate WebView JavaScript Interface,
 * Device Policy Manager (Device Owner / Device Admin), and ADB automation scripts.
 */
export async function generateBridgeNativeZip(options: PwaPackageOptions = {}): Promise<Blob> {
  const zip = new JSZip();
  const appName = options.appName || 'MYSMART SURF';
  const packageName = options.packageName || 'com.mysmartsurf.parental';

  // 1. Android Java Source Code
  const javaFolder = zip.folder('app/src/main/java/com/mysmartsurf');
  if (javaFolder) {
    javaFolder.file('ParentalControlDeviceAdminReceiver.java', ANDROID_FILES.deviceAdminReceiver);
    const bridgeFolder = javaFolder.folder('bridge');
    if (bridgeFolder) {
      bridgeFolder.file('WebAppInterface.java', ANDROID_FILES.webAppInterface);
    }
  }

  // 2. Android Resources
  zip.file('app/src/main/res/xml/device_admin_policies.xml', ANDROID_FILES.deviceAdminXml);

  // 3. Android Manifest
  zip.file('app/src/main/AndroidManifest.xml', ANDROID_FILES.manifest);

  // 4. Gradle Build Configuration
  zip.file('app/build.gradle.kts', ANDROID_FILES.buildGradle);

  // 5. ADB Device Owner Setup Script
  zip.file('scripts/adb_device_owner_setup.sh', ANDROID_FILES.adbCommands);

  // 6. Complete Developer Bridge API Documentation
  const bridgeDoc = `# 🔌 MYSMART SURF — Android Native Bridge API Specification

## Pengenalan
Antara muka JavaScript (JavaScript Interface) yang disuntik ke dalam Android WebView untuk membolehkan komunikasi dua hala antara aplikasi web React/PWA dan sistem operasi Android.

## Cara Suntikan dalam WebView (MainActivity.java):
\`\`\`java
WebView webView = findViewById(R.id.webview);
WebSettings webSettings = webView.getSettings();
webSettings.setJavaScriptEnabled(true);
webSettings.setDomStorageEnabled(true);

// Suntik bridge dengan nama 'AndroidBridge'
webView.addJavascriptInterface(new WebAppInterface(this), "AndroidBridge");
\`\`\`

## Senarai Kaedah Bridge (Methods Exposed to window.AndroidBridge):
1. \`isAvailable(): boolean\`
   Mengembalikan true jika aplikasi sedang berjalan di dalam Android Native WebView container.

2. \`getDeviceInfo(): string\`
   Mengembalikan JSON string mengandungi maklumat peranti:
   - model, manufacturer, androidVersion, sdkInt, isDeviceOwner, isDeviceAdmin

3. \`vibrate(milliseconds: number): void\`
   Menggetarkan peranti untuk amaran had masa (contoh: 200ms).

4. \`showNativeNotification(title: string, message: string): void\`
   Memaparkan notifikasi rasmi pada bar status Android (NotificationManager).

5. \`startLockTask(): boolean\`
   Mengaktifkan Android Kiosk Mode (Screen Pinning / Lock Task) supaya pengguna tidak dapat keluar dari aplikasi.

6. \`stopLockTask(): boolean\`
   Menamatkan Kiosk Mode apabila kata laluan ibu bapa yang sah dimasukkan.

7. \`isDeviceAdminActive(): boolean\`
   Memeriksa sama ada aplikasi mempunyai kebenaran Pentadbir Peranti (Device Admin).

8. \`requestDeviceAdmin(): void\`
   Membuka skrin tetapan Android untuk ibu bapa mengaktifkan Device Admin.

9. \`isDeviceOwner(): boolean\`
   Memeriksa sama ada aplikasi telah ditetapkan sebagai Pemilik Peranti (Device Owner melalui ADB).

10. \`setInternetBlocked(blocked: boolean): void\`
    Mengawal sekatan sambungan internet peranti melalui DevicePolicyManager atau perkhidmatan VPN tempatan.

11. \`hasUsageStatsPermission(): boolean\`
    Memeriksa sama ada kebenaran akses statistik penggunaan (PACKAGE_USAGE_STATS) telah diberikan.

12. \`requestUsageStatsPermission(): void\`
    Membuka skrin tetapan Android untuk memberikan kebenaran statistik penggunaan.

---
## Perintah Pantas ADB Device Owner:
\`\`\`bash
adb shell dpm set-device-owner com.mysmartsurf.parental/.ParentalControlDeviceAdminReceiver
\`\`\`
`;
  zip.file('BRIDGE_API_SPECIFICATION.md', bridgeDoc);

  // 7. Developer Readme & Quickstart
  const quickstartTxt = `========================================================================
MYSMART SURF - ANDROID NATIVE BRIDGE & SOURCE CODE PACKAGE
Versi: 2.5.0
Pakej: ${packageName}
Sasaran: Android 9.0 (API 28) hingga Android 14+ (API 34)
========================================================================

Kandungan Arkib Ini:
1. app/src/main/java/com/mysmartsurf/bridge/WebAppInterface.java
   - Kelas jambatan Javascript (@JavascriptInterface) untuk WebView.
2. app/src/main/java/com/mysmartsurf/ParentalControlDeviceAdminReceiver.java
   - Device Admin & Device Owner receiver untuk perlindungan anti-nyahpasang.
3. app/src/main/res/xml/device_admin_policies.xml
   - Polisi pentadbir (kunci skrin, had masa, kawalan sekatan).
4. app/src/main/AndroidManifest.xml
   - Fail manifes Android lengkap dengan semua kebenaran dan services.
5. app/build.gradle.kts
   - Skrip binaan Gradle Kotlin DSL sedia guna.
6. scripts/adb_device_owner_setup.sh
   - Skrip bash automasi persediaan Device Owner melalui sambungan USB ADB.
7. BRIDGE_API_SPECIFICATION.md
   - Spesifikasi penuh kaedah panggilan window.AndroidBridge.

Langkah Pemasangan di Android Studio:
1. Buka Android Studio -> New -> Import Project.
2. Salin fail-fail di atas ke dalam folder struktur projek anda.
3. Sambungkan peranti sasaran melalui USB dengan USB Debugging aktif.
4. Jalankan: bash scripts/adb_device_owner_setup.sh
5. Pasang dan jalankan aplikasi!
========================================================================`;
  zip.file('PANDUAN_PEMASANGAN_BRIDGE.txt', quickstartTxt);

  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

