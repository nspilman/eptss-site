import { Link, Button } from "@chakra-ui/react";
import { Navigation } from "components/enum/navigation";

export const HowItWorksButton = () => (
  <Link id="learn" href={Navigation.HowItWorks} variant="button">
    <Button>How it Works</Button>
  </Link>
);
