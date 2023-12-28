import React, { useState } from "react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { Loading } from "../Loading"; // Assuming this is already using Tailwind CSS

export const EmailAuthModal2 = ({
  isOpen,
  onClose,
  redirectUrl,
}: {
  isOpen: boolean;
  onClose?: () => void;
  redirectUrl?: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const { supabaseClient } = useSessionContext();
  const router = useRouter();

  // ... rest of your existing logic

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
        alert("Error");
        // toast({
        //   title: "Error",
        //   description: error?.message || "Something went wrong",
        //   status: "error",
        //   isClosable: true,
        // });
      } else {
        alert("Success");
        // toast({
        //   status: "success",
        //   duration: 8000,
        //   isClosable: true,
        //   render: () => (
        //     <div className="bg-white p-4 border-themeYellow">
        //       <span className="font-fraunces text-black font-bold">
        //         Email Sent
        //       </span>
        //       <span className="text-md font-light font-roboto text-black text-center my-4">
        //         We sent you a login link. Check your email!
        //       </span>
        //     </div>
        //   ),
        // });
        onClose?.();
      }
    } catch (error) {
      console.error(error);
      alert("error");
      //   toast({
      //     title: "Error",
      //     description: "Something went wrong",
      //   });
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  // Tailwind CSS classes are used here for styling
  return (
    <div
      className={`inset-0 bg-gray-600 bg-opacity-50 flex overflow-y-auto h-screen w-full z-10 sticky items-center justify-center ${
        isOpen ? "block" : "hidden"
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`modal bg-white px-8 py-2 rounded w-[420px]`}
        data-testid="email-auth-modal"
      >
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="p-4">
              <h1 className="font-bold uppercase">
                Sign Up / Log In with Email
              </h1>
              {/* ... */}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  onSendLoginLink();
                }}
              >
                <div className="form-control flex flex-col pt-4">
                  <label className="font-semibold">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ringostarr@gmail.com"
                    disabled={loading}
                    className="input p-1 window-border"
                  />
                  <span className="helper-text font-light text-sm">
                    {`You'll receive a link in your email to log you in!`}
                  </span>
                </div>
                <div className="flex flex-row items-center pt-4">
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
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
