import { useSuccessState } from "components/hooks/useSuccessState";
import { ActionSuccessPanel } from "components/shared/ActionSuccessPanel/ActionSuccessPanel";
import { Form } from "components/shared/Form";
import {
  additionalComments,
  yourEmail,
  yourName,
} from "components/shared/Form/fieldValues";
import { FormContainer } from "components/shared/FormContainer";
import { useJoinMailingList } from "./useJoinMailingList";

export const JoinMailingList = () => {
  const [successState, setSuccessState] = useSuccessState();
  const { onSubmit, successPanelProps } = useJoinMailingList(setSuccessState);
  return (
    <FormContainer
      form={
        <Form
          title={"Signups closed - Join the Mailing List"}
          description={
            "you will receive email updates on the current round and when signups next open"
          }
          fields={[yourName, yourEmail, additionalComments]}
          onSubmit={onSubmit}
        />
      }
      successBlock={<ActionSuccessPanel {...successPanelProps} />}
      successState={successState}
      errorMessage="Unable to sign up for the mailing list"
    />
  );
};
