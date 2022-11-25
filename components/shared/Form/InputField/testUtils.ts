export const getFieldTestId = (field: string, type: "text" | "vote") => {
  return `${field}-${type}-test-id`;
};

export const getFieldErrorId = (field: string) => {
  return `${field}-error-message`;
};
