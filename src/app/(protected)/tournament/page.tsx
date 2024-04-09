"use client";
import { toast } from "@/app/_components/use-toast";
import { UserRole, cn, userRoles as appUserRoles } from "@/lib/utils";
import { changeCredentials } from "@/lib/validators";
import { type matchTable } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { type InferSelectModel } from "drizzle-orm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEventHandler, useEffect, useRef, useState } from "react";

type Game = Omit<InferSelectModel<typeof matchTable>, "id">;

export default function Page() {
  const {
    isLoading,
    isFetching,
    isError,
    error,
    data: tournament,
  } = api.tournament.display.useQuery();

  const [selectedGame, setselectedGame] = useState<Game | null>(null);

  if (isLoading || isFetching) return <div>Loading...</div>;
  if (isError)
    return (
      <div>
        <h1>Error</h1>
        {error.message}
      </div>
    );

  return (
    <>
      <h1>PLAYER</h1>

      <div className="flex flex-col gap-4">
        <main className="contents">
          <h1 className="text-3xl underline">User data</h1>
          <div className="grid w-fit grid-cols-6 border border-black">
            <div className="bg-gray-200 px-2 py-1.5 text-center">Name</div>
            <div className="bg-gray-200 px-2 py-1.5 text-center">
              Player one
            </div>
            <div className="bg-gray-200 px-2 py-1.5 text-center">
              Player two
            </div>
            <div className="bg-gray-200 px-2 py-1.5 text-center">referee</div>
            <div className="bg-gray-200 px-2 py-1.5 text-center">Score One</div>
            <div className="bg-gray-200 px-2 py-1.5 text-center">Score Two</div>

            {tournament?.map((game, idx) => {
              const className = cn("px-2 py-1.5", {
                "bg-gray-200": idx % 2 == 1,
              });

              return (
                <div
                  key={`tournament-data-${game.tournamentName}-${game.playerOne}-${game.playerTwo}`}
                  className="group contents"
                >
                  <div className={className}>{game.tournamentName}</div>
                  <div className={className}>{game.playerOne}</div>
                  <div className={className}>{game.playerTwo}</div>
                  <div className={className}>{game.referee}</div>
                  <div className={className}>{game.scoreOne}</div>
                  <div className={className}>{game.scoreTwo}</div>
                </div>
              );
            })}
          </div>
        </main>
        <Link href="/">BACK</Link>
      </div>
    </>
  );
}
