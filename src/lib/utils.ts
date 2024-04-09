import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const userRoles = Object.freeze({
  player: "player",
  referee: "referee",
  admin: "admin",
} as const);

export type UserRole = (typeof userRoles)[keyof typeof userRoles];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
