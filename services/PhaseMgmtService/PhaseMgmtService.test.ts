import { PhaseMgmtService } from "./PhaseMgmtService";

describe("PhaseMgmtService tests", () => {
  const signupOpens = "2022-11-17, 12:00";
  const votingOpens = "2022-12-06, 12:00";
  const coveringBegins = "2022-12-17, 12:00";
  const coversDue = "2023-01-31, 12:00";
  const listeningParty = "2023-02-08, 12:00";
  const roundId = 5;
  const song = {
    artist: "anyArtist",
    title: "anyTitle",
  };

  const mockRoundMetadata = {
    signupOpens,
    votingOpens,
    coveringBegins,
    coversDue,
    listeningParty,
    roundId,
    song,
  };

  jest.mock("@supabase/supabase-js", () => ({
    createClient: jest.fn(() => ({
      // Here you can specify the methods and properties of the returned client.
      // For example, if you are using the `from` method in your code:
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue({ data: "mockData" }),
      // Continue with other methods you use in your Supabase client
    })),
  }));

  test("returns phase signups when date is during signup phase", async () => {
    jest.useFakeTimers();

    const dateDuringSignupPhase = "2022-11-18, 12:00";
    jest.setSystemTime(new Date(dateDuringSignupPhase));

    const expected = "signups";

    const phaseMgmtService = await PhaseMgmtService.build(mockRoundMetadata);
    expect((await phaseMgmtService).phase).toBe(expected);
  });

  test("returns phase voting when date is during voting phase", async () => {
    jest.useFakeTimers();

    const dateDuringVotingPhase = "2022-12-06, 12:00";
    jest.setSystemTime(new Date(dateDuringVotingPhase));

    const expected = "voting";

    const phaseMgmtService = await PhaseMgmtService.build(mockRoundMetadata);
    expect((await phaseMgmtService).phase).toBe(expected);
  });

  test("returns phase covering when date is during covering phase", async () => {
    jest.useFakeTimers();

    const dateDuringCoveringPhase = "2022-12-17, 12:00";
    jest.setSystemTime(new Date(dateDuringCoveringPhase));

    const expected = "covering";

    const phaseMgmtService = await PhaseMgmtService.build(mockRoundMetadata);
    expect((await phaseMgmtService).phase).toBe(expected);
  });

  test("returns phase celebration when date is after covering due", async () => {
    jest.useFakeTimers();

    const dateDuringCoveringPhase = "2023-01-31, 12:00";
    jest.setSystemTime(new Date(dateDuringCoveringPhase));

    const expected = "celebration";

    const phaseMgmtService = await PhaseMgmtService.build(mockRoundMetadata);
    expect((await phaseMgmtService).phase).toBe(expected);
  });

  test("returns roundId when passed in constructor", async () => {
    const phaseMgmtService = await PhaseMgmtService.build(mockRoundMetadata);
    expect((await phaseMgmtService).roundId).toBe(mockRoundMetadata.roundId);
  });

  test("returns correct phase start and end date strings based on phase dates from constructor", async () => {
    const {
      dateLabels: { signups, voting, covering, celebration },
    } = await PhaseMgmtService.build(mockRoundMetadata);
    const expectedSignupDates = {
      opens: "Thursday, Nov 17th",
      closes: "Monday, Dec 5th",
    };

    const expectedVotingDates = {
      opens: "Tuesday, Dec 6th",
      closes: "Friday, Dec 16th",
    };

    const expectedCoveringDates = {
      opens: "Saturday, Dec 17th",
      closes: "Monday, Jan 30th",
    };

    const expectedCelebrationDates = {
      opens: "Tuesday, Jan 31st",
      closes: "Wednesday, Feb 8th",
    };

    expect(signups).toStrictEqual(expectedSignupDates);
    expect(voting).toStrictEqual(expectedVotingDates);
    expect(covering).toStrictEqual(expectedCoveringDates);
    expect(celebration).toStrictEqual(expectedCelebrationDates);
  });

  test("throws error when phase dates are not in order signups > voting > covering > celebration", async () => {
    const dateBeforeSignupPhase = "2022-01-01";

    try {
      await PhaseMgmtService.build({
        ...mockRoundMetadata,
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
      await PhaseMgmtService.build(mockRoundMetadata);
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
      await PhaseMgmtService.build(mockRoundMetadata);
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
        ...mockRoundMetadata,
        coveringBegins: invalidDateString,
      });
    } catch (e: unknown) {
      expect((e as { message: string }).message).toBe(
        `${invalidDateString} is an invalid date string`
      );
    }
  });
});
