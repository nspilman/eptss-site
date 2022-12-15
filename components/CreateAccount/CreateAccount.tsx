import { password, yourEmail } from "components/shared/fieldValues";
import { FormContainer } from "components/shared/FormContainer";
import {
  useUser,
  useSupabaseClient,
  useSessionContext,
} from "@supabase/auth-helpers-react";

export const CreateAccount = () => {
  const authClient = useSupabaseClient();
  const signUp = async ({
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

    return error ? "error" : "success";
  };

  const fields = [yourEmail, password];

  const session = useSessionContext();
  console.log({ session });

  if (session.isLoading) {
    return <h1>Loading</h1>;
  }

  return (
    <>
      {session.session?.user ? (
        <>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <button onClick={() => authClient.auth.signOut()}>Sign out</button>
          <p>user:</p>
          <pre>{JSON.stringify(session, null, 2)}</pre>
        </>
      ) : (
        <FormContainer
          title="Create account"
          description=""
          fields={fields}
          onSubmit={signUp}
          successBlock={<div>Success</div>}
          errorMessage={"It broke!"}
        />
      )}
    </>
  );
};
