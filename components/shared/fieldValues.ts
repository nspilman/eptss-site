export const yourName = {
  label: "Your Name",
  placeholder: "Name",
  field: "name" as const,
  size: "small" as const,
};

export const yourEmail = {
  label: "Your Email",
  placeholder: "email",
  field: "email" as const,
  type: "email" as const,
  size: "small" as const,
};

export const password = {
  label: "password",
  placeholder: "",
  field: "password" as const,
  type: "password" as const,
  size: "small" as const,
};

export const additionalComments = {
  label: "Additional Comments",
  placeholder: "Additional Comments",
  field: "additionalComments" as const,
  size: "large" as const,
  optional: true,
};
