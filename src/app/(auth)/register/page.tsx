"use client";
import Link from "next/link";
import { api } from "@/trpc/react";
import { FormEventHandler, useState } from "react";
import { UserRegisterSchema, userRegisterSchema } from "@/lib/validators";
import { useRouter } from "next/navigation";

type UserRegisterSchemaKey = keyof UserRegisterSchema;
type ErrorType = Partial<Record<UserRegisterSchemaKey, string>>;

export default function Page() {
  const [error, setError] = useState<ErrorType>({});
  const router = useRouter();
  const registerMutation = api.auth.signIn.useMutation({
    onError(error) {
      console.log(error);
    },
    onSuccess() {
      router.replace("/");
    },
  });

  const handleRegister: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data: Record<string, unknown> = {};
    new FormData(event.target as HTMLFormElement).forEach((value, key) => {
      data[key] = value;
    });
    const userData = userRegisterSchema.safeParse(data);
    if (!userData.success) {
      const error: ErrorType = {};
      userData.error.issues.forEach(({ message, path }) => {
        path.forEach((field) => {
          error[field as UserRegisterSchemaKey] = message;
        });
      });
      setError(error);
      return;
    }
    registerMutation.mutate(userData.data);
    setError({});
  };
  console.log(error);
  return (
    <>
      <section className="p-10">
        <form
          onSubmit={handleRegister}
          className="flex w-2/6 flex-col items-center gap-2 align-middle"
        >
          <div>
            <label htmlFor="username">Username </label>
            <input
              type="text"
              name="username"
              id="username"
              className="rounded border-4 border-slate-500"
            />
          </div>
          <div>
            <label htmlFor="password">password </label>
            <input
              type="password"
              name="password"
              id="password"
              className="rounded border-4 border-slate-500"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirm password </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              className="rounded border-4 border-slate-500"
            />
          </div>
          {/* <div>
            <label htmlFor="userType">Select User Type:</label>
            <select id="userType" name="userType">
              <option value="player">Player</option>
              <option value="referee">Referee</option>
            </select>
          </div> */}
          <button>Continue</button>
        </form>
        <div className="flex w-2/6 justify-center">
          <Link href="/login">Login</Link>
        </div>
      </section>
    </>
  );
}
