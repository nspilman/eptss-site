import * as React from "react";
import {
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
  Heading,
  Text,
} from "@chakra-ui/react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { Loading } from "../Loading";

export const EmailAuthModal = ({
  isOpen,
  onClose,
  redirectUrl,
}: {
  isOpen: boolean;
  onClose?: () => void;
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
        email: email.trim(),
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
          status: "success",
          duration: 8000,
          isClosable: true,
          render: () => (
            <Box
              background="white"
              border="4px solid"
              borderColor="yellow.500"
              p="4"
            >
              <Heading size="xsm" color="black">
                Email Sent
              </Heading>
              <Text color="black">
                We sent you a login link. Check your email!
              </Text>
            </Box>
          ),
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
    <Box data-testid="email-auth-modal">
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
                <FormHelperText>{`You'll receive a link in your email to log you in!`}</FormHelperText>
              </FormControl>
            </form>
          </ModalBody>

          <ModalFooter>
            {!onClose && (
              // outline: {
              //   border: "2px solid",
              //   borderColor: "white",
              //   color: "white",
              //   _hover: {
              //     textDecoration: "auto",
              //     boxShadow: "0 0 3px 3px var(--chakra-colors-yellow-300)",
              //   },
              // },
              // {
              //   fontWeight: "bold",
              //   borderRadius: "base",
              //   _hover: {
              //     bg: "white",
              //     transition: "100ms",
              //     color: "blue.900",
              //   },
              // },
              <button
                className="border-2 uppercase font-bold border-white shadow-md mx-4 p-2 shadow-themeYellow hover:border-themeYellow rounded"
                onClick={() => router.push("/")}
              >
                Go back Home
              </button>
            )}
            {loading ? (
              <Loading />
            ) : (
              <button
                className="btn-main bg-blue-500 uppercase hover:shadow-white hover:bg-blue-500"
                onClick={onSendLoginLink}
                disabled={loading}
              >
                Send Login Link
              </button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
