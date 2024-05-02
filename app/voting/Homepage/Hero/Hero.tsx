"use server";
import { Navigation } from "@/enum/navigation";
import { HeroActions } from "./HeroActions/HeroActions";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export const Hero = () => {
  return (
    <Card className="w-3/4">
      <CardTitle className="py-4 px-2">
        <span className=" text-lg md:text-xl lg:text-4xl font-bold font-fraunces pr-2">
          creative fulfillment
        </span>
        <span className=" text-md md:text-lg lg:text-2xl font-semibold font-fraunces">
          with fewer decisions
        </span>
      </CardTitle>
      <CardContent>
        <span className="font-fraunces text-sm md:text-md animation-delay-2000 opacity-75">
          Sign up with a song you want to cover.
          <b> Everyone</b> votes, and the most popular is the song that{" "}
          <b>everyone plays</b>. You{`'`}ve got a creative assignment, a
          deadline and a community of musicians doing the same thing. Want in?
          Sign up with your email. It{`'`}s free, and we do this every quarter.
        </span>
      </CardContent>
      <CardFooter>
        <Button className="py-4 px-2">
          {/* Need to change route! */}
          <a href={Navigation.SignUp}>Join the Creative Community</a>
        </Button>
      </CardFooter>
    </Card>
  );
};
