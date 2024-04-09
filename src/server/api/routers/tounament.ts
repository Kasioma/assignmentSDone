import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  tournamentsTable,
  matchTable,
  tournamentResitration,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import { registration } from "@/lib/validators";
import { and, eq, or } from "drizzle-orm";
import { validateRequest } from "@/server/auth";
import { generateId } from "lucia";

export const tournamentRouter = createTRPCRouter({
  display: publicProcedure.query(async () => {
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
      const { user } = await validateRequest();
      const id = generateId(15);
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
      try {
        if (input.playerName == user.username) {
          const name = await ctx.db
            .select()
            .from(tournamentsTable)
            .where(eq(tournamentsTable.name, input.tournamentName));

          const check = await ctx.db
            .select()
            .from(tournamentResitration)
            .where(
              and(
                eq(tournamentResitration.tournamentName, input.tournamentName),
                eq(tournamentResitration.playerName, input.playerName),
              ),
            );

          if (name && check.length < 1) {
            await ctx.db.insert(tournamentResitration).values({ id, ...input });
          } else {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "ALREADY REGISTERED",
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
