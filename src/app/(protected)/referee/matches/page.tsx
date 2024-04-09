"use client";
import { toast } from "@/app/_components/use-toast";
import { UserRole, cn, userRoles as appUserRoles } from "@/lib/utils";
import { changeCredentials, scoreSetter } from "@/lib/validators";
import { matchTable } from "@/server/db/schema";
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
    data: games,
  } = api.referee.display.useQuery();

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  if (isLoading || isFetching) return <div>Loading...</div>;
  if (isError)
    return (
      <div>
        <h1>Error</h1>
        {error.message}
      </div>
    );

  return (
    <div className="flex flex-col gap-4">
      <main className="contents">
        <h1 className="text-3xl underline">User data</h1>
        <div className="grid w-fit grid-cols-6 border border-black">
          <div className="bg-gray-200 px-2 py-1.5 text-center">referee</div>
          <div className="bg-gray-200 px-2 py-1.5 text-center">
            Trournament Name
          </div>
          <div className="bg-gray-200 px-2 py-1.5 text-center">Player one</div>
          <div className="bg-gray-200 px-2 py-1.5 text-center">Player two</div>
          <div className="bg-gray-200 px-2 py-1.5 text-center">Score One</div>
          <div className="bg-gray-200 px-2 py-1.5 text-center">Score Two</div>

          {games?.map((game, idx) => {
            const className = cn("px-2 py-1.5", {
              "bg-gray-200": idx % 2 == 1,
              "cursor-pointer relative after:absolute after:inset-0 after:bg-black after:opacity-0 group-hover:after:opacity-25":
                idx,
            });

            return (
              <div
                key={`user-data-${game.referee}-${game.playerOne}-${game.playerTwo}`}
                className="group contents"
                onClick={() => setSelectedGame(game)}
              >
                <div className={className}>{game.referee}</div>
                <div className={className}>{game.tournamentName}</div>
                <div className={className}>{game.playerOne}</div>
                <div className={className}>{game.playerTwo}</div>
                <div className={className}>{game.scoreOne}</div>
                <div className={className}>{game.scoreTwo}</div>
              </div>
            );
          })}
        </div>
      </main>
      {selectedGame && (
        <UpdateUserInfo user={selectedGame} setUser={setSelectedGame} />
      )}
      <Link href="/referee">BACK</Link>
    </div>
  );
}

type Props = {
  user: Game;
  setUser: (user: null) => void;
};

function UpdateUserInfo({ user, setUser }: Props) {
  const router = useRouter();

  const mutationOptions = {
    onError(error: { message: string }) {
      toast({
        variant: "destructive",
        title: "Server error",
        description: error.message,
      });
    },
    onSuccess() {
      setUser(null);
      router.refresh();
    },
  };
  const updateMutation = api.referee.modify.useMutation(mutationOptions);

  const handleChange: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data: Record<string, unknown> = {};
    new FormData(event.target as HTMLFormElement).forEach((value, key) => {
      data[key] = value;
    });
    const userData = scoreSetter.safeParse(data);
    if (!userData.success) {
      userData.error.issues.forEach(({ message, path }) => {
        path.forEach(() => {
          toast({
            variant: "destructive",
            title: "Validation wrong",
            description: `{$path}: ${message.toLowerCase()}`,
          });
        });
      });
      return;
    }
    updateMutation.mutate(userData.data);
  };

  return (
    <>
      <h1>REFEREE</h1>

      <h2 className="mt-8 text-2xl underline">Change account information</h2>
      <form onSubmit={handleChange}>
        <div>
          <label htmlFor="tournamentName">Tournament Name</label>

          <input
            type="text"
            name="tournamentName"
            id="tournamentName"
            className="rounded border-4 border-slate-500"
          />
        </div>
        <div>
          <label htmlFor="playerOne">Player One</label>

          <input
            type="text"
            name="playerOne"
            id="playerOne"
            className="rounded border-4 border-slate-500"
          />
        </div>
        <div>
          <label htmlFor="playerTwo">Player Two</label>

          <input
            type="text"
            name="playerTwo"
            id="playerTwo"
            className="rounded border-4 border-slate-500"
          />
        </div>
        <div>
          <label htmlFor="scoreOne">Score One</label>

          <input
            type="number"
            name="scoreOne"
            id="scoreOne"
            className="rounded border-4 border-slate-500"
          />
        </div>
        <div>
          <label htmlFor="scoreTwo">Score Two</label>

          <input
            type="number"
            name="scoreTwo"
            id="scoreTwo"
            className="rounded border-4 border-slate-500"
          />
        </div>
        <button>Change</button>
      </form>
    </>
  );
}
