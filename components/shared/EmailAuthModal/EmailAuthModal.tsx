import * as React from "react";
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
  Box,
} from "@chakra-ui/react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

export const EmailAuthModal = ({
  isOpen,
  onClose,
  onOpen,
  redirectUrl,
}: {
  isOpen: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  redirectUrl?: string;
}) => {
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const toast = useToast();

  const { supabaseClient } = useSessionContext();
  const router = useRouter();

  const initialRef = React.useRef(null);

  const onSendLoginLink = async () => {
    try {
      setLoading(true);
      const { error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectUrl,
        },
      });
      if (error) {
        toast({
          title: "Error",
          description: error?.message || "Something went wrong",
          status: "error",
          isClosable: true,
        });
      } else {
        toast({
          title: "Email Sent",
          description: "We sent you a login link. Check your email!",
          status: "success",
          duration: 8000,
          isClosable: true,
        });
        onClose?.();
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Modal
        isOpen={isOpen}
        onClose={onClose || (() => {})}
        isCentered={true}
        initialFocusRef={initialRef}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign Up / Log In with Email</ModalHeader>
          {onClose && <ModalCloseButton />}
          <ModalBody>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSendLoginLink();
              }}
            >
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  ref={initialRef}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ringostarr@gmail.com"
                  disabled={loading}
                />
                <FormHelperText>{`You'll receive a link in your email to log you in`}</FormHelperText>
              </FormControl>
            </form>
          </ModalBody>

          <ModalFooter>
            {!onClose && (
              <Button variant="secondary" onClick={() => router.push("/")}>
                Go back Home
              </Button>
            )}
            <Button
              colorScheme="blue"
              variant="solid"
              onClick={onSendLoginLink}
              disabled={loading}
              isLoading={loading}
            >
              Send Login Link
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
