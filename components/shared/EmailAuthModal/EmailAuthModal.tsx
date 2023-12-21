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
  ModalOverlay,
  useToast,
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
            <div className="bg-white p-4 border-themeYellow">
              <span className="font-fraunces text-black font-bold">
                Email Sent
              </span>
              <span className="text-md font-light font-roboto text-black text-center my-4">
                We sent you a login link. Check your email!
              </span>
            </div>
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
    <div data-testid="email-auth-modal">
      <Modal
        isOpen={isOpen}
        onClose={onClose || (() => {})}
        isCentered={true}
        initialFocusRef={initialRef}
      >
        <ModalOverlay />
        <ModalContent>
          <div className="p-4">
            <h1 className="font-bold uppercase">Sign Up / Log In with Email</h1>
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
          </div>
        </ModalContent>
      </Modal>
    </div>
  );
};
