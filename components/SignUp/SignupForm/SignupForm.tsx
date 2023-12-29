import { useUserSession } from "components/context/UserSessionContext";
import { Navigation } from "components/enum/navigation";
import { ActionSuccessPanel } from "components/shared/ActionSuccessPanel";
import { FormContainer } from "components/shared/FormContainer";
import { GENERIC_ERROR_MESSAGE } from "consts";
import { useSignup } from "../useSignup";
import Link from "next/link";

interface Props {
  roundId?: number;
  title: string;
  signupsCloseDateLabel?: string;
}

export const SignupForm = ({
  roundId,
  title,
  signupsCloseDateLabel,
}: Props) => {
  const { user } = useUserSession();

  if (!user) {
    throw new Error("Login required to access Signup page");
  }

  if (!roundId || !signupsCloseDateLabel) {
    throw new Error("roundId and signupCloseDateLabel must be defined");
  }

  const { signUp, signupSuccess, fields } = useSignup(roundId, user.id);
  return (
    <div className="flex items-center justify-center">
      <FormContainer
        fields={fields}
        title={title}
        description={
          <div className="flex flex-col items-center justify-center">
            <p className="text-md font-light font-roboto text-white">
              Signing up as {user.email}
            </p>
            <p className="text-md font-light font-roboto text-white">
              Sign up with the song you want to cover!
            </p>
            <p className="text-md font-light font-roboto text-white">
              Signups close Midnight of {signupsCloseDateLabel}.
            </p>
            <Link href={Navigation.FAQ} className="text-themeYellow">
              FAQ Here
            </Link>
          </div>
        }
        successBlock={
          <ActionSuccessPanel {...signupSuccess} action="signups" />
        }
        errorMessage={GENERIC_ERROR_MESSAGE}
        onSubmit={signUp}
      />
    </div>
  );
};
