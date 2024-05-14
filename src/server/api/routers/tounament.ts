import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  tournamentsTable,
  matchTable,
  tournamentResitration,
  adminMail,
  userTable,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import { registration } from "@/lib/validators";
import { and, eq, or } from "drizzle-orm";
import { validateRequest } from "@/server/auth";
import { generateId } from "lucia";
import sendTournamentRegisterEmail from "@/server/email";

async function isRole(role: string) {
  const { user } = await validateRequest();
  return user?.role === role;
}

export const tournamentRouter = createTRPCRouter({
  display: publicProcedure.query(async () => {
    if (!(await isRole("player"))) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Incorrect role",
      });
    }
    const { user } = await validateRequest();
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }
    try {
      const matches = await db
        .select()
        .from(matchTable)
        .where(
          or(
            eq(matchTable.playerOne, user.username),
            eq(matchTable.playerTwo, user.username),
          ),
        );
      return matches;
    } catch {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "FETCH COULDNT BE PERFORMED",
      });
    }
  }),
  register: publicProcedure
    .input(registration)
    .mutation(async ({ ctx, input }) => {
      if (!(await isRole("player"))) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Incorrect role",
        });
      }
      const { user } = await validateRequest();
      const id = generateId(15);
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
      try {
        if (input.playerName == user.username) {
          const tournament = (
            await ctx.db
              .select()
              .from(tournamentsTable)
              .where(eq(tournamentsTable.name, input.tournamentName))
          )[0];

          const check = await ctx.db
            .select()
            .from(tournamentResitration)
            .where(
              and(
                eq(tournamentResitration.tournamentName, input.tournamentName),
                eq(tournamentResitration.playerName, input.playerName),
              ),
            );

          if (tournament && check.length < 1) {
            await ctx.db.insert(tournamentResitration).values({ id, ...input });
          } else {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "ALREADY REGISTERED",
            });
          }
          const mail = (
            await ctx.db
              .select()
              .from(adminMail)
              .where(eq(adminMail.adminId, tournament.adminId))
          )[0];
          const adminName = (
            await ctx.db
              .select()
              .from(userTable)
              .where(eq(userTable.id, tournament.adminId))
          )[0];
          if (!mail) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
            });
          }
          if (!adminName) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
            });
          }
          const result = await sendTournamentRegisterEmail({
            tournament,
            admin: { name: adminName.username, email: mail.mail },
            playerName: user.username,
          });

          if (result.error !== null) {
            console.error(result.error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
            });
          }
        }
      } catch {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "ALREADY REGISTERED",
        });
      }
    }),
});
