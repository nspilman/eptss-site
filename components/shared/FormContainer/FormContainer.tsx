import { useSuccessState } from "components/hooks/useSuccessState";
import { FieldValues } from "react-hook-form";
import { Form } from "./Form";
import { InputType } from "./Form/types";
import * as styles from "./FormContainer.css";

interface Props<T extends FieldValues> {
  successBlock: React.ReactNode;
  errorMessage: string;
  title: string;
  description?: React.ReactNode;
  fields: InputType<T>[];
  onSubmit: (payload: T) => Promise<"success" | "error">;
}

export function FormContainer<T extends FieldValues>({
  title,
  description,
  onSubmit,
  fields,
  successBlock,
  errorMessage,
}: Props<T>) {
  const [successState, setSuccessState] = useSuccessState();

  return (
    <div className={styles.formWrapper}>
      <>
        {successState !== "success" ? (
          <Form
            title={title}
            description={description}
            fields={fields}
            onSubmit={async (payload: T) =>
              setSuccessState(await onSubmit(payload))
            }
          />
        ) : (
          successBlock
        )}
        {successState === "error" && errorMessage}
      </>
    </div>
  );
}
