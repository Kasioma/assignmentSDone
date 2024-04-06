import { validateRequest } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function layout() {
  const { user } = await validateRequest();
  if (!user) return redirect("/login");
  return <></>;
}
