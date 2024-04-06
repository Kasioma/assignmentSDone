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

export type NullablePartial<T> = { [K in keyof T]: T[K] | null | undefined };
