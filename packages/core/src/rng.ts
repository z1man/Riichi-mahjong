import { RNGState } from "./types";

// xfnv1a hash -> 32-bit unsigned
function xfnv1a(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seedRng(seed: string): RNGState {
  let h = xfnv1a(seed);
  const next = () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    a: Math.floor(next() * 0xffffffff),
    b: Math.floor(next() * 0xffffffff),
    c: Math.floor(next() * 0xffffffff),
    d: Math.floor(next() * 0xffffffff)
  };
}

export function rngNext(state: RNGState): { value: number; state: RNGState } {
  // sfc32
  let { a, b, c, d } = state;
  a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
  const t = (a + b) | 0;
  a = b ^ (b >>> 9);
  b = (c + (c << 3)) | 0;
  c = (c << 21) | (c >>> 11);
  d = (d + 1) | 0;
  const result = (t + d) | 0;
  c = (c + result) | 0;
  return { value: (result >>> 0) / 4294967296, state: { a, b, c, d } };
}

export function rngShuffle<T>(state: RNGState, list: T[]): { state: RNGState; list: T[] } {
  let s = state;
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const step = rngNext(s);
    s = step.state;
    const j = Math.floor(step.value * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return { state: s, list: arr };
}
