import { useSuccessState } from "components/hooks/useSuccessState";
import { FieldValues } from "react-hook-form";
import { Form } from "./Form";
import { InputType } from "./Form/types";

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
    <div className="flex items-center justify-center bg-[rgba(28,32,38,.9)] py-8 px-12 rounded-3xl w-full">
      <div className="w-[300px] sm:w-[450px] md:w-[600px] lg:w-[800px] flex items-center">
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
      </div>
    </div>
  );
}
