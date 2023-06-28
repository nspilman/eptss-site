import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import { Submit } from "components/Submit";
import { PageContainer } from "components/shared/PageContainer";
import { PhaseMgmtService } from "services/PhaseMgmtService";
import { JoinMailingList } from "components/JoinMailingList";
import { SignInGate } from "components/shared/SignInGate";

const SubmitPage = ({
  roundId,
  areSubmissionsOpen,
  coverClosesLabel,
  listeningPartyLabel,
  song,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <PageContainer title={`Submit your cover for round ${roundId}`}>
      <SignInGate>
        {areSubmissionsOpen ? (
          <Submit
            roundId={roundId}
            coverClosesLabel={coverClosesLabel}
            listeningPartyLabel={listeningPartyLabel}
            song={song}
          />
        ) : (
          <JoinMailingList />
        )}
      </SignInGate>
    </PageContainer>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const {
    phase,
    roundId,
    dateLabels: {
      covering: { closes: coverClosesLabel },
      celebration: { closes: listeningPartyLabel },
    },
    song,
  } = await PhaseMgmtService.build();
  const areSubmissionsOpen = ["covering", "celebration"].includes(phase);

  return {
    props: {
      roundId,
      areSubmissionsOpen,
      coverClosesLabel,
      listeningPartyLabel,
      song,
    },
  };
};

export default SubmitPage;
