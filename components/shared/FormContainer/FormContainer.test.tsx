import { render, screen } from "@testing-library/react";
import { FormContainer } from "./FormContainer";

describe("Form Container Tests", () => {
  const expectedFormText = "I am the test form, why yes I am";
  const expectedSuccessText = "You did it, you really did it!";
  const expectedErrorMessage = "it's broken, mate";
  const testForm = <div>{expectedFormText}</div>;
  const testSuccess = <div>{expectedSuccessText}</div>;
  test("renders form when successStatus is undefined", () => {
    render(
      <FormContainer
        form={testForm}
        successBlock={testSuccess}
        errorMessage={expectedErrorMessage}
      />
    );
    expect(screen.getByText(expectedFormText));
  });
  test("renders successBlock when successStatus is success", () => {
    render(
      <FormContainer
        form={testForm}
        successBlock={testSuccess}
        errorMessage={expectedErrorMessage}
        successState="success"
      />
    );
    expect(screen.getByText(expectedSuccessText));
  });

  test("renders errorMessage when successStatus is error", () => {
    render(
      <FormContainer
        form={testForm}
        successBlock={testSuccess}
        errorMessage={expectedErrorMessage}
        successState="error"
      />
    );
    expect(screen.getByText(expectedErrorMessage));
  });
});
