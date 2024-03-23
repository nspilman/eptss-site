"use client";

import { LoadingSpinner } from "../LoadingSpinner";

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
    <button
      type="submit"
      className={`border btn-main ${
        pending ? "text-gray-400" : "white"
      } p-2 w-full h-[40px] lg:w-40 mt-4 flex items-center content-center justify-center`}
      disabled={disabled}
      style={{ marginTop: "unset" }}
    >
      {!pending ? label : <LoadingSpinner />}
    </button>
  );
};
