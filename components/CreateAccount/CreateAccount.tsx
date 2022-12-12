import { useSupabase } from "components/hooks/useSupabaseClient";
import { yourEmail } from "components/shared/FormContainer/Form/fieldValues";
import { FormContainer } from "components/shared/FormContainer";

export const CreateAccount = () => {
  const supabase = useSupabase();
  const signUp = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return error ? "error" : "success";
  };

  const fields = [
    yourEmail,
    {
      label: "password",
      placeholder: "password",
      field: "password" as const,
      type: "text" as const,
      size: "large" as const,
    },
  ];

  return (
    <FormContainer
      title="Create account"
      description=""
      fields={fields}
      onSubmit={signUp}
      successBlock={<div>Success</div>}
      errorMessage={"It broke!"}
    />
  );
};
