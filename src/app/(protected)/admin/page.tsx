import { validateRequest } from "@/server/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PageAdmin() {
  const { user } = await validateRequest();
  const data = user?.role;
  if (user) {
    switch (data) {
      case "referee":
        redirect("/referee");
      case "player":
        redirect("/");
      default:
        break;
    }
  }
  return (
    <>
      <h2>ADMIN</h2>
      <Link href="/settings">Settings</Link>
    </>
  );
}
