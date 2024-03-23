"use server";
import { Phase } from "@/services/PhaseMgmtService";
import { Navigation } from "@/enum/navigation";
import Link from "next/link";

interface Props {
  roundId: number;
  phase: Phase;
}

export const Hero = ({ roundId, phase }: Props) => {
  const statusHeadline = phase === "signups" ? "" : "currently covering";
  const statusBody =
    phase === "signups" ? "Signups are open for round " + roundId : "";
  return (
    <div className="w-full flex flex-col md:flex-row pt-32 pb-8 md:py-52 bg-gradient-to-b items-center md:items-start">
      <div className="flex w-[80vw] md:max-w-[50vw] bg-cover bg-no-repeat bg-center">
        <div className="md:px-16">
          <div className="flex flex-col">
            <span className="text-themeYellow text-lg md:text-xl lg:text-3xl font-bold font-fraunces">
              creative fulfillment
            </span>
            <span className=" text-themeYellow text-md md:text-lg lg:text-2xl font-semibold font-fraunces">
              with fewer decisions
            </span>
          </div>
          <div className="py-8">
            <span className="font-fraunces text-sm md:text-md text-white animation-delay-2000 opacity-75">
              Sign up with a song you want to cover.
              <b> Everyone</b> votes, and the most popular is the song that{" "}
              <b>everyone plays</b>. You{`'`}ve got a creative assignment, a
              deadline and a community of musicians doing the same thing. Want
              in? Sign up with your email. It{`'`}s free, and we do this every
              quarter.
            </span>
          </div>
          <button className="btn-main">
            <a href={Navigation.SignUp}>Join the Creative Community</a>
          </button>
        </div>
      </div>
      <div className="flex w-[80vw] md:max-w-[50vw] bg-cover bg-no-repeat bg-center mt-4 md:mt-16 relative h-full md:text-right md:justify-end">
        <div className="flex-col flex md:mx-16">
          <span className="font-fraunces text-md text-white">
            {statusHeadline}
          </span>
          <span className="text-md md:text-lg lg:text-2xl font-semibold text-white font-fraunces">
            {statusBody}
          </span>
          <span className="text-md  text-white font-fraunces">
            closing march 18th -{" "}
            <Link
              className="text-themeYellow font-fraunces text-md"
              href={phase === "signups" ? Navigation.SignUp : Navigation.Submit}
            >
              {phase === "signups" ? "sign up now" : "submit your cover"}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};
