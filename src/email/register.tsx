import {
    Html,
    Body,
    Head,
    Heading,
    Hr,
    Container,
    Preview,
    Section,
    Text,
  } from "@react-email/components";
  import { Tailwind } from "@react-email/tailwind";
  
  type Props = {
    tournamentName: string;
    administratorName: string;
    playerName: string;
  };
  
  export default function TournamentRegister({
    tournamentName,
    administratorName,
    playerName,
  }: Props) {
    return (
      <Html>
        <Head />
        <Preview>New Tournament Registration Notification</Preview>
        <Tailwind>
          <Body className="bg-gray-100 text-black">
            <Container>
              <Section className="border border-black/30 bg-white px-10 py-4">
                <Heading className="leading-tight">
                  New Tournament Registration
                </Heading>
                <Text>
                  Hello {administratorName},
                  <br />A new registration has been submitted for the{" "}
                  {tournamentName} tournament by {playerName}.
                  Please check your dashboard for details.
                </Text>
                <Hr />
              </Section>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    );
  }