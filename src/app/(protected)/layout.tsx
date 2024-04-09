import { validateRequest } from "@/server/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
type Props = {
  children: React.ReactNode;
};
export default async function layout({ children }: Props) {
  const { user } = await validateRequest();
  if (!user) return redirect("/login");
  return (
    <>
      <Link href="/api/logout">LOG OUT</Link>
      {children}
    </>
  );
}
