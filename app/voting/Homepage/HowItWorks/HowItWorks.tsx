import { ButtonsContainer } from "components/ButtonsContainer";
import { FAQButton, RoundsButton, SignupButton } from "components/NavButtons";

export const HowItWorks = () => {
  return (
    <div className="relative px-8 md:px-24 bg-black bg-opacity-5 py-4 mx-8">
      <div className="absolute -inset-12 bg-gradient-to-r from-white to-themeYellow rounded-lg blur opacity-5 pointer-events-none group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
      <div>
        <div>
          <h3 className="text-white font-fraunces font-bold text-xl">
            How It Works
          </h3>
        </div>
        <div>
          <div>
            <div>
              <div>
                <div className="leadin-3 flex flex-col text-white font-fraunces py-4  opacity-75">
                  <span>Sign up with the song you want to cover</span>
                  <span>Vote on your favorite cover options</span>
                  <span>Cover the song that wins</span>
                  <span>Celebrate with your peers</span>
                </div>
                <div className="opacity-75">
                  <span className="text-md font-light font-roboto text-white py-1 ">
                    {`Everyone Plays the Same Song is a community project open to musicians of all skill levels, inviting participants to cover the same song each round.`}
                  </span>
                  <span className="text-md font-light font-roboto text-white py-1">
                    {`Sign up by creating an account and submit the song you'd like to cover for the upcoming round. Songs are chosen based on participant voting, using a scale from 1 (not interested in covering) to 5 (very interested in covering). Once the song is selected, you will have just over a month to submit your SoundCloud cover link.  The fun doesn't stop there - after submission, we compile all covers into a playlist for a communal listening party. `}
                  </span>
                  <span className="text-md font-light font-roboto text-white py-1">
                    {`No special equipment or software is required - just your passion for music. You choose which rounds to participate in, allowing you to be part of the song selection and music-making process as per your interest and convenience. Join us for a celebration of music and community! We can't wait to hear your interpretation of... the same song!`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-12">
          <ButtonsContainer>
            <FAQButton />
            <RoundsButton />
            <SignupButton />
          </ButtonsContainer>
        </div>
      </div>
    </div>
  );
};
