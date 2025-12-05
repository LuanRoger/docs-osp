export const AppRoot = {
  ELECTRON_SHADCN: "/electron-shadcn",
} as const;

export type AppRoot = typeof AppRoot[keyof typeof AppRoot];
