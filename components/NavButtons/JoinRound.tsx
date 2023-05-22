import { Button } from "@chakra-ui/react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { PhaseMgmtService } from "services/PhaseMgmtService";

export const JoinRoundButton = () => {
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
  return session.session?.user && phaseMgmtService?.phase === "signups" ? (
    <Button onClick={() => router.push("/sign-up")}>
      Sign up for Round {phaseMgmtService.roundId}
    </Button>
  ) : (
    <></>
  );
};
