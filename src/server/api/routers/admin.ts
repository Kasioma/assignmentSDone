import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { userTable, tournamentsTable } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import { tournamentCreateValidator, changeCredentials } from "@/lib/validators";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { validateRequest } from "@/server/auth";
import { generateId } from "lucia";

async function isRole(role: string) {
  const user = await validateRequest();
  if (user) return user.user?.role === role;
  return false;
}

export const adminRouter = createTRPCRouter({
  display: publicProcedure.query(async () => {
    if (!(await isRole("admin"))) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Incorrect role",
      });
    }
    try {
      const users = await db.select().from(userTable);
      console.log(users);
      return users;
    } catch {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "FETCH COULDNT BE PERFORMED",
      });
    }
  }),
  modify: publicProcedure
    .input(changeCredentials.extend({ currentUsername: z.string().max(20) }))
    .mutation(async ({ ctx, input }) => {
      if (!(await isRole("admin"))) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Incorrect role",
        });
      }
      try {
        const user = await ctx.db
          .select()
          .from(userTable)
          .where(eq(userTable.username, input.currentUsername));

        if (!user || user.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No such account exists",
          });
        }
        const values = {
          username: input.username,
          role: input.role,
        };

        await ctx.db
          .update(userTable)
          .set(values)
          .where(eq(userTable.username, input.currentUsername));
      } catch {}
    }),
  deleteUser: publicProcedure
    .input(z.object({ username: z.string().max(20) }))
    .mutation(async ({ ctx, input }) => {
      if (!(await isRole("admin"))) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Incorrect role",
        });
      }
      try {
        await ctx.db
          .delete(userTable)
          .where(eq(userTable.username, input.username));
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Something went wrong!",
        });
      }
    }),
  tournament: publicProcedure
    .input(tournamentCreateValidator)
    .mutation(async ({ ctx, input }) => {
      if (!(await isRole("admin"))) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Incorrect role",
        });
      }
      const sessionUser = await validateRequest();
      const id = generateId(15);
      try {
        if (sessionUser.user?.role != "admin") {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Incorrect role",
          });
        }
        await ctx.db.insert(tournamentsTable).values({ ...input, id, adminId: sessionUser.user.id });
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No such account exists",
        });
      }
    }),
});
