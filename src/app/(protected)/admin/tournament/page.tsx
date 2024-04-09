"use client";
import {
  TournamentCreateValidator,
  tournamentCreateValidator,
} from "@/lib/validators";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEventHandler, useState } from "react";

type TournamentCreateValidatorKey = keyof TournamentCreateValidator;
type ErrorType = Partial<Record<TournamentCreateValidatorKey, string>>;

export default function Page() {
  const [error, setError] = useState<ErrorType>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const router = useRouter();
  const tournamentMutation = api.admin.tournament.useMutation({
    onError(error) {
      console.log(error.message);
      setErrorMessage(error.message);
    },
    onSuccess() {
      router.refresh();
    },
  });

  const handleCreation: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data: Record<string, unknown> = {};
    new FormData(event.target as HTMLFormElement).forEach((value, key) => {
      data[key] = value;
    });
    const userData = tournamentCreateValidator.safeParse(data);
    if (!userData.success) {
      const error: ErrorType = {};
      userData.error.issues.forEach(({ message, path }) => {
        path.forEach((field) => {
          error[field as TournamentCreateValidatorKey] = message;
        });
      });
      console.log(error);
      setError(error);
      return;
    }
    tournamentMutation.mutate(userData.data);
    setError({});
  };

  return (
    <>
    <h1>ADMIN</h1>

      <section className="p-10">
        {errorMessage && <div className="text-red-600">{errorMessage}</div>}
        <form
          key={Date.now()}
          onSubmit={handleCreation}
          className="flex w-2/6 flex-col items-center gap-2 align-middle"
        >
          <div>
            <label htmlFor="name">Username </label>
            <input
              type="text"
              name="name"
              id="name"
              className="rounded border-4 border-slate-500"
            />
          </div>
          <div>
            <label htmlFor="startDate">startDate </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              className="rounded border-4 border-slate-500"
            />
          </div>
          <div>
            <label htmlFor="endDate">endDate </label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              className="rounded border-4 border-slate-500"
            />
          </div>
          <button>Create</button>
        </form>
        <div className="flex w-2/6 justify-center">
          <Link href="/admin">BACK</Link>
        </div>
      </section>
    </>
  );
}
