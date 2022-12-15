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
    return error ? ("success" as const) : ("error" as const);
  };

  const title = "Sign In";
  const error = "Could not sign in";
  return (
    <FormContainer
      fields={fields}
      onSubmit={onSubmit}
      title={title}
      errorMessage={error}
      successBlock={<></>}
    />
  );
};
