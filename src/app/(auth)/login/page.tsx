"use client";
import { UserLoginSchema, userLoginSchema } from "@/lib/validators";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEventHandler, useState } from "react";

type UserLoginSchemaKey = keyof UserLoginSchema;
type ErrorType = Partial<Record<UserLoginSchemaKey, string>>;

export default function Page() {
  const [error, setError] = useState<ErrorType>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const router = useRouter();
  const loginMutation = api.auth.logIn.useMutation({
    onError(error) {
      console.log(error.message);
      setErrorMessage(error.message);
    },
    onSuccess(data) {
      switch (data) {
        case "admin":
          router.replace("/admin");
          break;
        case "referee":
          router.replace("/referee");
          break;
        default:
          router.replace("/");
          break;
      }
    },
  });

  const handleLogin: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data: Record<string, unknown> = {};
    new FormData(event.target as HTMLFormElement).forEach((value, key) => {
      data[key] = value;
    });
    const userData = userLoginSchema.safeParse(data);
    if (!userData.success) {
      const error: ErrorType = {};
      userData.error.issues.forEach(({ message, path }) => {
        path.forEach((field) => {
          error[field as UserLoginSchemaKey] = message;
        });
      });
      console.log(error);
      setError(error);
      return;
    }
    loginMutation.mutate(userData.data);
    setError({});
  };
  return (
    <>
      <section className="p-10">
        {errorMessage && <div className="text-red-600">{errorMessage}</div>}
        <form
          onSubmit={handleLogin}
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
          <button>Continue</button>
        </form>
        <div className="flex w-2/6 justify-center">
          <Link href="/register">Register</Link>
        </div>
      </section>
    </>
  );
}
