import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { password, yourEmail } from "components/shared/fieldValues";
import { FormContainer } from "components/shared/FormContainer";

export const SignIn = () => {
  const fields = [yourEmail, password];
  const authClient = useSupabaseClient();
  const onSubmit = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const { error } = await authClient.auth.signInWithPassword({
      email,
      password,
    });
    return error ? ("error" as const) : ("success" as const);
  };

  const resetMyEmail = async () => {
    const { error } = await authClient.auth.resetPasswordForEmail(
      "nate.spilman@gmail.com",
      {
        redirectTo: "https://everyoneplaysthesamesong.com",
      }
    );
    console.log({ error });
  };

  const title = "Sign In";
  const error = "Could not sign in";
  const description = (
    <span>
      Need to reset your password?
      <span onClick={() => resetMyEmail()}>here</span>
    </span>
  );
  return (
    <FormContainer
      fields={fields}
      onSubmit={onSubmit}
      title={title}
      errorMessage={error}
      successBlock={<></>}
      description={description}
    />
  );
};
