// src/types/global.d.ts
export {};

declare global {
  interface Window {
    __APP_CONFIG__?: {
      BACKEND_URL?: string;
    };
  }
}