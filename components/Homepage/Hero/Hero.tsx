import { VStack } from "@chakra-ui/react";
import { Navigation } from "components/enum/navigation";
import { Button } from "components/shared/Button";
import Image from "next/image";
import Link from "next/link";

export const Hero = () => {
  return (
    <div className="w-full flex flex-col md:flex-row py-32 bg-gradient-to-b items-center md:items-start">
      <div className="flex w-[80vw] md:w-[50vw] bg-cover bg-no-repeat bg-center">
        <VStack
          alignItems="center md:flex-start"
          px={{ base: "8", md: "16", lg: "24" }}
        >
          <span className="text-themeYellow text-lg md:text-2xl lg:text-4xl font-bold font-fraunces">
            creative fulfillment
          </span>
          <span className="text-themeYellow text-lg md:text-2xl lg:text-4xl font-bold font-fraunces animation-delay-4000 ">
            with fewer decisions
          </span>
          <span className="font-fraunces text-md text-white animation-delay-2000">
            Sign up with a song you want to cover.
            <b> Everyone</b> votes, and the most popular is the song that{" "}
            <b>everyone plays</b>. You{`'`}ve got a creative assignment, a
            deadline and a community of musicians doing the same thing. Want in?
            Sign up with your email. It{`'`}s free, and do this every quarter.
          </span>
          <div>
            <Image
              src="/pencil-underline.png"
              alt="pencilunderline"
              layout="responsive"
              height={"10px"}
              width={"100%"}
            />
          </div>
          <Button
            href={Navigation.SignUp}
            title="Join the Creative Community"
          />
        </VStack>
      </div>
      <div className="flex w-[80vw] md:w-[50vw] bg-cover bg-no-repeat bg-center mt-4">
        <VStack alignItems="flex-start" px={{ base: "8", md: "16", lg: "24" }}>
          <span className="font-fraunces text-md text-white">
            currently covering
          </span>
          <span className="text-md md:text-lg lg:text-2xl font-semibold text-white font-fraunces">
            Mr. Brightside by The Killers
          </span>
          <span className="text-sm md:text-md lg:text-lg text-white font-fraunces">
            due december 4th -{" "}
            <Link href={Navigation.Submit}>
              <a className="text-themeYellow font-fraunces text-sm">
                Submit your cover
              </a>
            </Link>
          </span>
        </VStack>
      </div>
    </div>
  );
};
