// Script to generate high-resolution PWA and APK wrapper PNG icons
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Helper to create uncompressed/deflated raw PNG image with pure Node.js
function createPNG(width, height, drawFn) {
  const bytesPerPixel = 4; // RGBA
  const rowSize = width * bytesPerPixel;
  const rawData = Buffer.alloc((rowSize + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowSize + 1);
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit depth
  ihdrData[9] = 6; // Color type 6: RGBA
  ihdrData[10] = 0; // Compression 0
  ihdrData[11] = 0; // Filter 0
  ihdrData[12] = 0; // Interlace 0
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT Chunk
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table & calculation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Pixel art generator for MYSMART SURF
function renderIcon(x, y, width, height, isMaskable = false) {
  const cx = width / 2;
  const cy = height / 2;
  const nx = (x - cx) / (width / 2);
  const ny = (y - cy) / (height / 2);
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background
  const bgDark = [9, 13, 22, 255]; // #090d16
  const bgSurface = [17, 20, 26, 255]; // #11141A
  const borderCol = [30, 34, 44, 255]; // #1E222C
  const bluePri = [37, 99, 235, 255]; // #2563EB
  const blueLight = [56, 189, 248, 255]; // #38BDF8
  const cyanAcc = [6, 182, 212, 255]; // #06B6D4
  const white = [255, 255, 255, 255];

  if (isMaskable) {
    // Maskable icon fills the entire square
    if (dist > 1.0) return bgDark;
  } else {
    // Rounded squircle corner
    const squircle = Math.pow(Math.abs(nx), 4) + Math.pow(Math.abs(ny), 4);
    if (squircle > 0.85) {
      return [0, 0, 0, 0]; // Transparent outside
    }
  }

  // Outer ring / border
  const squircleBorder = Math.pow(Math.abs(nx), 4) + Math.pow(Math.abs(ny), 4);
  if (!isMaskable && squircleBorder > 0.78) {
    return borderCol;
  }

  // Shield calculation (center)
  const scale = isMaskable ? 0.65 : 0.75;
  const sx = nx / scale;
  const sy = ny / scale;

  // Shield boundary: y from -0.7 to 0.75
  // Top: straight with slight arc; Sides: vertical down then tapering to (0, 0.75)
  if (sy >= -0.75 && sy <= 0.8) {
    const isTopArc = sy < -0.4 ? Math.abs(sx) <= 0.65 : false;
    let inShield = false;
    if (sy <= 0.0 && Math.abs(sx) <= 0.65) {
      inShield = true;
    } else if (sy > 0.0 && sy <= 0.8) {
      const taper = 0.65 * (1 - (sy / 0.8));
      if (Math.abs(sx) <= taper) {
        inShield = true;
      }
    }

    if (inShield) {
      // Shield gradient from Blue to Indigo
      const t = (sy + 0.75) / 1.55;
      const sr = Math.round(37 * (1 - t) + 14 * t);
      const sg = Math.round(99 * (1 - t) + 165 * t);
      const sb = Math.round(235 * (1 - t) + 233 * t);

      // Inner shield border
      let innerShield = false;
      const isx = Math.abs(sx) / 0.82;
      const isy = (sy + 0.05) / 0.82;
      if (isy <= 0.0 && isx <= 0.65) {
        innerShield = true;
      } else if (isy > 0.0 && isy <= 0.8) {
        const taper = 0.65 * (1 - (isy / 0.8));
        if (isx <= taper) {
          innerShield = true;
        }
      }

      if (innerShield) {
        // Inner core: Deep Midnight Blue
        // Draw Central Lock / Clock symbol
        const clockDist = Math.sqrt(sx * sx + (sy - 0.05) * (sy - 0.05));
        if (clockDist < 0.28 && clockDist > 0.20) {
          return blueLight;
        }
        // Clock hands
        if (clockDist <= 0.20) {
          if ((Math.abs(sx) < 0.03 && sy >= -0.15 && sy <= 0.05) || (Math.abs(sy - 0.05) < 0.03 && sx >= 0.0 && sx <= 0.14)) {
            return white;
          }
          return [11, 19, 41, 255];
        }
        return [11, 19, 41, 255];
      }

      return [sr, sg, sb, 255];
    }
  }

  return bgSurface;
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA & APK icons...');

// 1. 192x192 Standard
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, (x, y, w, h) => renderIcon(x, y, w, h, false)));
console.log('Generated pwa-192x192.png');

// 2. 512x512 Standard
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, false)));
console.log('Generated pwa-512x512.png');

// 3. 512x512 Maskable (for Android Adaptive Launcher Icons)
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, (x, y, w, h) => renderIcon(x, y, w, h, true)));
console.log('Generated pwa-maskable-512x512.png');

// 4. Apple Touch Icon 180x180
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, (x, y, w, h) => renderIcon(x, y, w, h, false)));
console.log('Generated apple-touch-icon.png');

// 5. Favicon 48x48
fs.writeFileSync(path.join(publicDir, 'favicon.png'), createPNG(48, 48, (x, y, w, h) => renderIcon(x, y, w, h, false)));
console.log('Generated favicon.png');

console.log('All PWA and APK icons successfully generated!');
