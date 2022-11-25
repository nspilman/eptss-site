import { useState } from "react";

export const useSuccessState = () => {
  return useState<"success" | "error">();
};
