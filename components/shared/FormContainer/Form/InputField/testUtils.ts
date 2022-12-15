import { FieldTypes } from "../types";

export const getFieldTestId = (field: string, type?: FieldTypes) => {
  const typeText = type === "vote" ? "vote" : "text";
  return `${field}-${typeText}-test-id`;
};

export const getFieldErrorId = (field: string) => {
  return `${field}-error-message`;
};
