export const AppStatus = {
  active: 'active',
  inactive: 'inactive',
} as const;

export type AppStatusType = typeof AppStatus[keyof typeof AppStatus];
