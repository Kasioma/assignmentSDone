import { z } from "zod";
import { userRoles } from "./utils";
const passwordSchema = z.string();
const userRoleSchema = z.union([
  z.literal(userRoles.player),
  z.literal(userRoles.referee),
  z.literal(userRoles.admin),
]);

export const userLoginSchema = z.object({
  username: z.string().max(20),
  password: passwordSchema,
});

export type UserLoginSchema = z.infer<typeof userLoginSchema>;

export const userChangePassword = z.object({
  username: z.string().max(20),
  password: passwordSchema,
  newPassword: passwordSchema,
});

export const userChangeUsername = z.object({
  username: z.string().max(20),
  newUsername: z.string().max(20),
  password: passwordSchema,
});

export const changeCredentials = z.object({
  username: z.string().max(20),
  role: userRoleSchema,
});

export type ChangeCredentials = z.infer<typeof changeCredentials>;

export type UserChangePassword = z.infer<typeof userChangePassword>;
export type UserChangeUsername = z.infer<typeof userChangeUsername>;

export const userRegisterSchema = userLoginSchema
  .extend({
    confirmPassword: passwordSchema,
    role: userRoleSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirm"],
  });

export type UserRegisterSchema = z.infer<typeof userRegisterSchema>;

const datelike = z.union([z.number(), z.string(), z.date()]);
const datelikeToDate = datelike.pipe(z.coerce.date());

export const tournamentCreateValidator = z.object({
  name: z.string(),
  startDate: datelikeToDate,
  endDate: datelikeToDate,
});

export type TournamentCreateValidator = z.infer<
  typeof tournamentCreateValidator
>;

export const registration = z.object({
  playerName: z.string(),
  tournamentName: z.string(),
});

export const gameCreator = z.object({
  tournamentName: z.string(),
  playerOne: z.string(),
  playerTwo: z.string(),
});

export const scoreSetter = z.object({
  tournamentName: z.string(),
  playerOne: z.string(),
  playerTwo: z.string(),
  scoreOne: z.number().or(z.string()).pipe(z.coerce.number()),
  scoreTwo: z.number().or(z.string()).pipe(z.coerce.number()),
});

export type ScoreSetter = z.infer<typeof scoreSetter>;

export type GameCreator = z.infer<typeof gameCreator>;

export type Registration = z.infer<typeof registration>;

export type NullablePartial<T> = { [K in keyof T]: T[K] | null | undefined };
