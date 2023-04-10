import React, { useEffect, useState } from "react";
import { FormContainer } from "components/shared/FormContainer";
import { GENERIC_ERROR_MESSAGE } from "../../constants";
import { useSignup } from "./useSignup";
import { ActionSuccessPanel } from "components/shared/ActionSuccessPanel";
import {
  Box,
  Center,
  Link,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Navigation } from "components/enum/navigation";
import { EmailAuthModal } from "components/EmailAuthModal";
import { getSupabaseClient } from "utils/getSupabaseClient";
import { Session, useSessionContext } from "@supabase/auth-helpers-react";

interface Props {
  roundId: number;
  signupsCloseDateLabel: string;
  rootDomain: string;
}

export const SignUp = ({
  roundId,
  signupsCloseDateLabel,
  rootDomain,
}: Props) => {
  const title = `Sign Up for Everyone Plays the Same Song round ${roundId}`;

  const { session } = useSessionContext();
  const { signUp, signupSuccess, fields } = useSignup(roundId, session?.user.id);

  const { isOpen, onClose, onOpen } = useDisclosure({ isOpen: !session });

  return (
    <Center>
      <EmailAuthModal
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
        redirectUrl={`${rootDomain}/sign-up`}
      />
      <FormContainer
        fields={fields}
        title={title}
        description={
          <Stack alignItems="center">
            <Text as="p">Signing up as {session?.user.email}</Text>
            <Text as="p">Sign up with the song you want to cover!</Text>
            <Text>Signups close Midnight of {signupsCloseDateLabel}.</Text>
            <Link href={Navigation.HowItWorks} color="yellow.300">
              Full rules here
            </Link>
          </Stack>
        }
        successBlock={<ActionSuccessPanel {...signupSuccess} />}
        errorMessage={GENERIC_ERROR_MESSAGE}
        onSubmit={signUp}
      />
    </Center>
  );
};
