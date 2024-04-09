"use client";
import { GameCreator, gameCreator } from "@/lib/validators";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEventHandler, useState } from "react";

type GameCreatorKey = keyof GameCreator;
type ErrorType = Partial<Record<GameCreatorKey, string>>;

export default function Page() {
  const [error, setError] = useState<ErrorType>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const router = useRouter();
  const createGameMutation = api.referee.createGame.useMutation({
    onError(error) {
      console.log(error.message);
      setErrorMessage(error.message);
    },
    onSuccess() {
      router.refresh();
    },
  });

  const handleRegistration: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data: Record<string, unknown> = {};
    new FormData(event.target as HTMLFormElement).forEach((value, key) => {
      data[key] = value;
    });
    const userData = gameCreator.safeParse(data);
    if (!userData.success) {
      const error: ErrorType = {};
      userData.error.issues.forEach(({ message, path }) => {
        path.forEach((field) => {
          error[field as GameCreatorKey] = message;
        });
      });
      console.log(error);
      setError(error);
      return;
    }
    createGameMutation.mutate(userData.data);
    setError({});
  };
  return (
    <>
    <h1>REFEREE</h1>
      <section className="p-10">
        {errorMessage && <div className="text-red-600">{errorMessage}</div>}
        <form
          onSubmit={handleRegistration}
          className="flex w-2/6 flex-col items-center gap-2 align-middle"
        >
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
            <label htmlFor="playerOne">Player One </label>
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
          <button>Confirm Creation</button>
        </form>
        <div className="flex w-2/6 justify-center">
          <Link href="/referee/matches">TOURNAMENT</Link>
          <Link href="/settings">SETTING</Link>
        </div>
      </section>
    </>
  );
}
