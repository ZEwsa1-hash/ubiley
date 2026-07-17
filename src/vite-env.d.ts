/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RSVP_ENDPOINT?: string
  readonly VITE_MUSIC_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
