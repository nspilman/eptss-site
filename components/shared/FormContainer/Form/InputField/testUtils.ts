export const getFieldTestId = (
  field: string,
  type?: "text" | "vote" | "email"
) => {
  const typeText = type === "vote" ? "vote" : "text";
  return `${field}-${typeText}-test-id`;
};

export const getFieldErrorId = (field: string) => {
  return `${field}-error-message`;
};
