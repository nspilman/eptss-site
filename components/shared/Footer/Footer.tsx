import { Box } from "@chakra-ui/react";
import {
  HowItWorksButton,
  JoinRoundButton,
  SignupButton,
} from "components/NavButtons";

export const Footer = () => (
  <Box as="footer" display="flex" justifyContent="center" py="2">
    <HowItWorksButton />
    <SignupButton />
    <JoinRoundButton />
  </Box>
);
