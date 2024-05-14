import { validateRequest } from "@/server/auth";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const userRoles = Object.freeze({
  player: "player",
  referee: "referee",
  admin: "admin",
} as const);

export type UserRole = (typeof userRoles)[keyof typeof userRoles];

export const registrationStatus = Object.freeze({
  accepted: "accepted",
  denied: "denied",
  pending: "pending",
} as const);

export type RegistrationStatus = (typeof registrationStatus)[keyof typeof registrationStatus];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}