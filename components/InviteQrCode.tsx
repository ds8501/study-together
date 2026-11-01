"use client";

import { useMemo } from "react";

const SIZE = 37; // Version 5 QR
const DATA_CODEWORDS = 108; // Version 5-L
const ECC_CODEWORDS = 26;

function multiply(x: number, y: number): number {
  let product = 0;
  for (let i = 7; i >= 0; i--) {
    product = (product << 1) ^ ((product >>> 7) * 0x11d);
    product ^= ((y >>> i) & 1) * x;
  }
  return product;
}

function makeQrCode(text: string): boolean[][] {
  const bytes = Array.from(new TextEncoder().encode(text));
  if (bytes.length > 106) throw new Error("Invite link is too long for the QR code.");

  const bits: number[] = [];
  const append = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  append(0b0100, 4); // byte mode
  append(bytes.length, 8);
  bytes.forEach(byte => append(byte, 8));
  append(0, Math.min(4, DATA_CODEWORDS * 8 - bits.length));
  while (bits.length % 8) bits.push(0);

  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    data.push(bits.slice(i, i + 8).reduce((value, bit) => (value << 1) | bit, 0));
  }
  for (let pad = 0; data.length < DATA_CODEWORDS; pad++) data.push(pad % 2 ? 0x11 : 0xec);

  let generator = [1];
  let root = 1;
  for (let i = 0; i < ECC_CODEWORDS; i++) {
    const next = Array(generator.length + 1).fill(0);
    generator.forEach((coefficient, index) => {
      next[index] ^= coefficient;
      next[index + 1] ^= multiply(coefficient, root);
    });
    generator = next;
    root = multiply(root, 2);
  }
  const remainder = Array(ECC_CODEWORDS).fill(0);
  for (const byte of data) {
    const factor = byte ^ remainder.shift()!;
    remainder.push(0);
    remainder.forEach((value, index) => { remainder[index] = value ^ multiply(generator[index + 1], factor); });
  }
  const allBits = [...data, ...remainder].flatMap(byte => Array.from({ length: 8 }, (_, i) => (byte >>> (7 - i)) & 1));

  const matrix = Array.from({ length: SIZE }, () => Array<boolean>(SIZE).fill(false));
  const reserved = Array.from({ length: SIZE }, () => Array<boolean>(SIZE).fill(false));
  const set = (x: number, y: number, value: boolean) => {
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
    matrix[y][x] = value;
    reserved[y][x] = true;
  };

  const finder = (left: number, top: number) => {
    for (let dy = -1; dy <= 7; dy++) for (let dx = -1; dx <= 7; dx++) {
      const distance = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
      set(left + dx, top + dy, distance !== 2 && distance <= 3);
    }
  };
  finder(0, 0);
  finder(SIZE - 7, 0);
  finder(0, SIZE - 7);

  for (let i = 8; i < SIZE - 8; i++) {
    if (!reserved[6][i]) set(i, 6, i % 2 === 0);
    if (!reserved[i][6]) set(6, i, i % 2 === 0);
  }
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    set(30 + dx, 30 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }

  const formatData = 0b01000; // L error correction, mask pattern 0
  let formatRemainder = formatData << 10;
  for (let bit = 14; bit >= 10; bit--) {
    if ((formatRemainder >>> bit) & 1) formatRemainder ^= 0x537 << (bit - 10);
  }
  const format = ((formatData << 10) | formatRemainder) ^ 0x5412;
  const formatBit = (index: number) => ((format >>> index) & 1) !== 0;
  for (let i = 0; i <= 5; i++) set(8, i, formatBit(i));
  set(8, 7, formatBit(6)); set(8, 8, formatBit(7)); set(7, 8, formatBit(8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, formatBit(i));
  for (let i = 0; i < 8; i++) set(SIZE - 1 - i, 8, formatBit(i));
  for (let i = 8; i < 15; i++) set(8, SIZE - 15 + i, formatBit(i));
  set(8, SIZE - 8, true);

  let bitIndex = 0;
  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    const upward = ((right + 1) & 2) === 0;
    for (let step = 0; step < SIZE; step++) {
      const y = upward ? SIZE - 1 - step : step;
      for (let offset = 0; offset < 2; offset++) {
        const x = right - offset;
        if (reserved[y][x]) continue;
        const value = bitIndex < allBits.length ? allBits[bitIndex++] === 1 : false;
        set(x, y, value !== ((x + y) % 2 === 0));
      }
    }
  }
  return matrix;
}

export default function InviteQrCode({ value }: { value: string }) {
  const modules = useMemo(() => makeQrCode(value), [value]);
  const path = modules.flatMap((row, y) => row.flatMap((dark, x) => dark ? [`M${x} ${y}h1v1h-1z`] : [])).join("");
  return <svg className="invite-qr" viewBox={`-4 -4 ${SIZE + 8} ${SIZE + 8}`} role="img" aria-label="QR code for the invitation link" shapeRendering="crispEdges"><rect x="-4" y="-4" width={SIZE + 8} height={SIZE + 8} rx="2" fill="white"/><path d={path} fill="#151321"/></svg>;
}
