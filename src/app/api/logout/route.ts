import { lucia, validateRequest } from "@/server/auth";
import { cookies } from "next/headers";

export async function GET(request: Request): Promise<Response> {
  const { session } = await validateRequest();

  if (session) {
    await lucia.invalidateSession(session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  }
  const loginUrl = new URL("/login", request.url);
  return Response.redirect(loginUrl);
}
