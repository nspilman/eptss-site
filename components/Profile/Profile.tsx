import { PageContainer } from "components/shared/PageContainer";
import { SignInGate } from "components/shared/SignInGate";
import { ProfileDisplay } from "./ProfileDisplay";

export interface SignUp {
  song: {
    title: string;
    artist: string;
  };
  roundId: number;
  averageVote: number;
}

export const Profile = () => {
  return (
    <PageContainer title="Profile">
      <SignInGate>
        <ProfileDisplay />
      </SignInGate>
    </PageContainer>
  );
};
