export * from "./database";
export * from "./roundDetails";

export type Status = "Success" | "Error";
export type FormReturn = { status: Status; message: string };
