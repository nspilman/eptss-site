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
} from "@chakra-ui/react";
import { useSessionContext } from "@supabase/auth-helpers-react";

export const EmailAuthModal = ({
  isOpen,
  onClose,
  onOpen,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}) => {
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const toast = useToast();

  const { supabaseClient } = useSessionContext();

  const initialRef = React.useRef(null);

  const onSendLoginLink = async () => {
    try {
      setLoading(true);
      const { error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: window.location.origin,
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
        onClose();
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
    <Modal isOpen={isOpen} onClose={onClose} isCentered={true} initialFocusRef={initialRef}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Join Us!</ModalHeader>
        <ModalCloseButton />
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
              <FormHelperText>{`We'll never share your email or spam you, we swear!`}</FormHelperText>
            </FormControl>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" variant="solid" onClick={onSendLoginLink} disabled={loading} isLoading={loading}>
            Send Login Link
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
