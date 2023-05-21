import { Button, Link } from "@chakra-ui/react";
import { Navigation } from "components/enum/navigation";

export const FAQButton = () => (
  <Link href={Navigation.FAQ} variant="button">
    <Button>FAQ</Button>
  </Link>
);
