import * as styles from "./FormContainer.css";

interface Props {
  form: React.ReactNode;
  successBlock: React.ReactNode;
  errorMessage: string;
  successState?: "success" | "error";
}

export const FormContainer = ({
  form,
  successBlock,
  successState,
  errorMessage,
}: Props) => {
  return (
    <div className={styles.formWrapper}>
      <>
        {successState !== "success" ? form : successBlock}
        {successState === "error" && errorMessage}
      </>
    </div>
  );
};
