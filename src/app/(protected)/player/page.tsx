"use client";
import { Registration, registration } from "@/lib/validators";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEventHandler, useState } from "react";

type RegistrationKey = keyof Registration;
type ErrorType = Partial<Record<RegistrationKey, string>>;

export default function Page() {
  const [error, setError] = useState<ErrorType>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const router = useRouter();
  const registerMutation = api.tournament.register.useMutation({
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
    const userData = registration.safeParse(data);
    if (!userData.success) {
      const error: ErrorType = {};
      userData.error.issues.forEach(({ message, path }) => {
        path.forEach((field) => {
          error[field as RegistrationKey] = message;
        });
      });
      console.log(error);
      setError(error);
      return;
    }
    registerMutation.mutate(userData.data);
    setError({});
  };
  return (
    <>
      <h1>PLAYER</h1>

      <section className="p-10">
        {errorMessage && <div className="text-red-600">{errorMessage}</div>}
        <form
          onSubmit={handleRegistration}
          className="flex w-2/6 flex-col items-center gap-2 align-middle"
        >
          <div>
            <label htmlFor="playerName">Username </label>
            <input
              type="text"
              name="playerName"
              id="playerName"
              className="rounded border-4 border-slate-500"
            />
          </div>
          <div>
            <label htmlFor="tournamentName">Tournament Name </label>
            <input
              type="text"
              name="tournamentName"
              id="tournamentName"
              className="rounded border-4 border-slate-500"
            />
          </div>
          <button>Confirm Registration</button>
        </form>
        <div className="flex w-2/6 flex-col justify-center">
          <Link href="/tournament">TOURNAMENT</Link>
          <Link href="/settings">SETTINGS</Link>
        </div>
      </section>
    </>
  );
}
