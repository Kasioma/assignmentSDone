export const userRoles = Object.freeze({
  player: "player",
  referee: "referee",
  admin: "admin",
} as const);

export type UserRole = (typeof userRoles)[keyof typeof userRoles];
