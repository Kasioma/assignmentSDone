import { validateRequest } from "@/server/auth";
import { redirect } from "next/navigation";
type Props = {
  children: React.ReactNode;
};
export default async function layout({ children }: Props) {
  const { user } = await validateRequest();
  const data = user?.role;
  if (user)
    switch (data) {
      case "admin":
        redirect("/admin");
      case "referee":
        redirect("/referee");
      default:
        redirect("/player");
    }

  return <>{children}</>;
}
