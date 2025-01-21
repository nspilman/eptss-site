import { Navigation } from "@/enum/navigation";
import { FormReturn } from "@/types";
import { revalidateTag } from "next/cache";

export const getIsSuccess = (responseCode: number) => {
  return [200, 201, 204].includes(responseCode);
};

export const handleResponse = (status: number, tagToRevalidate: Navigation, errorMessage: string): FormReturn => {
  const isSuccess = getIsSuccess(status);
  if(isSuccess){
    revalidateTag(tagToRevalidate)
  }
  return { status: isSuccess ? "Success" : "Error", message: errorMessage };
}

export const getDataToString = (formData: FormData, key: string) => {
  return formData.get(key)?.toString();
};