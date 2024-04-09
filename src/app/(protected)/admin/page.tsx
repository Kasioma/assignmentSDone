"use client";
import { toast } from "@/app/_components/use-toast";
import { UserRole, cn, userRoles as appUserRoles } from "@/lib/utils";
import { changeCredentials } from "@/lib/validators";
import { type userTable } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { type InferSelectModel } from "drizzle-orm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEventHandler, useEffect, useRef, useState } from "react";

type User = Omit<InferSelectModel<typeof userTable>, "password">;

export default function Page() {
  const {
    isLoading,
    isFetching,
    isError,
    error,
    data: users,
  } = api.admin.display.useQuery();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
        <div className="grid w-fit grid-cols-2 border border-black">
          <div className="bg-gray-200 px-2 py-1.5 text-center">Username</div>
          <div className="bg-gray-200 px-2 py-1.5 text-center">Role</div>

          {users?.map((user, idx) => {
            const className = cn("px-2 py-1.5", {
              "bg-gray-200": idx % 2 == 1,
              "cursor-pointer relative after:absolute after:inset-0 after:bg-black after:opacity-0 group-hover:after:opacity-25":
                user.role != "admin",
            });

            return (
              <div
                key={`user-data-${user.username}`}
                className="group contents"
                onClick={
                  user.role == "admin"
                    ? undefined
                    : () => {
                        setSelectedUser(user);
                      }
                }
              >
                <div className={className}>{user.username}</div>
                <div className={className}>{user.role}</div>
              </div>
            );
          })}
        </div>
      </main>
      {selectedUser && (
        <UpdateUserInfo user={selectedUser} setUser={setSelectedUser} />
      )}
      <Link href="/admin/tournament">TOURNAMENT</Link>
    </div>
  );
}

type Props = {
  user: User;
  setUser: (user: null) => void;
};

function UpdateUserInfo({ user, setUser }: Props) {
  const usernameRef = useRef<HTMLInputElement | null>(null);

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
  const updateMutation = api.admin.modify.useMutation(mutationOptions);
  const deleteMutation = api.admin.deleteUser.useMutation(mutationOptions);

  useEffect(() => {
    usernameRef.current!.value = user.username;
  }, [user.username]);

  const userRoles = Object.values<UserRole>(appUserRoles).filter(
    (role) => role != user.role,
  );
  userRoles.unshift(user.role);

  const handleChange: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data: Record<string, unknown> = {};
    new FormData(event.target as HTMLFormElement).forEach((value, key) => {
      data[key] = value;
    });
    const userData = changeCredentials.safeParse(data);
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
    updateMutation.mutate({ ...userData.data, currentUsername: user.username });
  };

  return (
    <>
    <h1>ADMIN</h1>

      <h2 className="mt-8 text-2xl underline">Change account information</h2>
      <form onSubmit={handleChange}>
        <div>
          <label htmlFor="name">Username</label>

          <input
            ref={usernameRef}
            type="text"
            name="username"
            id="username"
            className="rounded border-4 border-slate-500"
          />
        </div>
        <div>
          <label htmlFor="role">Role</label>
          <select className="p-1" name="role" id="role" key={user.role}>
            {userRoles.map((role) => (
              <option key={role} value={role} className="capitalize">
                {role}
              </option>
            ))}
          </select>
        </div>
        <button>Change</button>
      </form>

      <button
        type="button"
        onClick={() => deleteMutation.mutate({ username: user.username })}
        className="w-fit border border-black p-2 transition-colors hover:bg-gray-100 disabled:bg-gray-300"
      >
        Delete
      </button>
      <Link href="/settings">SETTING</Link>
    </>
  );
}
