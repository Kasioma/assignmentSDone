import { z } from "zod";
const passwordSchema = z.string();

export const userLoginSchema = z.object({
  username: z.string().max(20),
  password: passwordSchema,
});

export type UserLoginSchema = z.infer<typeof userLoginSchema>;

export const userRegisterSchema = userLoginSchema
  .extend({
    confirmPassword: passwordSchema,
    //todo mail stuff
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirm"],
  });

export type UserRegisterSchema = z.infer<typeof userRegisterSchema>;

export type NullablePartial<T> = { [K in keyof T]: T[K] | null | undefined };
