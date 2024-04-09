import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { gameCreator, scoreSetter } from "@/lib/validators";
import { generateId } from "lucia";
import { matchTable, tournamentsTable, userTable } from "@/server/db/schema";
import { validateRequest } from "@/server/auth";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";

export const refereeRouter = createTRPCRouter({
  createGame: publicProcedure
    .input(gameCreator)
    .mutation(async ({ ctx, input }) => {
      const { user } = await validateRequest();
      const id = generateId(15);
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
      if (user.role != "referee") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
      try {
        const tournament = await ctx.db
          .select()
          .from(tournamentsTable)
          .where(eq(tournamentsTable.name, input.tournamentName));

        const playerOne = await ctx.db
          .select()
          .from(userTable)
          .where(eq(userTable.username, input.playerOne));

        const playerTwo = await ctx.db
          .select()
          .from(userTable)
          .where(eq(userTable.username, input.playerTwo));

        if (
          tournament.length > 0 &&
          playerOne.length > 0 &&
          playerTwo.length > 0 &&
          playerOne[0]?.role == "player" &&
          playerTwo[0]?.role == "player"
        ) {
          await ctx.db.insert(matchTable).values({
            id: id,
            tournamentName: input.tournamentName,
            playerOne: input.playerOne,
            playerTwo: input.playerTwo,
            referee: user.username,
          });
        } else {
          throw new TRPCError({
            code: "UNAUTHORIZED",
          });
        }
      } catch {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }
    }),
  display: publicProcedure.query(async () => {
    const { user } = await validateRequest();
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }
    try {
      const games = await db
        .select()
        .from(matchTable)
        .where(eq(matchTable.referee, user.username));
      return games;
    } catch {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "FETCH COULDNT BE PERFORMED",
      });
    }
  }),
  modify: publicProcedure
    .input(scoreSetter)
    .mutation(async ({ ctx, input }) => {
      try {
        const values = {
          tournamentName: input.tournamentName,
          playerOne: input.playerOne,
          playerTwo: input.playerTwo,
          scoreOne: input.scoreOne,
          scoreTwo: input.scoreTwo,
        };

        await ctx.db
          .update(matchTable)
          .set(values)
          .where(
            and(
              eq(matchTable.tournamentName, input.tournamentName),
              eq(matchTable.playerOne, input.playerOne),
              eq(matchTable.playerTwo, input.playerTwo),
            ),
          );
      } catch {}
    }),
});
