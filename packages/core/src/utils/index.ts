import { revalidatePath } from "next/cache";
import type { FormReturn } from "../types";

export const getIsSuccess = (responseCode: number) => {
  return [200, 201, 204].includes(responseCode);
};

export const handleResponse = (status: number, pathToRevalidate: string, errorMessage: string): FormReturn => {
  const isSuccess = getIsSuccess(status);
  if(isSuccess){
    revalidatePath(pathToRevalidate);
  }
  return { status: isSuccess ? "Success" : "Error", message: errorMessage };
}

export const getDataToString = (formData: FormData, key: string) => {
  return formData.get(key)?.toString();
};

export * from './isAdmin';
export * from './supabase/server';
export * from './dbHelpers';
export * from './audioDuration';