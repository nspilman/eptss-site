import { PhaseMgmtService } from "./PhaseMgmtService";

describe("PhaseMgmtService tests", () => {
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

    const phaseMgmtService = await PhaseMgmtService.build(mockDates);
    expect((await phaseMgmtService).phase).toBe(expected);
  });

  test("returns phase voting when date is during voting phase", async () => {
    jest.useFakeTimers();

    const dateDuringVotingPhase = "2022-12-06";
    jest.setSystemTime(new Date(dateDuringVotingPhase));

    const expected = "voting";

    const phaseMgmtService = await PhaseMgmtService.build(mockDates);
    expect((await phaseMgmtService).phase).toBe(expected);
  });

  test("returns phase covering when date is during covering phase", async () => {
    jest.useFakeTimers();

    const dateDuringCoveringPhase = "2022-12-17";
    jest.setSystemTime(new Date(dateDuringCoveringPhase));

    const expected = "covering";

    const phaseMgmtService = await PhaseMgmtService.build(mockDates);
    expect((await phaseMgmtService).phase).toBe(expected);
  });

  test("returns phase celebration when date is after covering due", async () => {
    jest.useFakeTimers();

    const dateDuringCoveringPhase = "2023-01-31";
    jest.setSystemTime(new Date(dateDuringCoveringPhase));

    const expected = "celebration";

    const phaseMgmtService = await PhaseMgmtService.build(mockDates);
    expect((await phaseMgmtService).phase).toBe(expected);
  });

  test("throws error when phase dates are not in order signups > voting > covering > celebration", async () => {
    const dateBeforeSignupPhase = "2022-01-01";

    try {
      await PhaseMgmtService.build({
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
      await PhaseMgmtService.build(mockDates);
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
      await PhaseMgmtService.build(mockDates);
    } catch (e: unknown) {
      expect((e as { message: string }).message).toBe(
        "current date cannot be after listening party. The Listening Party ends the round"
      );
    }
  });

  test("throws error when datestring of dates from constructor are invalid", async () => {
    const invalidDateString = "ohyouthoughtthiswasarabbit?";

    try {
      await PhaseMgmtService.build({
        ...mockDates,
        coveringBegins: invalidDateString,
      });
    } catch (e: unknown) {
      expect((e as { message: string }).message).toBe(
        `${invalidDateString} is an invalid date string`
      );
    }
  });
});
