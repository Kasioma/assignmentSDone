import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { gameCreator, scoreSetter } from "@/lib/validators";
import { generateId } from "lucia";
import {
  matchTable,
  tournamentResitration,
  tournamentsTable,
  userTable,
} from "@/server/db/schema";
import { validateRequest } from "@/server/auth";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";

async function isRole(role: string) {
  const user = await validateRequest();
  if (user) return user.user?.role === role;
  return false;
}

export const refereeRouter = createTRPCRouter({
  createGame: publicProcedure
    .input(gameCreator)
    .mutation(async ({ ctx, input }) => {
      if (!(await isRole("referee"))) {
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

        const playerOneRegistration = await ctx.db
          .select()
          .from(tournamentResitration)
          .where(eq(tournamentResitration.playerName, input.playerOne));

        const playerTwoRegistration = await ctx.db
          .select()
          .from(tournamentResitration)
          .where(eq(tournamentResitration.playerName, input.playerTwo));

        if (
          tournament.length > 0 &&
          playerOne.length > 0 &&
          playerTwo.length > 0 &&
          playerOne[0]?.role == "player" &&
          playerTwo[0]?.role == "player" &&
          playerOneRegistration[0]?.status === "accepted" &&
          playerOneRegistration[0].tournamentName === input.tournamentName &&
          playerTwoRegistration[0]?.status === "accepted" &&
          playerTwoRegistration[0].tournamentName === input.tournamentName
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
    if (!(await isRole("referee"))) {
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
      if (!(await isRole("referee"))) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Incorrect role",
        });
      }
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
