import { ActionSuccessPanel } from "components/shared/ActionSuccessPanel";
import {
  additionalComments,
  yourEmail,
  yourName,
} from "components/shared/fieldValues";
import { FormContainer } from "components/shared/FormContainer";
import { useJoinMailingList } from "./useJoinMailingList";

export const JoinMailingList = () => {
  const { onSubmit, successPanelProps } = useJoinMailingList();
  return (
    <FormContainer
      title={"Signups closed - Join the Mailing List"}
      description={
        "you will receive email updates on the current round and when signups next open"
      }
      fields={[yourName, yourEmail, additionalComments]}
      onSubmit={onSubmit}
      successBlock={<ActionSuccessPanel {...successPanelProps} />}
      errorMessage="Unable to sign up for the mailing list"
    />
  );
};
