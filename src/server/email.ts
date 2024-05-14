"use server";

import { Resend } from "resend";
import { env } from "@/env";
import TournamentRegister from "@/email/register";
import { createElement } from "react";
import type { Tournament } from "./db/schema";

const resend = new Resend(env.RESEND_API_KEY);

type TournamentRegisterEmailProps = {
  tournament: Tournament;
  admin: { email: string; name: string };
  playerName: string;
};

export default async function sendTournamentRegisterEmail({
  tournament,
  admin,
  playerName,
}: TournamentRegisterEmailProps) {
  const result = await resend.emails.send({
    from: `Tennis App <${env.EMAIL_SENDER}>`,
    to: admin.email,
    subject: "New Tournament Registration",
    react: createElement(TournamentRegister, {
      tournamentName: tournament.name,
      administratorName: admin.name,
      playerName,
    }),
  });

  return result;
}