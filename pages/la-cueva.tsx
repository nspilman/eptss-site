import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { LaCueva } from "components/LaCueva";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetStaticProps,
} from "next";
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

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext
) => {
  const { roundId, dateLabels, phase } = await PhaseMgmtService.build();

  const supabase = createServerSupabaseClient(ctx);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase.from("roles").select("*");
  // .join("auth.role", { on: { role_id: "id" } });

  console.log({ data, user });

  return {
    props: {
      roundId,
      dateLabels,
      phase,
    },
  };
};
export default LaCuevaPage;
