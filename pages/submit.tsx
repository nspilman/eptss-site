import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import { Submit } from "components/Submit";
import { PhaseMgmtService } from "services/PhaseMgmtService";

const SubmitPage = ({
  roundId,
  phase,
  coverClosesLabel,
  listeningPartyLabel,
  song,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <Submit
      roundId={roundId}
      phase={phase}
      coverClosesLabel={coverClosesLabel}
      listeningPartyLabel={listeningPartyLabel}
      song={song}
    />
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const {
    roundId,
    phase,
    dateLabels: {
      covering: { closes: coverClosesLabel },
      celebration: { closes: listeningPartyLabel },
    },
    song,
  } = await PhaseMgmtService.build();

  return {
    props: {
      roundId,
      coverClosesLabel,
      listeningPartyLabel,
      song,
      phase,
    },
  };
};

export default SubmitPage;
