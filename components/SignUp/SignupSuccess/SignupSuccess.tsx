import * as styles from "./SignupAccess.css";

export const SignupSuccess = () => {
  return (
    <div className={styles.body}>
      <h2>
        Thank you for signing up for this round of Everyone Plays the Same Song!
      </h2>
      <p>
        You will get a welcome email with all the information and dates you will
        need
      </p>
    </div>
  );
};
