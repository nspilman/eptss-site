import { LaCueva } from "components/LaCueva";
import { GetStaticProps } from "next";
import { Phase, PhaseMgmtService } from "services/PhaseMgmtService";

const LaCuevaPage = ({
  roundId,
  dateLabels,
  phase,
}: {
  roundId: number;
  dateLabels: Record<Phase, Record<"opens" | "closes", string>>;
  phase: Phase;
}) => {
  return (
    <LaCueva
      {...{
        roundId,
        dateLabels,
        phase,
      }}
    />
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const { roundId, dateLabels, phase } = await PhaseMgmtService.build();

  return {
    props: {
      roundId,
      dateLabels,
      phase,
    },
  };
};
export default LaCuevaPage;
