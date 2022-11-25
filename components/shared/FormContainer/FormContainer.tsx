import * as styles from "./FormContainer.css";

interface Props {
  form: React.ReactNode;
  successBlock: React.ReactNode;
  errorMessage: string;
  successState?: "success" | "error";
}

export const FormContainer = ({ form, successBlock, successState }: Props) => {
  return (
    <div className={styles.formWrapper}>
      <>
        {successState !== "success" ? form : successBlock}
        {successState === "error" &&
          "An error has occurred. Please try again and/or hit Nate up."}
      </>
    </div>
  );
};
