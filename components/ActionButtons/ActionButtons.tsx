import { Button, Link, Stack, Box } from "@chakra-ui/react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { Navigation } from "components/enum/navigation";
import { SignupButton } from "components/Homepage/SignupButton";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { PhaseMgmtService } from "services/PhaseMgmtService";

export const ActionButtons = () => {
  const session = useSessionContext();
  const router = useRouter();

  const [phaseMgmtService, setPhaseMgmtService] = useState<PhaseMgmtService>();

  useEffect(() => {
    const getPhase = async () => {
      const phaseMgmtService = await PhaseMgmtService.build();
      setPhaseMgmtService(await phaseMgmtService);
    };
    getPhase();
  }, []);

  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      justifyContent="center"
      alignItems="center"
    >
      <Link id="learn" href={Navigation.HowItWorks} variant="button">
        <Button>Rules</Button>
      </Link>
      <Link href="#listen" variant="button">
        <Button>Listen</Button>
      </Link>
      <Box display={{ base: "block", md: "none" }}>
        <SignupButton />
      </Box>
      {session.session?.user && phaseMgmtService?.phase === "signups" && (
        <Button onClick={() => router.push("/sign-up")}>
          Sign up for Round {phaseMgmtService.roundId}
        </Button>
      )}
    </Stack>
  );
};
