export type Status = "Success" | "Error";

export type FormReturn = {
  status: Status;
  message: string;
  variant?: "default" | "destructive";
};
