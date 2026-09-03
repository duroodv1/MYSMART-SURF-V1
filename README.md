# 🛡️ MYSMART SURF — Android Parental Control & Screen Time Manager

> **Kawal Masa. Lindungi Penggunaan. Bina Tabiat Digital Yang Sihat.**  
> Aplikasi Kawalan Ibu Bapa & Pengurusan Masa Skrin Bersepadu untuk Android (PWA & APK Native).

[![Deploy to GitHub Pages](https://github.com/features/actions/workflows/deploy.yml/badge.svg)](https://github.com)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Offline--First-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

---

## 📱 Ciri-Ciri Utama (Key Features)

* ⏳ **Pengurusan Had Masa Harian (Daily Screen Time Limits)**: Tetapkan kuota harian untuk aplikasi hiburan, permainan, dan media sosial.
* 🌙 **Jadual Waktu Tidur & Belajar (Bedtime & Study Schedules)**: Kunci peranti secara automatik pada waktu malam atau waktu mengulang kaji.
* 🔒 **Kunci Skrin Segera (Instant Remote Lock)**: Kunci skrin serta-merta dengan PIN keselamatan ibu bapa.
* 🛡️ **Perlindungan Anti-Nyahpasang (Tamper Resistance)**: Sokongan Android Device Owner & Device Admin API (`DevicePolicyManager`) bagi menghalang anak menyahpasang aplikasi.
* 🌐 **Sokongan PWA Luar Talian (Offline-First PWA)**: Berfungsi 100% tanpa sambungan internet melalui Service Worker `v2.5.0` dan IndexedDB/localStorage.
* 📦 **Penjana Pakej APK & PWA (One-Click Bundler)**: Muat turun pakej ZIP PWA siap guna atau kod sumber Android Native (Java/Gradle).

---

## 🚀 Pembangunan Tempatan (Local Development)

### Keperluan:
* **Node.js**: v18+ atau v20+ (Disyorkan Node 20)
* **npm**: v9+ atau v10+

### Arahan:
```bash
# 1. Klon repositori ini
git clone https://github.com/<username>/mysmart-surf.git
cd mysmart-surf

# 2. Pasang kebergantungan (dependencies)
npm install

# 3. Jalankan pelayan pembangunan (dev server)
npm run dev
# Buka pelayar di http://localhost:3000

# 4. Bina untuk pengeluaran (production build)
npm run build

# 5. Uji pratonton binaan pengeluaran
npm run preview
```

---

## 🌐 Cara Deploy ke GitHub Pages (Automated Deployment)

Projek ini telah dikonfigurasi dengan **GitHub Actions** (`.github/workflows/deploy.yml`), `package-lock.json`, dan sokongan laluan relatif (`base: './'`).

1. **Tolak kod ke GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```
2. **Aktifkan Kebenaran GitHub Pages & Actions (PENTING)**:
   * **Langkah 1 (Pages Source)**:
     * Buka repositori anda di GitHub.
     * Pergi ke **Settings** ⚙️ > **Pages**.
     * Di bahagian **Build and deployment** > **Source**, pilih **GitHub Actions** (atau cawangan `gh-pages`).
   * **Langkah 2 (Workflow Permissions)**:
     * Pergi ke **Settings** ⚙️ > **Actions** > **General**.
     * Skrol ke bawah ke bahagian **Workflow permissions**.
     * Pilih **Read and write permissions** dan tandakan **Allow GitHub Actions to create and approve pull requests**, kemudian klik **Save**.
3. **Selesai!**
   * GitHub Actions akan membina dan menerbitkan laman web anda secara automatik ke:  
     `https://<username>.github.io/<nama-repo>/`
   * Fail `public/.nojekyll` dan `public/404.html` telah disediakan bagi mengelakkan ralat 404 pada routing SPA.

---

### ⚠️ Masalah Biasa & Cara Penyelesaian (GitHub Troubleshooting)

* **Ralat `Deployment failed with status: 404 Not Found`**:
  * **Punca**: Anda belum memilih sumber Pages di Settings repositori GitHub.
  * **Penyelesaian**: Buka **Settings > Pages > Source** dan tukar kepada **GitHub Actions**.
* **Ralat `Permission to ... denied to github-actions[bot]`**:
  * **Penyelesaian**: Buka **Settings > Actions > General > Workflow permissions** > Pilih **Read and write permissions** > Tekan **Save**.
* **Ralat `remote: Support for password authentication was removed`**:
  * **Penyelesaian**: Gunakan GitHub Personal Access Token (PAT) atau log masuk melalui GitHub Desktop / GitHub CLI (`gh auth login`).
* **Ralat `[rejected] main -> main (fetch first)`**:
  * **Penyelesaian**: Jalankan `git pull --rebase origin main` kemudian `git push origin main`.

---

## ⚡ Cara Deploy ke Netlify

1. **Netlify Git Integration**:
   * Sambungkan repositori GitHub ini ke Netlify.
   * Fail `netlify.toml` akan dikesan secara automatik (`npm run build` -> `dist`).
2. **Netlify Drop**:
   * Jalankan `npm run build` secara tempatan.
   * Tarik folder `dist/` ke **[app.netlify.com/drop](https://app.netlify.com/drop)**.

---

## 📦 Penukaran ke Fail APK Android

Anda boleh menukar aplikasi ini kepada APK Native Android melalui:
1. **PWABuilder** ([pwabuilder.com](https://www.pwabuilder.com)): Masukkan pautan URL GitHub Pages atau Netlify anda, muat turun APK terus.
2. **HTML2APK / Web2APK**: Muat turun fail ZIP daripada tab **APK NATIVE** di dalam aplikasi dan masukkan ke dalam perisian penukar.
3. **Android Studio**: Kod native Java (`WebAppInterface.java`, `ParentalControlDeviceAdminReceiver.java`, dan `build.gradle.kts`) disertakan di dalam pakej muat turun.

---

## 🛠️ Susunan Teknologi (Tech Stack)

* **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Bundler & Dev Server**: [Vite 6](https://vitejs.dev/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Animasi**: [Motion](https://motion.dev/)
* **Carta & Graf**: [Recharts](https://recharts.org/)
* **Ikon**: [Lucide React](https://lucide.dev/)
* **Penjanaan Arkib**: [JSZip](https://stuk.github.io/jszip/)

---

## 📄 Lesen & Notis
Dibangunkan untuk tujuan pengurusan masa skrin keluarga dan perlindungan digital. Sila patuhi garis panduan privasi kanak-kanak dan kebenaran pentadbir peranti pada peranti sasaran.
