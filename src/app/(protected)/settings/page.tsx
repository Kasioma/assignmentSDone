"use client";
import {
  UserChangeUsername,
  userChangeUsername,
  userChangePassword,
  UserChangePassword,
} from "@/lib/validators";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEventHandler, useState } from "react";

type UserChangePasswordKey = keyof UserChangePassword;
type UserChangeUsernameKey = keyof UserChangeUsername;
type ErrorType = Partial<
  Record<UserChangePasswordKey | UserChangeUsernameKey, string>
>;

export default function Page() {
  const [error, setError] = useState<ErrorType>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const router = useRouter();
  const changeMutationName = api.auth.changeUsername.useMutation({
    onError(error) {
      console.log(error.message);
      setErrorMessage(error.message);
    },
    onSuccess() {
      router.back();
    },
  });

  const handleChangeUsername: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data: Record<string, unknown> = {};
    new FormData(event.target as HTMLFormElement).forEach((value, key) => {
      data[key] = value;
    });
    const userData = userChangeUsername.safeParse(data);
    if (!userData.success) {
      const error: ErrorType = {};
      userData.error.issues.forEach(({ message, path }) => {
        path.forEach((field) => {
          error[field as UserChangeUsernameKey] = message;
        });
      });
      console.log(error);
      setError(error);
      return;
    }
    changeMutationName.mutate(userData.data);
    setError({});
  };

  const changeMutationPass = api.auth.changePassword.useMutation({
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
  const handleChangePassword: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data: Record<string, unknown> = {};
    new FormData(event.target as HTMLFormElement).forEach((value, key) => {
      data[key] = value;
    });
    const userData = userChangePassword.safeParse(data);
    if (!userData.success) {
      const error: ErrorType = {};
      userData.error.issues.forEach(({ message, path }) => {
        path.forEach((field) => {
          error[field as UserChangePasswordKey] = message;
        });
      });
      console.log(error);
      setError(error);
      return;
    }
    changeMutationPass.mutate(userData.data);
    setError({});
  };

  return (
    <>
      <h2>SETTINGS</h2>
      <form
        onSubmit={handleChangeUsername}
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
          <label htmlFor="newUsername">New Username </label>
          <input
            type="text"
            name="newUsername"
            id="newUsername"
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
        <button>Change Username</button>
      </form>
      <form
        onSubmit={handleChangePassword}
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
          <label htmlFor="newPassword">New Password </label>
          <input
            type="newPassword"
            name="newPassword"
            id="newPassword"
            className="rounded border-4 border-slate-500"
          />
        </div>
        <button>Change Password</button>
      </form>
      <div className="flex w-2/6 justify-center">
        <Link href="/">BACK</Link>
      </div>
    </>
  );
}
