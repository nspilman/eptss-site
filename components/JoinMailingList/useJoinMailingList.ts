import { useSupabase } from "components/hooks/useSupabaseClient";
import { getIsSuccess } from "utils";

interface MailingListModel {
  name: string;
  email: string;
  additionalComments?: string;
}

export const useJoinMailingList = (
  setSuccessState: (successState: "error" | "success") => void
) => {
  const supabase = useSupabase();
  const onSubmit = async ({
    additionalComments,
    email,
    name,
  }: MailingListModel) => {
    const mailingListEntity = {
      name,
      email,
      additional_comments: additionalComments,
    };
    const { status } = await supabase
      .from("mailing_list")
      .insert(mailingListEntity);
    setSuccessState(getIsSuccess(status) ? "success" : "error");
  };

  const successText = {
    header: `Thank you for joining the Everyone Plays the Same Song mailing list!`,
    body: `You'll be notified when signups for future rounds open`,
    thankyou: `Thanks for your interest!`,
  };

  const signupSuccessImage = {
    src: "/mailingListMascot.png",
    alt: "Welcome to the Everyone Plays the Same Song mailing list!",
  };

  const successPanelProps = {
    text: successText,
    image: signupSuccessImage,
  };
  return { onSubmit, successPanelProps };
};
