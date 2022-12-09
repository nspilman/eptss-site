import { TimeBot5000 } from "./TimeBot5000";

describe("TimeBot5000 tests", () => {
  const signupOpens = "2022-11-17";
  const votingOpens = "2022-12-06";
  const coveringBegins = "2022-12-17";
  const coversDue = "2023-01-31";
  const listeningParty = "2023-02-08";

  const mockDates = {
    signupOpens,
    votingOpens,
    coveringBegins,
    coversDue,
    listeningParty,
  };

  test("returns phase signups when date is during signup phase", async () => {
    jest.useFakeTimers();

    const dateDuringSignupPhase = "2022-11-18";
    jest.setSystemTime(new Date(dateDuringSignupPhase));

    const expected = "signups";

    const timeBot5000 = await TimeBot5000.build(mockDates);
    expect((await timeBot5000).phase).toBe(expected);
  });

  test("returns phase voting when date is during voting phase", async () => {
    jest.useFakeTimers();

    const dateDuringVotingPhase = "2022-12-06";
    jest.setSystemTime(new Date(dateDuringVotingPhase));

    const expected = "voting";

    const timeBot5000 = await TimeBot5000.build(mockDates);
    expect((await timeBot5000).phase).toBe(expected);
  });

  test("returns phase covering when date is during covering phase", async () => {
    jest.useFakeTimers();

    const dateDuringCoveringPhase = "2022-12-17";
    jest.setSystemTime(new Date(dateDuringCoveringPhase));

    const expected = "covering";

    const timeBot5000 = await TimeBot5000.build(mockDates);
    expect((await timeBot5000).phase).toBe(expected);
  });

  test("returns phase celebration when date is after covering due", async () => {
    jest.useFakeTimers();

    const dateDuringCoveringPhase = "2023-01-31";
    jest.setSystemTime(new Date(dateDuringCoveringPhase));

    const expected = "celebration";

    const timeBot5000 = await TimeBot5000.build(mockDates);
    expect((await timeBot5000).phase).toBe(expected);
  });

  test("throws error when phase dates are not in order signups > voting > covering > celebration", async () => {
    const dateBeforeSignupPhase = "2022-01-01";

    try {
      await TimeBot5000.build({
        ...mockDates,
        coveringBegins: dateBeforeSignupPhase,
      });
    } catch (e: unknown) {
      expect((e as { message: string }).message).toBe(
        "dates are in incorrect order"
      );
    }
  });

  test("throws error when current date is before signup date", async () => {
    const dateBeforeSignupPhase = "2022-01-01";

    jest.useFakeTimers();
    jest.setSystemTime(new Date(dateBeforeSignupPhase));

    try {
      await TimeBot5000.build(mockDates);
    } catch (e: unknown) {
      expect((e as { message: string }).message).toBe(
        "current date cannot be before signup date. Signup starts the current round"
      );
    }
  });

  test("throws error when current date is before signup date", async () => {
    const dateAfterListeningParty = "2024-01-01";

    jest.useFakeTimers();
    jest.setSystemTime(new Date(dateAfterListeningParty));

    try {
      await TimeBot5000.build(mockDates);
    } catch (e: unknown) {
      expect((e as { message: string }).message).toBe(
        "current date cannot be after listening party. The Listening Party ends the round"
      );
    }
  });
});
