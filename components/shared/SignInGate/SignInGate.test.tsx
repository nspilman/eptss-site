import { render, waitFor } from "@testing-library/react";
import { useUserSession } from "components/context/UserSessionContext";
import { SignInGate } from "./SignInGate"; // path to your component
import React from "react";
import "@testing-library/jest-dom";

const mockUser = {
  id: "1",
  app_metadata: {}, // update with your actual app_metadata structure or mock data
  user_metadata: {}, // update with your actual user_metadata structure or mock data
  aud: "auth0", // update with your actual `aud` value
  created_at: new Date().toISOString(), // or any other valid date string
  // add any other necessary properties here
};

// Mock useUserSession hook
jest.mock("components/context/UserSessionContext", () => ({
  useUserSession: jest.fn(),
}));

describe("SignInGate", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state", async () => {
    (
      useUserSession as jest.MockedFunction<typeof useUserSession>
    ).mockReturnValue({ isLoading: true });

    const { getByText } = render(
      <SignInGate>{<div>Test content</div>}</SignInGate>
    );

    await waitFor(() => {
      expect(getByText("Loading...")).toBeInTheDocument();
    });
  });

  test("renders children when user is present", async () => {
    (
      useUserSession as jest.MockedFunction<typeof useUserSession>
    ).mockReturnValue({ isLoading: false, user: mockUser });

    const { getByText } = render(
      <SignInGate>{<div>Test content</div>}</SignInGate>
    );

    await waitFor(() => {
      expect(getByText("Test content")).toBeInTheDocument();
    });
  });

  test("renders EmailAuthModal when user is not present", async () => {
    (
      useUserSession as jest.MockedFunction<typeof useUserSession>
    ).mockReturnValue({ isLoading: false });

    const { getByTestId } = render(
      <SignInGate>{<div>Test content</div>}</SignInGate>
    );

    await waitFor(() => {
      // Assuming that EmailAuthModal has a data-testid="email-auth-modal" attribute
      expect(getByTestId("email-auth-modal")).toBeInTheDocument();
    });
  });
});
