import axios from 'axios';

export const BASE_API_URL = 'https://rukoob-api.runasp.net';

export const apiClient = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStoredToken = (): string | null => {
  return localStorage.getItem('rukoob_admin_token');
};

export const setStoredToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem('rukoob_admin_token', token);
  } else {
    localStorage.removeItem('rukoob_admin_token');
  }
};

// Request interceptor to automatically attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Windows-1252 byte lookup table to automatically repair Mojibake Arabic text
const win1252ToByte: Record<string, number> = {};
for (let i = 0; i < 256; i++) {
  win1252ToByte[String.fromCharCode(i)] = i;
}
const win1252Extra: Record<string, number> = {
  '\u20AC': 0x80, '\u201A': 0x82, '\u0192': 0x83, '\u201E': 0x84, '\u2026': 0x85,
  '\u2020': 0x86, '\u2021': 0x87, '\u02C6': 0x88, '\u2030': 0x89, '\u0160': 0x8A,
  '\u2039': 0x8B, '\u0152': 0x8C, '\u017D': 0x8E, '\u2018': 0x91, '\u2019': 0x92,
  '\u201C': 0x93, '\u201D': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97,
  '\u02DC': 0x98, '\u2122': 0x99, '\u0161': 0x9A, '\u203A': 0x9B, '\u0153': 0x9C,
  '\u017E': 0x9E, '\u0178': 0x9F
};
Object.assign(win1252ToByte, win1252Extra);

export const fixMojibakeString = (val: string): string => {
  if (!val || typeof val !== 'string') return val;
  // If string contains mojibake characters like Ø or Ù
  if (!/[\u00D8\u00D9]/.test(val)) return val;
  try {
    const bytes: number[] = [];
    for (const ch of val) {
      if (win1252ToByte[ch] !== undefined) {
        bytes.push(win1252ToByte[ch]);
      } else {
        const code = ch.charCodeAt(0);
        bytes.push(code < 256 ? code : 63);
      }
    }
    return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
  } catch {
    return val;
  }
};

export const cleanMojibakeData = <T>(val: T): T => {
  if (typeof val === 'string') {
    return fixMojibakeString(val) as unknown as T;
  } else if (Array.isArray(val)) {
    return val.map((item) => cleanMojibakeData(item)) as unknown as T;
  } else if (val !== null && typeof val === 'object') {
    const res: Record<string, any> = {};
    for (const k in val) {
      res[k] = cleanMojibakeData((val as any)[k]);
    }
    return res as T;
  }
  return val;
};

// Response interceptor to handle Mojibake decoding and 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = cleanMojibakeData(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      setStoredToken(null);
      localStorage.removeItem('rukoob_admin_user');
    }
    return Promise.reject(error);
  }
);

export const getFullImageUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BASE_API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
