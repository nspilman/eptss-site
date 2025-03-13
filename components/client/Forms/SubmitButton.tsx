"use client";

import { LoadingSpinner } from "../../LoadingSpinner";
import { Button } from "@/components/ui/primatives";

export const SubmitButton = ({
  label,
  disabled = false,
  pending = false,
}: {
  label: string;
  disabled?: boolean;
  pending?: boolean;
}) => {
  return (
    <Button
      type="submit"
      className={`w-full bg-gradient-to-r from-[#e2e240] to-[#40e2e2] text-gray-900 hover:from-[#f0f050] hover:to-[#50f0f0] transition-all duration-300 ${
        pending ? "text-gray-400" : "white"
      }`}
      disabled={disabled}
      style={{ marginTop: "unset" }}
    >
      {!pending ? label : <LoadingSpinner />}
    </Button>
  );
};
