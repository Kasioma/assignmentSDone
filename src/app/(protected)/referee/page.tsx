import { validateRequest } from "@/server/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
  const { user } = await validateRequest();
  const data = user?.role;
  if (user) {
    switch (data) {
      case "admin":
        redirect("/admin");
      case "player":
        redirect("/");
      default:
        break;
    }
  }
  return (
    <>
      <h2>REFEREE</h2>
      <Link href="/settings">Settings</Link>
    </>
  );
}
