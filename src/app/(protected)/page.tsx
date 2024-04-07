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
      case "referee":
        redirect("/referee");
      default:
        break;
    }
  }
  return (
    <>
      <h2>PLAYER</h2>
      <Link href="/settings">Settings</Link>
    </>
  );
}
