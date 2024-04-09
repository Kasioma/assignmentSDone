import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  userChangePassword,
  userChangeUsername,
  userLoginSchema,
  userRegisterSchema,
} from "@/lib/validators";
import { Argon2id } from "oslo/password";
import { generateId } from "lucia";
import { userTable } from "@/server/db/schema";
import { lucia, validateRequest } from "@/server/auth";
import { cookies } from "next/headers";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

export const authRouter = createTRPCRouter({
  signIn: publicProcedure
    .input(userRegisterSchema)
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await new Argon2id().hash(input.password);
      const userId = generateId(15);

      try {
        await ctx.db.insert(userTable).values({
          id: userId,
          username: input.username,
          password: hashedPassword,
          role: input.role,
        });
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already in use.",
        });
      }

      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
      return input.role;
    }),
  logIn: publicProcedure
    .input(userLoginSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.db
          .select()
          .from(userTable)
          .where(eq(userTable.username, input.username));

        console.log(user);

        if (!user || user.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No such account exists",
          });
        }

        const storedHashedPassword = user[0]?.password;

        if (storedHashedPassword !== undefined) {
          const validPassword = await new Argon2id().verify(
            storedHashedPassword,
            input.password,
          );

          if (!validPassword) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Incorrect password",
            });
          }
        }

        if (user[0]?.id !== undefined) {
          const session = await lucia.createSession(user[0].id, {});
          const sessionCookie = lucia.createSessionCookie(session.id);
          cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes,
          );
        }
        return user[0]?.role;
      } catch (error) {
        console.error("Error during login:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No such account exists",
        });
      }
    }),
  changeUsername: publicProcedure
    .input(userChangeUsername)
    .mutation(async ({ ctx, input }) => {
      const sessionUser = await validateRequest();
      try {
        const user = await ctx.db
          .select()
          .from(userTable)
          .where(eq(userTable.username, input.username));

        console.log(user);

        if (
          !user ||
          user.length === 0 ||
            sessionUser.user?.username != input.username
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No such account exists",
          });
        }

        const storedHashedPassword = user[0]?.password;

        if (storedHashedPassword !== undefined) {
          const validPassword = await new Argon2id().verify(
            storedHashedPassword,
            input.password,
          );

          if (!validPassword) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Incorrect password",
            });
          }
        }
        const newUsername = await ctx.db
          .select()
          .from(userTable)
          .where(eq(userTable.username, input.newUsername));
        if (newUsername.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "USERNAME ALREADY EXISTS",
          });
        } else {
          await ctx.db
            .update(userTable)
            .set({ username: input.newUsername })
            .where(eq(userTable.username, input.username));
        }
        return user[0]?.role;
      } catch (error) {
        console.error("Error during login:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong!",
        });
      }
    }),
  changePassword: publicProcedure
    .input(userChangePassword)
    .mutation(async ({ ctx, input }) => {
      const sessionUser = await validateRequest();
      try {
        const user = await ctx.db
          .select()
          .from(userTable)
          .where(eq(userTable.username, input.username));

        console.log(user);

        if (
          !user ||
          user.length === 0 ||
          sessionUser.user?.username != input.username
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No such account exists",
          });
        }

        const storedHashedPassword = user[0]?.password;

        if (storedHashedPassword !== undefined) {
          const validPassword = await new Argon2id().verify(
            storedHashedPassword,
            input.password,
          );

          if (!validPassword) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Incorrect password",
            });
          }
        }
        const newHashedPassword = await new Argon2id().hash(input.newPassword);
        await ctx.db
          .update(userTable)
          .set({ password: newHashedPassword })
          .where(eq(userTable.username, input.username));
        return user[0]?.role;
      } catch (error) {
        console.error("Error during login:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong!",
        });
      }
    }),
});
