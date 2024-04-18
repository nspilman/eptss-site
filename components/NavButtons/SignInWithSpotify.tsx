"use client";
import { Navigation } from "@/enum/navigation";
import { createClient } from "@/utils/supabase/client";

export const SignInWithSpotifyBtn = () => {
  function handleLoginWithOAuth(provider: "spotify") {
    const supabase = createClient();

    supabase.auth.signInWithOAuth({
      provider: "spotify",
      options: {
        redirectTo: location.origin + "/app/auth/oauth/callback/",
      },
    });
  }

  return (
    <button
      className="btn-main"
      onClick={() => handleLoginWithOAuth("spotify")}
    >
      Sign In With Spotify
    </button>
  );
};
