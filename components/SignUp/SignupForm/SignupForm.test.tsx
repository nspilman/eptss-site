import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  getFieldTestId,
  getFieldErrorId,
} from "../../shared/Form/InputField/testUtils";
import { SignupForm } from "./SignupForm";

describe("Signup Form tests", () => {
  const fields = {
    email: "email",
    name: "name",
    songTitle: "songTitle",
    artist: "artist",
    youtubeLink: "youtubeLink",
    additionalComments: "additionalComments",
  };

  const requiredFields = [
    fields.artist,
    fields.songTitle,
    fields.youtubeLink,
    fields.email,
    fields.name,
  ];

  test("calls onSubmit with input values when all fields are populated", async () => {
    const onSubmit = jest.fn();
    const anyRound = 10293;
    render(<SignupForm roundId={anyRound} onSubmit={onSubmit} />);
    const expectedArtistText = "Van Vorst";
    const expectedSongTitle = "Jabroni Sauce";
    const expectedName = "Jackson Jacksonville";
    const expectedComment = "I am a comment!";
    const expectedEmail = "anyemail@email.com";
    const expectedYoutubeLink = "youtubelinkinghamton";

    const artistField = screen.getByTestId(
      getFieldTestId(fields.artist, "text")
    );
    const artistInput = artistField.querySelector("input");
    fireEvent.change(artistInput as HTMLInputElement, {
      target: { value: expectedArtistText },
    });
    const songTitleField = screen.getByTestId(
      getFieldTestId(fields.songTitle, "text")
    );

    const titleInput = songTitleField.querySelector("input");
    fireEvent.change(titleInput as HTMLInputElement, {
      target: { value: expectedSongTitle },
    });

    const nameField = screen.getByTestId(getFieldTestId(fields.name, "text"));
    const nameInput = nameField.querySelector("input");
    fireEvent.change(nameInput as HTMLInputElement, {
      target: { value: expectedName },
    });

    const youtubeLinkField = screen.getByTestId(
      getFieldTestId(fields.youtubeLink, "text")
    );

    const youtubeInput = youtubeLinkField.querySelector("input");
    fireEvent.change(youtubeInput as HTMLInputElement, {
      target: { value: expectedYoutubeLink },
    });

    const emailField = screen.getByTestId(getFieldTestId(fields.email, "text"));
    const emailInput = emailField.querySelector("input");
    fireEvent.change(emailInput as HTMLInputElement, {
      target: { value: expectedEmail },
    });

    const additionalCommentsField = screen.getByTestId(
      getFieldTestId(fields.additionalComments, "text")
    );
    const additionalCommentsInput =
      additionalCommentsField.querySelector("input");
    fireEvent.change(additionalCommentsInput as HTMLInputElement, {
      target: { value: expectedComment },
    });

    const submitButton = screen.getByTestId("form-submission");
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        {
          additionalComments: expectedComment,
          artist: expectedArtistText,
          email: expectedEmail,
          name: expectedName,
          songTitle: expectedSongTitle,
          youtubeLink: expectedYoutubeLink,
        },
        expect.anything()
      )
    );
  });
  test("calls onSubmit with input values when required fields are populated", async () => {
    const onSubmit = jest.fn();
    const anyRound = 10293;
    render(<SignupForm roundId={anyRound} onSubmit={onSubmit} />);
    const expectedArtistText = "Van Vorst";
    const expectedSongTitle = "Jabroni Sauce";
    const expectedName = "Jackson Jacksonville";
    const expectedEmail = "anyemail@email.com";
    const expectedYoutubeLink = "youtubelinkinghamton";

    const artistField = screen.getByTestId(
      getFieldTestId(fields.artist, "text")
    );
    const artistInput = artistField.querySelector("input");
    fireEvent.change(artistInput as HTMLInputElement, {
      target: { value: expectedArtistText },
    });
    const songTitleField = screen.getByTestId(
      getFieldTestId(fields.songTitle, "text")
    );

    const titleInput = songTitleField.querySelector("input");
    fireEvent.change(titleInput as HTMLInputElement, {
      target: { value: expectedSongTitle },
    });

    const nameField = screen.getByTestId(getFieldTestId(fields.name, "text"));
    const nameInput = nameField.querySelector("input");
    fireEvent.change(nameInput as HTMLInputElement, {
      target: { value: expectedName },
    });

    const youtubeLinkField = screen.getByTestId(
      getFieldTestId(fields.youtubeLink, "text")
    );

    const youtubeInput = youtubeLinkField.querySelector("input");
    fireEvent.change(youtubeInput as HTMLInputElement, {
      target: { value: expectedYoutubeLink },
    });

    const emailField = screen.getByTestId(getFieldTestId(fields.email, "text"));
    const emailInput = emailField.querySelector("input");
    fireEvent.change(emailInput as HTMLInputElement, {
      target: { value: expectedEmail },
    });

    const submitButton = screen.getByTestId("form-submission");
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        {
          artist: expectedArtistText,
          email: expectedEmail,
          name: expectedName,
          songTitle: expectedSongTitle,
          youtubeLink: expectedYoutubeLink,
          additionalComments: "",
        },
        expect.anything()
      )
    );
  });

  test("shows required field error messages when user clicks submit with empty inputs", async () => {
    const onSubmit = jest.fn();
    const anyRound = 10293;
    render(<SignupForm roundId={anyRound} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByTestId("form-submission"));

    await waitFor(() =>
      requiredFields.forEach((field) => {
        expect(screen.getByTestId(getFieldErrorId(field))).toBeTruthy();
      })
    );
  });
});
