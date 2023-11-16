import { Navigation } from "components/enum/navigation";
import { Button } from "components/shared/Button";
import Link from "next/link";

export const Hero = () => {
  return (
    <div className="w-full flex flex-col md:flex-row pt-32 pb-8 md:pb-32 bg-gradient-to-b items-center md:items-start">
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
            <span className="font-fraunces text-sm md:text-md text-white animation-delay-2000">
              Sign up with a song you want to cover.
              <b> Everyone</b> votes, and the most popular is the song that{" "}
              <b>everyone plays</b>. You{`'`}ve got a creative assignment, a
              deadline and a community of musicians doing the same thing. Want
              in? Sign up with your email. It{`'`}s free, and we do this every
              quarter.
            </span>
          </div>
          <Button
            href={Navigation.SignUp}
            title="Join the Creative Community"
          />
        </div>
      </div>
      <div className="flex w-[80vw] md:max-w-[50vw] bg-cover bg-no-repeat bg-center mt-4 md:mt-0 relative h-full">
        <div className="md:mx-16 flex-col flex content-center">
          <div className="absolute -inset-12 bg-gradient-to-r from-bgGradientLighterBLue to-themeYellow rounded-lg blur opacity-5 pointer-events-none group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <span className="font-fraunces text-md text-white">
            currently covering
          </span>
          <span className="text-md md:text-lg lg:text-2xl font-semibold text-white font-fraunces pb-8">
            Mr. Brightside by The Killers
          </span>
          <span className="text-sm md:text-md  text-white font-fraunces">
            due december 4th -{" "}
            <Link href={Navigation.Submit}>
              <a className="text-themeYellow font-fraunces text-md">
                submit your cover
              </a>
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};
