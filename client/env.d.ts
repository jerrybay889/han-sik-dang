/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID: string;
  readonly VITE_ADSENSE_PUBLISHER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
