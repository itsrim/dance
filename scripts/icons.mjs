import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const root = path.resolve(import.meta.dirname, "..", "public");

function crc32(buf) {
  let c = ~0 >>> 0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type);
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(size, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0;
    for (let x = 0; x < size; x++) {
      const s = (y * size + x) * 4;
      const d = y * stride + 1 + x * 4;
      raw[d] = pixels[s];
      raw[d + 1] = pixels[s + 1];
      raw[d + 2] = pixels[s + 2];
      raw[d + 3] = pixels[s + 3];
    }
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function paint(size) {
  const px = new Uint8ClampedArray(size * size * 4);
  const ink = [42, 20, 32];
  const cream = [246, 239, 230];
  const clay = [196, 84, 58];

  const set = (x, y, rgb, a) => {
    if (x < 0 || y < 0 || x >= size || y >= size || a <= 0) return;
    const i = (y * size + x) * 4;
    const srcA = Math.min(1, a);
    const dstA = px[i + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA <= 0) return;
    for (let c = 0; c < 3; c++) {
      const src = rgb[c];
      const dst = px[i + c];
      px[i + c] = Math.round((src * srcA + dst * dstA * (1 - srcA)) / outA);
    }
    px[i + 3] = Math.round(outA * 255);
  };

  const disc = (cx, cy, r, rgb) => {
    const x0 = Math.max(0, Math.floor(cx - r - 1));
    const x1 = Math.min(size - 1, Math.ceil(cx + r + 1));
    const y0 = Math.max(0, Math.floor(cy - r - 1));
    const y1 = Math.min(size - 1, Math.ceil(cy + r + 1));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        const a = Math.min(1, Math.max(0, r - d + 0.6));
        set(x, y, rgb, a);
      }
    }
  };

  for (let i = 0; i < px.length; i += 4) {
    px[i] = ink[0];
    px[i + 1] = ink[1];
    px[i + 2] = ink[2];
    px[i + 3] = 255;
  }

  disc(size / 2, size / 2, size * 0.34, cream);
  for (const [fx, fy, color, fr] of [
    [0.4, 0.62, ink, 0.055],
    [0.5, 0.5, ink, 0.055],
    [0.6, 0.38, clay, 0.055],
  ]) {
    disc(size * fx, size * fy, size * fr, color);
  }
  return Buffer.from(px);
}

fs.mkdirSync(root, { recursive: true });
for (const size of [192, 512]) {
  fs.writeFileSync(path.join(root, `icon-${size}.png`), encodePng(size, paint(size)));
}
console.log("icons written");
