import { render, screen } from "@testing-library/react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { SignInGate } from "./SignInGate";
import "@testing-library/jest-dom";

jest.mock("@supabase/auth-helpers-react");
jest
  .spyOn(window, "location", "get")
  .mockReturnValue({ href: "http://mock-url" } as any);

describe("SignInGate", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockedUseSessionContext = useSessionContext as jest.Mock;

  it("renders Loading... when isLoading is true", () => {
    mockedUseSessionContext.mockReturnValue({
      isLoading: true,
      session: null,
    });

    render(
      <SignInGate>
        <p>test child</p>
      </SignInGate>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("test child")).not.toBeInTheDocument();
  });

  it("renders children when session exists", () => {
    mockedUseSessionContext.mockReturnValue({
      isLoading: false,
      session: { user: { name: "test user" } },
    });

    render(
      <SignInGate>
        <p>test child</p>
      </SignInGate>
    );

    expect(screen.getByText("test child")).toBeInTheDocument();
  });

  it("renders EmailAuthModal when session is null", () => {
    mockedUseSessionContext.mockReturnValue({
      isLoading: false,
      session: null,
    });

    render(
      <SignInGate>
        <p>test child</p>
      </SignInGate>
    );

    expect(screen.getByTestId("email-auth-modal")).toBeInTheDocument();
    expect(screen.queryByText("test child")).not.toBeInTheDocument();
  });
});
